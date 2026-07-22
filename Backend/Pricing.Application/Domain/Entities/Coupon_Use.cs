using Baldan.Pricing.Application.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Domain.Entities
{
    public class Coupon_Use : EntityBase
    {
        public int Id_Cupom { get; set; }

        public int Id_Order { get; set; }

        public int Id_User { get; set; }

        public decimal Discount_Value { get; set; }

        public Cupom Cupom { get; set; }

        public Orders Order { get; set; }

        public User_Customer User_Customer { get; set; }
    }
}
