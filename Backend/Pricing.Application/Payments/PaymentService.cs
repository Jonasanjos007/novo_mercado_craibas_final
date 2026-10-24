#nullable enable
using System.Globalization;
using System.Text.Json;
using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces.Payment;
using Mercado.Craibas.Application.Interfaces.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Mercado.Craibas.Application.Payments;



/// <summary>
/// Pagamento dos pedidos com a API Orders do Mercado Pago (Checkout Transparente: PIX e cartão).
///
/// Fluxo:
///   1. PostSaveOrder cria o pedido PENDENTE (valor recalculado no servidor).
///   2. O front chama CreatePix ou CreateCard → uma linha em Payment_Transactions.
///   3. O Mercado Pago responde na hora (cartão) ou avisa depois pelo webhook (PIX/análise).
///      O front também consulta GetOrderPayment, que sincroniza com o Mercado Pago de tempos em tempos
///      (assim funciona mesmo sem webhook, ex.: rodando local).
///   4. Aprovado → Status_Pay e Order_Status = CONFIRMADO + e-mail, notificação e log.
///      Recusado → pedido continua PENDENTE, cliente tenta de novo, admin é avisado.
///      PIX vencido → rotina marca EXPIRADO, avisa cliente e admin; dá para gerar outro PIX.
/// </summary>
public sealed class PaymentService : IPaymentService
{
    private const string Provider = "MERCADO_PAGO";

    // Uma atualização de status por vez (webhook, consulta do front e rotina podem chegar juntos).
    // Evita confirmar/avisar duas vezes. Suficiente para uma instância da API.
    private static readonly SemaphoreSlim Gate = new(1, 1);

    private static readonly JsonSerializerOptions WebhookJson = new() { PropertyNameCaseInsensitive = true };

    private readonly IUnitOfWork _unitOfWork;
    private readonly IMercadoPagoClient _mp;
    private readonly IPaymentNotifier _notifier;
    private readonly MercadoPagoOptions _options;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(IUnitOfWork unitOfWork, IMercadoPagoClient mp, IPaymentNotifier notifier,
        IOptions<MercadoPagoOptions> options, ILogger<PaymentService> logger)
    {
        _unitOfWork = unitOfWork;
        _mp = mp;
        _notifier = notifier;
        _options = options.Value;
        _logger = logger;
    }

    // ════════════════════════════════════════════════════════════════════════
    // Configuração
    // ════════════════════════════════════════════════════════════════════════

    public PaymentConfigResponse GetConfig() => new()
    {
        Enabled = _options.IsConfigured,
        PublicKey = _options.PublicKey,
        PixExpirationHours = _options.PixExpirationHours,
        PixDiscountPercent = _options.PixDiscountPercent,
        MaxInstallments = Math.Clamp(_options.MaxInstallments, 1, 24),
    };

    // ════════════════════════════════════════════════════════════════════════
    // Consulta (o front pergunta enquanto espera)
    // ════════════════════════════════════════════════════════════════════════

    public async Task<Result<OrderPaymentResponse>> GetOrderPaymentAsync(int userId, int orderId)
    {
        var order = await LoadOwnedOrder(userId, orderId);

        if (order == null)
            return Result<OrderPaymentResponse>.Failure(Error.NotFound("Pagamento", "Pedido não encontrado."));

        var current = await LatestTransaction(orderId);

        // Sincroniza com o Mercado Pago se ainda está em aberto e a última consulta é antiga.
        if (current != null && PaymentStatus.IsOpen(current.Status) && !string.IsNullOrEmpty(current.Provider_Order_Id)
            && (current.Last_Sync_At == null || current.Last_Sync_At < DateTime.Now.AddSeconds(-Math.Max(3, _options.StatusSyncSeconds))))
        {
            await SyncWithProviderAsync(current.Id, "consulta do cliente");
            order = await LoadOwnedOrder(userId, orderId) ?? order;
            current = await LatestTransaction(orderId);
        }

        return Result<OrderPaymentResponse>.Success(BuildResponse(order, current));
    }

    // ════════════════════════════════════════════════════════════════════════
    // PIX
    // ════════════════════════════════════════════════════════════════════════

