#nullable enable
using System.Globalization;
using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces;
using Mercado.Craibas.Application.Interfaces.Services;
using Mercado.Craibas.Application.Payments;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Mercado.Craibas.Application.Services;

/// <summary>Andamento da devolução (coluna Orders.Return_Status).</summary>
public static class OrderReturnStatus
{
    public const string EmAnalise = "EM_ANALISE";
    public const string AguardandoColeta = "AGUARDANDO_COLETA";
    public const string Devolvido = "DEVOLVIDO";
    public const string Cancelada = "CANCELADA";

    public static string Label(string? status) => status switch
    {
        EmAnalise => "Em análise de devolução",
        AguardandoColeta => "Aguardando coleta do produto",
        Devolvido => "Devolvido",
        Cancelada => "Devolução cancelada",
        _ => status ?? "",
    };
}

/// <summary>
/// Pós-venda: cancelamento pelo cliente e devolução (direito de arrependimento).
///
/// Cancelar (cliente): só com o pedido PENDENTE ou CONFIRMADO (antes de PREPARANDO).
///   - PENDENTE: cancela e encerra o PIX aberto.
///   - CONFIRMADO: estorna no Mercado Pago e devolve o estoque. Se o estorno falhar, NÃO cancela.
/// Devolver (cliente): pedido ENTREGUE, até 7 dias após a entrega, uma vez por pedido.
///   Andamento (admin): EM_ANALISE → AGUARDANDO_COLETA → DEVOLVIDO (estorno + estoque),
///   ou CANCELADA (devolução recusada; o pedido continua entregue).
/// O status do pedido (Order_Status) continua ENTREGUE durante a devolução, para não mexer
/// no ganho do entregador nem nas avaliações. O andamento fica em Return_Status.
/// </summary>
public interface IOrderAfterSaleService
{
    Task<Result<bool>> CancelByCustomerAsync(int userId, int orderId, string? reason);
    Task<Result<bool>> RequestReturnAsync(int userId, int orderId, string reason);
    Task<Result<OrderReturnsAdminResponse>> GetReturnsAsync(string? filter);
    Task<Result<bool>> UpdateReturnStatusAsync(int adminId, int orderId, string status, string? note);
}

public sealed class OrderAfterSaleService : IOrderAfterSaleService
{
    public const int ReturnWindowDays = 7;
    private static readonly CultureInfo PtBr = new("pt-BR");

    private readonly IUnitOfWork _unitOfWork;
    private readonly IPaymentService _payment;
    private readonly IOrderStockService _stock;
    private readonly INotificationService _notification;
    private readonly IEmailService _email;
    private readonly IOrderStatusNotifier _statusNotifier;
    private readonly MercadoPagoOptions _options;
    private readonly ILogger<OrderAfterSaleService> _logger;

    public OrderAfterSaleService(IUnitOfWork unitOfWork, IPaymentService payment, IOrderStockService stock,
        INotificationService notification, IEmailService email, IOrderStatusNotifier statusNotifier,
        IOptions<MercadoPagoOptions> options, ILogger<OrderAfterSaleService> logger)
    {
        _unitOfWork = unitOfWork;
        _payment = payment;
        _stock = stock;
        _notification = notification;
        _email = email;
        _statusNotifier = statusNotifier;
        _options = options.Value;
        _logger = logger;
    }

    // ════════════════════════════════════════════════════════════════════════
    // Cancelamento pelo cliente
    // ════════════════════════════════════════════════════════════════════════

