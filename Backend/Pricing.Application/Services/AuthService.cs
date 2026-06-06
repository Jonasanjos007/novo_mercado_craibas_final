using Backend.Services.Interfaces;
using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Auth;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Baldan.Pricing.Application.Interfaces.Repositories;
using BCrypt.Net;
using Pricing.Api.DTOs.Requests;
using Pricing.Api.DTOs.Responses;

public class AuthService : IAuthService
{
    private readonly ITokenService _tokenService;
    private readonly IAuthRepository _authRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AuthService(
        ITokenService tokenService,
        IAuthRepository authRepository,
        IUnitOfWork unitOfWork
        )
    {
        _tokenService = tokenService;
        _authRepository = authRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LoginResponse>> LoginAsync(LoginRequest request)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var User = new UserResponse();

        var User_Costumer = await _authRepository.GetByEmailAsyncCustomer(request.Email);

        if (User_Costumer is not null)
        {
            User = new UserResponse
            {
                Id = User_Costumer.Id,
                Name = User_Costumer.Name,
                Email = User_Costumer.Email,
                Avatar = User_Costumer.Avatar,
                Role = User_Costumer.Role,
                Ativo = User_Costumer.Ativo,
                PasswordHash = User_Costumer.PasswordHash,
                RefreshToken = User_Costumer.RefreshToken,
                RefreshTokenExpiresAt = User_Costumer.RefreshTokenExpiresAt
            };
        }
        var User_Admin = await _authRepository.GetByEmailAsyncAdmin(request.Email);

        if (User_Admin is not null) {
            User = new UserResponse
            {
                Id = User_Admin.Id,
                Name = User_Admin.Name,
                Email = User_Admin.Email,
                Avatar = User_Admin.Avatar,
                Role = User_Admin.Role,
                Ativo = User_Admin.Ativo,
                PasswordHash = User_Admin.PasswordHash,
                RefreshToken = User_Admin.RefreshToken,
                RefreshTokenExpiresAt = User_Admin.RefreshTokenExpiresAt
            };
        }
        var User_Delvery = await _authRepository.GetByEmailAsyncDelivery(request.Email);

        if (User_Delvery is not null) {
            User = new UserResponse
            {
                Id = User_Delvery.Id,
                Name = User_Delvery.Name,
                Email = User_Delvery.Email,
                Avatar = User_Delvery.Avatar,
                Role = User_Delvery.Role,
                Ativo = User_Delvery.Ativo,
                PasswordHash = User_Delvery.PasswordHash,
                RefreshToken = User_Delvery.RefreshToken,
                RefreshTokenExpiresAt = User_Delvery.RefreshTokenExpiresAt
            };
        }

        if(User  is null)
        {
            return Result<LoginResponse>.Failure(AuthErrors.InvalidCredentials);
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, User.PasswordHash))
        {
            return Result<LoginResponse>.Failure(AuthErrors.InvalidCredentials);
        }

        var teste = User.Id.ToString();

        var accessToken = _tokenService.GenerateAccessToken(
            User.Id, User.Email, User.Role);

        var refreshToken = _tokenService.GenerateRefreshToken();

        var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(30);

        var userId = User.Id;
        await _authRepository.UpdateRefreshTokenAsync(userId, refreshToken, refreshTokenExpiresAt.ToString());

        await _unitOfWork.CommitAsync();

        return Result<LoginResponse>.Success(new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            Role = User.Role
        });
    }

    //public async Task<Result<LoginResponse>> RefreshAsync(string refreshToken)
    //{
    //    var user = await _authRepository.GetByRefreshTokenAsync(refreshToken);

    //    if (user is null)
    //        return Result<LoginResponse>.Failure(AuthErrors.InvalidRefreshToken);

    //    var newAccessToken = _tokenService.GenerateAccessToken(
    //        user.Id, user.Email, user.Role);

    //    var newRefreshToken = _tokenService.GenerateRefreshToken();
    //    var expiresAt = DateTime.UtcNow.AddDays(7);

    //    await _authRepository.UpdateRefreshTokenAsync(
    //        user.Id, newRefreshToken, expiresAt);

    //    await _unitOfWork.CommitAsync();

    //    return Result<LoginResponse>.Success(new LoginResponse
    //    {
    //        AccessToken = newAccessToken,
    //        RefreshToken = newRefreshToken
    //    });
    //}
}

