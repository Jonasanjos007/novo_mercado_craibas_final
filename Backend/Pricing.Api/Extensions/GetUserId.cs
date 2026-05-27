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
    }
}
