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
        public ICollection<OrderLineItens> OrderLineItens { get; set; } = [];
        public ICollection<Coupon_Use> Coupon_Uses { get; set; } = [];

    }
}
