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
    }
}