    public async Task<Result<bool>> CancelByCustomerAsync(int userId, int orderId, string? reason)
    {
        reason = Clean(reason, 500);
        var order = await _unitOfWork.GetClassAsyncWhere<Orders>(x => x.Id == orderId && x.Id_User_Customer == userId && x.Isdelete != true);
        if (order == null)
            return Result<bool>.Failure(Error.NotFound("Pedido", "Pedido não encontrado."));

        var status = (order.Order_Status ?? "").ToUpperInvariant();
        if (status != "PENDENTE" && status != "CONFIRMADO")
            return Result<bool>.Failure(Error.Validation("Pedido", status == "CANCELADO"
                ? "Este pedido já está cancelado."
                : "Este pedido já está em preparação e não pode mais ser cancelado pelo site. Fale com a loja."));

        if (await _payment.HasPaymentInAnalysisAsync(orderId))
            return Result<bool>.Failure(Error.Validation("Pedido", "O pagamento deste pedido está em análise. Aguarde a resposta da operadora para cancelar."));

        var now = DateTime.Now;
        var previousPay = order.Status_Pay;
        // Pago = confirmado OU pagamento já aprovado (ex.: o admin voltou o status para pendente depois do pagamento).
        var paid = status == "CONFIRMADO" || string.Equals(previousPay, "CONFIRMADO", StringComparison.OrdinalIgnoreCase);

        // Reserva o cancelamento de forma atômica: se o admin mudou o status agora, não cancela.
        var claimed = await _unitOfWork.Query<Orders>()
            .Where(x => x.Id == orderId && x.Order_Status == status)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Order_Status, "CANCELADO")
                .SetProperty(x => x.Cancel_Reason, reason)
                .SetProperty(x => x.Canceled_At, now)
                .SetProperty(x => x.Canceled_By, "CLIENTE")
                .SetProperty(x => x.UpdateDate, now));
        if (claimed == 0)
            return Result<bool>.Failure(Error.Validation("Pedido", "O status do pedido mudou. Atualize a página e confira."));

        var refundNote = "";
        if (!paid)
        {
            await _payment.CancelOpenPixAsync(orderId);
            await SetPayStatus(orderId, "CANCELADO");
            // Se o estoque já tinha sido baixado (o admin mexeu no status antes), devolve. Sem baixa, não faz nada.
            await _stock.RestockAsync(orderId);
        }
        else
        {
            var outcome = await _payment.RefundApprovedPaymentAsync(orderId, "cancelamento pelo cliente");
            if (outcome == RefundOutcome.Failed)
            {
                // Estorno não saiu: desfaz o cancelamento para o cliente não ficar sem produto e sem dinheiro.
                await _unitOfWork.Query<Orders>().Where(x => x.Id == orderId)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(x => x.Order_Status, status)
                        .SetProperty(x => x.Cancel_Reason, (string?)null)
                        .SetProperty(x => x.Canceled_At, (DateTime?)null)
                        .SetProperty(x => x.Canceled_By, (string?)null));

                await NotifyAdmins(order, "Falha no estorno", "Cancelamento não concluído",
                    $"O cliente tentou cancelar o pedido Nº {order.Number_Order}, mas o estorno no Mercado Pago falhou. O pedido continua {status}. Verifique no painel do Mercado Pago.",
                    "AlertTriangle");
                await Log(order, "Falha no cancelamento", $"Estorno do pedido #{order.Number_Order} recusado pelo Mercado Pago; pedido mantido como {status}.", userId, "CLIENTE");

                return Result<bool>.Failure(Error.Validation("Pedido", "Não foi possível estornar o pagamento agora, então o pedido não foi cancelado. Tente novamente em alguns minutos ou fale com a loja."));
            }

            if (outcome == RefundOutcome.Refunded)
            {
                await SetPayStatus(orderId, "ESTORNADO");
                refundNote = " O valor pago foi estornado.";
            }
            else
            {
                await SetPayStatus(orderId, "CANCELADO");
                refundNote = " A loja vai entrar em contato para devolver o valor pago.";
                await NotifyAdmins(order, "Estorno manual", "Estornar pagamento manualmente",
                    $"O pedido Nº {order.Number_Order} foi cancelado pelo cliente e não tem pagamento online para estorno automático. Devolva o valor ao cliente.",
                    "AlertTriangle");
            }

            await _stock.RestockAsync(orderId);
        }

        // Avisos: cliente (e-mail + notificação, no padrão das trocas de status) e administradores.
        try { await _statusNotifier.NotifyCustomerAsync(orderId, "CANCELADO", null, now); }
        catch (Exception ex) { _logger.LogWarning(ex, "Falha ao avisar o cliente do cancelamento do pedido {OrderId}", orderId); }

        await NotifyAdmins(order, "Pedido cancelado", "Pedido cancelado pelo cliente",
            $"O cliente cancelou o pedido Nº {order.Number_Order} ({Money(order.Total_Value_Order)}).{refundNote}{(string.IsNullOrEmpty(reason) ? "" : $" Motivo: {reason}")}",
            "CircleX");

        await Log(order, "Pedido cancelado pelo cliente",
            $"Pedido #{order.Number_Order} cancelado pelo cliente (estava {status}; pagamento: {previousPay}).{refundNote} Motivo: {(string.IsNullOrEmpty(reason) ? "não informado" : reason)}",
            userId, "CLIENTE");

        return Result<bool>.Success(true);
    }

    // ════════════════════════════════════════════════════════════════════════
    // Devolução: pedido do cliente
    // ════════════════════════════════════════════════════════════════════════

    public async Task<Result<bool>> RequestReturnAsync(int userId, int orderId, string reason)
    {
        reason = Clean(reason, 500) ?? "";
        if (reason.Length < 5)
            return Result<bool>.Failure(Error.Validation("Devolução", "Conte o motivo da devolução (mínimo de 5 caracteres)."));

        var order = await _unitOfWork.GetClassAsyncWhere<Orders>(x => x.Id == orderId && x.Id_User_Customer == userId && x.Isdelete != true);
        if (order == null)
            return Result<bool>.Failure(Error.NotFound("Pedido", "Pedido não encontrado."));

        if (!string.Equals(order.Order_Status, "ENTREGUE", StringComparison.OrdinalIgnoreCase))
            return Result<bool>.Failure(Error.Validation("Devolução", "A devolução só pode ser pedida depois que o pedido for entregue."));

        if (order.Return_Status != null)
            return Result<bool>.Failure(Error.Validation("Devolução", "Já existe uma solicitação de devolução para este pedido."));

        var deliveredAt = order.CustomerDeliveryDate ?? order.UpdateDate ?? order.InsertDate;
        if (DateTime.Now > deliveredAt.AddDays(ReturnWindowDays))
            return Result<bool>.Failure(Error.Validation("Devolução", $"O prazo de {ReturnWindowDays} dias para devolução terminou em {deliveredAt.AddDays(ReturnWindowDays):dd/MM/yyyy}."));

        var now = DateTime.Now;
        var claimed = await _unitOfWork.Query<Orders>()
            .Where(x => x.Id == orderId && x.Return_Status == null)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Return_Status, OrderReturnStatus.EmAnalise)
                .SetProperty(x => x.Return_Reason, reason)
                .SetProperty(x => x.Return_Requested_At, now)
                .SetProperty(x => x.Return_Updated_At, now)
                .SetProperty(x => x.UpdateDate, now));
        if (claimed == 0)
            return Result<bool>.Failure(Error.Validation("Devolução", "Já existe uma solicitação de devolução para este pedido."));

        var customer = await Customer(order);
        await NotifyCustomer(order, customer, "Devolução", "Solicitação de devolução recebida",
            $"Recebemos o pedido de devolução do pedido Nº {order.Number_Order}. Em breve entraremos em contato pelo WhatsApp para combinar a coleta.",
            "RotateCcw", "DEVOLUCAO_EM_ANALISE",
            $"<p style='margin:14px 0 0 0;'>Motivo informado: <strong>{Html(reason)}</strong></p>");

        await NotifyAdmins(order, "Pedido de devolução", "Novo pedido de devolução",
            $"{customer?.Name ?? "Cliente"} pediu a devolução do pedido Nº {order.Number_Order} ({Money(order.Total_Value_Order)}). Motivo: {reason}",
            "RotateCcw");

        await Log(order, "Pedido de devolução",
            $"Cliente pediu devolução do pedido #{order.Number_Order}. Motivo: {reason}", userId, "CLIENTE");

        return Result<bool>.Success(true);
    }

    // ════════════════════════════════════════════════════════════════════════
    // Devolução: admin
    // ════════════════════════════════════════════════════════════════════════

    public async Task<Result<OrderReturnsAdminResponse>> GetReturnsAsync(string? filter)
    {
        var query = _unitOfWork.Query<Orders>().AsNoTracking().Where(x => x.Return_Status != null && x.Isdelete != true);

        var counts = await query.GroupBy(x => x.Return_Status!).Select(g => new { g.Key, Count = g.Count() }).ToListAsync();

        filter = (filter ?? "open").Trim().ToUpperInvariant();
        if (filter == "OPEN")
            query = query.Where(x => x.Return_Status == OrderReturnStatus.EmAnalise || x.Return_Status == OrderReturnStatus.AguardandoColeta);
        else if (filter != "ALL")
            query = query.Where(x => x.Return_Status == filter);

        var rows = await query
            .OrderByDescending(x => x.Return_Requested_At)
            .Take(200)
            .Select(x => new
            {
                x.Id,
                x.Number_Order,
                CustomerName = x.User_Customer != null ? x.User_Customer.Name : "",
                CustomerPhone = x.User_Customer != null ? x.User_Customer.Phone : null,
                CustomerEmail = x.User_Customer != null ? x.User_Customer.Email : null,
                AddressPhone = x.Address != null ? x.Address.Phone : null,
                Address = x.Address != null ? x.Address.Road + ", " + x.Address.Number + " - " + x.Address.Neighborhood + ", " + x.Address.City : null,
                x.Total_Value_Order,
                x.Payment_terms,
                x.Status_Pay,
                x.Return_Status,
                x.Return_Reason,
                x.Return_Admin_Note,
                x.Return_Requested_At,
                x.Return_Updated_At,
                x.CustomerDeliveryDate,
                x.UpdateDate,
                Items = x.OrderLineItens.Where(i => i.Isdelete != true).Sum(i => i.Quantity),
                FirstProduct = x.OrderLineItens.Where(i => i.Isdelete != true).Select(i => i.Name_Product).FirstOrDefault(),
                FirstImage = x.OrderLineItens.Where(i => i.Isdelete != true)
                    .SelectMany(i => i.Product.Imagens_Products.Where(img => img.Isdelete != true).Select(img => img.Url_Imagem))
                    .FirstOrDefault(),
            })
            .ToListAsync();

        var ids = rows.Select(r => r.Id).ToList();
        var paidOnline = await _unitOfWork.Query<Payment_Transactions>().AsNoTracking()
            .Where(t => ids.Contains(t.Id_Order) && (t.Status == PaymentStatus.Aprovado || t.Status == PaymentStatus.Estornado))
            .Select(t => t.Id_Order).Distinct().ToListAsync();

        var response = new OrderReturnsAdminResponse
        {
            ByStatus = counts.ToDictionary(c => c.Key, c => c.Count),
            Items = rows.Select(r => new OrderReturnAdminResponse
            {
                Id_Order = r.Id,
                Number_Order = r.Number_Order,
                Customer_Name = r.CustomerName ?? "",
                Customer_Phone = string.IsNullOrWhiteSpace(r.CustomerPhone) ? r.AddressPhone : r.CustomerPhone,
                Customer_Email = r.CustomerEmail,
                Address = r.Address,
                Total_Value_Order = r.Total_Value_Order,
                Payment_terms = r.Payment_terms ?? "",
                Status_Pay = r.Status_Pay ?? "",
                Return_Status = r.Return_Status ?? "",
                Return_Reason = r.Return_Reason,
                Return_Admin_Note = r.Return_Admin_Note,
                Return_Requested_At = r.Return_Requested_At,
                Return_Updated_At = r.Return_Updated_At,
                Delivered_At = r.CustomerDeliveryDate ?? r.UpdateDate,
                Items = r.Items,
                First_Product = r.FirstProduct,
                First_Image = r.FirstImage,
                Online_Refund = paidOnline.Contains(r.Id),
            }).ToList(),
        };
        response.Open = response.ByStatus.GetValueOrDefault(OrderReturnStatus.EmAnalise) + response.ByStatus.GetValueOrDefault(OrderReturnStatus.AguardandoColeta);

        return Result<OrderReturnsAdminResponse>.Success(response);
    }

    public async Task<Result<bool>> UpdateReturnStatusAsync(int adminId, int orderId, string status, string? note)
    {
        status = (status ?? "").Trim().ToUpperInvariant();
        note = Clean(note, 500);

        if (status is not (OrderReturnStatus.AguardandoColeta or OrderReturnStatus.Devolvido or OrderReturnStatus.Cancelada))
            return Result<bool>.Failure(Error.Validation("Devolução", "Status de devolução inválido."));

        if (status == OrderReturnStatus.Cancelada && (note == null || note.Length < 5))
            return Result<bool>.Failure(Error.Validation("Devolução", "Explique ao cliente por que a devolução foi cancelada (mínimo de 5 caracteres)."));

        var order = await _unitOfWork.GetClassAsyncWhere<Orders>(x => x.Id == orderId && x.Isdelete != true);
        if (order == null || order.Return_Status == null)
            return Result<bool>.Failure(Error.NotFound("Devolução", "Pedido de devolução não encontrado."));

        var current = order.Return_Status;
        var allowed = current switch
        {
            OrderReturnStatus.EmAnalise => status is OrderReturnStatus.AguardandoColeta or OrderReturnStatus.Devolvido or OrderReturnStatus.Cancelada,
            OrderReturnStatus.AguardandoColeta => status is OrderReturnStatus.Devolvido or OrderReturnStatus.Cancelada,
            _ => false,
        };
        if (!allowed)
            return Result<bool>.Failure(Error.Validation("Devolução",
                $"Não é possível mudar de \"{OrderReturnStatus.Label(current)}\" para \"{OrderReturnStatus.Label(status)}\"."));

        var admin = await _unitOfWork.GetClassAsyncWhere<User_Admin>(x => x.Id == adminId);
        var now = DateTime.Now;
        var refundNote = "";

        // Reserva a mudança: dois admins ao mesmo tempo não estornam duas vezes.
        var claimed = await _unitOfWork.Query<Orders>()
            .Where(x => x.Id == orderId && x.Return_Status == current)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Return_Status, status)
                .SetProperty(x => x.Return_Admin_Note, note)
                .SetProperty(x => x.Return_Updated_At, now)
                .SetProperty(x => x.UpdateDate, now));
        if (claimed == 0)
            return Result<bool>.Failure(Error.Validation("Devolução", "Esta devolução acabou de ser alterada. Atualize a lista."));

        if (status == OrderReturnStatus.Devolvido)
        {
            var outcome = await _payment.RefundApprovedPaymentAsync(orderId, "devolução");
            if (outcome == RefundOutcome.Failed)
            {
                await _unitOfWork.Query<Orders>().Where(x => x.Id == orderId)
                    .ExecuteUpdateAsync(s => s.SetProperty(x => x.Return_Status, current).SetProperty(x => x.Return_Admin_Note, order.Return_Admin_Note));
                return Result<bool>.Failure(Error.Validation("Devolução", "O Mercado Pago não fez o estorno agora. Nada foi alterado: tente de novo em alguns minutos ou estorne pelo painel do Mercado Pago."));
            }

            if (outcome == RefundOutcome.Refunded)
            {
                await SetPayStatus(orderId, "ESTORNADO");
                refundNote = " O valor pago foi estornado.";
            }
            else
            {
                refundNote = " A loja vai devolver o valor pago.";
            }

            await _stock.RestockAsync(orderId);
        }

        var customer = await Customer(order);
        var (title, message, icon, emailStatus) = status switch
        {
            OrderReturnStatus.AguardandoColeta => ("Devolução aprovada",
                $"A devolução do pedido Nº {order.Number_Order} foi aprovada. Vamos buscar o produto; combinaremos o horário pelo WhatsApp.",
                "Truck", "DEVOLUCAO_COLETA"),
            OrderReturnStatus.Devolvido => ("Devolução concluída",
                $"Recebemos o produto do pedido Nº {order.Number_Order} e a devolução foi concluída.{refundNote}",
                "CircleCheck", "DEVOLVIDO"),
            _ => ("Devolução cancelada",
                $"A devolução do pedido Nº {order.Number_Order} foi cancelada. {note}",
                "CircleX", "DEVOLUCAO_CANCELADA"),
        };

        await NotifyCustomer(order, customer, "Devolução", title, message, icon, emailStatus,
            string.IsNullOrEmpty(note) ? "" : $"<p style='margin:14px 0 0 0;'>Observação da loja: <strong>{Html(note)}</strong></p>");

        await Log(order, "Devolução atualizada",
            $"{admin?.Name ?? "Administrador"} mudou a devolução do pedido #{order.Number_Order}: '{OrderReturnStatus.Label(current)}' → '{OrderReturnStatus.Label(status)}'.{refundNote}{(string.IsNullOrEmpty(note) ? "" : $" Observação: {note}")}",
            adminId, "Admin");

        return Result<bool>.Success(true);
    }

    // ════════════════════════════════════════════════════════════════════════
    // Auxiliares
    // ════════════════════════════════════════════════════════════════════════

    private Task SetPayStatus(int orderId, string value)
        => _unitOfWork.Query<Orders>().Where(x => x.Id == orderId).ExecuteUpdateAsync(s => s.SetProperty(x => x.Status_Pay, value));

    private Task<User_Customer?> Customer(Orders order)
        => order.Id_User_Customer == null
            ? Task.FromResult<User_Customer?>(null)
            : _unitOfWork.GetClassAsyncWhere<User_Customer>(x => x.Id == order.Id_User_Customer);

    private async Task NotifyCustomer(Orders order, User_Customer? customer, string kind, string title, string description, string icon, string emailStatus, string extraHtml)
    {
        if (customer == null) return;
        try
        {
            await _notification.SendNotification(new NotificationRequest
            {
                Kind = kind,
                Title = title,
                Description = description,
                Icone = icon,
                ActionUrl = "/orders",
                ReferenceId = order.Id,
                ReferenceType = "ORDER",
                Role = "CLIENTE"
            }, new List<NotificationUserRequest> { new() { UserId = customer.Id } });
        }
        catch (Exception ex) { _logger.LogWarning(ex, "Falha ao notificar o cliente do pedido {OrderId}", order.Id); }

        if (string.IsNullOrWhiteSpace(customer.Email)) return;
        try
        {
            var html = _email.EmailPedidoLayout(
                titulo: title,
                subtitulo: $"Pedido #{order.Number_Order}",
                status: emailStatus,
                conteudoHtml: $@"
                    <p style='margin:0;'>Olá, <strong>{Html(customer.Name)}</strong>!</p>
                    <p style='margin:14px 0 0 0;'>{Html(description)}</p>{extraHtml}",
                textoBotao: "Ver meus pedidos",
                linkBotao: $"{_options.SiteUrl.TrimEnd('/')}/orders");
            await _email.EnviarEmailAsync(customer.Email, $"{title} · Pedido #{order.Number_Order}", html);
        }
        catch (Exception ex) { _logger.LogWarning(ex, "Falha ao enviar e-mail do pedido {OrderId}", order.Id); }
    }

    private async Task NotifyAdmins(Orders order, string kind, string title, string description, string icon)
    {
        try
        {
            var admins = await _unitOfWork.GetClassListAsyncWhere<User_Admin>(x => x.Isdelete != true && x.Ativo == true);
            if (admins.Count == 0) return;
            await _notification.SendNotification(new NotificationRequest
            {
                Kind = kind,
                Title = title,
                Description = description,
                Icone = icon,
                ActionUrl = "/admin",
                ReferenceId = order.Id,
                ReferenceType = "ORDER",
                Role = "ADMIN"
            }, admins.Select(a => new NotificationUserRequest { UserId = a.Id }).ToList());
        }
        catch (Exception ex) { _logger.LogWarning(ex, "Falha ao notificar administradores do pedido {OrderId}", order.Id); }
    }

    private async Task Log(Orders order, string action, string info, int userId, string level)
    {
        try
        {
            var now = DateTime.Now;
            await _unitOfWork.SaveLogUser(new LogRequest
            {
                Id_User = userId,
                Tipo = "PÓS-VENDA",
                Nivel = level,
                Acao = action,
                Info = info,
                Log = $"{action} · Pedido N°:{order.Number_Order} (ID: {order.Id}) \n{info} \nData/Hora: {now:dd/MM/yyyy HH:mm:ss}",
                InsertDate = now
            }, userId);
        }
        catch (Exception ex) { _logger.LogWarning(ex, "Falha ao gravar log do pedido {OrderId}", order.Id); }
    }

    private static string? Clean(string? value, int max)
    {
        var v = (value ?? "").Trim();
        if (v.Length == 0) return null;
        return v.Length > max ? v[..max] : v;
    }

    private static string Money(double value) => value.ToString("C", PtBr);
    private static string Html(string? value) => System.Net.WebUtility.HtmlEncode(value ?? "");
}
