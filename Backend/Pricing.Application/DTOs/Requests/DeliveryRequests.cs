namespace Mercado.Craibas.Application.DTOs.Requests
{
    /// <summary>Confirmar a entrega.</summary>
    public class DeliverOrderRequest
    {
        /// <summary>Nome de quem recebeu (obrigatório).</summary>
        public string? WhoReceivedIt { get; set; }
    }

    /// <summary>Admin pega o pedido para ele mesmo entregar.</summary>
    public class TakeDeliveryOrderRequest
    {
        /// <summary>true = assume mesmo que já esteja com outro entregador.</summary>
        public bool Force { get; set; }
    }

    /// <summary>Admin atribui o pedido a um entregador.</summary>
    public class AssignDeliveryRequest
    {
        public int DeliveryId { get; set; }
    }

    /// <summary>Configuração da gorjeta/pagamento.</summary>
    public class DeliverySettingsRequest
    {
        public bool TipEnabled { get; set; }

        /// <summary>POR_PEDIDO ou POR_DIA.</summary>
        public string? Mode { get; set; }

        /// <summary>FIXO ou PERCENTUAL.</summary>
        public string? OrderValueType { get; set; }

        public double OrderValue { get; set; }

        public double DailyValue { get; set; }

        public DateTime? CountFrom { get; set; }
    }

    /// <summary>Valor próprio do entregador (null = usa o geral).</summary>
    public class DeliveryRatesRequest
    {
        public double? CommissionDelivers { get; set; }
        public double? DailyRate { get; set; }
    }

    /// <summary>Gorjeta de um pedido específico (null = volta para o padrão).</summary>
    public class DeliveryOrderTipRequest
    {
        public double? Amount { get; set; }
    }

    /// <summary>Dar baixa nos itens pendentes de um entregador.</summary>
    public class CreateDeliveryPayoutRequest
    {
        public int DeliveryId { get; set; }

        /// <summary>Modo por pedido: pedidos pagos.</summary>
        public List<int> OrderIds { get; set; } = new();

        /// <summary>Modo por dia: dias pagos.</summary>
        public List<DateTime> WorkDates { get; set; } = new();

        public string? Note { get; set; }
    }

    /// <summary>Estornar uma baixa.</summary>
    public class ReverseDeliveryPayoutRequest
    {
        public string? Reason { get; set; }
    }
}
