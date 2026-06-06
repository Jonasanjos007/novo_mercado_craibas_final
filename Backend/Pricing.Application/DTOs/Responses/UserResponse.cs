using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Domain.Enums;
using Mercado.Craibas.Application.DTOs.Responses;

namespace Pricing.Api.DTOs.Responses;

public class UserResponse
{
    public int Id { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Avatar { get; set; } = default!;
    public ProfileEnum Role { get; set; } = default!;
    public bool Ativo { get; set; } = default!;
    public double  Phone { get; set; } = default!;
    public CartResponse? Cart_User { get; set; }
    public string PasswordHash { get; set; } = default!;
    public string RefreshToken { get; set; } = default!;
    public string RefreshTokenExpiresAt { get; set; } = default!;
    public DateTime Insert_Date { get; set; } = default!;
}
