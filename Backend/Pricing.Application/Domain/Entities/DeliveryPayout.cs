using Baldan.Pricing.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Enums;

namespace Mercado.Craibas.Application.Domain.Entities
{
    /// <summary>
    /// Baixa (pagamento) feita pelo admin para um entregador.
    /// Os valores ficam congelados nos itens.
    /// </summary>
    public class DeliveryPayout : EntityBase
    {
        public int Id_User_Delivery { get; set; }
        public User_Delivery User_Delivery { get; set; }

        /// <summary>Modo da configuração no momento da baixa.</summary>
        public DeliveryPayModeEnum Mode { get; set; }

        /// <summary>Primeira e última data dos itens pagos.</summary>
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }

        public double Total { get; set; }

        public DateTime PaidAt { get; set; }

        /// <summary>Admin que deu a baixa.</summary>
        public int PaidById { get; set; }

        public string? Note { get; set; }

        /// <summary>Estorno: os itens voltam a ficar pendentes.</summary>
        public DateTime? ReversedAt { get; set; }
        public int? ReversedById { get; set; }
        public string? ReversedReason { get; set; }

        public ICollection<DeliveryPayoutItem> Items { get; set; } = [];
    }

    /// <summary>
    /// Item de uma baixa: um pedido (modo por pedido) ou um dia (modo por dia).
    /// </summary>
    public class DeliveryPayoutItem : EntityBase
    {
        public int Id_DeliveryPayout { get; set; }
        public DeliveryPayout DeliveryPayout { get; set; }

        /// <summary>Pedido pago (modo por pedido).</summary>
        public int? Id_Order { get; set; }
        public Orders? Order { get; set; }

        /// <summary>Dia pago (modo por dia).</summary>
        public DateTime? WorkDate { get; set; }

        /// <summary>Data da entrega (pedido) ou o próprio dia.</summary>
        public DateTime ReferenceDate { get; set; }

        /// <summary>Quantidade de entregas cobertas pelo item.</summary>
        public int Deliveries { get; set; }

        public double Amount { get; set; }

        /// <summary>true = item é a coleta de uma devolução (não a entrega do pedido).</summary>
        public bool Is_Return_Pickup { get; set; }
    }
}
