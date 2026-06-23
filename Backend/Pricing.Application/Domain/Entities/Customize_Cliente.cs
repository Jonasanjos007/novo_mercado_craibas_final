using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class Customize_Cliente : EntityBase
    {
        public string Global_Site_Color { get; set; }
        public int Id_User_Customer {  get; set; }
        public User_Customer User_Customer { get; set; }

    }
}
