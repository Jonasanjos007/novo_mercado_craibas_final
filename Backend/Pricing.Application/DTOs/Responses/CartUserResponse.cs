using Baldan.Pricing.Application.Models.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class CartUserResponse
    {
        public List<CartItemResponse> CartItensProduct { get; set; } = [];

        public double? SubTotal { get; set; }

        public double? Discount { get; set; }

        public double? Total { get; set; }

        public string? Cupom { get; set; }

        public int? Id_Cupom { get; set; }
        public double? ShippingCost { get; set; }
        public string? Discount_Type { get; set; }
        public bool? ErroCupom { get; set; }
        public string? Menssege { get; set; }
        public bool CouponApplied { get; set; }
        public string WhereApplyCoupon { get; set; }
    }
}
