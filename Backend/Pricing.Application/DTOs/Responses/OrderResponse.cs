using Baldan.Pricing.Application.Domain.Entities;
using Pricing.Api.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class OrderResponse
    {
        public int Id_Order { get; set; }
        public int? Id_Cupom { get; set; }
        public string Number_Order { get; set; }
        public double Total_Value_Order { get; set; }
        public AddressResponse Address { get; set; }
        public string Order_Status { get; set; }
        public double Discont { get; set; }
        public string Category { get; set; }
        public string Status_Pay { get; set; }
        public int Quantity { get; set; }
        public bool NotifyViaWhatsApp { get; set; }
        public double? ShippingCost { get; set; }
        public string? Discount_Type { get; set; }
        public DateTime? Estimated_Delivery_Date { get; set; }
        public List<ProductResponse>Products { get; set; }
        public string Payment_terms { get; set; }
        public bool CouponApplied { get; set; }
        public DateTime InsertDate { get; set; }
        public double? Total_Value_OrderCupom { get; set; }
        public DateTime? CustomerDeliveryDate { get; set; }
        public string? WhoReceivedIt { get; set; }

        /// <summary>Quem está entregando (entregador ou admin).</summary>
        public string? DeliveryName { get; set; }

        /// <summary>DELIVERY, ADMIN ou null.</summary>
        public string? DeliveryAssigneeType { get; set; }

        // ── Cancelamento e devolução ───────────────────────────────────────────
        public string? Cancel_Reason { get; set; }
        public DateTime? Canceled_At { get; set; }
        /// <summary>CLIENTE ou ADMIN.</summary>
        public string? Canceled_By { get; set; }
        /// <summary>Nulo = sem devolução. EM_ANALISE, AGUARDANDO_COLETA, DEVOLVIDO ou CANCELADA.</summary>
        public string? Return_Status { get; set; }
        public string? Return_Reason { get; set; }
        public DateTime? Return_Requested_At { get; set; }
        public string? Return_Admin_Note { get; set; }
        /// <summary>Até quando o cliente pode pedir devolução (7 dias após a entrega).</summary>
        public DateTime? Return_Deadline { get; set; }
        /// <summary>Pedido de cancelamento: SOLICITADO (em andamento), RECUSADO ou APROVADO.</summary>
        public string? Cancel_Status { get; set; }
        public DateTime? Cancel_Requested_At { get; set; }
        /// <summary>Resposta da loja ao pedido de cancelamento.</summary>
        public string? Cancel_Admin_Note { get; set; }
    }
}
