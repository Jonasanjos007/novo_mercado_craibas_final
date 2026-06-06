

using Baldan.Pricing.Application.Commons;
using Pricing.Api.DTOs.Requests;
using Pricing.Api.DTOs.Responses;

namespace Backend.Services.Interfaces;

public interface IAuthService
{
    Task<Result<LoginResponse>> LoginAsync(LoginRequest request);
    //Task<Result<LoginResponse>> RefreshAsync(string refreshToken);
}