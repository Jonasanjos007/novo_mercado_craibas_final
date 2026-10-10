using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Domain.Enums;
using Mercado.Craibas.Application.Domain.Enums;

namespace Mercado.Craibas.Application.Domain.Entities
{

    public class UserSession : EntityBase
    {
        public int UserId { get; set; }
        public ProfileEnum Role { get; set; }
        public string RefreshTokenHash { get; set; } = string.Empty;
        public string DeviceName { get; set; } = string.Empty;

        public string DeviceType { get; set; } = "desktop";

        public string? UserAgent { get; set; }

        public string? IpAddress { get; set; }

        public DateTime LastUsedAt { get; set; }

        public DateTime ExpiresAt { get; set; }
        public DateTime? RevokedAt { get; set; }
        public SessionRevokeReasonEnum? RevokedReason { get; set; }
    }
}
