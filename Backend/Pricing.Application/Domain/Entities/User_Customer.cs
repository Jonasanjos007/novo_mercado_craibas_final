using Baldan.Pricing.Application.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class User_Customer : EntityBase
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string? Avatar { get; set; }
        public ProfileEnum Role { get; set; }
        public bool Ativo { get; set; }
        public double? Phone { get; set; }
        public Address? Address { get; set; }
        public Customize_Cliente Customize_Cliente { get; set; }
        public ICollection<Orders> Orders { get; set; } = [];
        public ICollection<Cart> Carts { get; set; } = [];
        public ICollection<Rating> Ratings { get; set; } = [];
        public string? RefreshToken { get; set; }
        public string? RefreshTokenExpiresAt { get; set; }


    }
}
