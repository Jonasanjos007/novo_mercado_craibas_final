using Baldan.Pricing.Application.Domain.Enums;
using Baldan.Pricing.Application.Models.Enums;
using Mercado.Craibas.Application.Domain.Entities;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class Cupom : EntityBase
    {
        public string Name_Cupom { get; set; }
        public string Cod_Cupom { get; set; }
        public string Description { get; set; }
        public double Discount { get; set; }
        public DiscountType Discount_Type { get; set; }
        public bool Active { get; set; }
        public bool Show_Flash_Offer { get; set; }
        public double? Minimum_Value { get; set; }
        public double? Maximum_Discount { get; set; }
        public int? Quantity_Uses { get; set; }
        public int? Quantity_Used { get; set; }
        public int? Per_User_Limit { get; set; }
        public bool First_Order_Only { get; set; }
        public DateTime? Date_Start { get; set; }
        public DateTime? Date_End { get; set; }
        public ICollection<Orders> Orders { get; set; } = [];

        public ICollection<Coupon_Product> Coupon_Products { get; set; } = [];

        public ICollection<Coupon_Category> Coupon_Categories { get; set; } = [];

        public ICollection<Coupon_Use> Coupon_Uses { get; set; } = [];
    }
}