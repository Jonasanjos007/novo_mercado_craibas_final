using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class Cart : EntityBase
    {
        public int Id_User_Customer { get; set; }
        public int? Id_Cupom { get; set; }
        public Cupom? Cupom { get; set; }
        public User_Customer User_Customer { get; set; }
        public ICollection<Cart_Item> Cart_Items { get; set; } = [];
    }
}
