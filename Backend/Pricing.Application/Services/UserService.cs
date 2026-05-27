//using Backend.Services.Interfaces;
//using Baldan.Pricing.Application.Commons;
//using Baldan.Pricing.Application.Domain.Auth;
//using Baldan.Pricing.Application.Domain.Enums;
//using Baldan.Pricing.Application.Interfaces;
//using Baldan.Pricing.Application.Interfaces.Repositories;
//using Baldan.Pricing.Application.Models.Entities;
//using Pricing.Api.DTOs.Responses;
//using System.Security.Claims;

//public class UserService : IUserService
//{
//    private readonly IUserRepository _userRepository;
//    private readonly IProfileRepository _profileRepository;
//    private readonly IUnitOfWork _unitOfWork;

//    public UserService(IUserRepository userRepository, IProfileRepository profileRepository, IUnitOfWork unitOfWork)
//    {
//        _userRepository = userRepository;
//        _profileRepository = profileRepository;
//        _unitOfWork = unitOfWork;
//    }

//    public async Task<Result<string>> CreateUser(CreateUserRequest request)
//    {
//        if (await _userRepository.ExistsByEmailAsync(request.Email))
//            return Result<string>.Failure(AuthErrors.InvalidCredentials);

//        if (!Enum.TryParse<ProfileEnum>(request.Role, true, out var profileEnum))
//            return Result<string>.Failure(AuthErrors.InvalidCredentials);

//        var profile = await _profileRepository.GetByEnumAsync(profileEnum);

//        if (profile is null)
//            return Result<string>.Failure(AuthErrors.InvalidCredentials);

//        var user = new User
//        {
//            Name = request.Name,
//            Email = request.Email,
//            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
//            Role = profileEnum.ToString(),
//            Avatar = request.Avatar,
//            Profileid = profile.Id,
//            RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7)
//        };

//        await _userRepository.AddAsync(user);
//        await _unitOfWork.CommitAsync();

//        return Result<string>.Success(user.Email);
//    }

//    public async Task<Result<LoggedUserResponse>> GetLoggedUserAsync(int userId)
//    {

//        var entity = await _userRepository.GetByIdAsync(userId);

//        if (entity is null)
//            return Result<LoggedUserResponse>.Failure(AuthErrors.InvalidCredentials);

//        var profile = await _profileRepository.GetByEnumAsync(
//            Enum.Parse<ProfileEnum>(entity.Role));

//        return Result<LoggedUserResponse>.Success(new LoggedUserResponse
//        {
//            Id = entity.Id.ToString(),
//            Name = entity.Name,
//            Email = entity.Email,
//            Role = entity.Role,
//            Avatar = entity.Avatar,
//        });
//    }
//}

