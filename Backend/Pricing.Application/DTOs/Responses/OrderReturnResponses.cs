#nullable enable
namespace Mercado.Craibas.Application.DTOs.Responses
{
    /// <summary>Linha da aba "Devoluções" do admin.</summary>
    public class OrderReturnAdminResponse
    {
        public int Id_Order { get; set; }
        public string Number_Order { get; set; } = "";
        public string Customer_Name { get; set; } = "";
        public string? Customer_Phone { get; set; }
        public string? Customer_Email { get; set; }
        public double Total_Value_Order { get; set; }
        public string Payment_terms { get; set; } = "";
        public string Status_Pay { get; set; } = "";
        public string Return_Status { get; set; } = "";
        public string? Return_Reason { get; set; }
        public string? Return_Admin_Note { get; set; }
        public DateTime? Return_Requested_At { get; set; }
        public DateTime? Return_Updated_At { get; set; }
        public DateTime? Delivered_At { get; set; }
        public int Items { get; set; }
        public string? First_Product { get; set; }
        public string? First_Image { get; set; }
        public string? Address { get; set; }
        /// <summary>true = o pagamento foi online e o estorno é automático ao marcar DEVOLVIDO.</summary>
        public bool Online_Refund { get; set; }
    }

    public class OrderReturnsAdminResponse
    {
        public List<OrderReturnAdminResponse> Items { get; set; } = new();
        /// <summary>Quantidade por andamento (EM_ANALISE, AGUARDANDO_COLETA, DEVOLVIDO, CANCELADA).</summary>
        public Dictionary<string, int> ByStatus { get; set; } = new();
        /// <summary>Em aberto = em análise + aguardando coleta.</summary>
        public int Open { get; set; }
    }
}
