using backend.services.interfaces;
using Backend.Services.Interfaces;
using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Auth;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Domain.Enums;
using Baldan.Pricing.Application.Interfaces;
using Baldan.Pricing.Application.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using Pricing.Api.DTOs.Responses;
using System;
using System.Security.Claims;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    //private readonly IProfileRepository _profileRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UserService(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    //public async Task<Result<string>> CreateUser(CreateUserRequest request)
    //{
    //    if (await _userRepository.ExistsByEmailAsync(request.Email))
    //        return Result<string>.Failure(AuthErrors.InvalidCredentials);

    //    if (!Enum.TryParse<ProfileEnum>(request.Role, true, out var profileEnum))
    //        return Result<string>.Failure(AuthErrors.InvalidCredentials);

    //    var profile = await _profileRepository.GetByEnumAsync(profileEnum);

    //    if (profile is null)
    //        return Result<string>.Failure(AuthErrors.InvalidCredentials);

    //    var user = new User
    //    {
    //        Name = request.Name,
    //        Email = request.Email,
    //        PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
    //        Role = profileEnum.ToString(),
    //        Avatar = request.Avatar,
    //        Profileid = profile.Id,
    //        RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7)
    //    };

    //    await _userRepository.AddAsync(user);
    //    await _unitOfWork.CommitAsync();

    //    return Result<string>.Success(user.Email);
    //}

    public async Task<Result<UserResponse>> GetbyIdUser(int userid, string role)
    {
        dynamic? user = null;

        switch (role)
        {
            case "CLIENTE":
                user = await _userRepository.GetByIdAsync<User_Customer>(userid);
                break;

            case "ADMIN":
                user = await _userRepository.GetByIdAsync<User_Admin>(userid);
                break;

            case "DELIVERY":
                user = await _userRepository.GetByIdAsync<User_Delivery>(userid);
                break;

            default:
                return Result<UserResponse>.Failure(
                    Error.Failure("Role", "Role Não Encontrado!")
                );
        }

        if (user is null)
        {
            return Result<UserResponse>.Failure(AuthErrors.InvalidCredentials);
        }

        return Result<UserResponse>.Success(new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Avatar = user.Avatar,
            Role = user.Role,
            Phone = user.Phone,
            Insert_Date = user.InsertDate,
        });
    }
}

