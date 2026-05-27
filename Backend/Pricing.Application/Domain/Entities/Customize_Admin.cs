using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class Customize_Admin : EntityBase
    {
        public string Global_Site_Color { get; set; }
        public bool Dark { get; set; } = false;
        public int Id_User_Admin { get; set; }
        public User_Admin User_Admin { get; set; }
    }
}
