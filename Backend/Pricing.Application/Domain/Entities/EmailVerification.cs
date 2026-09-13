using Baldan.Pricing.Application.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Domain.Entities
{
    public class EmailVerification : EntityBase
    {

        public int UserId { get; set; }

        public string CodeHash { get; set; }

        public DateTime ExpiresAt { get; set; }

        public int Attempts { get; set; } = 0;

        public DateTime? UsedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? ResendCount { get; set; }
        public DateTime? ResendWindowStartedAt { get; set; }
        public DateTime? LastResendAt { get; set; }
        public User_Customer? User { get; set; }
    }
}
