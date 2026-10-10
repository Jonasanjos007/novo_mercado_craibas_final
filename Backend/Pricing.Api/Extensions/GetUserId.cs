using Baldan.Pricing.Application.Domain.Enums;
using System.Security.Claims;

namespace Pricing.Api.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal user)
        {
            var value = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(value))
                throw new UnauthorizedAccessException();

            return int.Parse(value);
        }

        public static ProfileEnum GetUserRole(this ClaimsPrincipal user)
        {
            var value = user.FindFirst(ClaimTypes.Role)?.Value;

            if (!Enum.TryParse<ProfileEnum>(value, out var role))
                throw new UnauthorizedAccessException();

            return role;
        }

        public static int GetSessionId(this ClaimsPrincipal user)
        {
            var value = user.FindFirst("session_id")?.Value;

            if (!int.TryParse(value, out var sessionId))
                throw new UnauthorizedAccessException();

            return sessionId;
        }
    }
}
