using Baldan.Pricing.Application.Domain.Enums;
using Mercado.Craibas.Application.Domain.Entities;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class Orders : EntityBase
    {
        public string Number_Order {  get; set; }
        public double Total_Value_Order { get; set; }
        public double? Total_Value_OrderCupom { get; set; }
        public double Discont {  get; set; }
        public double Discont_Percentage { get; set; }
        public int? Id_Cupom { get; set; }
        public Cupom? Cupom { get; set; }
        public string Status_Pay { get; set; }
        public string? Tracking_Code { get; set; }
        public double? ShippingCost { get; set; }
        public string Payment_terms { get; set; }
        public int? Id_User_Customer { get; set; }
        public User_Customer User_Customer { get; set; }
        public string Order_Status { get; set; }
        public int Id_Address { get; set; }
        public Address Address { get; set; }
        public int? Id_User_Delivery { get; set; }
        public bool NotifyViaWhatsApp { get; set; } = false;
        //public string? StatusNotifyViaWhatsApp { get; set; }
        public string? Discount_Type { get; set; }
        public User_Delivery User_Delivery { get; set; }
        /// <summary>Admin que pegou o pedido para ele mesmo entregar (não conta ganho).</summary>
        public int? Id_User_Admin_Delivery { get; set; }
        public User_Admin? User_Admin_Delivery { get; set; }
        /// <summary>Quando o pedido foi atribuído ao entregador (ou ao admin).</summary>
        public DateTime? Delivery_AssignedAt { get; set; }
        /// <summary>Quando saiu para entrega.</summary>
        public DateTime? Delivery_DispatchedAt { get; set; }
        public double? Delivery_Commission { get; set; }
        public DateTime? Estimated_Delivery_Date { get; set; }
        public DateTime? CustomerDeliveryDate { get; set; }
        public string? WhoReceivedIt { get; set; }
        /// <summary>Quando o estoque deste pedido foi baixado (na confirmação). Nulo = ainda não baixou.</summary>
        public DateTime? Stock_Deducted_At { get; set; }

        // ── Cancelamento pelo cliente ──────────────────────────────────────────
        /// <summary>Motivo informado no cancelamento.</summary>
        public string? Cancel_Reason { get; set; }
        public DateTime? Canceled_At { get; set; }
        /// <summary>Quem cancelou: CLIENTE ou ADMIN.</summary>
        public string? Canceled_By { get; set; }
        /// <summary>
        /// Pedido de cancelamento de pedido pago (precisa da aprovação do admin):
        /// nulo = nenhum, SOLICITADO (em andamento), RECUSADO ou APROVADO.
        /// </summary>
        public string? Cancel_Status { get; set; }
        public DateTime? Cancel_Requested_At { get; set; }
        /// <summary>Resposta do admin (motivo da recusa ou observação da aprovação).</summary>
        public string? Cancel_Admin_Note { get; set; }
        public DateTime? Cancel_Decided_At { get; set; }

        // ── Devolução (direito de arrependimento: 7 dias após a entrega) ───────
        /// <summary>Nulo = sem devolução. EM_ANALISE, AGUARDANDO_COLETA, DEVOLVIDO ou CANCELADA.</summary>
        public string? Return_Status { get; set; }
        public string? Return_Reason { get; set; }
        public DateTime? Return_Requested_At { get; set; }
        public DateTime? Return_Updated_At { get; set; }
        /// <summary>Observação do admin ao mudar a devolução (aparece para o cliente).</summary>
        public string? Return_Admin_Note { get; set; }

        // ── Coleta da devolução (funciona como uma entrega, no sentido contrário) ──
        /// <summary>Entregador que vai buscar o produto (conta no ganho dele).</summary>
        public int? Return_Id_User_Delivery { get; set; }
        public User_Delivery? Return_User_Delivery { get; set; }
        /// <summary>Admin que vai buscar ele mesmo (não conta ganho).</summary>
        public int? Return_Id_User_Admin_Delivery { get; set; }
        public User_Admin? Return_User_Admin_Delivery { get; set; }
        public DateTime? Return_AssignedAt { get; set; }
        /// <summary>Quando saiu para buscar.</summary>
        public DateTime? Return_DispatchedAt { get; set; }
        /// <summary>Quando o produto foi coletado com o cliente.</summary>
        public DateTime? Return_CollectedAt { get; set; }
        /// <summary>Quem entregou o produto na coleta.</summary>
        public string? Return_WhoHanded { get; set; }
        public ICollection<OrderLineItens> OrderLineItens { get; set; } = [];
        public ICollection<Coupon_Use> Coupon_Uses { get; set; } = [];

    }
}
