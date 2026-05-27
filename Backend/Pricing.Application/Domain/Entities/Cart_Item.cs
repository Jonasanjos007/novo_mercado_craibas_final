using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class Cart_Item : EntityBase
    {
        public int Id_Cart { get; set; }

        public Cart Cart { get; set; }

        public int Id_Product { get; set; }

        public Product Product { get; set; }

        public int Quantity { get; set; }
    }
}
