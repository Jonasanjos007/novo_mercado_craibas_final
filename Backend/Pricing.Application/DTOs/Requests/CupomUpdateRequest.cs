using Baldan.Pricing.Application.Models.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class CupomUpdateRequest
    {
        public int Id { get; set; }
        public string Name_Cupom { get; set; }
        public string Cod_Cupom { get; set; }
        public string Description { get; set; }
        public double Discount { get; set; }
        public DiscountType Discount_Type { get; set; }
        public bool Active { get; set; }
        public double? Minimum_Value { get; set; }
        public double? Maximum_Discount { get; set; }
        public int? Quantity_Uses { get; set; }
        public int? Per_User_Limit { get; set; }
        public DateTime? Date_Start { get; set; }
        public DateTime? Date_End { get; set; }
        public bool First_Order_Only { get; set; }
        public List<int> AddedProducts { get; set; } = [];
        public List<int> RemovedProducts { get; set; } = [];
        public List<int> AddedCategories { get; set; } = [];
        public List<int> RemovedCategories { get; set; } = [];
    }
}
