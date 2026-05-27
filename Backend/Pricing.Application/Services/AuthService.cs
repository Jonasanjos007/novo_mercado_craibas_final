//using Backend.Services.Interfaces;
//using Baldan.Pricing.Application.Commons;
//using Baldan.Pricing.Application.Domain.Auth;
//using Baldan.Pricing.Application.Interfaces;
//using Baldan.Pricing.Application.Interfaces.Repositories;
//using BCrypt.Net;
//using Pricing.Api.DTOs.Requests;
//using Pricing.Api.DTOs.Responses;

//public class AuthService : IAuthService
//{
//    private readonly ITokenService _tokenService;
//    private readonly IAuthRepository _authRepository;
//    private readonly IUnitOfWork _unitOfWork;

//    public AuthService(
//        ITokenService tokenService,
//        IAuthRepository authRepository,
//        IUnitOfWork unitOfWork
//        )
//    {
//        _tokenService = tokenService;
//        _authRepository = authRepository;
//        _unitOfWork = unitOfWork;
//    }

//    public async Task<Result<LoginResponse>> LoginAsync(LoginRequest request)
//    {

//        var user = await _authRepository.GetByEmailAsync(request.Email);

//        if (user is null)
//        {
//            return Result<LoginResponse>.Failure(AuthErrors.InvalidCredentials);
//        }

//        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
//        {
//            return Result<LoginResponse>.Failure(AuthErrors.InvalidCredentials);
//        }

//        var teste = user.Id.ToString();

//        var accessToken = _tokenService.GenerateAccessToken(
//            user.Id, user.Email, user.Role);

//        var refreshToken = _tokenService.GenerateRefreshToken();

//        var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(30);

//        var userId = user.Id;

//        await _authRepository.UpdateRefreshTokenAsync(userId, refreshToken, refreshTokenExpiresAt);
        
//        await _unitOfWork.CommitAsync();

//        return Result<LoginResponse>.Success(new LoginResponse
//        {
//            AccessToken = accessToken,
//            RefreshToken = refreshToken
//        });
//    }

//    public async Task<Result<LoginResponse>> RefreshAsync(string refreshToken)
//    {
//        var user = await _authRepository.GetByRefreshTokenAsync(refreshToken);

//        if (user is null)
//            return Result<LoginResponse>.Failure(AuthErrors.InvalidRefreshToken);

//        var newAccessToken = _tokenService.GenerateAccessToken(
//            user.Id, user.Email, user.Role);

//        var newRefreshToken = _tokenService.GenerateRefreshToken();
//        var expiresAt = DateTime.UtcNow.AddDays(7);

//        await _authRepository.UpdateRefreshTokenAsync(
//            user.Id, newRefreshToken, expiresAt);

//        await _unitOfWork.CommitAsync();

//        return Result<LoginResponse>.Success(new LoginResponse
//        {
//            AccessToken = newAccessToken,
//            //RefreshToken = newRefreshToken
//        });
//    }
//}

