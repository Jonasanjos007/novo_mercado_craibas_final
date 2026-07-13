using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class Rating : EntityBase
    {
        public int Id_Product { get; set; }
        public Product Product { get; set; }
        public int Id_User_Customer { get; set; }
        public User_Customer User_Customer { get; set; }
        public int Ranting { get; set; }
        public string Comment { get; set; }
    }
}
