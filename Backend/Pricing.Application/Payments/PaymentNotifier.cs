#nullable enable
using System.Globalization;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.Interfaces;
using Mercado.Craibas.Application.Interfaces.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Mercado.Craibas.Application.Payments;

/// <summary>
/// Avisos do pagamento, no mesmo padrão do resto do site:
/// e-mail (EmailPedidoLayout), notificação no sino (NotificationService) e log na Movimentação (Logs).
/// Nenhum aviso derruba o pagamento: falhas só vão para o log do servidor.
/// </summary>


public sealed class PaymentNotifier : IPaymentNotifier
{
    private const string LogType = "PAGAMENTO";
    private static readonly CultureInfo PtBr = new("pt-BR");

    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _email;
    private readonly INotificationService _notification;
    private readonly MercadoPagoOptions _options;
    private readonly ILogger<PaymentNotifier> _logger;

    public PaymentNotifier(IUnitOfWork unitOfWork, IEmailService email, INotificationService notification,
        IOptions<MercadoPagoOptions> options, ILogger<PaymentNotifier> logger)
    {
        _unitOfWork = unitOfWork;
        _email = email;
        _notification = notification;
        _options = options.Value;
        _logger = logger;
    }

    public async Task PixGeneratedAsync(Orders order, Payment_Transactions tx)
    {
        var customer = await GetCustomer(order);
        var expires = FormatDate(tx.Expires_At);

        await NotifyCustomer(order, customer, "Pagamento PIX", "PIX gerado",
            $"O PIX do pedido Nº {order.Number_Order} no valor de {Money(tx.Amount)} foi gerado. Pague até {expires} para confirmar sua compra.",
            "QrCode", "PAYMENT");

        await NotifyAdmins(order, "Pagamento PIX", "Pagamento PIX pendente",
            $"Pedido Nº {order.Number_Order} de {customer?.Name ?? "cliente"} aguarda o PIX de {Money(tx.Amount)} (vence em {expires}).",
            "Clock");

        await Log(order, customer, tx, "PIX gerado",
            $"PIX gerado para o pedido #{order.Number_Order} · {Money(tx.Amount)} · vence {expires}");
    }

    public async Task ApprovedAsync(Orders order, Payment_Transactions tx, string source)
    {
        var customer = await GetCustomer(order);
        var method = MethodLabel(tx);

        if (customer != null)
        {
            var html = _email.EmailPedidoLayout(
                titulo: "Pagamento aprovado",
                subtitulo: "Recebemos o seu pagamento.",
                status: OrderPaymentValues.Confirmado,
                conteudoHtml: $@"
                    <p style='margin:0;'>Olá, <strong>{Html(customer.Name)}</strong>!</p>
                    <p style='margin:14px 0 0 0;'>O pagamento do pedido <strong style='color:#f97316;'>#{Html(order.Number_Order)}</strong> foi aprovado.</p>
                    <p style='margin:8px 0 0 0;'>Forma de pagamento: <strong>{Html(method)}</strong></p>
                    <p style='margin:8px 0 0 0;'>Valor pago: <strong>{Money(tx.Amount)}</strong></p>
                    <p style='margin:14px 0 0 0;'>Agora vamos separar os seus produtos. Você recebe um aviso a cada nova etapa.</p>",
                textoBotao: "Acompanhar pedido",
                linkBotao: OrdersUrl());

            await SendEmail(customer.Email, $"Pagamento aprovado · Pedido #{order.Number_Order}", html);
        }

        await NotifyCustomer(order, customer, "Pagamento aprovado", "Pagamento aprovado",
            $"Recebemos o pagamento de {Money(tx.Amount)} ({method}) do pedido Nº {order.Number_Order}. Seu pedido foi confirmado!",
            "CircleCheck", "PAYMENT");

        await NotifyAdmins(order, "Pagamento aprovado", "Pagamento aprovado",
            $"Pedido Nº {order.Number_Order} pago via {method} ({Money(tx.Amount)}). O pedido foi confirmado e pode ser preparado.",
            "CircleCheck");

        await Log(order, customer, tx, "Pagamento aprovado",
            $"Pagamento aprovado do pedido #{order.Number_Order} · {method} · {Money(tx.Amount)} · origem: {source}");
    }