    public async Task<Result<OrderPaymentResponse>> CreatePixAsync(int userId, CreatePixPaymentRequest request)
    {
        if (!_options.IsConfigured)
            return NotConfigured();

        var order = await LoadOwnedOrder(userId, request.Id_Order);
        var invalid = ValidatePayable(order);
        if (invalid != null) return Result<OrderPaymentResponse>.Failure(invalid);

        var amount = PixAmount(order!);
        if (amount <= 0)
            return Result<OrderPaymentResponse>.Failure(Error.Validation("Pagamento", "Valor do pedido inválido."));

        var transactions = await Transactions(order!.Id);
        var blocking = BlockingTransaction(transactions);
        if (blocking != null) return Result<OrderPaymentResponse>.Failure(blocking);

        // Reaproveita o PIX ainda válido (mesmo valor e mais de 2 minutos de prazo): o cliente não paga dois.
        var reusable = transactions.FirstOrDefault(x => x.Method == PaymentMethod.Pix && x.Status == PaymentStatus.Pendente
            && x.Amount == amount && x.Expires_At > DateTime.Now.AddMinutes(2) && !string.IsNullOrEmpty(x.Pix_Qr_Code));
        if (reusable != null)
            return Result<OrderPaymentResponse>.Success(BuildResponse(order, reusable));

        var customer = await _unitOfWork.GetClassAsyncWhere<User_Customer>(x => x.Id == userId);
        if (customer == null || string.IsNullOrWhiteSpace(customer.Email))
            return Result<OrderPaymentResponse>.Failure(Error.Validation("Pagamento", "Cadastre um e-mail válido para pagar com PIX."));

        var hours = Math.Clamp(_options.PixExpirationHours, 0.5, 24 * 30);
        var tx = await InsertTransaction(order, userId, PaymentMethod.Pix, amount, installments: null);

        var mpRequest = new MpCreateOrderRequest
        {
            TotalAmount = FormatAmount(amount),
            ExternalReference = tx.External_Reference,
            Description = $"Pedido {order.Number_Order}",
            Payer = new MpPayer { Email = customer.Email.Trim(), FirstName = FirstName(customer.Name) },
            Transactions = new MpTransactionsRequest
            {
                Payments =
                {
                    new MpPaymentRequest
                    {
                        Amount = FormatAmount(amount),
                        PaymentMethod = new MpPaymentMethodRequest { Id = "pix", Type = "bank_transfer" },
                        ExpirationTime = PaymentStatusMapper.ToIsoDuration(hours),
                    }
                }
            }
        };

        var result = await _mp.CreateOrderAsync(mpRequest, tx.Idempotency_Key);
        var tracked = await TrackedTransaction(tx.Id);

        if (!result.Success || result.Order == null)
        {
            tracked.Status = PaymentStatus.Erro;
            tracked.Error_Message = result.CommunicationFailure
                ? "Não foi possível gerar o PIX agora. Tente novamente em instantes."
                : $"O Mercado Pago não gerou o PIX ({result.ErrorCode}).";
            tracked.Last_Response = MercadoPagoClient.Truncate(result.RawBody, 8000);
            tracked.UpdateDate = DateTime.Now;
            await _unitOfWork.CommitAsync();
            await _notifier.ErrorAsync(order, tracked);
            return Result<OrderPaymentResponse>.Failure(Error.Validation("Pagamento", tracked.Error_Message));
        }

        var payment = result.Order.FirstPayment;
        tracked.Provider_Order_Id = result.Order.Id;
        tracked.Provider_Payment_Id = payment?.Id;
        tracked.Provider_Status = result.Order.Status;
        tracked.Provider_Status_Detail = MercadoPagoClient.Truncate(result.Order.StatusDetail ?? payment?.StatusDetail, 80);
        tracked.Pix_Qr_Code = payment?.PaymentMethod?.QrCode;
        tracked.Pix_Qr_Code_Base64 = payment?.PaymentMethod?.QrCodeBase64;
        tracked.Pix_Ticket_Url = payment?.PaymentMethod?.TicketUrl;
        tracked.Expires_At = ParseProviderDate(payment?.DateOfExpiration) ?? DateTime.Now.AddHours(hours);
        tracked.Status = PaymentStatusMapper.Map(result.Order.Status, result.Order.StatusDetail, payment?.Status, payment?.StatusDetail);
        tracked.Last_Response = MercadoPagoClient.Truncate(result.RawBody, 8000);
        tracked.Last_Sync_At = DateTime.Now;
        tracked.UpdateDate = DateTime.Now;
        await MarkOrderMethod(order.Id, "pix");
        await _unitOfWork.CommitAsync();

        if (string.IsNullOrEmpty(tracked.Pix_Qr_Code))
            _logger.LogWarning("Mercado Pago: PIX do pedido {OrderId} criado sem qr_code. Resposta: {Body}", order.Id, MercadoPagoClient.Truncate(result.RawBody, 2000));

        if (tracked.Status == PaymentStatus.Pendente)
            await _notifier.PixGeneratedAsync(order, tracked);
        else
            await ApplyTransitionAsync(tracked.Id, PaymentStatus.Pendente, "criação do PIX");

        order = await LoadOwnedOrder(userId, order.Id) ?? order;
        return Result<OrderPaymentResponse>.Success(BuildResponse(order, await TrackedTransactionNoCache(tracked.Id)));
    }

