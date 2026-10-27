#nullable enable
namespace Mercado.Craibas.Application.DTOs.Requests
{
    /// <summary>Cancelamento pelo cliente (motivo opcional).</summary>
    public class CancelOrderRequest
    {
        public string? Reason { get; set; }
    }

    /// <summary>Pedido de devolução pelo cliente (motivo obrigatório).</summary>
    public class ReturnOrderRequest
    {
        public string Reason { get; set; } = "";
    }

    /// <summary>Admin muda o andamento da devolução.</summary>
    public class UpdateReturnStatusRequest
    {
        /// <summary>AGUARDANDO_COLETA, DEVOLVIDO ou CANCELADA.</summary>
        public string Status { get; set; } = "";
        /// <summary>Observação para o cliente (obrigatória ao cancelar a devolução).</summary>
        public string? Note { get; set; }
    }

    /// <summary>Admin decide o pedido de cancelamento do cliente.</summary>
    public class CancelDecisionRequest
    {
        /// <summary>true = aprova (cancela e estorna); false = recusa (o pedido segue).</summary>
        public bool Approve { get; set; }
        /// <summary>Explicação para o cliente (obrigatória ao recusar).</summary>
        public string? Note { get; set; }
    }
}