    public async Task InAnalysisAsync(Orders order, Payment_Transactions tx)
    {
        var customer = await GetCustomer(order);

        await NotifyCustomer(order, customer, "Pagamento em análise", "Pagamento em análise",
            $"O pagamento do pedido Nº {order.Number_Order} está em análise pela operadora. Avisaremos assim que for concluído.",
            "Clock", "PAYMENT");

        await Log(order, customer, tx, "Pagamento em análise",
            $"Pagamento do pedido #{order.Number_Order} em análise · {MethodLabel(tx)} · {Money(tx.Amount)}");
    }

    public async Task RejectedAsync(Orders order, Payment_Transactions tx)
    {
        var customer = await GetCustomer(order);

        await NotifyCustomer(order, customer, "Pagamento recusado", "Pagamento não aprovado",
            $"O pagamento do pedido Nº {order.Number_Order} não foi aprovado. {tx.Error_Message} Você pode tentar de novo em Meus pedidos.",
            "CircleX", "PAYMENT");

        await NotifyAdmins(order, "Pagamento recusado", "Pagamento recusado",
            $"O cartão do pedido Nº {order.Number_Order} ({customer?.Name ?? "cliente"}) foi recusado ({tx.Provider_Status_Detail ?? "sem detalhe"}). O pedido continua pendente.",
            "CircleX");

        await Log(order, customer, tx, "Pagamento recusado",
            $"Pagamento recusado do pedido #{order.Number_Order} · {MethodLabel(tx)} · {Money(tx.Amount)} · motivo: {tx.Provider_Status_Detail ?? "não informado"}");
    }

    public async Task ExpiredAsync(Orders order, Payment_Transactions tx)
    {
        var customer = await GetCustomer(order);

        if (customer != null)
        {
            var html = _email.EmailPedidoLayout(
                titulo: "O prazo do PIX terminou",
                subtitulo: "Seu pedido ainda pode ser pago.",
                status: "PAGAMENTO_EXPIRADO",
                conteudoHtml: $@"
                    <p style='margin:0;'>Olá, <strong>{Html(customer.Name)}</strong>!</p>
                    <p style='margin:14px 0 0 0;'>O PIX do pedido <strong style='color:#f97316;'>#{Html(order.Number_Order)}</strong> no valor de <strong>{Money(tx.Amount)}</strong> venceu em {FormatDate(tx.Expires_At)} sem pagamento.</p>
                    <p style='margin:14px 0 0 0;'>Se ainda quiser os produtos, acesse <strong>Meus pedidos</strong> e gere um novo PIX ou pague com cartão.</p>",
                textoBotao: "Ir para Meus pedidos",
                linkBotao: OrdersUrl());

            await SendEmail(customer.Email, $"PIX expirado · Pedido #{order.Number_Order}", html);
        }

        await NotifyCustomer(order, customer, "PIX expirado", "O prazo do PIX terminou",
            $"O PIX do pedido Nº {order.Number_Order} venceu sem pagamento. Gere um novo PIX ou pague com cartão em Meus pedidos.",
            "TimerOff", "PAYMENT");

        await NotifyAdmins(order, "PIX expirado", "PIX expirado",
            $"O PIX do pedido Nº {order.Number_Order} ({customer?.Name ?? "cliente"}) venceu sem pagamento. O pedido continua pendente.",
            "TimerOff");

        await Log(order, customer, tx, "PIX expirado",
            $"PIX do pedido #{order.Number_Order} expirou sem pagamento · {Money(tx.Amount)} · venceu {FormatDate(tx.Expires_At)}");
    }

    public async Task RefundedAsync(Orders order, Payment_Transactions tx)
    {
        var customer = await GetCustomer(order);

        await NotifyCustomer(order, customer, "Pagamento estornado", "Pagamento estornado",
            $"O pagamento de {Money(tx.Amount)} do pedido Nº {order.Number_Order} foi estornado.",
            "RotateCcw", "PAYMENT");

        await NotifyAdmins(order, "Pagamento estornado", "Pagamento estornado",
            $"O pagamento do pedido Nº {order.Number_Order} foi estornado/contestado no Mercado Pago ({tx.Provider_Status}). Verifique o pedido.",
            "RotateCcw");

        await Log(order, customer, tx, "Pagamento estornado",
            $"Pagamento do pedido #{order.Number_Order} estornado · status Mercado Pago: {tx.Provider_Status}/{tx.Provider_Status_Detail}");
    }