    // ════════════════════════════════════════════════════════════════════════
    // Cartão
    // ════════════════════════════════════════════════════════════════════════

    public async Task<Result<OrderPaymentResponse>> CreateCardAsync(int userId, CreateCardPaymentRequest request)
    {
        if (!_options.IsConfigured)
            return NotConfigured();

        if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.Payment_Method_Id))
            return Result<OrderPaymentResponse>.Failure(Error.Validation("Pagamento", "Dados do cartão incompletos. Preencha o formulário novamente."));

        var type = (request.Payment_Type_Id ?? "credit_card").Trim().ToLowerInvariant();
        if (type is not ("credit_card" or "debit_card"))
            return Result<OrderPaymentResponse>.Failure(Error.Validation("Pagamento", "Tipo de cartão não aceito."));

        var installments = type == "debit_card" ? 1 : request.Installments;
        if (installments < 1 || installments > Math.Clamp(_options.MaxInstallments, 1, 24))
            return Result<OrderPaymentResponse>.Failure(Error.Validation("Pagamento", "Número de parcelas inválido."));

        var order = await LoadOwnedOrder(userId, request.Id_Order);
        var invalid = ValidatePayable(order);
        if (invalid != null) return Result<OrderPaymentResponse>.Failure(invalid);

        var amount = CardAmount(order!);
        if (amount <= 0)
            return Result<OrderPaymentResponse>.Failure(Error.Validation("Pagamento", "Valor do pedido inválido."));

        var transactions = await Transactions(order!.Id);
        var blocking = BlockingTransaction(transactions);
        if (blocking != null) return Result<OrderPaymentResponse>.Failure(blocking);

        var customer = await _unitOfWork.GetClassAsyncWhere<User_Customer>(x => x.Id == userId);
        var email = !string.IsNullOrWhiteSpace(request.Payer_Email) ? request.Payer_Email.Trim() : customer?.Email?.Trim();
        if (string.IsNullOrWhiteSpace(email))
            return Result<OrderPaymentResponse>.Failure(Error.Validation("Pagamento", "Informe o e-mail do pagador."));

        var method = type == "debit_card" ? PaymentMethod.DebitCard : PaymentMethod.CreditCard;
        var tx = await InsertTransaction(order, userId, method, amount, installments);

        var mpRequest = new MpCreateOrderRequest
        {
            TotalAmount = FormatAmount(amount),
            ExternalReference = tx.External_Reference,
            Description = $"Pedido {order.Number_Order}",
            Payer = new MpPayer
            {
                Email = email,
                FirstName = FirstName(customer?.Name),
                Identification = string.IsNullOrWhiteSpace(request.Identification_Number) ? null : new MpIdentification
                {
                    Type = string.IsNullOrWhiteSpace(request.Identification_Type) ? "CPF" : request.Identification_Type.Trim(),
                    Number = new string(request.Identification_Number.Where(char.IsLetterOrDigit).ToArray()),
                }
            },
            Transactions = new MpTransactionsRequest
            {
                Payments =
                {
                    new MpPaymentRequest
                    {
                        Amount = FormatAmount(amount),
                        PaymentMethod = new MpPaymentMethodRequest
                        {
                            Id = request.Payment_Method_Id.Trim().ToLowerInvariant(),
                            Type = type,
                            Token = request.Token.Trim(),
                            Installments = installments,
                        }
                    }
                }
            }
        };

        var result = await _mp.CreateOrderAsync(mpRequest, tx.Idempotency_Key);
        var tracked = await TrackedTransaction(tx.Id);
        tracked.Card_Brand = request.Payment_Method_Id.Trim().ToLowerInvariant();
        tracked.Card_Last_Four = OnlyLastFour(request.Last_Four_Digits);
        tracked.Last_Response = MercadoPagoClient.Truncate(result.RawBody, 8000);
        tracked.Last_Sync_At = DateTime.Now;
        tracked.UpdateDate = DateTime.Now;

        if (result.Order == null)
        {
            // Não virou order no Mercado Pago: dado inválido (4xx) ou falha de comunicação.
            tracked.Status = result.CommunicationFailure ? PaymentStatus.Erro : PaymentStatus.Recusado;
            tracked.Provider_Status_Detail = MercadoPagoClient.Truncate(result.ErrorCode, 80);
            tracked.Error_Message = result.CommunicationFailure
                ? "Não foi possível falar com o Mercado Pago agora. Nenhum valor foi cobrado. Tente novamente em instantes."
                : PaymentStatusMapper.RejectionMessage($"{result.ErrorCode} {result.ErrorMessage}");
            await _unitOfWork.CommitAsync();

            if (tracked.Status == PaymentStatus.Recusado) await _notifier.RejectedAsync(order, tracked);
            else await _notifier.ErrorAsync(order, tracked);

            return Result<OrderPaymentResponse>.Success(BuildResponse(order, tracked));
        }

        var payment = result.Order.FirstPayment;
        tracked.Provider_Order_Id = result.Order.Id;
        tracked.Provider_Payment_Id = payment?.Id;
        tracked.Provider_Status = result.Order.Status;
        tracked.Provider_Status_Detail = MercadoPagoClient.Truncate(payment?.StatusDetail ?? result.Order.StatusDetail, 80);
        await MarkOrderMethod(order.Id, "credit");
        await _unitOfWork.CommitAsync();

        // A transição (aprovado / recusado / em análise) faz a troca de status e os avisos.
        var newStatus = NormalizeForMethod(method,
            PaymentStatusMapper.Map(result.Order.Status, result.Order.StatusDetail, payment?.Status, payment?.StatusDetail));
        await ApplyStatusAsync(tracked.Id, newStatus, "cartão");

        order = await LoadOwnedOrder(userId, order.Id) ?? order;
        return Result<OrderPaymentResponse>.Success(BuildResponse(order, await TrackedTransactionNoCache(tracked.Id)));
    }

    // ════════════════════════════════════════════════════════════════════════
    // Webhook
    // ════════════════════════════════════════════════════════════════════════

    public async Task<Result<bool>> HandleWebhookAsync(string? queryDataId, string? queryType, string? signature, string? requestId, string? rawBody)
    {
        MpWebhookBody? body = null;
        if (!string.IsNullOrWhiteSpace(rawBody))
        {
            try { body = JsonSerializer.Deserialize<MpWebhookBody>(rawBody, WebhookJson); }
            catch (JsonException) { /* corpo inválido: segue com a query */ }
        }

        var type = (queryType ?? body?.Type ?? "").Trim().ToLowerInvariant();
        var dataId = !string.IsNullOrWhiteSpace(queryDataId) ? queryDataId.Trim() : body?.Data?.Id?.Trim();

        if (!string.IsNullOrWhiteSpace(_options.WebhookSecret))
        {
            // A assinatura usa o data.id da URL (query). Sem ele, usa o do corpo.
            if (!MercadoPagoSignature.IsValid(signature, requestId, dataId, _options.WebhookSecret, _options.WebhookToleranceMinutes, DateTimeOffset.UtcNow))
            {
                _logger.LogWarning("Webhook Mercado Pago com assinatura inválida (data.id={DataId}, x-request-id={RequestId}).", dataId, requestId);
                return Result<bool>.Failure(Error.Unauthorized("Webhook", "Assinatura inválida."));
            }
        }
        else
        {
            _logger.LogWarning("Webhook Mercado Pago recebido SEM validação de assinatura: configure MercadoPago:WebhookSecret.");
        }

        // Só tratamos o tópico "order" (API Orders). Outros tópicos: confirma o recebimento e ignora.
        if (type != "order" || string.IsNullOrWhiteSpace(dataId))
            return Result<bool>.Success(true);

        var tx = await _unitOfWork.Query<Payment_Transactions>().AsNoTracking()
            .Where(x => x.Provider_Order_Id == dataId)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync();

        if (tx == null)
        {
            _logger.LogInformation("Webhook Mercado Pago para order desconhecida {DataId}: ignorado.", dataId);
            return Result<bool>.Success(true);
        }

        await _unitOfWork.Query<Payment_Transactions>().Where(x => x.Id == tx.Id)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.Last_Webhook_At, DateTime.Now));

        // O corpo do webhook não é a fonte da verdade: consulta a order no Mercado Pago.
        var synced = await SyncWithProviderAsync(tx.Id, "webhook");
        return synced
            ? Result<bool>.Success(true)
            : Result<bool>.Failure(Error.Failure("Webhook", "Não foi possível consultar a order no Mercado Pago."));
    }

    // ════════════════════════════════════════════════════════════════════════
    // Expiração do PIX (rotina)
    // ════════════════════════════════════════════════════════════════════════

    public async Task<int> ExpireOverduePixAsync(CancellationToken ct)
    {
        var now = DateTime.Now;
        var overdue = await _unitOfWork.Query<Payment_Transactions>().AsNoTracking()
            .Where(x => x.Method == PaymentMethod.Pix && x.Status == PaymentStatus.Pendente
                        && x.Expires_At != null && x.Expires_At < now && x.Isdelete != true)
            .OrderBy(x => x.Expires_At)
            .Select(x => new { x.Id, x.Provider_Order_Id })
            .Take(50)
            .ToListAsync(ct);

        var expired = 0;
        foreach (var item in overdue)
        {
            if (ct.IsCancellationRequested) break;

            // Antes de expirar, confere no Mercado Pago: o cliente pode ter pago no último minuto.
            if (!string.IsNullOrEmpty(item.Provider_Order_Id))
            {
                await SyncWithProviderAsync(item.Id, "rotina de expiração");
                var after = await TrackedTransactionNoCache(item.Id);
                if (after == null || after.Status != PaymentStatus.Pendente) { if (after?.Status == PaymentStatus.Expirado) expired++; continue; }

                // Ainda pendente lá: pede o cancelamento para ninguém pagar um PIX vencido.
                await _mp.CancelOrderAsync(item.Provider_Order_Id, Guid.NewGuid().ToString());
            }

            if (await ApplyStatusAsync(item.Id, PaymentStatus.Expirado, "rotina de expiração"))
                expired++;
        }

        return expired;
    }

    // ════════════════════════════════════════════════════════════════════════
    // Núcleo: sincronização e troca de status
    // ════════════════════════════════════════════════════════════════════════

    /// <summary>Consulta a order no Mercado Pago e aplica o status. false = não conseguiu consultar.</summary>
    private async Task<bool> SyncWithProviderAsync(int transactionId, string source)
    {
        var tx = await TrackedTransactionNoCache(transactionId);
        if (tx == null || string.IsNullOrEmpty(tx.Provider_Order_Id)) return true;

        var result = await _mp.GetOrderAsync(tx.Provider_Order_Id);
        if (result.Order == null)
        {
            await _unitOfWork.Query<Payment_Transactions>().Where(x => x.Id == transactionId)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.Last_Sync_At, DateTime.Now));
            return !result.CommunicationFailure && result.StatusCode is >= 400 and < 500;
        }

        var payment = result.Order.FirstPayment;
        var status = NormalizeForMethod(tx.Method,
            PaymentStatusMapper.Map(result.Order.Status, result.Order.StatusDetail, payment?.Status, payment?.StatusDetail));

        var providerStatus = result.Order.Status;
        var providerDetail = MercadoPagoClient.Truncate(payment?.StatusDetail ?? result.Order.StatusDetail, 80);
        var providerPaymentId = payment?.Id ?? tx.Provider_Payment_Id;
        var raw = MercadoPagoClient.Truncate(result.RawBody, 8000);
        var syncedAt = DateTime.Now;

        await _unitOfWork.Query<Payment_Transactions>().Where(x => x.Id == transactionId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Provider_Status, providerStatus)
                .SetProperty(x => x.Provider_Status_Detail, providerDetail)
                .SetProperty(x => x.Provider_Payment_Id, providerPaymentId)
                .SetProperty(x => x.Last_Response, raw)
                .SetProperty(x => x.Last_Sync_At, syncedAt));

        await ApplyStatusAsync(transactionId, status, source);
        return true;
    }

    /// <summary>Muda o status (se mudou) e dispara a troca do pedido e os avisos. true = houve mudança.</summary>
    private async Task<bool> ApplyStatusAsync(int transactionId, string newStatus, string source)
    {
        string previous;

        await Gate.WaitAsync();
        try
        {
            var tx = await _unitOfWork.Query<Payment_Transactions>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == transactionId);
            if (tx == null || tx.Status == newStatus) return false;
            // Estados finais não voltam atrás (ex.: webhook atrasado de "pendente" depois de aprovado).
            if (!CanMove(tx.Status, newStatus)) return false;

            previous = tx.Status;
            var now = DateTime.Now;
            DateTime? paidAt = newStatus == PaymentStatus.Aprovado ? now : tx.Paid_At;
            string? errorMessage = newStatus switch
            {
                PaymentStatus.Recusado => tx.Error_Message ?? PaymentStatusMapper.RejectionMessage(tx.Provider_Status_Detail),
                PaymentStatus.Aprovado => null,
                _ => tx.Error_Message,
            };

            await _unitOfWork.Query<Payment_Transactions>().Where(x => x.Id == transactionId)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.Status, newStatus)
                    .SetProperty(x => x.UpdateDate, now)
                    .SetProperty(x => x.Paid_At, paidAt)
                    .SetProperty(x => x.Error_Message, errorMessage));
        }
        finally
        {
            Gate.Release();
        }

        await ApplyTransitionAsync(transactionId, previous, source);
        return true;
    }

    /// <summary>Efeitos da mudança: confirma o pedido, cancela PIX que sobrou e avisa as pessoas.</summary>
    private async Task ApplyTransitionAsync(int transactionId, string previous, string source)
    {
        var tx = await TrackedTransactionNoCache(transactionId);
        if (tx == null) return;
        var order = await _unitOfWork.GetClassAsyncWhere<Orders>(x => x.Id == tx.Id_Order);
        if (order == null) return;

        switch (tx.Status)
        {
            case PaymentStatus.Aprovado:
                await ConfirmOrderAsync(order, tx, source);
                break;

            case PaymentStatus.EmAnalise:
                await _notifier.InAnalysisAsync(order, tx);
                break;

            case PaymentStatus.Recusado:
                await _notifier.RejectedAsync(order, tx);
                break;

            case PaymentStatus.Expirado:
                if (tx.Method == PaymentMethod.Pix && !IsPaid(order)) await _notifier.ExpiredAsync(order, tx);
                break;

            case PaymentStatus.Estornado:
                await _notifier.RefundedAsync(order, tx);
                break;

            case PaymentStatus.Cancelado:
            case PaymentStatus.Erro:
                await _notifier.ErrorAsync(order, tx);
                break;
        }

        _logger.LogInformation("Pagamento {TxId} do pedido {OrderId}: {Previous} → {Status} ({Source})",
            tx.Id, order.Id, previous, tx.Status, source);
    }

    private async Task ConfirmOrderAsync(Orders order, Payment_Transactions tx, string source)
    {
        var orderCanceled = string.Equals(order.Order_Status, OrderPaymentValues.Cancelado, StringComparison.OrdinalIgnoreCase) || order.Isdelete == true;
        var alreadyPaidByOther = IsPaid(order) && await _unitOfWork.Query<Payment_Transactions>()
            .AnyAsync(x => x.Id_Order == order.Id && x.Id != tx.Id && x.Status == PaymentStatus.Aprovado);

        if (orderCanceled)
        {
            await _notifier.NeedsRefundAlertAsync(order, tx, "o pagamento foi aprovado, mas o pedido está cancelado.");
            return;
        }
        if (alreadyPaidByOther)
        {
            await _notifier.NeedsRefundAlertAsync(order, tx, "o pedido recebeu um segundo pagamento aprovado (pagamento em duplicidade).");
            return;
        }

        var now = DateTime.Now;
        var payTerms = tx.Method == PaymentMethod.Pix ? "pix" : "credit";
        var newOrderStatus = string.Equals(order.Order_Status, OrderPaymentValues.Pendente, StringComparison.OrdinalIgnoreCase) || string.IsNullOrEmpty(order.Order_Status)
            ? OrderPaymentValues.Confirmado
            : order.Order_Status;

        await _unitOfWork.Query<Orders>().Where(x => x.Id == order.Id)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Status_Pay, OrderPaymentValues.Confirmado)
                .SetProperty(x => x.Order_Status, newOrderStatus)
                .SetProperty(x => x.Payment_terms, payTerms)
                .SetProperty(x => x.UpdateDate, now));

        order.Status_Pay = OrderPaymentValues.Confirmado;
        order.Order_Status = newOrderStatus;
        order.Payment_terms = payTerms;

        // PIX que ficou aberto para o mesmo pedido: cancela lá e aqui, para não receber duas vezes.
        var openPix = await _unitOfWork.Query<Payment_Transactions>().AsNoTracking()
            .Where(x => x.Id_Order == order.Id && x.Id != tx.Id && x.Status == PaymentStatus.Pendente)
            .ToListAsync();
        foreach (var other in openPix)
        {
            if (!string.IsNullOrEmpty(other.Provider_Order_Id))
                await _mp.CancelOrderAsync(other.Provider_Order_Id, Guid.NewGuid().ToString());
            await _unitOfWork.Query<Payment_Transactions>().Where(x => x.Id == other.Id && x.Status == PaymentStatus.Pendente)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.Status, PaymentStatus.Cancelado).SetProperty(x => x.UpdateDate, now));
        }

        await _notifier.ApprovedAsync(order, tx, source);
    }

    /// <summary>Cartão "aguardando" (ex.: confirmação do banco) é tratado como em análise: não tem QR para mostrar.</summary>
    private static string NormalizeForMethod(string method, string status)
        => method != PaymentMethod.Pix && status == PaymentStatus.Pendente ? PaymentStatus.EmAnalise : status;

    private static bool CanMove(string from, string to)
    {
        if (from == to) return false;
        return from switch
        {
            PaymentStatus.Pendente or PaymentStatus.EmAnalise or PaymentStatus.Erro => true,
            // Recusado/expirado/cancelado podem virar aprovado (pagamento caiu depois) ou estorno.
            PaymentStatus.Recusado or PaymentStatus.Expirado or PaymentStatus.Cancelado
                => to is PaymentStatus.Aprovado or PaymentStatus.Estornado,
            PaymentStatus.Aprovado => to == PaymentStatus.Estornado,
            _ => false,
        };
    }

    // ════════════════════════════════════════════════════════════════════════
    // Auxiliares
    // ════════════════════════════════════════════════════════════════════════

    private async Task<Orders?> LoadOwnedOrder(int userId, int orderId)
    {
        if (userId <= 0 || orderId <= 0) return null;
        return await _unitOfWork.GetClassAsyncWhere<Orders>(x => x.Id == orderId && x.Id_User_Customer == userId && x.Isdelete != true);
    }

    private static Error? ValidatePayable(Orders? order)
    {
        if (order == null)
            return Error.NotFound("Pagamento", "Pedido não encontrado.");
        if (IsPaid(order))
            return Error.Conflict("Pagamento", "Este pedido já está pago.");
        if (string.Equals(order.Order_Status, OrderPaymentValues.Cancelado, StringComparison.OrdinalIgnoreCase))
            return Error.Validation("Pagamento", "Este pedido foi cancelado e não pode ser pago.");
        if (!string.IsNullOrEmpty(order.Order_Status) && !string.Equals(order.Order_Status, OrderPaymentValues.Pendente, StringComparison.OrdinalIgnoreCase))
            return Error.Validation("Pagamento", "Este pedido não está aguardando pagamento.");
        return null;
    }

    /// <summary>Cartão em análise impede novo pagamento (evita cobrar duas vezes).</summary>
    private static Error? BlockingTransaction(List<Payment_Transactions> transactions)
    {
        if (transactions.Any(x => x.Status == PaymentStatus.Aprovado))
            return Error.Conflict("Pagamento", "Este pedido já tem um pagamento aprovado.");
        if (transactions.Any(x => x.Status == PaymentStatus.EmAnalise))
            return Error.Conflict("Pagamento", "Já existe um pagamento em análise para este pedido. Aguarde a resposta da operadora.");
        return null;
    }

    private static bool IsPaid(Orders order)
        => string.Equals(order.Status_Pay, OrderPaymentValues.Confirmado, StringComparison.OrdinalIgnoreCase);

    private decimal CardAmount(Orders order) => Math.Round((decimal)order.Total_Value_Order, 2, MidpointRounding.AwayFromZero);

    private decimal PixAmount(Orders order)
    {
        var total = CardAmount(order);
        var discount = Math.Clamp((decimal)_options.PixDiscountPercent, 0m, 100m);
        return Math.Round(total * (1 - discount / 100m), 2, MidpointRounding.AwayFromZero);
    }

    private async Task<List<Payment_Transactions>> Transactions(int orderId)
        => await _unitOfWork.Query<Payment_Transactions>().AsNoTracking()
            .Where(x => x.Id_Order == orderId && x.Isdelete != true)
            .OrderByDescending(x => x.Id)
            .ToListAsync();

    private async Task<Payment_Transactions?> LatestTransaction(int orderId)
        => await _unitOfWork.Query<Payment_Transactions>().AsNoTracking()
            .Where(x => x.Id_Order == orderId && x.Isdelete != true)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync();

    private async Task<Payment_Transactions> TrackedTransaction(int id)
        => await _unitOfWork.Query<Payment_Transactions>().FirstAsync(x => x.Id == id);

    private async Task<Payment_Transactions?> TrackedTransactionNoCache(int id)
        => await _unitOfWork.Query<Payment_Transactions>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);

    private async Task<Payment_Transactions> InsertTransaction(Orders order, int userId, string method, decimal amount, int? installments)
    {
        var key = Guid.NewGuid().ToString();
        return await _unitOfWork.InsertAsyncReturnId(new Payment_Transactions
        {
            Id_Order = order.Id,
            Id_User_Customer = userId,
            Provider = Provider,
            Method = method,
            Status = PaymentStatus.Pendente,
            External_Reference = $"{order.Number_Order}-{key[..8]}",
            Idempotency_Key = key,
            Amount = amount,
            Installments = installments,
            InsertDate = DateTime.Now,
            Isdelete = false,
        });
    }

    /// <summary>Guarda no pedido a forma escolhida por último (aparece em Meus pedidos e no admin).</summary>
    private async Task MarkOrderMethod(int orderId, string terms)
        => await _unitOfWork.Query<Orders>().Where(x => x.Id == orderId && x.Payment_terms != terms)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.Payment_terms, terms));

    private OrderPaymentResponse BuildResponse(Orders order, Payment_Transactions? tx) => new()
    {
        Id_Order = order.Id,
        Number_Order = order.Number_Order,
        Status_Pay = order.Status_Pay ?? "",
        Order_Status = order.Order_Status ?? "",
        Payment_Terms = order.Payment_terms ?? "",
        Total_Value_Order = order.Total_Value_Order,
        Pix_Amount = PixAmount(order),
        Card_Amount = CardAmount(order),
        Can_Pay = ValidatePayable(order) == null && !(tx != null && tx.Status == PaymentStatus.EmAnalise),
        Server_Time = DateTime.Now,
        Current = tx == null ? null : new PaymentTransactionResponse
        {
            Id = tx.Id,
            Method = tx.Method,
            Status = tx.Status,
            Status_Detail = tx.Provider_Status_Detail,
            Message = MessageFor(tx),
            Amount = tx.Amount,
            Installments = tx.Installments,
            Card_Brand = tx.Card_Brand,
            Card_Last_Four = tx.Card_Last_Four,
            // QR só enquanto o PIX está aberto
            Pix_Qr_Code = tx.Status == PaymentStatus.Pendente ? tx.Pix_Qr_Code : null,
            Pix_Qr_Code_Base64 = tx.Status == PaymentStatus.Pendente ? tx.Pix_Qr_Code_Base64 : null,
            Pix_Ticket_Url = tx.Status == PaymentStatus.Pendente ? tx.Pix_Ticket_Url : null,
            Expires_At = tx.Expires_At,
            Paid_At = tx.Paid_At,
            InsertDate = tx.InsertDate,
        }
    };

    private static string? MessageFor(Payment_Transactions tx) => tx.Status switch
    {
        PaymentStatus.Aprovado => "Pagamento aprovado.",
        PaymentStatus.Pendente when tx.Method == PaymentMethod.Pix => "Aguardando o pagamento do PIX.",
        PaymentStatus.EmAnalise => "Pagamento em análise. Você será avisado assim que a operadora responder.",
        PaymentStatus.Recusado => tx.Error_Message ?? PaymentStatusMapper.RejectionMessage(tx.Provider_Status_Detail),
        PaymentStatus.Expirado => "O prazo deste PIX terminou. Gere um novo PIX ou pague com cartão.",
        PaymentStatus.Cancelado => "Este pagamento foi cancelado.",
        PaymentStatus.Estornado => "Este pagamento foi estornado.",
        PaymentStatus.Erro => tx.Error_Message ?? "Não foi possível processar o pagamento.",
        _ => null,
    };

    private Result<OrderPaymentResponse> NotConfigured()
    {
        _logger.LogWarning("Pagamento solicitado, mas o Mercado Pago não está configurado (MercadoPago:AccessToken/PublicKey).");
        return Result<OrderPaymentResponse>.Failure(Error.Validation("Pagamento", "Pagamento online indisponível no momento. Tente novamente mais tarde."));
    }

    private static string FormatAmount(decimal value) => value.ToString("0.00", CultureInfo.InvariantCulture);

    private static string? FirstName(string? name)
    {
        var first = (name ?? "").Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();
        return string.IsNullOrEmpty(first) ? null : first;
    }

    private static string? OnlyLastFour(string? value)
    {
        var digits = new string((value ?? "").Where(char.IsDigit).ToArray());
        return digits.Length >= 4 ? digits[^4..] : null;
    }

    /// <summary>Datas do Mercado Pago vêm com fuso (ex.: -04:00): converte para o horário local do servidor.</summary>
    private static DateTime? ParseProviderDate(string? value)
        => DateTimeOffset.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed)
            ? parsed.LocalDateTime
            : null;
}
