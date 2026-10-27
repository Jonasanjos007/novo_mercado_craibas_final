namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class DeliveryOrderResponse
    {
        public int Id { get; set; }
        public string Number_Order { get; set; } = string.Empty;
        public string Order_Status { get; set; } = string.Empty;
        public string? Payment_terms { get; set; }
        public string? Status_Pay { get; set; }
        public double Total_Value_Order { get; set; }
        public double? ShippingCost { get; set; }
        public int Quantity { get; set; }

        public DateTime InsertDate { get; set; }
        public DateTime? Estimated_Delivery_Date { get; set; }
        public DateTime? AssignedAt { get; set; }
        public DateTime? DispatchedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public string? WhoReceivedIt { get; set; }

        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public AddressResponse? Address { get; set; }
        public List<DeliveryOrderItemResponse> Items { get; set; } = new();
        public string AssigneeType { get; set; } = "NONE";
        public int? AssigneeId { get; set; }
        public string? AssigneeName { get; set; }

        public bool IsMine { get; set; }
        public double? Earning { get; set; }
        public string Kind { get; set; } = "ENTREGA";
        public string? ReturnReason { get; set; }
        public bool CancelRequested { get; set; }
    }

    public class DeliveryOrderItemResponse
    {
        public string Name { get; set; } = string.Empty;
        public string? Variation { get; set; }
        public int Quantity { get; set; }
    }

    public class DeliveryEarningEntryResponse
    {
        public string Kind { get; set; } = "PEDIDO";

        public int? OrderId { get; set; }
        public string? OrderNumber { get; set; }
        public double? OrderTotal { get; set; }

        public DateTime Date { get; set; }

        public int Deliveries { get; set; }
        public double Amount { get; set; }

        public bool CustomTip { get; set; }

        public bool Paid { get; set; }
        public DateTime? PaidAt { get; set; }
        public int? PayoutId { get; set; }
    }

    public class DeliveryEarningsResponse
    {
        public bool Enabled { get; set; }
        public string? Mode { get; set; }
        public string? OrderValueType { get; set; }

        public double? CurrentValue { get; set; }

        public double PendingTotal { get; set; }
        public double PaidTotal { get; set; }

        public List<DeliveryEarningEntryResponse> Entries { get; set; } = new();
    }

    public class DeliveryProfileResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Transport { get; set; }
        public string? Avatar { get; set; }
        public DateTime InsertDate { get; set; }

        public int ActiveOrders { get; set; }
        public int DeliveredTotal { get; set; }
        public int DeliveredToday { get; set; }
        public int DeliveredThisWeek { get; set; }
    }

    public class DeliveryDriverAdminResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Transport { get; set; }
        public string? Avatar { get; set; }
        public bool Ativo { get; set; }

        public int PreparingOrders { get; set; }
        public int EnRouteOrders { get; set; }
        public int DeliveredTotal { get; set; }
        public int DeliveredToday { get; set; }
        public DateTime? LastDeliveryAt { get; set; }

        public double PendingAmount { get; set; }
        public int PendingItems { get; set; }
        public double PaidAmount { get; set; }

        public double? CommissionDelivers { get; set; }
        public double? DailyRate { get; set; }
    }

    public class DeliverySettingsResponse
    {
        public bool TipEnabled { get; set; }
        public string Mode { get; set; } = "POR_PEDIDO";
        public string OrderValueType { get; set; } = "FIXO";
        public double OrderValue { get; set; }
        public double DailyValue { get; set; }
        public DateTime? CountFrom { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdatedByName { get; set; }
    }

    public class DeliveryPayablesResponse
    {
        public bool Enabled { get; set; }
        public string? Mode { get; set; }
        public int DeliveryId { get; set; }
        public string DeliveryName { get; set; } = string.Empty;
        public double Total { get; set; }
        public List<DeliveryEarningEntryResponse> Entries { get; set; } = new();
    }

    public class DeliveryPayoutResponse
    {
        public int Id { get; set; }
        public int DeliveryId { get; set; }
        public string DeliveryName { get; set; } = string.Empty;
        public string Mode { get; set; } = string.Empty;
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }
        public double Total { get; set; }
        public int ItemsCount { get; set; }
        public int Deliveries { get; set; }
        public DateTime PaidAt { get; set; }
        public string? PaidByName { get; set; }
        public string? Note { get; set; }
        public DateTime? ReversedAt { get; set; }
        public string? ReversedByName { get; set; }
        public string? ReversedReason { get; set; }
        public List<DeliveryEarningEntryResponse> Items { get; set; } = new();
    }
}
