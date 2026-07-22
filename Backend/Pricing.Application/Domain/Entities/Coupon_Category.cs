using Baldan.Pricing.Application.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Domain.Entities
{
    public class Coupon_Category : EntityBase
    {
        public int Id_Cupom { get; set; }

        public int Id_Category { get; set; }

        public Cupom Cupom { get; set; }

        public Product_Category Product_Category { get; set; }
    }
}
