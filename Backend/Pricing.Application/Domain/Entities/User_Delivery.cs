using Baldan.Pricing.Application.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class User_Delivery : EntityBase
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string? Avatar { get; set; }
        public ProfileEnum Role { get; set; }
        public bool Ativo {  get; set; }
        /// <summary>Valor próprio por pedido (R$ ou %, igual à configuração). Null = usa o geral.</summary>
        public double? CommissionDelivers { get; set; }
        /// <summary>Valor próprio por dia trabalhado. Null = usa o geral.</summary>
        public double? DailyRate { get; set; }
        public string Transport { get; set; }
        public Address? Address { get; set; }
        public string? Phone { get; set; }
        public Customize_Delivery Customize_Delivery { get; set; }
        public ICollection<Orders> Orders { get; set; } = [];
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiresAt { get; set; }
        public int TokenVersion { get; set; } = 1;

    }
}
