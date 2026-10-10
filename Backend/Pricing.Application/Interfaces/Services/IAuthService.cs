

using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Enums;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.DTOs.Requests;
using Pricing.Api.DTOs.Requests;
using Pricing.Api.DTOs.Responses;

namespace Backend.Services.Interfaces;

public interface IAuthService
{
    Task<Result<LoginResponse>> LoginAsync(LoginRequest request, string? userAgent, string? ipAddress, string? currentRefreshToken);
    Task<Result<LoginResponse>> RefreshAsync(string refreshToken, string? ipAddress);
    Task<Result> LogoutAsync(string refreshToken);

    Task<Result<List<UserSessionResponse>>> GetSessionsAsync(int userId, ProfileEnum role, int currentSessionId);
    Task<Result<bool>> RevokeSessionAsync(int userId, ProfileEnum role, int sessionId, int currentSessionId, string? password);
    Task<Result<int>> RevokeOtherSessionsAsync(int userId, ProfileEnum role, int currentSessionId, string? password);
    //Task<Result<LoginResponse>> RefreshAsync(string refreshToken);
    Task<Result<bool>> ChangePassword(int userId, ChangePasswordRequest request);
}
