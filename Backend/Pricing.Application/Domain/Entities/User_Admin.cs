using Baldan.Pricing.Application.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class User_Admin : EntityBase
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string? Avatar { get; set; }
        public ProfileEnum Role { get; set; }
        public bool Ativo { get; set; }
        public Customize_Admin Customize_Admin { get; set; }

    }
}
