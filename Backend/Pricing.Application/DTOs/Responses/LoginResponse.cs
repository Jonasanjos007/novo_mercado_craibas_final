using Baldan.Pricing.Application.Domain.Enums;
using System.Text.Json.Serialization;

namespace Pricing.Api.DTOs.Responses;

public class LoginResponse
{
    public string AccessToken { get; set; } = default!;

    [JsonIgnore]
    public string RefreshToken { get; set; } = default!;

    [JsonIgnore]
    public DateTime RefreshTokenExpiresAt { get; set; } = default!;

    public ProfileEnum Role { get; set; } = default!;
}
