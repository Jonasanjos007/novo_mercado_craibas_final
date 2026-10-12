using Baldan.Pricing.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Enums;
using Mercado.Craibas.Application.DTOs.Responses;
using Microsoft.EntityFrameworkCore;

namespace Baldan.Pricing.Application.Commons;

/// <summary>Status do pedido usados nas entregas.</summary>
public static class DeliveryOrderStatus
{
    public const string Preparando = "PREPARANDO";
    public const string SaiuParaEntrega = "SAIU_PARA_ENTREGA";
    public const string Entregue = "ENTREGUE";
}

/// <summary>Resultado do cálculo de um entregador.</summary>
public sealed class DeliveryLedgerResult
{
    public List<DeliveryEarningEntryResponse> Pending { get; } = new();
    public List<DeliveryEarningEntryResponse> Paid { get; } = new();

    public double PendingTotal => DeliveryLedger.Round(Pending.Sum(x => x.Amount));
    public double PaidTotal => DeliveryLedger.Round(Paid.Sum(x => x.Amount));
}

/// <summary>
/// Cálculo dos ganhos dos entregadores. Usado pelo portal do entregador e pelo admin,
/// para os dois sempre mostrarem o mesmo valor.
///
/// - Pago: vem das baixas (valor congelado). Baixa estornada não conta.
/// - Pendente: entregas ainda não pagas, calculadas com a configuração atual.
///   Uma entrega fica coberta por um item "pedido" ou por um item "dia", nunca pelos dois.
/// - Gorjeta desligada: nada fica pendente.
/// - Entregas feitas pelo admin nunca contam (o pedido não tem Id_User_Delivery).
/// </summary>
public static class DeliveryLedger
{
    public static double Round(double value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    /// <summary>Configuração salva ou o padrão (gorjeta desligada).</summary>
    public static async Task<DeliverySettings> LoadSettingsAsync(IQueryable<DeliverySettings> query)
    {
        var settings = await query
            .AsNoTracking()
            .OrderBy(x => x.Id)
            .FirstOrDefaultAsync();

        return settings ?? new DeliverySettings
        {
            TipEnabled = false,
            Mode = DeliveryPayModeEnum.POR_PEDIDO,
            OrderValueType = DeliveryValueTypeEnum.FIXO,
            OrderValue = 0,
            DailyValue = 0
        };
    }

    /// <summary>Valor por pedido (gorjeta do pedido > valor próprio do entregador > geral).</summary>
    public static double OrderAmount(DeliverySettings settings, double? personalValue, double orderTotal, double? customTip)
    {
        if (customTip.HasValue)
            return Round(customTip.Value);

        var value = personalValue ?? settings.OrderValue;

        return settings.OrderValueType == DeliveryValueTypeEnum.PERCENTUAL
            ? Round(orderTotal * value / 100d)
            : Round(value);
    }

    /// <summary>Valor do dia (valor próprio do entregador > geral).</summary>
    public static double DayAmount(DeliverySettings settings, double? personalDaily) =>
        Round(personalDaily ?? settings.DailyValue);

    /// <summary>Valor atual que vale para o entregador (para exibir).</summary>
    public static double CurrentValue(DeliverySettings settings, double? personalValue, double? personalDaily) =>
        settings.Mode == DeliveryPayModeEnum.POR_DIA
            ? Round(personalDaily ?? settings.DailyValue)
            : Round(personalValue ?? settings.OrderValue);

    /// <summary>
    /// Monta pago + pendente.
    /// onlyDeliveryId: calcula só um entregador; null = todos.
    /// </summary>
    public static async Task<Dictionary<int, DeliveryLedgerResult>> BuildAsync(
        int? onlyDeliveryId,
        DeliverySettings settings,
        IQueryable<User_Delivery> deliveries,
        IQueryable<Orders> orders,
        IQueryable<DeliveryPayoutItem> payoutItems)
    {
        // Valores próprios
        var rateQuery = deliveries.AsNoTracking();
        if (onlyDeliveryId.HasValue)
            rateQuery = rateQuery.Where(x => x.Id == onlyDeliveryId.Value);

        var rates = await rateQuery
            .Select(x => new { x.Id, x.CommissionDelivers, x.DailyRate })
            .ToListAsync();

        // Entregas concluídas por entregadores
        var orderQuery = orders.AsNoTracking()
            .Where(x => x.Id_User_Delivery != null
                        && x.Order_Status == DeliveryOrderStatus.Entregue
                        && x.Isdelete != true);

        if (onlyDeliveryId.HasValue)
            orderQuery = orderQuery.Where(x => x.Id_User_Delivery == onlyDeliveryId.Value);

        var delivered = await orderQuery
            .Select(x => new
            {
                x.Id,
                x.Number_Order,
                x.Total_Value_Order,
                DeliveredAt = x.CustomerDeliveryDate ?? x.UpdateDate ?? x.InsertDate,
                x.Delivery_Commission,
                DeliveryId = x.Id_User_Delivery!.Value
            })
            .ToListAsync();

        // Itens já pagos (baixas não estornadas)
        var itemQuery = payoutItems.AsNoTracking()
            .Where(x => x.DeliveryPayout.ReversedAt == null);

        if (onlyDeliveryId.HasValue)
            itemQuery = itemQuery.Where(x => x.DeliveryPayout.Id_User_Delivery == onlyDeliveryId.Value);

        var paidItems = await itemQuery
            .Select(x => new
            {
                x.Id_Order,
                OrderNumber = x.Order != null ? x.Order.Number_Order : null,
                x.WorkDate,
                x.ReferenceDate,
                x.Deliveries,
                x.Amount,
                x.Id_DeliveryPayout,
                x.DeliveryPayout.PaidAt,
                DeliveryId = x.DeliveryPayout.Id_User_Delivery
            })
            .ToListAsync();

        var result = new Dictionary<int, DeliveryLedgerResult>();

        foreach (var rate in rates)
        {
            var ledger = new DeliveryLedgerResult();
            result[rate.Id] = ledger;

            var myPaid = paidItems.Where(x => x.DeliveryId == rate.Id).ToList();

            var paidOrderIds = myPaid
                .Where(x => x.Id_Order.HasValue)
                .Select(x => x.Id_Order!.Value)
                .ToHashSet();

            var paidDays = myPaid
                .Where(x => x.WorkDate.HasValue)
                .Select(x => x.WorkDate!.Value.Date)
                .ToHashSet();

            foreach (var item in myPaid)
            {
                ledger.Paid.Add(new DeliveryEarningEntryResponse
                {
                    Kind = item.Id_Order.HasValue ? "PEDIDO" : "DIA",
                    OrderId = item.Id_Order,
                    OrderNumber = item.OrderNumber,
                    Date = item.ReferenceDate,
                    Deliveries = item.Deliveries,
                    Amount = Round(item.Amount),
                    Paid = true,
                    PaidAt = item.PaidAt,
                    PayoutId = item.Id_DeliveryPayout
                });
            }

            ledger.Paid.Sort((a, b) => b.Date.CompareTo(a.Date));

            if (!settings.TipEnabled)
                continue;

            var countFrom = settings.CountFrom?.Date;

            var pendingOrders = delivered
                .Where(x => x.DeliveryId == rate.Id
                            && !paidOrderIds.Contains(x.Id)
                            && !paidDays.Contains(x.DeliveredAt.Date)
                            && (!countFrom.HasValue || x.DeliveredAt >= countFrom.Value))
                .ToList();

            if (settings.Mode == DeliveryPayModeEnum.POR_DIA)
            {
                foreach (var day in pendingOrders.GroupBy(x => x.DeliveredAt.Date))
                {
                    ledger.Pending.Add(new DeliveryEarningEntryResponse
                    {
                        Kind = "DIA",
                        Date = day.Key,
                        Deliveries = day.Count(),
                        Amount = DayAmount(settings, rate.DailyRate)
                    });
                }
            }
            else
            {
                foreach (var order in pendingOrders)
                {
                    ledger.Pending.Add(new DeliveryEarningEntryResponse
                    {
                        Kind = "PEDIDO",
                        OrderId = order.Id,
                        OrderNumber = order.Number_Order,
                        OrderTotal = order.Total_Value_Order,
                        Date = order.DeliveredAt,
                        Deliveries = 1,
                        Amount = OrderAmount(settings, rate.CommissionDelivers, order.Total_Value_Order, order.Delivery_Commission),
                        CustomTip = order.Delivery_Commission.HasValue
                    });
                }
            }

            ledger.Pending.Sort((a, b) => b.Date.CompareTo(a.Date));
        }

        return result;
    }
}
