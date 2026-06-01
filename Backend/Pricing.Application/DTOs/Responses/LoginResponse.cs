using Baldan.Pricing.Application.Domain.Enums;

namespace Pricing.Api.DTOs.Responses;

public class LoginResponse
{
    public string AccessToken { get; set; } = default!;
    public string RefreshToken { get; set; } = default!;
    public ProfileEnum Role { get; set; } = default!;
}
