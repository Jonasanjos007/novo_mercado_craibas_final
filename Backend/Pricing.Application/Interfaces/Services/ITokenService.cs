using Baldan.Pricing.Application.Domain.Enums;

public interface ITokenService
{
    public string GenerateAccessToken(int userId, string email, ProfileEnum role, int tokenVersion, int sessionId);
    public string GenerateRefreshToken();
}