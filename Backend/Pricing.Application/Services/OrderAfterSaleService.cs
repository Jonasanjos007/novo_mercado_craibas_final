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
    /// <summary>Devolução aprovada: falta buscar o produto (aparece nas entregas como coleta).</summary>
    public const string AguardandoColeta = "AGUARDANDO_COLETA";
    /// <summary>Entregador (ou admin) saiu para buscar.</summary>
    public const string EmColeta = "EM_COLETA";
    /// <summary>Produto buscado; falta o admin conferir e concluir (estorno).</summary>
    public const string Coletado = "COLETADO";
    public const string Devolvido = "DEVOLVIDO";
    public const string Cancelada = "CANCELADA";

    public static readonly string[] Open = { EmAnalise, AguardandoColeta, EmColeta, Coletado };

    public static string Label(string? status) => status switch
    {
        EmAnalise => "Em análise de devolução",
        AguardandoColeta => "Aguardando coleta do produto",
        EmColeta => "Saiu para coleta",
        Coletado => "Produto coletado",
        Devolvido => "Devolvido",
        Cancelada => "Devolução cancelada",
        _ => status ?? "",
    };

    /// <summary>Devolução em andamento ou concluída (o produto não pode mais ser avaliado).</summary>
    public static bool BlocksReview(string? status) => status != null && status != Cancelada;
}

/// <summary>Pedido de cancelamento (coluna Orders.Cancel_Status).</summary>
public static class OrderCancelStatus
{
    /// <summary>Cliente pediu; aguardando o admin ("Cancelamento em andamento").</summary>
    public const string Solicitado = "SOLICITADO";
    public const string Recusado = "RECUSADO";
    public const string Aprovado = "APROVADO";

    public static string Label(string? status) => status switch
    {
        Solicitado => "Cancelamento em andamento",
        Recusado => "Cancelamento recusado",
        Aprovado => "Cancelamento aprovado",
        _ => status ?? "",
    };
}

/// <summary>
/// Pós-venda: cancelamento pelo cliente e devolução (direito de arrependimento).
///
/// Cancelar (cliente): pedido PENDENTE ou CONFIRMADO (antes de PREPARANDO).
///   - Sem pagamento: cancela na hora e encerra o PIX aberto.
///   - Pago: vira "Cancelamento em andamento" (Cancel_Status = SOLICITADO). O admin aprova
///     (cancela, estorna e devolve o estoque) ou recusa com uma explicação (o pedido segue).
/// Devolver (cliente): pedido ENTREGUE, até 7 dias após a entrega, uma vez por pedido.
///   EM_ANALISE → (admin aprova) AGUARDANDO_COLETA → (entregador/admin sai) EM_COLETA
///   → (coletou) COLETADO → (admin confere) DEVOLVIDO = estorno + estoque.
///   A coleta funciona como uma entrega: aparece no quadro de entregas, pode ir para um
///   entregador ou para o próprio admin, e a coleta feita por entregador conta no ganho dele.
///   CANCELADA = devolução recusada; o pedido continua entregue.
/// Order_Status continua ENTREGUE durante a devolução; o andamento fica em Return_Status.
/// </summary>
public interface IOrderAfterSaleService
{
    Task<Result<bool>> CancelByCustomerAsync(int userId, int orderId, string? reason);
    Task<Result<OrderCancelsAdminResponse>> GetCancellationsAsync(string? filter);
    Task<Result<bool>> DecideCancellationAsync(int adminId, int orderId, bool approve, string? note);

    Task<Result<bool>> RequestReturnAsync(int userId, int orderId, string reason);
    Task<Result<OrderReturnsAdminResponse>> GetReturnsAsync(string? filter);
    Task<Result<bool>> UpdateReturnStatusAsync(int adminId, int orderId, string status, string? note);

    // ── Coleta da devolução (chamado pelas entregas) ──
    /// <summary>true = o pedido está com a coleta da devolução em aberto (aguardando ou em coleta).</summary>
    Task<bool> IsPickupAsync(int orderId);
    Task<Result<bool>> TakePickupAsync(int adminId, int orderId, bool force);
    Task<Result<bool>> ReleasePickupAsync(int adminId, int orderId);
    Task<Result<bool>> AssignPickupAsync(int adminId, int orderId, int deliveryId);
    Task<Result<bool>> UnassignPickupAsync(int adminId, int orderId);
    /// <summary>actor: ADMIN ou DELIVERY.</summary>
    Task<Result<bool>> DispatchPickupAsync(string actor, int actorId, int orderId);
    Task<Result<bool>> CollectPickupAsync(string actor, int actorId, int orderId, string? whoHanded);
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
    // Cancelamento: cliente
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

        // Pago = confirmado OU pagamento já aprovado (ex.: o admin voltou o status para pendente depois do pagamento).
        var paid = status == "CONFIRMADO" || string.Equals(order.Status_Pay, "CONFIRMADO", StringComparison.OrdinalIgnoreCase);

