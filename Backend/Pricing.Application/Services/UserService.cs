using backend.services.interfaces;
using Backend.Services.Interfaces;
using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Auth;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Domain.Enums;
using Baldan.Pricing.Application.Interfaces;
using Baldan.Pricing.Application.Interfaces.Repositories;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
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
        dynamic? cart_User = null;
        List<Address> andrees_User = [];


        switch (role)
        {
            case "CLIENTE":
                user = await _userRepository.GetByIdAsync<User_Customer>(userid,"Id");
                cart_User = await _userRepository.GetByIdAsync<Cart>(userid, "Id_User_Customer");
                andrees_User = await _unitOfWork.GetClassListById<Address>(userid, "Id_User_Customer");
                break;

            case "ADMIN":
                user = await _userRepository.GetByIdAsync<User_Admin>(userid, "Id");
                break;

            case "DELIVERY":
                user = await _userRepository.GetByIdAsync<User_Delivery>(userid,"Id");
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

            Cart_User = cart_User == null
             ? null
             : new CartResponse
             {
                 Id = cart_User.Id,
                 Id_User_Customer = cart_User.Id_User_Customer
             },

            Address = andrees_User?.Select(x => new AddressResponse
            {
                Id = x.Id,
                Road = x.Road,
                Neighborhood = x.Neighborhood,
                City = x.City,
                Number = x.Number,
                State = x.State,
                Id_User_Customer = x.Id_User_Customer,
                ReferencePoint = x.ReferencePoint,
                Supplement = x.Supplement,
                Standard = x.Standard,
            }).ToList()
        });
    }
    public async Task<Result<bool>> PostSaveAddressUserService(AddressRequest NewAnddress)
     {
        var Andrees = new Address
        {
            Road = NewAnddress.Road,
            Neighborhood = NewAnddress.Neighborhood,
            Supplement = NewAnddress.supplement,
            ReferencePoint = NewAnddress.referencePoint,
            City = NewAnddress.City,
            Number = NewAnddress.Number,
            State = NewAnddress.State,
            Standard = NewAnddress.standard,
            Id_User_Customer = NewAnddress.Id_User_Customer,
            InsertDate = DateTime.Now
        };

        var Insert_Address = await _userRepository.InsertAddressUserAsync<Address>(Andrees);

        if(Insert_Address == 0)
        {
            return Result<bool>.Failure(Error.Failure("Endereço", "Error ao Salvar Endereço"));
        }
        return Result<bool>.Success(true);
    }
    public async Task<Result<List<AddressResponse>>> GetAddressbyIdUserService(int Id_User)
    {
         List<Address> ListAddress = [] ;

        var NewListAnddres = await _unitOfWork.GetClassListById<Address>(Id_User, "Id_User_Customer");


        if (NewListAnddres == null)
        {
            return Result<List<AddressResponse>>.Failure(Error.Failure("Endereço","Nenhum Endereço Encontrado com seu ID"));
        }
        var response = new List<AddressResponse>();

        foreach (var x in NewListAnddres)
        {
            response.Add(new AddressResponse
            {
                Id = x.Id,
                Road = x.Road,
                Neighborhood = x.Neighborhood,
                City = x.City,
                Number = x.Number,
                State = x.State,
                Id_User_Customer = x.Id_User_Customer,
                ReferencePoint = x.ReferencePoint,
                Supplement = x.Supplement,
                Standard = x.Standard
            });
        }

        return Result<List<AddressResponse>>.Success(response);
    }

}

