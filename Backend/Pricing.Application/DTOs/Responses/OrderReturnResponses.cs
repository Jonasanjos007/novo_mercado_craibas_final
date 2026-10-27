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

        // ── Coleta ──
        /// <summary>NONE, DELIVERY ou ADMIN: quem vai buscar o produto.</summary>
        public string Pickup_Assignee_Type { get; set; } = "NONE";
        public string? Pickup_Assignee_Name { get; set; }
        public DateTime? Pickup_Dispatched_At { get; set; }
        public DateTime? Pickup_Collected_At { get; set; }
        /// <summary>Quem entregou o produto na coleta.</summary>
        public string? Pickup_Who_Handed { get; set; }
    }

    public class OrderReturnsAdminResponse
    {
        public List<OrderReturnAdminResponse> Items { get; set; } = new();
        /// <summary>Quantidade por andamento (EM_ANALISE, AGUARDANDO_COLETA, EM_COLETA, COLETADO, DEVOLVIDO, CANCELADA).</summary>
        public Dictionary<string, int> ByStatus { get; set; } = new();
        /// <summary>Em aberto = em análise + aguardando coleta + em coleta + coletado.</summary>
        public int Open { get; set; }
    }

    /// <summary>Linha da aba "Cancelamentos" do admin.</summary>
    public class OrderCancelAdminResponse
    {
        public int Id_Order { get; set; }
        public string Number_Order { get; set; } = "";
        public string Customer_Name { get; set; } = "";
        public string? Customer_Phone { get; set; }
        public string? Customer_Email { get; set; }
        public double Total_Value_Order { get; set; }
        public string Payment_terms { get; set; } = "";
        public string Status_Pay { get; set; } = "";
        public string Order_Status { get; set; } = "";
        /// <summary>SOLICITADO, RECUSADO ou APROVADO.</summary>
        public string Cancel_Status { get; set; } = "";
        public string? Cancel_Reason { get; set; }
        public string? Cancel_Admin_Note { get; set; }
        public DateTime? Cancel_Requested_At { get; set; }
        public DateTime? Cancel_Decided_At { get; set; }
        public DateTime Order_Date { get; set; }
        public int Items { get; set; }
        public string? First_Product { get; set; }
        public string? First_Image { get; set; }
        public string? Address { get; set; }
        /// <summary>true = pago online: ao aprovar, o estorno é automático.</summary>
        public bool Online_Refund { get; set; }
        /// <summary>Quem está com a entrega (se já foi atribuída).</summary>
        public string? Delivery_Assignee_Name { get; set; }
    }

    public class OrderCancelsAdminResponse
    {
        public List<OrderCancelAdminResponse> Items { get; set; } = new();
        public Dictionary<string, int> ByStatus { get; set; } = new();
        /// <summary>Aguardando decisão (SOLICITADO).</summary>
        public int Open { get; set; }
    }
}