        return paid
            ? await RequestPaidCancellationAsync(order, status, reason, userId)
            : await CancelUnpaidAsync(order, status, reason, userId);
    }

    /// <summary>Sem pagamento: não há o que estornar, cancela na hora.</summary>
    private async Task<Result<bool>> CancelUnpaidAsync(Orders order, string status, string? reason, int userId)
    {
        var orderId = order.Id;
        if (await _payment.HasPaymentInAnalysisAsync(orderId))
            return Result<bool>.Failure(Error.Validation("Pedido", "O pagamento deste pedido está em análise. Aguarde a resposta da operadora para cancelar."));

        var now = DateTime.Now;
        var previousPay = order.Status_Pay;

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

        await _payment.CancelOpenPixAsync(orderId);
        await SetPayStatus(orderId, "CANCELADO");
        // Se o estoque já tinha sido baixado (o admin mexeu no status antes), devolve. Sem baixa, não faz nada.
        await _stock.RestockAsync(orderId);

        try { await _statusNotifier.NotifyCustomerAsync(orderId, "CANCELADO", null, now); }
        catch (Exception ex) { _logger.LogWarning(ex, "Falha ao avisar o cliente do cancelamento do pedido {OrderId}", orderId); }

        await NotifyAdmins(order, "Pedido cancelado", "Pedido cancelado pelo cliente",
            $"O cliente cancelou o pedido Nº {order.Number_Order} ({Money(order.Total_Value_Order)}), que ainda não estava pago.{(string.IsNullOrEmpty(reason) ? "" : $" Motivo: {reason}")}",
            "CircleX");

        await Log(order, "Pedido cancelado pelo cliente",
            $"Pedido #{order.Number_Order} cancelado pelo cliente (estava {status}; pagamento: {previousPay}). Motivo: {(string.IsNullOrEmpty(reason) ? "não informado" : reason)}",
            userId, "CLIENTE");

        return Result<bool>.Success(true);
    }

    /// <summary>Pago: vira "Cancelamento em andamento" e espera o admin.</summary>
    private async Task<Result<bool>> RequestPaidCancellationAsync(Orders order, string status, string? reason, int userId)
    {
        if (order.Cancel_Status == OrderCancelStatus.Solicitado)
            return Result<bool>.Failure(Error.Validation("Pedido", "O cancelamento deste pedido já está em andamento. A loja vai responder em breve."));
        if (order.Cancel_Status == OrderCancelStatus.Recusado)
            return Result<bool>.Failure(Error.Validation("Pedido", "A loja já respondeu ao pedido de cancelamento deste pedido. Se precisar, fale com a loja pelo WhatsApp."));

        if (reason == null || reason.Length < 3)
            return Result<bool>.Failure(Error.Validation("Pedido", "Conte rapidamente o motivo do cancelamento."));

        var now = DateTime.Now;
        var claimed = await _unitOfWork.Query<Orders>()
            .Where(x => x.Id == order.Id && x.Order_Status == status && x.Cancel_Status == null)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Cancel_Status, OrderCancelStatus.Solicitado)
                .SetProperty(x => x.Cancel_Reason, reason)
                .SetProperty(x => x.Cancel_Requested_At, now)
                .SetProperty(x => x.Cancel_Admin_Note, (string?)null)
                .SetProperty(x => x.UpdateDate, now));
        if (claimed == 0)
            return Result<bool>.Failure(Error.Validation("Pedido", "O status do pedido mudou. Atualize a página e confira."));

        var customer = await Customer(order);
        await NotifyCustomer(order, customer, "Cancelamento", "Cancelamento em andamento",
            $"Recebemos seu pedido de cancelamento do pedido Nº {order.Number_Order}. A loja vai analisar e, se aprovado, o valor pago é estornado na mesma forma de pagamento.",
            "Clock", "CANCELAMENTO_SOLICITADO",
            $"<p style='margin:14px 0 0 0;'>Motivo informado: <strong>{Html(reason)}</strong></p>");

        await NotifyAdmins(order, "Pedido de cancelamento", "Cliente pediu cancelamento",
            $"{customer?.Name ?? "Cliente"} pediu o cancelamento do pedido Nº {order.Number_Order} ({Money(order.Total_Value_Order)}), que já está pago. Aprove ou recuse em Pedidos › Cancelamentos. Motivo: {reason}",
            "CircleX");

        await Log(order, "Pedido de cancelamento",
            $"Cliente pediu o cancelamento do pedido #{order.Number_Order} (estava {status}, pago). Motivo: {reason}", userId, "CLIENTE");

        return Result<bool>.Success(true);
    }

    // ════════════════════════════════════════════════════════════════════════
    // Cancelamento: admin
    // ════════════════════════════════════════════════════════════════════════

    public async Task<Result<OrderCancelsAdminResponse>> GetCancellationsAsync(string? filter)
    {
        var query = _unitOfWork.Query<Orders>().AsNoTracking().Where(x => x.Cancel_Status != null && x.Isdelete != true);

        var counts = await query.GroupBy(x => x.Cancel_Status!).Select(g => new { g.Key, Count = g.Count() }).ToListAsync();

        filter = (filter ?? "open").Trim().ToUpperInvariant();
        if (filter == "OPEN")
            query = query.Where(x => x.Cancel_Status == OrderCancelStatus.Solicitado);
        else if (filter != "ALL")
            query = query.Where(x => x.Cancel_Status == filter);

        var rows = await query
            .OrderByDescending(x => x.Cancel_Requested_At)
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
                x.Order_Status,
                x.Cancel_Status,
                x.Cancel_Reason,
                x.Cancel_Admin_Note,
                x.Cancel_Requested_At,
                x.Cancel_Decided_At,
                x.InsertDate,
                Assignee = x.User_Delivery != null ? x.User_Delivery.Name : (x.User_Admin_Delivery != null ? x.User_Admin_Delivery.Name : null),
                Items = x.OrderLineItens.Where(i => i.Isdelete != true).Sum(i => i.Quantity),
                FirstProduct = x.OrderLineItens.Where(i => i.Isdelete != true).Select(i => i.Name_Product).FirstOrDefault(),
                FirstImage = x.OrderLineItens.Where(i => i.Isdelete != true)
                    .SelectMany(i => i.Product.Imagens_Products.Where(img => img.Isdelete != true).Select(img => img.Url_Imagem))
                    .FirstOrDefault(),
            })
            .ToListAsync();

        var paidOnline = await PaidOnlineAsync(rows.Select(r => r.Id).ToList());

        var response = new OrderCancelsAdminResponse
        {
            ByStatus = counts.ToDictionary(c => c.Key, c => c.Count),
            Items = rows.Select(r => new OrderCancelAdminResponse
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
                Order_Status = r.Order_Status ?? "",
                Cancel_Status = r.Cancel_Status ?? "",
                Cancel_Reason = r.Cancel_Reason,
                Cancel_Admin_Note = r.Cancel_Admin_Note,
                Cancel_Requested_At = r.Cancel_Requested_At,
                Cancel_Decided_At = r.Cancel_Decided_At,
                Order_Date = r.InsertDate,
                Items = r.Items,
                First_Product = r.FirstProduct,
                First_Image = r.FirstImage,
                Online_Refund = paidOnline.Contains(r.Id),
                Delivery_Assignee_Name = r.Assignee,
            }).ToList(),
        };
        response.Open = response.ByStatus.GetValueOrDefault(OrderCancelStatus.Solicitado);

        return Result<OrderCancelsAdminResponse>.Success(response);
    }

    public async Task<Result<bool>> DecideCancellationAsync(int adminId, int orderId, bool approve, string? note)
    {
        note = Clean(note, 500);
        var order = await _unitOfWork.GetClassAsyncWhere<Orders>(x => x.Id == orderId && x.Isdelete != true);
        if (order == null || order.Cancel_Status == null)
            return Result<bool>.Failure(Error.NotFound("Cancelamento", "Pedido de cancelamento não encontrado."));
        if (order.Cancel_Status != OrderCancelStatus.Solicitado)
            return Result<bool>.Failure(Error.Validation("Cancelamento", $"Este pedido já foi respondido ({OrderCancelStatus.Label(order.Cancel_Status)}). Atualize a lista."));

        var admin = await _unitOfWork.GetClassAsyncWhere<User_Admin>(x => x.Id == adminId);
        var adminName = admin?.Name ?? "Administrador";
        var now = DateTime.Now;
        var customer = await Customer(order);

        if (!approve)
        {
            if (note == null || note.Length < 5)
                return Result<bool>.Failure(Error.Validation("Cancelamento", "Explique ao cliente por que o cancelamento não foi aprovado (mínimo de 5 caracteres)."));

            var refused = await _unitOfWork.Query<Orders>()
                .Where(x => x.Id == orderId && x.Cancel_Status == OrderCancelStatus.Solicitado)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.Cancel_Status, OrderCancelStatus.Recusado)
                    .SetProperty(x => x.Cancel_Admin_Note, note)
                    .SetProperty(x => x.Cancel_Decided_At, now)
                    .SetProperty(x => x.UpdateDate, now));
            if (refused == 0)
                return Result<bool>.Failure(Error.Validation("Cancelamento", "Este pedido acabou de ser alterado. Atualize a lista."));

            await NotifyCustomer(order, customer, "Cancelamento", "Cancelamento não aprovado",
                $"O cancelamento do pedido Nº {order.Number_Order} não foi aprovado e o pedido segue normalmente. {note}",
                "CircleX", "CANCELAMENTO_RECUSADO",
                $"<p style='margin:14px 0 0 0;'>Resposta da loja: <strong>{Html(note)}</strong></p>");

            await Log(order, "Cancelamento recusado",
                $"{adminName} recusou o pedido de cancelamento do pedido #{order.Number_Order}. Resposta: {note}", adminId, "ADMIN");

            return Result<bool>.Success(true);
        }

        var status = (order.Order_Status ?? "").ToUpperInvariant();
        if (status is "SAIU_PARA_ENTREGA" or "ENTREGUE")
            return Result<bool>.Failure(Error.Validation("Cancelamento",
                "O pedido já saiu para entrega. Recuse o cancelamento e, se o cliente não quiser o produto, ele pode pedir a devolução depois de receber."));
        if (status == "CANCELADO")
            return Result<bool>.Failure(Error.Validation("Cancelamento", "Este pedido já está cancelado."));

        // Reserva: só um admin aprova e só se ninguém mudou o pedido agora.
        var claimed = await _unitOfWork.Query<Orders>()
            .Where(x => x.Id == orderId && x.Cancel_Status == OrderCancelStatus.Solicitado && x.Order_Status == order.Order_Status)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Order_Status, "CANCELADO")
                .SetProperty(x => x.Cancel_Status, OrderCancelStatus.Aprovado)
                .SetProperty(x => x.Cancel_Admin_Note, note)
                .SetProperty(x => x.Cancel_Decided_At, now)
                .SetProperty(x => x.Canceled_At, now)
                .SetProperty(x => x.Canceled_By, "CLIENTE")
                .SetProperty(x => x.UpdateDate, now));
        if (claimed == 0)
            return Result<bool>.Failure(Error.Validation("Cancelamento", "Este pedido acabou de ser alterado. Atualize a lista."));

        var outcome = await _payment.RefundApprovedPaymentAsync(orderId, "cancelamento aprovado");
        if (outcome == RefundOutcome.Failed)
        {
            // Estorno não saiu: desfaz para o cliente não ficar sem produto e sem dinheiro.
            await _unitOfWork.Query<Orders>().Where(x => x.Id == orderId)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.Order_Status, order.Order_Status)
                    .SetProperty(x => x.Cancel_Status, OrderCancelStatus.Solicitado)
                    .SetProperty(x => x.Cancel_Admin_Note, order.Cancel_Admin_Note)
                    .SetProperty(x => x.Cancel_Decided_At, (DateTime?)null)
                    .SetProperty(x => x.Canceled_At, (DateTime?)null)
                    .SetProperty(x => x.Canceled_By, (string?)null));
            await Log(order, "Falha no cancelamento",
                $"Estorno do pedido #{order.Number_Order} recusado pelo Mercado Pago; o cancelamento continua em andamento.", adminId, "ADMIN");
            return Result<bool>.Failure(Error.Validation("Cancelamento",
                "O Mercado Pago não fez o estorno agora, então o pedido não foi cancelado. Tente de novo em alguns minutos ou estorne pelo painel do Mercado Pago."));
        }

        string refundNote;
        if (outcome == RefundOutcome.Refunded)
        {
            await SetPayStatus(orderId, "ESTORNADO");
            refundNote = " O valor pago foi estornado.";
        }
        else
        {
            await SetPayStatus(orderId, "CANCELADO");
            refundNote = " A loja vai devolver o valor pago.";
            await NotifyAdmins(order, "Estorno manual", "Estornar pagamento manualmente",
                $"O cancelamento do pedido Nº {order.Number_Order} foi aprovado, mas o pagamento não foi online. Devolva {Money(order.Total_Value_Order)} ao cliente.",
                "AlertTriangle");
        }

        await _stock.RestockAsync(orderId);

        try { await _statusNotifier.NotifyCustomerAsync(orderId, "CANCELADO", null, now); }
        catch (Exception ex) { _logger.LogWarning(ex, "Falha ao avisar o cliente do cancelamento do pedido {OrderId}", orderId); }

        await Log(order, "Cancelamento aprovado",
            $"{adminName} aprovou o cancelamento do pedido #{order.Number_Order} (estava {status}).{refundNote}{(note == null ? "" : $" Observação: {note}")}",
            adminId, "ADMIN");

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
            query = query.Where(x => OrderReturnStatus.Open.Contains(x.Return_Status!));
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
                PickupType = x.Return_Id_User_Delivery != null ? "DELIVERY" : (x.Return_Id_User_Admin_Delivery != null ? "ADMIN" : "NONE"),
                PickupName = x.Return_User_Delivery != null ? x.Return_User_Delivery.Name : (x.Return_User_Admin_Delivery != null ? x.Return_User_Admin_Delivery.Name : null),
                x.Return_DispatchedAt,
                x.Return_CollectedAt,
                x.Return_WhoHanded,
                Items = x.OrderLineItens.Where(i => i.Isdelete != true).Sum(i => i.Quantity),
                FirstProduct = x.OrderLineItens.Where(i => i.Isdelete != true).Select(i => i.Name_Product).FirstOrDefault(),
                FirstImage = x.OrderLineItens.Where(i => i.Isdelete != true)
                    .SelectMany(i => i.Product.Imagens_Products.Where(img => img.Isdelete != true).Select(img => img.Url_Imagem))
                    .FirstOrDefault(),
            })
            .ToListAsync();

        var paidOnline = await PaidOnlineAsync(rows.Select(r => r.Id).ToList());

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
                Pickup_Assignee_Type = r.PickupType,
                Pickup_Assignee_Name = r.PickupName,
                Pickup_Dispatched_At = r.Return_DispatchedAt,
                Pickup_Collected_At = r.Return_CollectedAt,
                Pickup_Who_Handed = r.Return_WhoHanded,
            }).ToList(),
        };
        response.Open = OrderReturnStatus.Open.Sum(s => response.ByStatus.GetValueOrDefault(s));

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

        // Devolvido (estorno) só depois da aprovação: com o produto coletado ou trazido pelo cliente.
        var current = order.Return_Status;
        var allowed = current switch
        {
            OrderReturnStatus.EmAnalise => status is OrderReturnStatus.AguardandoColeta or OrderReturnStatus.Cancelada,
            OrderReturnStatus.AguardandoColeta => status is OrderReturnStatus.Devolvido or OrderReturnStatus.Cancelada,
            OrderReturnStatus.EmColeta => status is OrderReturnStatus.Cancelada,
            OrderReturnStatus.Coletado => status is OrderReturnStatus.Devolvido,
            _ => false,
        };
        if (!allowed)
            return Result<bool>.Failure(Error.Validation("Devolução", current == OrderReturnStatus.EmColeta && status == OrderReturnStatus.Devolvido
                ? "A coleta ainda está a caminho. Confirme a coleta nas entregas e depois conclua a devolução."
                : $"Não é possível mudar de \"{OrderReturnStatus.Label(current)}\" para \"{OrderReturnStatus.Label(status)}\"."));

        var admin = await _unitOfWork.GetClassAsyncWhere<User_Admin>(x => x.Id == adminId);
        var now = DateTime.Now;
        var refundNote = "";
        var clearPickup = status == OrderReturnStatus.Cancelada;

        // Reserva a mudança: dois admins ao mesmo tempo não estornam duas vezes.
        var claimed = await _unitOfWork.Query<Orders>()
            .Where(x => x.Id == orderId && x.Return_Status == current)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Return_Status, status)
                .SetProperty(x => x.Return_Admin_Note, note)
                .SetProperty(x => x.Return_Updated_At, now)
                .SetProperty(x => x.Return_Id_User_Delivery, x => clearPickup ? null : x.Return_Id_User_Delivery)
                .SetProperty(x => x.Return_Id_User_Admin_Delivery, x => clearPickup ? null : x.Return_Id_User_Admin_Delivery)
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
                $"A devolução do pedido Nº {order.Number_Order} foi aprovada. Vamos buscar o produto no endereço de entrega; combinaremos o horário pelo WhatsApp.",
                "Truck", "DEVOLUCAO_COLETA"),
            OrderReturnStatus.Devolvido => ("Devolução concluída",
                $"Conferimos o produto do pedido Nº {order.Number_Order} e a devolução foi concluída.{refundNote}",
                "CircleCheck", "DEVOLVIDO"),
            _ => ("Devolução cancelada",
                $"A devolução do pedido Nº {order.Number_Order} foi cancelada. {note}",
                "CircleX", "DEVOLUCAO_CANCELADA"),
        };

        await NotifyCustomer(order, customer, "Devolução", title, message, icon, emailStatus,
            string.IsNullOrEmpty(note) ? "" : $"<p style='margin:14px 0 0 0;'>Observação da loja: <strong>{Html(note)}</strong></p>");

        await Log(order, "Devolução atualizada",
            $"{admin?.Name ?? "Administrador"} mudou a devolução do pedido #{order.Number_Order}: '{OrderReturnStatus.Label(current)}' → '{OrderReturnStatus.Label(status)}'.{refundNote}{(string.IsNullOrEmpty(note) ? "" : $" Observação: {note}")}",
            adminId, "ADMIN");

        return Result<bool>.Success(true);
    }

    // ════════════════════════════════════════════════════════════════════════
    // Coleta da devolução (quadro de entregas e portal do entregador)
    // ════════════════════════════════════════════════════════════════════════

    public Task<bool> IsPickupAsync(int orderId)
        => _unitOfWork.Query<Orders>().AnyAsync(x => x.Id == orderId && x.Isdelete != true
            && (x.Return_Status == OrderReturnStatus.AguardandoColeta || x.Return_Status == OrderReturnStatus.EmColeta));

    private Task<Orders?> OpenPickupAsync(int orderId)
        => _unitOfWork.GetClassAsyncWhere<Orders>(x => x.Id == orderId && x.Isdelete != true
            && (x.Return_Status == OrderReturnStatus.AguardandoColeta || x.Return_Status == OrderReturnStatus.EmColeta));

    public async Task<Result<bool>> TakePickupAsync(int adminId, int orderId, bool force)
    {
        var admin = await _unitOfWork.GetClassAsyncWhere<User_Admin>(x => x.Id == adminId && x.Isdelete != true);
        if (admin == null)
            return Result<bool>.Failure(Error.NotFound("Admin.NotFound", "Administrador não encontrado."));

        var order = await OpenPickupAsync(orderId);
        if (order == null)
            return Result<bool>.Failure(Error.NotFound("Delivery.OrderNotFound", "Esta coleta não está mais disponível. Atualize a lista."));

        if (order.Return_Id_User_Admin_Delivery == adminId)
            return Result<bool>.Success(true);

        if (!force && (order.Return_Id_User_Delivery != null || order.Return_Id_User_Admin_Delivery != null))
            return Result<bool>.Failure(Error.Conflict("Delivery.AlreadyAssigned", $"Esta coleta já está com {await PickupHolderAsync(order)}."));

        var previous = order.Return_Id_User_Delivery != null || order.Return_Id_User_Admin_Delivery != null ? await PickupHolderAsync(order) : null;
        var now = DateTime.Now;
        var updated = await _unitOfWork.Query<Orders>()
            .Where(x => x.Id == orderId && x.Return_Status == order.Return_Status
                        && x.Return_Id_User_Delivery == order.Return_Id_User_Delivery
                        && x.Return_Id_User_Admin_Delivery == order.Return_Id_User_Admin_Delivery)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Return_Id_User_Delivery, (int?)null)
                .SetProperty(x => x.Return_Id_User_Admin_Delivery, (int?)adminId)
                .SetProperty(x => x.Return_AssignedAt, (DateTime?)now)
                .SetProperty(x => x.UpdateDate, (DateTime?)now));
        if (updated == 0)
            return Result<bool>.Failure(Error.Conflict("Delivery.Changed", "A coleta foi alterada por outra pessoa. Atualize a lista."));

        await DeliveryLog(order, adminId, "ADMIN", "Pegou coleta de devolução",
            $"{admin.Name} vai buscar o produto da devolução do pedido #{order.Number_Order}" + (previous != null ? $" (antes com {previous})." : "."));
        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> ReleasePickupAsync(int adminId, int orderId)
    {
        var now = DateTime.Now;
        var updated = await _unitOfWork.Query<Orders>()
            .Where(x => x.Id == orderId && x.Isdelete != true
                        && x.Return_Id_User_Admin_Delivery == adminId
                        && x.Return_Status == OrderReturnStatus.AguardandoColeta)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Return_Id_User_Admin_Delivery, (int?)null)
                .SetProperty(x => x.Return_AssignedAt, (DateTime?)null)
                .SetProperty(x => x.UpdateDate, (DateTime?)now));
        if (updated == 0)
            return Result<bool>.Failure(Error.Conflict("Delivery.CannotRelease", "Só é possível soltar uma coleta que está com você e ainda não saiu."));

        var order = await _unitOfWork.GetClassAsyncWhere<Orders>(x => x.Id == orderId);
        if (order != null)
            await DeliveryLog(order, adminId, "ADMIN", "Soltou coleta", $"O administrador (ID {adminId}) soltou a coleta da devolução do pedido #{order.Number_Order}.");
        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> AssignPickupAsync(int adminId, int orderId, int deliveryId)
    {
        var admin = await _unitOfWork.GetClassAsyncWhere<User_Admin>(x => x.Id == adminId && x.Isdelete != true);
        if (admin == null)
            return Result<bool>.Failure(Error.NotFound("Admin.NotFound", "Administrador não encontrado."));

        var delivery = await _unitOfWork.GetClassAsyncWhere<User_Delivery>(x => x.Id == deliveryId && x.Isdelete != true);
        if (delivery == null)
            return Result<bool>.Failure(Error.NotFound("Delivery.NotFound", "Entregador não encontrado."));
        if (!delivery.Ativo)
            return Result<bool>.Failure(Error.Validation("Delivery.Inactive", $"{delivery.Name} está desativado e não pode receber coletas."));

        var order = await OpenPickupAsync(orderId);
        if (order == null)
            return Result<bool>.Failure(Error.NotFound("Delivery.OrderNotFound", "Esta coleta não está mais disponível. Atualize a lista."));
        if (order.Return_Id_User_Delivery == deliveryId)
            return Result<bool>.Success(true);

        var previous = order.Return_Id_User_Delivery != null || order.Return_Id_User_Admin_Delivery != null ? await PickupHolderAsync(order) : null;
        var now = DateTime.Now;
        var updated = await _unitOfWork.Query<Orders>()
            .Where(x => x.Id == orderId && x.Return_Status == order.Return_Status
                        && x.Return_Id_User_Delivery == order.Return_Id_User_Delivery
                        && x.Return_Id_User_Admin_Delivery == order.Return_Id_User_Admin_Delivery)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Return_Id_User_Delivery, (int?)deliveryId)
                .SetProperty(x => x.Return_Id_User_Admin_Delivery, (int?)null)
                .SetProperty(x => x.Return_AssignedAt, (DateTime?)now)
                .SetProperty(x => x.UpdateDate, (DateTime?)now));
        if (updated == 0)
            return Result<bool>.Failure(Error.Conflict("Delivery.Changed", "A coleta foi alterada por outra pessoa. Atualize a lista."));

        await DeliveryLog(order, adminId, "ADMIN", previous == null ? "Atribuiu coleta" : "Trocou entregador da coleta",
            $"{admin.Name} mandou {delivery.Name} buscar o produto da devolução do pedido #{order.Number_Order}" + (previous != null ? $" (antes com {previous})." : "."));
        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> UnassignPickupAsync(int adminId, int orderId)
    {
        var order = await OpenPickupAsync(orderId);
        if (order == null)
            return Result<bool>.Failure(Error.NotFound("Delivery.OrderNotFound", "Esta coleta não está mais disponível. Atualize a lista."));
        if (order.Return_Status != OrderReturnStatus.AguardandoColeta)
            return Result<bool>.Failure(Error.Conflict("Delivery.AlreadyDispatched", "A coleta já saiu. Troque o entregador em vez de remover."));
        if (order.Return_Id_User_Delivery == null && order.Return_Id_User_Admin_Delivery == null)
            return Result<bool>.Success(true);

        var previous = await PickupHolderAsync(order);
        var now = DateTime.Now;
        var updated = await _unitOfWork.Query<Orders>()
            .Where(x => x.Id == orderId && x.Return_Status == OrderReturnStatus.AguardandoColeta)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Return_Id_User_Delivery, (int?)null)
                .SetProperty(x => x.Return_Id_User_Admin_Delivery, (int?)null)
                .SetProperty(x => x.Return_AssignedAt, (DateTime?)null)
                .SetProperty(x => x.UpdateDate, (DateTime?)now));
        if (updated == 0)
            return Result<bool>.Failure(Error.Conflict("Delivery.Changed", "A coleta foi alterada por outra pessoa. Atualize a lista."));

        await DeliveryLog(order, adminId, "ADMIN", "Removeu entregador da coleta", $"O administrador (ID {adminId}) removeu {previous} da coleta do pedido #{order.Number_Order}.");
        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> DispatchPickupAsync(string actor, int actorId, int orderId)
    {
        var isAdmin = actor == "ADMIN";
        var now = DateTime.Now;
        var updated = await _unitOfWork.Query<Orders>()
            .Where(x => x.Id == orderId && x.Isdelete != true
                        && x.Return_Status == OrderReturnStatus.AguardandoColeta
                        && (isAdmin ? x.Return_Id_User_Admin_Delivery == actorId : x.Return_Id_User_Delivery == actorId))
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Return_Status, OrderReturnStatus.EmColeta)
                .SetProperty(x => x.Return_DispatchedAt, (DateTime?)now)
                .SetProperty(x => x.Return_Updated_At, (DateTime?)now)
                .SetProperty(x => x.UpdateDate, (DateTime?)now));
        if (updated == 0)
            return Result<bool>.Failure(await ExplainPickupFailureAsync(actor, actorId, orderId));

        var order = await _unitOfWork.GetClassAsyncWhere<Orders>(x => x.Id == orderId);
        if (order != null)
        {
            var customer = await Customer(order);
            await NotifyCustomer(order, customer, "Devolução", "Saímos para buscar o produto",
                $"Estamos a caminho para buscar o produto da devolução do pedido Nº {order.Number_Order}. Deixe-o separado, por favor.",
                "Truck", "DEVOLUCAO_EM_COLETA", "");
            await DeliveryLog(order, actorId, isAdmin ? "ADMIN" : "DELIVERY", "Saiu para coleta",
                $"{(isAdmin ? "O administrador" : "O entregador")} (ID {actorId}) saiu para buscar o produto da devolução do pedido #{order.Number_Order}.");
        }
        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> CollectPickupAsync(string actor, int actorId, int orderId, string? whoHanded)
    {
        whoHanded = whoHanded?.Trim();
        if (string.IsNullOrWhiteSpace(whoHanded) || whoHanded.Length < 2)
            return Result<bool>.Failure(Error.Validation("Delivery.ReceiverRequired", "Informe o nome de quem entregou o produto."));
        if (whoHanded.Length > 100)
            return Result<bool>.Failure(Error.Validation("Delivery.ReceiverTooLong", "O nome deve ter no máximo 100 caracteres."));

        var isAdmin = actor == "ADMIN";
        var now = DateTime.Now;
        var updated = await _unitOfWork.Query<Orders>()
            .Where(x => x.Id == orderId && x.Isdelete != true
                        && x.Return_Status == OrderReturnStatus.EmColeta
                        && (isAdmin ? x.Return_Id_User_Admin_Delivery == actorId : x.Return_Id_User_Delivery == actorId))
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Return_Status, OrderReturnStatus.Coletado)
                .SetProperty(x => x.Return_CollectedAt, (DateTime?)now)
                .SetProperty(x => x.Return_WhoHanded, whoHanded)
                .SetProperty(x => x.Return_Updated_At, (DateTime?)now)
                .SetProperty(x => x.UpdateDate, (DateTime?)now));
        if (updated == 0)
            return Result<bool>.Failure(await ExplainPickupFailureAsync(actor, actorId, orderId));

        var order = await _unitOfWork.GetClassAsyncWhere<Orders>(x => x.Id == orderId);
        if (order != null)
        {
            var customer = await Customer(order);
            await NotifyCustomer(order, customer, "Devolução", "Produto coletado",
                $"Buscamos o produto da devolução do pedido Nº {order.Number_Order}. Assim que a loja conferir, a devolução é concluída e o valor estornado.",
                "PackageCheck", "DEVOLUCAO_COLETADO", "");
            await NotifyAdmins(order, "Coleta concluída", "Produto da devolução coletado",
                $"O produto do pedido Nº {order.Number_Order} foi coletado (entregue por {whoHanded}). Confira e conclua a devolução em Pedidos › Devoluções.",
                "PackageCheck");
            await DeliveryLog(order, actorId, isAdmin ? "ADMIN" : "DELIVERY", "Coletou produto da devolução",
                $"{(isAdmin ? "O administrador" : "O entregador")} (ID {actorId}) coletou o produto da devolução do pedido #{order.Number_Order}. Entregue por: {whoHanded}.");
        }
        return Result<bool>.Success(true);
    }

    private async Task<string> PickupHolderAsync(Orders order)
    {
        if (order.Return_Id_User_Delivery.HasValue)
        {
            var d = await _unitOfWork.GetClassAsyncWhere<User_Delivery>(x => x.Id == order.Return_Id_User_Delivery.Value);
            return d?.Name ?? "outro entregador";
        }
        if (order.Return_Id_User_Admin_Delivery.HasValue)
        {
            var a = await _unitOfWork.GetClassAsyncWhere<User_Admin>(x => x.Id == order.Return_Id_User_Admin_Delivery.Value);
            return a != null ? $"{a.Name} (admin)" : "outro administrador";
        }
        return "ninguém";
    }

    private async Task<Error> ExplainPickupFailureAsync(string actor, int actorId, int orderId)
    {
        var order = await _unitOfWork.GetClassAsyncWhere<Orders>(x => x.Id == orderId && x.Isdelete != true);
        if (order == null || order.Return_Status == null)
            return Error.NotFound("Delivery.OrderNotFound", "Coleta não encontrada. Atualize a lista.");

        var mine = actor == "ADMIN" ? order.Return_Id_User_Admin_Delivery == actorId : order.Return_Id_User_Delivery == actorId;
        if (!mine)
            return actor == "ADMIN"
                ? Error.Conflict("Delivery.AlreadyAssigned", $"Esta coleta está com {await PickupHolderAsync(order)}. Pegue a coleta antes de continuar.")
                : Error.NotFound("Delivery.OrderNotFound", "Esta coleta não está mais com você. Atualize a lista.");

        return Error.Conflict("Delivery.InvalidStatus", $"Esta devolução está como '{OrderReturnStatus.Label(order.Return_Status)}'. Atualize a lista.");
    }

    private async Task DeliveryLog(Orders order, int userId, string level, string action, string info)
    {
        try
        {
            var now = DateTime.Now;
            await _unitOfWork.SaveLogUser(new LogRequest
            {
                Id_User = userId,
                // Mesmo padrão dos logs de entrega: tipo descreve o que aconteceu.
                Tipo = action switch
                {
                    "Saiu para coleta" => "SAIU PARA COLETA",
                    "Coletou produto da devolução" => "PRODUTO COLETADO",
                    "Pegou coleta de devolução" => "COLETA RETIRADA PARA BUSCAR",
                    "Soltou coleta" => "COLETA DEVOLVIDA",
                    "Removeu entregador da coleta" => "ENTREGADOR REMOVIDO DA COLETA",
                    _ => "COLETA ATRIBUÍDA",
                },
                Nivel = level,
                Acao = action,
                Info = info,
                Log = $"{action} · Pedido N°:{order.Number_Order} (ID: {order.Id}) \n{info} \nData/Hora: {now:dd/MM/yyyy HH:mm:ss}",
                InsertDate = now
            }, userId);
        }
        catch (Exception ex) { _logger.LogWarning(ex, "Falha ao gravar log da coleta do pedido {OrderId}", order.Id); }
    }

    private async Task<HashSet<int>> PaidOnlineAsync(List<int> ids)
    {
        if (ids.Count == 0) return new HashSet<int>();
        var list = await _unitOfWork.Query<Payment_Transactions>().AsNoTracking()
            .Where(t => ids.Contains(t.Id_Order) && (t.Status == PaymentStatus.Aprovado || t.Status == PaymentStatus.Estornado))
            .Select(t => t.Id_Order).Distinct().ToListAsync();
        return list.ToHashSet();
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
