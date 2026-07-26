using Mercado.Craibas.Application.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class Product_Category : EntityBase
    {
        public string Category { get; set; }
        public ICollection<Product> Product { get; set; } = [];
        public ICollection<Coupon_Category> Coupon_Categories { get; set; } = [];

    }
}