    public async Task NeedsRefundAlertAsync(Orders order, Payment_Transactions tx, string reason)
    {
        var customer = await GetCustomer(order);

        await NotifyAdmins(order, "Pagamento para estornar", "Atenção: pagamento a estornar",
            $"Pedido Nº {order.Number_Order}: {reason} Valor {Money(tx.Amount)} ({MethodLabel(tx)}). Faça o estorno no painel do Mercado Pago.",
            "AlertTriangle");

        await Log(order, customer, tx, "Pagamento a estornar",
            $"Pedido #{order.Number_Order}: {reason} · {MethodLabel(tx)} · {Money(tx.Amount)} · order Mercado Pago {tx.Provider_Order_Id}");
    }

    public async Task ErrorAsync(Orders order, Payment_Transactions tx)
    {
        var customer = await GetCustomer(order);
        await Log(order, customer, tx, "Erro no pagamento",
            $"Falha ao processar o pagamento do pedido #{order.Number_Order} · {MethodLabel(tx)} · {tx.Error_Message}");
    }

    // ── auxiliares ──────────────────────────────────────────────────────────

    private async Task<User_Customer?> GetCustomer(Orders order)
        => order.Id_User_Customer == null ? null
            : await _unitOfWork.GetClassAsyncWhere<User_Customer>(x => x.Id == order.Id_User_Customer);

    private async Task NotifyCustomer(Orders order, User_Customer? customer, string kind, string title, string description, string icon, string referenceType)
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
                ReferenceType = referenceType,
                Role = "CLIENTE"
            }, new List<NotificationUserRequest> { new() { UserId = customer.Id } });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Pagamento: falha ao notificar o cliente do pedido {OrderId}", order.Id);
        }
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
            }, admins.Select(x => new NotificationUserRequest { UserId = x.Id }).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Pagamento: falha ao notificar os administradores do pedido {OrderId}", order.Id);
        }
    }

    private async Task Log(Orders order, User_Customer? customer, Payment_Transactions tx, string action, string info)
    {
        try
        {
            var now = DateTime.Now;
            await _unitOfWork.SaveLogUser(new LogRequest
            {
                Id_User = customer?.Id ?? order.Id_User_Customer ?? 0,
                Tipo = LogType,
                Nivel = "Sistema",
                Acao = action,
                Info = info,
                Log =
                    $"{action} · Pedido N°:{order.Number_Order} (ID: {order.Id}) \n" +
                    $"Cliente: {customer?.Name ?? "Não identificado"} | ID Cliente: {customer?.Id} \n" +
                    $"Forma: {MethodLabel(tx)} | Valor: {Money(tx.Amount)} | Status: {tx.Status} \n" +
                    $"Mercado Pago: order {tx.Provider_Order_Id ?? "-"} | pagamento {tx.Provider_Payment_Id ?? "-"} | " +
                    $"{tx.Provider_Status ?? "-"}/{tx.Provider_Status_Detail ?? "-"} \n" +
                    $"Data/Hora: {now:dd/MM/yyyy HH:mm:ss}",
                InsertDate = now
            }, customer?.Id);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Pagamento: falha ao gravar log do pedido {OrderId}", order.Id);
        }
    }

    private async Task SendEmail(string to, string subject, string html)
    {
        try
        {
            if (!await _email.EnviarEmailAsync(to, subject, html))
                _logger.LogWarning("Pagamento: e-mail não enviado para {To} ({Subject})", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Pagamento: falha ao enviar e-mail para {To}", to);
        }
    }

    private string OrdersUrl() => $"{_options.SiteUrl.TrimEnd('/')}/orders";

    internal static string MethodLabel(Payment_Transactions tx) => tx.Method switch
    {
        PaymentMethod.Pix => "PIX",
        PaymentMethod.DebitCard => CardLabel("Cartão de débito", tx),
        _ => CardLabel(tx.Installments is > 1 ? $"Cartão de crédito em {tx.Installments}x" : "Cartão de crédito", tx),
    };

    private static string CardLabel(string label, Payment_Transactions tx)
        => string.IsNullOrWhiteSpace(tx.Card_Last_Four) ? label : $"{label} •••• {tx.Card_Last_Four}";

    private static string Money(decimal value) => value.ToString("C", PtBr);
    private static string FormatDate(DateTime? value) => value?.ToString("dd/MM/yyyy 'às' HH:mm", PtBr) ?? "-";
    private static string Html(string? value) => System.Net.WebUtility.HtmlEncode(value ?? "");
}
