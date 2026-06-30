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
using System.Collections.Generic;
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
        //dynamic? cart_User = null;
        //List<Address> andrees_User = [];
        dynamic? Customize = null;


        switch (role)
        {
            case "CLIENTE":
                user = await _userRepository.GetByIdAsync<User_Customer>(userid, "Id");
                //cart_User = await _userRepository.GetByIdAsync<Cart>(userid, "Id_User_Customer");
                //andrees_User = await _unitOfWork.GetClassListById<Address>(userid, "Id_User_Customer");
                Customize = await _unitOfWork.GetClassById<Customize_Cliente>(userid, "Id_User_Customer");
                break;

            case "ADMIN":
                user = await _userRepository.GetByIdAsync<User_Admin>(userid, "Id");
                break;

            case "DELIVERY":
                user = await _userRepository.GetByIdAsync<User_Delivery>(userid, "Id");
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

            //Cart_User = cart_User == null
            // ? null
            // : new CartResponse
            // {
            //     Id = cart_User.Id,
            //     Id_User_Customer = cart_User.Id_User_Customer
            // },

            //Address = andrees_User?.Select(x => new AddressResponse
            //{
            //    Id = x.Id,
            //    Road = x.Road,
            //    Name = x.Name,
            //    Phone = x.Phone,
            //    Neighborhood = x.Neighborhood,
            //    City = x.City,
            //    Number = x.Number,
            //    State = x.State,
            //    Id_User_Customer = x.Id_User_Customer,
            //    ReferencePoint = x.ReferencePoint,
            //    Supplement = x.Supplement,
            //    Standard = x.Standard,
            //}).ToList(),
            Customize = Customize
        });
    }
    public async Task<Result<bool>> PostSaveAddressUserService(AddressRequest NewAnddress)
    {
        if (NewAnddress.Standard == true)
        {
            var PatternChangeList = await _unitOfWork.GetClassListById<Address>(NewAnddress.Id_User_Customer, "Id_User_Customer");

            var EnderecoPadrao = PatternChangeList.FirstOrDefault(x => x.Standard == true);

            if (EnderecoPadrao is not null)
            {
                var Update_Address = await _unitOfWork.UpdateFieldsAsync<Address>(filters: new Dictionary<string, object>
        {
                { "Id", EnderecoPadrao.Id }
                      },
                      fieldsToUpdate: new Dictionary<string, object>
                      {
                          {"Standard",false }
                      });
            }
        }

        var Andrees = new Address
        {
            Road = NewAnddress.Road,
            Name = NewAnddress.Name,
            Phone= NewAnddress.Phone,
            Neighborhood = NewAnddress.Neighborhood,
            Supplement = NewAnddress.Supplement,
            ReferencePoint = NewAnddress.ReferencePoint,
            City = NewAnddress.City,
            Number = NewAnddress.Number,
            State = NewAnddress.State,
            Standard = NewAnddress.Standard,
            Id_User_Customer = NewAnddress.Id_User_Customer,
            InsertDate = DateTime.Now
        };

        var Insert_Address = await _userRepository.InsertAddressUserAsync<Address>(Andrees);

        if (Insert_Address == 0)
        {
            return Result<bool>.Failure(Error.Failure("Endereço", "Error ao Salvar Endereço"));
        }
        return Result<bool>.Success(true);
    }
    public async Task<Result<List<AddressResponse>>> GetAddressbyIdUserService(int Id_User)
    {
        List<Address> ListAddress = [];

        var NewListAnddres = await _unitOfWork.GetClassListById<Address>(Id_User, "Id_User_Customer");


        if (NewListAnddres == null)
        {
            return Result<List<AddressResponse>>.Failure(Error.Failure("Endereço", "Nenhum Endereço Encontrado com seu ID"));
        }
        var response = new List<AddressResponse>();

        foreach (var x in NewListAnddres)
        {
            response.Add(new AddressResponse
            {
                Id = x.Id,
                Road = x.Road,
                Name = x.Name,
                Phone = x.Phone,
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

    public async Task<Result<bool>> PostUpdateAddressUserService(AddressRequest NewAnddress)
    {
        if (NewAnddress.Standard == true)
        {
            var PatternChangeList = await _unitOfWork.GetClassListById<Address>(NewAnddress.Id_User_Customer, "Id_User_Customer");

            var EnderecoPadrao = PatternChangeList.FirstOrDefault(x => x.Standard == true);

            if (EnderecoPadrao is not null)
            {
                var Update_Standard = await _unitOfWork.UpdateFieldsAsync<Address>(filters: new Dictionary<string, object>
        {
                { "Id", EnderecoPadrao.Id }
                      },
                      fieldsToUpdate: new Dictionary<string, object>
                      {
                          {"Standard",false }
                      });
            }
        }

        var Update_Address = await _unitOfWork.UpdateFieldsAsync<Address>(filters: new Dictionary<string, object>
        {
                { "Id", NewAnddress.Id }
        },

       fieldsToUpdate: new Dictionary<string, object>
       {
           {"Road",NewAnddress.Road },
           {"Name",NewAnddress.Name },
           {"Phone",NewAnddress.Phone },
           {"Neighborhood",NewAnddress.Neighborhood},
           {"Supplement",NewAnddress.Supplement},
           {"ReferencePoint",NewAnddress.ReferencePoint},
           {"City",NewAnddress.City},
           {"Number",NewAnddress.Number},
           {"State",NewAnddress.State},
           {"Standard",NewAnddress.Standard},
           { "Id_User_Customer", NewAnddress.Id_User_Customer},
           {"UpdateDate", DateTime.Now }
       });

        if (!Update_Address)
        {
            return Result<bool>.Failure(Error.Failure("Endereço", "Error ao Salvar Endereço"));
        }
        return Result<bool>.Success(true);
    }
    public async Task<Result<bool>> DeleteAddressService(AddressRequest DeleteAddress)
    {

        var DeleteAddres = await _unitOfWork.DeleteByColumnAsyncGlolbal<Address>("Id", DeleteAddress.Id);

        if (!DeleteAddres)
        {
            return Result<bool>.Failure(Error.Failure("Endereço", "Error ao Remover Endereço"));
        }
        if (DeleteAddress.Standard == true)
        {
            var GetAddressStandard = await _unitOfWork.GetClassById<Address>(DeleteAddress.Id_User_Customer, "Id_User_Customer");

            if (GetAddressStandard == null)
            {
                return Result<bool>.Failure(Error.Validation("Padrão", "Você ainda não possui um endereço cadastrado. Cadastre pelo menos um para ter um endereço padrão!"));
            }
            var Update_Standard = await _unitOfWork.UpdateFieldsAsync<Address>(filters: new Dictionary<string, object>
              {
        { "Id", GetAddressStandard.Id }
              },
      fieldsToUpdate: new Dictionary<string, object>
      {
                  {"Standard",true }
      });

        }
        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> SaveColorGlobalInsertService(string Color, int Id_User)
    {
        if (Color == null)
        {
            return Result<bool>.Failure(Error.Validation("Error", "Erro ao Salvar cor escolhida entre em contato com suporte!"));

        }
        var Insert_Color = await _unitOfWork.UpdateFieldsAsync<Customize_Cliente>(filters: new Dictionary<string, object>
         {
        { "Id_User_Customer", Id_User }
         },
      fieldsToUpdate: new Dictionary<string, object>
      {
          {"Global_Site_Color",Color },
          {"UpdateDate",DateTime.Now }
      });
        if (Insert_Color == false)
        {
            return Result<bool>.Failure(Error.Validation("Error", "Não foi possivel salvar a cor!, Entre em contato com suporte!"));
        }
        return Result<bool>.Success(true);
    }

}

