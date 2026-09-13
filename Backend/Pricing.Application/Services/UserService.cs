using backend.services.interfaces;
using Backend.Services.Interfaces;
using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Auth;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Domain.Enums;
using Baldan.Pricing.Application.Interfaces;
using Baldan.Pricing.Application.Interfaces.Repositories;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Enums;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces;
using Mercado.Craibas.Application.Interfaces.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Org.BouncyCastle.Asn1.Ocsp;
using Pricing.Api.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Drawing;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Xml.Linq;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    //private readonly IProfileRepository _profileRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _Emaillayout;
    private readonly INotificationService _notification;
    private readonly IMemoryCache _memoryCache;
    public UserService(IUserRepository userRepository, IUnitOfWork unitOfWork, IConfiguration configuration, IEmailService emailService, INotificationService notification, IMemoryCache memoryCache)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
        _Emaillayout = emailService;
        _notification = notification;
        _memoryCache = memoryCache;
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
    private static string HashCode(string code)
    {
        using var sha256 = SHA256.Create();

        var bytes = Encoding.UTF8.GetBytes(code);

        var hash = sha256.ComputeHash(bytes);

        return Convert.ToHexString(hash);
    }
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
                Customize = await _unitOfWork.GetClassById<Customize_Admin>(userid, "Id_User_Admin");
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
            Ativo = user.Ativo,
            UpdateDate = user.UpdateDate,
            Customize = new Customize_ClienteResponse{ 
                Id = Customize.Id,
                Global_Site_Color = Customize.Global_Site_Color,
                Tema = Customize.Dark,
                InsertDate = Customize.InsertDate,
                UpdateDate = Customize.UpdateDate
            }
        });
    }
    public async Task<Result<bool>> UpdateProfile(int userId, string role, UpdateProfileRequest request)
    {
        var name = request.Name?.Trim();
        var email = request.Email?.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(name) || name.Length < 3)
            return Result<bool>.Failure(Error.Failure("Perfil", "Informe um nome válido."));

        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            return Result<bool>.Failure(Error.Failure("Perfil", "Informe um e-mail válido."));

        var fields = new Dictionary<string, object>
        {
            { "Name", name },
            { "Email", email },
            { "Phone", request.Phone ?? 0 },
            { "UpdateDate", DateTime.Now }
        };

        string newAvatarName = null;
        string oldAvatarName = null;
        string avatarFolder = null;

        if (request.Avatar != null && request.Avatar.Length > 0)
        {
            const long maxAvatarSize = 5 * 1024 * 1024;
            var allowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(request.Avatar.FileName);

            if (request.Avatar.Length > maxAvatarSize)
                return Result<bool>.Failure(Error.Failure("Foto", "A imagem deve ter no máximo 5 MB."));

            if (!allowedExtensions.Contains(extension))
                return Result<bool>.Failure(Error.Failure("Foto", "Use uma imagem JPG, PNG ou WEBP."));

            var imagesPath = _configuration["Storage:ImagesPath"];
            if (string.IsNullOrWhiteSpace(imagesPath))
                return Result<bool>.Failure(Error.Failure("Foto", "O armazenamento de imagens não está configurado."));

            avatarFolder = Path.Combine(imagesPath, "Usuarios");
            Directory.CreateDirectory(avatarFolder);
            newAvatarName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";

            await using var stream = new FileStream(
                Path.Combine(avatarFolder, newAvatarName), FileMode.CreateNew);
            await request.Avatar.CopyToAsync(stream);
            fields.Add("Avatar", newAvatarName);
        }

        switch (role.ToUpperInvariant())
        {
            case "CLIENTE":
                oldAvatarName = (await _userRepository.GetByIdAsync<User_Customer>(userId, "Id"))?.Avatar;
                break;
            case "ADMIN":
                oldAvatarName = (await _userRepository.GetByIdAsync<User_Admin>(userId, "Id"))?.Avatar;
                break;
            case "DELIVERY":
                oldAvatarName = (await _userRepository.GetByIdAsync<User_Delivery>(userId, "Id"))?.Avatar;
                break;
        }

        var updated = role.ToUpperInvariant() switch
        {
            "CLIENTE" => await _unitOfWork.UpdateFieldsAsync<User_Customer>(
                new Dictionary<string, object> { { "Id", userId } }, fields),
            "ADMIN" => await _unitOfWork.UpdateFieldsAsync<User_Admin>(
                new Dictionary<string, object> { { "Id", userId } }, fields),
            "DELIVERY" => await _unitOfWork.UpdateFieldsAsync<User_Delivery>(
                new Dictionary<string, object> { { "Id", userId } }, fields),
            _ => false
        };

        if (!updated)
        {
            if (newAvatarName != null && avatarFolder != null)
                File.Delete(Path.Combine(avatarFolder, newAvatarName));
            return Result<bool>.Failure(Error.Failure("Perfil", "Não foi possível atualizar o perfil."));
        }

        if (newAvatarName != null && avatarFolder != null && !string.IsNullOrWhiteSpace(oldAvatarName))
        {
            var oldAvatarPath = Path.Combine(avatarFolder, Path.GetFileName(oldAvatarName));
            if (File.Exists(oldAvatarPath)) File.Delete(oldAvatarPath);
        }

        return Result<bool>.Success(true);
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


    public async Task<Result<bool>> SaveLogUser(LogRequest Log,int? UserId)
    {
            var patternChangeList = await _unitOfWork.InsertAsyncReturnId<Logs>(
                new Logs
                {
                    Id_User = Log.Id_User,
                    Log = Log.Log,
                    Nivel = Log.Nivel,
                    Tipo = Log.Tipo,
                    Acao = Log.Acao,
                    Info = Log.Info,
                    InsertDate = DateTime.Now
                });

        return Result<bool>.Success(true);
    }
    public async Task<Result<RegisterStartResponse>> RegisterStartAsync(RegisterStartRequest request)
    {
       
        var userExist = await _unitOfWork.GetClassAsyncWhere<User_Customer>(X => X.Name == request.Name && X.Phone == request.Phone && X.RegistrationStatus != RegistrationStatusEnum.Completed.ToString());
        if(userExist is not null)
        {
            var EmailVerification = await _unitOfWork.GetClassAsyncWhere<EmailVerification>(X => X.UserId == userExist.Id);
            return Result<RegisterStartResponse>.Success(new RegisterStartResponse {
                IdUser = userExist.Id,
                NextStep = userExist.RegistrationStatus,
                Name = userExist.Name,
                Phone = userExist.Phone,
                BackRegistration = true,
                Email = userExist.Email,
                ExpiresAt =  EmailVerification?.ExpiresAt ?? DateTime.Now

            });
        }

        var phoneExiste = await _unitOfWork.GetClassAsyncWhere<User_Customer>(x => x.Phone == request.Phone);

        var phone = new string(request.Phone.Where(char.IsDigit).ToArray());

        if (phoneExiste is not null)
        {
            return Result<RegisterStartResponse>.Failure(Error.Validation("Telefone", "Este telefone já está cadastrado em uma conta."));
        }
        // 1. Validar nome
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return Result<RegisterStartResponse>.Failure(Error.NotFound("Nome", "Informe seu nome."));
        }

        if (request.Name.Trim().Length < 3)
        {
            return Result<RegisterStartResponse>.Failure(Error.Validation("Nome", "Informe seu nome completo"));
        }

        // 2. Validar telefone
        if (string.IsNullOrWhiteSpace(request.Phone))
        {
            return Result<RegisterStartResponse>.Failure(Error.NotFound("Telefone", "Informe seu telefone."));
        }


        if (phone.Length < 10 || phone.Length > 11)
        {
            return Result<RegisterStartResponse>.Failure(Error.NotFound("Telefone", "Informe telefone inválido."));
        }

        // 3. Criar usuário
        var patternChangeList = await _unitOfWork.InsertAsyncReturnId<User_Customer>(
              new User_Customer
              {
                 Name = request.Name,
                 Phone = request.Phone,
                 PasswordHash = ".",
                 Role = ProfileEnum.CLIENTE,
                 InsertDate = DateTime.Now,
                 Ativo = false,
                 EmailVerified = false,
                 RegistrationStatus = RegistrationStatusEnum.PersonalDataCompleted.ToString(),

              });

        await _unitOfWork.InsertAsyncReturnId<Logs>(new Logs
        {
            Id_User = patternChangeList.Id,
            Log = $"O Cliente {patternChangeList.Name} iniciou o cadastro a primeira etapa do cadastro.",
            Tipo = "Cadastro",
            Nivel = "CLIENTE",
            Acao = $"{patternChangeList.Name} iniciou um novo cadastro.",
            Info = $"{patternChangeList.Name} iniciou o cadastro em {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
            InsertDate = DateTime.Now
        });
        var userAdmin = await _unitOfWork.GetClassListAsyncWhere<User_Admin>(x => x.Isdelete != true && x.Ativo == true);

        var users = userAdmin.Select(x => new NotificationUserRequest
        {
            UserId = x.Id
        }).ToList();

        await _notification.SendNotification(
              new NotificationRequest
              {
                  Kind = "Novo Cadastro",
                  Title = "Novo cliente cadastrado!",
                  Description = $"{patternChangeList.Name} iniciou um novo cadastro.",
                  Icone = "UserPlus",
                  ActionUrl = "/admin",
                  ReferenceId = patternChangeList.Id,
                  ReferenceType = "CADASTRO",
                  Role = "ADMIN"
              },users);
              
        return Result<RegisterStartResponse>.Success(
            new RegisterStartResponse
            {
                IdUser = patternChangeList.Id,
                NextStep = patternChangeList.RegistrationStatus,
                Name = request.Name,
                Phone = request.Phone,
                BackRegistration = false
            });
    }
    public async Task<Result<RegisterEmailResponse>> RegisterEmailConfirm(RegisterEmailRequest request)
    {
        var email = request.Email.Trim().ToLower();

        var clienteExiste = await _unitOfWork.GetClassAsyncWhere<User_Customer>(x => x.Email.ToLower() == email);

        if (clienteExiste is not null)
        {
            return Result<RegisterEmailResponse>.Failure(Error.Conflict("Email","Este e-mail já está cadastrado em uma conta."));
        }

        var user = await _unitOfWork.GetClassAsyncWhere<User_Customer>(x => x.Id == request.UserId);

        if (user == null)
        {
            return Result<RegisterEmailResponse>.Failure(Error.NotFound("Cadastro","Cadastro não encontrado."));
        }

        // ============================================================
        // 2. Verificar etapa
        // ============================================================

        if (user.RegistrationStatus != RegistrationStatusEnum.PersonalDataCompleted.ToString())
        {
            return Result<RegisterEmailResponse>.Failure(Error.Failure("Cadastro","Essa etapa do cadastro não está disponível."));
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return Result<RegisterEmailResponse>.Failure(Error.Failure("Cadastro","Informe seu e-mail."));
        }

        if (string.IsNullOrWhiteSpace(request.ConfirmEmail) || request.Email.Trim().ToLower() != request.ConfirmEmail.Trim().ToLower())
        {
            return Result<RegisterEmailResponse>.Failure(Error.Failure("Cadastro","Os e-mails não são iguais."));
        }

        if (!new EmailAddressAttribute().IsValid(email))
        {
            return Result<RegisterEmailResponse>.Failure(Error.Failure("Cadastro","Informe um e-mail válido."));
        }

        var emailExists =
            await _unitOfWork.GetClassAsyncWhere<User_Customer>(x => x.Email == email && x.Id != user.Id && x.RegistrationStatus == RegistrationStatusEnum.Completed.ToString());

        if (emailExists is not null)
        {
            return Result<RegisterEmailResponse>.Failure(Error.Failure("Cadastro","Esse e-mail já possui uma conta."));
        }

        var code = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

        var codeHash = HashCode(code);

        var createdAt = DateTime.UtcNow;

        var expiresAt = createdAt.AddMinutes(10);

        var emailVerification = new EmailVerification
        {
            UserId = user.Id,
            CodeHash = codeHash,
            ExpiresAt = expiresAt,
            Attempts = 0,
            CreatedAt = createdAt,
            UsedAt = null
        };

        await _unitOfWork.InsertAsyncReturnId<EmailVerification>(emailVerification);


        await _unitOfWork.UpdateFieldsAsync<User_Customer>(
            filters: new Dictionary<string, object>
            {
            { "Id", user.Id }
            },
            fieldsToUpdate: new Dictionary<string, object>
            {
            { "Email", email },

            {
                "RegistrationStatus",
                RegistrationStatusEnum.EmailVerificationPending.ToString()
            },

            { "UpdateDate", DateTime.UtcNow }
            });

        // ============================================================
        // 12. Criar layout do e-mail
        // ============================================================

        var layoutEmail =
            _Emaillayout.EmailConfirmacaoCadastro(
                user.Name,
                code);

        // ============================================================
        // 13. Enviar e-mail
        // ============================================================

        var enviado = await _Emaillayout.EnviarEmailAsync(
            email,
            "Confirme seu e-mail - Mercado Craíbas",
            layoutEmail);

        // ============================================================
        // 14. Verificar envio
        // ============================================================

        if (!enviado)
        {
            return Result<RegisterEmailResponse>.Failure(Error.Failure("Email","Não foi possível enviar o código de confirmação."));
        }

        // ============================================================
        // 15. Retornar
        // ============================================================
        await _unitOfWork.InsertAsyncReturnId<Logs>(new Logs
        {
            Id_User = user.Id,
            Log = $"{user.Name} informou o e-mail {email} para confirmação.",
            Tipo = "Cadastro",
            Nivel = "CLIENTE",
            Acao = $"O Cliente {user.Name} informou o e-mail para confirmação do cadastro.",
            Info = $"{user.Name} informou o e-mail {email} em {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
            InsertDate = DateTime.Now
        });

        return Result<RegisterEmailResponse>.Success(new RegisterEmailResponse
            {
                IdUser = user.Id,
                NextStep = RegistrationStatusEnum.EmailVerificationPending.ToString(),
                Name = user.Name,
                Phone = user.Phone,
                Email = email,
                ExpiresAt = expiresAt,
                BackRegistration = false
            });
    }

    public async Task<Result<RegisterEmailResponse>> RegisterEmailCodeConfirm(int userId,string code)
    {
        // 1. Buscar usuário
        var user = await _unitOfWork.GetClassAsyncWhere<User_Customer>(x => x.Id == userId);

        if (user == null)
        {
            return Result<RegisterEmailResponse>.Failure(Error.NotFound("Cadastro", "Cadastro não encontrado."));
        }

        // 2. Verificar se está na etapa correta
        if (user.RegistrationStatus != RegistrationStatusEnum.EmailVerificationPending.ToString())
        {
            return Result<RegisterEmailResponse>.Failure(Error.Failure("Cadastro","Essa etapa do cadastro não está disponível."));
        }

        // 3. Validar código informado
        if (string.IsNullOrWhiteSpace(code))
        {
            return Result<RegisterEmailResponse>.Failure(Error.Failure("Código","Informe o código de confirmação."));
        }

        code = code.Trim();

        if (code.Length != 6 || !code.All(char.IsDigit))
        {
            return Result<RegisterEmailResponse>.Failure(Error.Failure("Código","O código deve possuir 6 dígitos."));
        }

        // 4. Buscar último código enviado
        var verification = await _unitOfWork.GetClassAsyncWhere<EmailVerification>(x => x.UserId == user.Id && x.UsedAt == null);

      
        if (verification == null)
        {
            return Result<RegisterEmailResponse>.Failure(Error.Failure("Código","Nenhum código de confirmação encontrado. Solicite um novo código."));
        }
        if (verification.Attempts >= 3)
        {
            return Result<RegisterEmailResponse>.Failure(Error.Failure("Código", "Número máximo de tentativas atingido. Solicite um novo código."));
        }
        if (verification.ExpiresAt < DateTime.UtcNow)
        {
            return Result<RegisterEmailResponse>.Failure(Error.Failure("Código","O código de confirmação expirou. Solicite um novo código."));
        }
        

        // 6. Verificar código
        var codeHash = HashCode(code);

        if (!string.Equals(verification.CodeHash,codeHash,StringComparison.OrdinalIgnoreCase))
        {
            await _unitOfWork.UpdateFieldsAsync<EmailVerification>(
            filters: new Dictionary<string, object>
            {
            { "Id", verification.Id }
            },
            fieldsToUpdate: new Dictionary<string, object>
            {
            { "Attempts", verification.Attempts += 1 }
            });
            return Result<RegisterEmailResponse>.Failure(Error.Failure("Código","Código de confirmação inválido."));
        }

        // 7. Marcar código como utilizado
        await _unitOfWork.UpdateFieldsAsync<EmailVerification>(
            filters: new Dictionary<string, object>
            {
            { "Id", verification.Id }
            },
            fieldsToUpdate: new Dictionary<string, object>
            {
            { "UsedAt", DateTime.UtcNow }
            }
        );

        // 8. Atualizar status do cadastro
        await _unitOfWork.UpdateFieldsAsync<User_Customer>(
            filters: new Dictionary<string, object>
            {
            { "Id", user.Id }
            },
            fieldsToUpdate: new Dictionary<string, object>
            {
            {
                "RegistrationStatus",
                RegistrationStatusEnum.EmailCompleted.ToString()
            },
            { "EmailVerified", true },
            { "UpdateDate", DateTime.UtcNow }
            }
        );

        // 9. Registrar log
        await _unitOfWork.InsertAsyncReturnId<Logs>(
            new Logs
            {
                Id_User = user.Id,
                Log = $"{user.Name} confirmou o e-mail {user.Email}.",
                Tipo = "Cadastro",
                Nivel = "CLIENTE",
                Acao = $"O Cliente {user.Name} confirmou o código de e-mail.",
                Info = $"{user.Name} confirmou o e-mail em {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
                InsertDate = DateTime.Now
            }
        );

      

        // 10. Retornar próxima etapa
        return Result<RegisterEmailResponse>.Success(new RegisterEmailResponse
            {
            IdUser = user.Id,
            NextStep = RegistrationStatusEnum.EmailCompleted.ToString(),
            Name = user.Name,
            Phone = user.Phone,
            Email = user.Email,
            BackRegistration = false
            }
        );
    }
    public async Task<Result<RegisterPasswordResponse>> RegisterPassword(int userId,string password,string confirmPassword)
    {
        // 1. Validar usuário
        var user = await _unitOfWork.GetClassById<User_Customer>(userId,"Id");

        if (user == null)
        {
            return Result<RegisterPasswordResponse>.Failure(Error.Failure("Usuário não encontrado", "Usuário não encontrado."));
        }
        if (user.PasswordHash != "." || user.PasswordHash == null)
        {
            return Result<RegisterPasswordResponse>.Failure(Error.Failure("Usuário não encontrado", "Senha ja existe acesse na tela de login."));
        }
      
        // 2. Validar senha
        if (string.IsNullOrWhiteSpace(password))
        {
            return Result<RegisterPasswordResponse>.Failure(Error.Failure("Senha necessária","A senha é obrigatória."));
        }

        // 3. Confirmar senha
        if (password != confirmPassword)
        {
            return Result<RegisterPasswordResponse>.Failure(Error.Failure("Senha necessária", "As senhas não coincidem."));
        }

        // 4. Pelo menos 8 caracteres
        if (password.Length < 8)
        {
            return Result<RegisterPasswordResponse>.Failure(Error.Failure("Comprimento da Senha","A senha deve possuir pelo menos 8 caracteres."));
        }

        // 5. Letra maiúscula
        if (!password.Any(char.IsUpper))
        {
            return Result<RegisterPasswordResponse>.Failure(Error.Failure("Letra Maiúscula","A senha deve possuir pelo menos uma letra maiúscula."));
        }

        // 6. Letra minúscula
        if (!password.Any(char.IsLower))
        {
            return Result<RegisterPasswordResponse>.Failure(Error.Failure("Letra minúscula", "A senha deve possuir pelo menos uma letra minúscula."));
        }

        // 7. Número
        if (!password.Any(char.IsDigit))
        {
            return Result<RegisterPasswordResponse>.Failure(Error.Failure("Numero Senha","A senha deve possuir pelo menos um número."));
        }

        // 8. Caractere especial
        if (!password.Any(ch => !char.IsLetterOrDigit(ch)))
        {
            return Result<RegisterPasswordResponse>.Failure(Error.Failure("Caráctere Especial","A senha deve possuir pelo menos um caractere especial."));
        }

        // 9. Gerar hash
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

        // 10. Salvar
        await _unitOfWork.UpdateFieldsAsync<User_Customer>(
          filters: new Dictionary<string, object>
          {
            { "Id", user.Id }
          },
          fieldsToUpdate: new Dictionary<string, object>
          {
            {"RegistrationStatus",RegistrationStatusEnum.Completed.ToString()},
            {"PasswordHash",passwordHash},
            { "UpdateDate", DateTime.UtcNow }
          }
        );
        var NewCustomize_Cliente = new Customize_Cliente
        {
           Global_Site_Color = "brand",
            Dark = true,
            Id_User_Customer = user.Id,
            InsertDate = DateTime.Now,
            Isdelete = false
        };

        await _unitOfWork.InsertAsyncReturnId<Customize_Cliente>(NewCustomize_Cliente);

        var NewCart = new Cart
        {
            Id_User_Customer = user.Id,
            InsertDate = DateTime.Now,
            Isdelete = false
        };
        await _unitOfWork.InsertAsyncReturnId<Cart>(NewCart);


        await _unitOfWork.InsertAsyncReturnId<Logs>(
           new Logs
           {
               Id_User = user.Id,
               Log = $"{user.Name} finalizou o cadastro da conta.",
               Tipo = "Cadastro",
               Nivel = "CLIENTE",
               Acao = $"O Cliente {user.Name} concluiu todas as etapas do cadastro.",
               Info = $"{user.Name} finalizou o cadastro em {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
               InsertDate = DateTime.Now
           });

        await _notification.SendNotification(
              new NotificationRequest
              {
                  Kind = "Cadastro",
                  Title = "Cadastro realizado com sucesso! 🎉",
                  Description = $"Seja bem-vindo(a) ao Mercado Craibas, {user.Name}! Seu cadastro foi concluído com sucesso. Agora você já pode realizar suas compras, acompanhar seus pedidos e aproveitar todas as funcionalidades do nosso e-commerce.",
                  Icone = "UserCheck",
                  ActionUrl = "/",
                  ReferenceId = user.Id,
                  ReferenceType = "REGISTRATION",
                  Role = "CLIENTE"
              },
              new List<NotificationUserRequest>
              {
                    new NotificationUserRequest
                    {
                        UserId = user.Id
                    }
              });

        var userAdmin = await _unitOfWork.GetClassListAsyncWhere<User_Admin>(x => x.Isdelete != true && x.Ativo == true);

        var users = userAdmin.Select(x => new NotificationUserRequest
        {
            UserId = x.Id
        }).ToList();

        await _notification.SendNotification(
            new NotificationRequest
            {
                Kind = "Novo Cadastro",
                Title = "Novo cliente cadastrado! 🎉",
                Description = $"O cliente {user.Name} concluiu o cadastro e já pode utilizar a plataforma.",
                Icone = "UserPlus",
                ActionUrl = "/admin",
                ReferenceId = user.Id,
                ReferenceType = "CADASTRO",
                Role = "ADMIN"
            },
            users
        );

        // Se você possui um status de cadastro:
        return Result<RegisterPasswordResponse>.Success(
            new RegisterPasswordResponse
            {
                IdUser = user.Id,
                NextStep = RegistrationStatusEnum.Completed.ToString(),
                Message = "Cadastro realizado com sucesso! Agora você será direcionado para a tela de login para realizar seu primeiro acesso."
            }
        );
    }
    public async Task<Result<RegisterEmailResponse>> ResendCode(int userId,string email,string phone,string ipAddress)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(phone) || string.IsNullOrWhiteSpace(ipAddress))
        {
            return Result<RegisterEmailResponse>.Failure(Error.Failure("Cadastro","Não foi possível validar os dados do cadastro."));
        }

        var user = await _unitOfWork.GetClassAsyncWhere<User_Customer>(x => x.Id == userId &&x.Email == email &&x.Phone == phone);

        if (user == null)
        {
            return Result<RegisterEmailResponse>.Failure(Error.Failure("Cadastro","Não foi possível validar os dados do cadastro."));
        }

        if (user.RegistrationStatus != RegistrationStatusEnum.EmailVerificationPending.ToString())
        {
            return Result<RegisterEmailResponse>.Failure(Error.Failure("Cadastro","Essa etapa do cadastro não está disponível."));
        }

        var verification = await _unitOfWork.GetClassAsyncWhere<EmailVerification>( x => x.UserId == user.Id && x.UsedAt == null);

        if (verification == null)
        {
            return Result<RegisterEmailResponse>.Failure(Error.Failure("Código","Nenhum código de confirmação encontrado. Solicite um novo código."));
        }

        var now = DateTime.UtcNow;

        // ============================================================
        // 5. LIMITADOR POR IP
        // Máximo: 10 solicitações a cada 10 minutos
        // ============================================================

        var ipCacheKey = $"resend-code-ip:{ipAddress}";

        if (!_memoryCache.TryGetValue<int>(ipCacheKey,out var ipAttempts))
        {
            ipAttempts = 0;
        }

        if (ipAttempts >= 5)
        {
            return Result<RegisterEmailResponse>.Failure(Error.Failure("Código","Muitas solicitações foram realizadas. Tente novamente mais tarde."));
        }

        if (verification.LastResendAt.HasValue)
        {
            var nextAllowedResend = verification.LastResendAt.Value.AddSeconds(60);

            if (nextAllowedResend > now)
            {
                var remainingSeconds =Math.Max(1,(int)Math.Ceiling((nextAllowedResend - now).TotalSeconds));

                return Result<RegisterEmailResponse>.Failure(Error.Failure("Código",$"Aguarde {remainingSeconds} segundos antes de solicitar outro código."));
            }
        }

        var resendCount = verification.ResendCount;
        var resendWindowStart = verification.ResendWindowStartedAt;

        // Primeira solicitação dentro da janela
        if (!resendWindowStart.HasValue)
        {
            resendWindowStart = now;
            resendCount = 0;
        }

        // Reiniciar janela após 30 minutos
        if (resendWindowStart.Value.AddMinutes(30) <= now)
        {
            resendWindowStart = now;
            resendCount = 0;
        }

        if (resendCount >= 5)
        {
            var availableAt = resendWindowStart.Value.AddMinutes(30);

            var remainingMinutes =Math.Max(1,(int)Math.Ceiling((availableAt - now).TotalMinutes));

            return Result<RegisterEmailResponse>.Failure(Error.Failure("Código",$"Limite de reenvios atingido. Tente novamente em aproximadamente {remainingMinutes} minutos."));
        }

        var code = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

        var codeHash = HashCode(code);

        var expiresAt = now.AddMinutes(10);

        var layoutEmail =_Emaillayout.EmailConfirmacaoCadastro(user.Name,code);

        var enviado = await _Emaillayout.EnviarEmailAsync(user.Email,"Confirme seu e-mail - Mercado Craíbas",layoutEmail);

        if (!enviado)
        {
            return Result<RegisterEmailResponse>.Failure(Error.Failure("E-mail","Não foi possível enviar o novo código de confirmação. Tente novamente."));
        }

        await _unitOfWork.UpdateFieldsAsync<EmailVerification>(
            filters: new Dictionary<string, object>
            {
            { "Id", verification.Id }
            },

            fieldsToUpdate: new Dictionary<string, object>
            {
            { "CodeHash", codeHash },
            { "ExpiresAt", expiresAt },
            { "Attempts", 0 },
            { "CreatedAt", now },

            { "LastResendAt", now },

            { "ResendCount", resendCount + 1 },
            { "ResendWindowStartedAt", resendWindowStart }
            }
        );

        ipAttempts++;

        _memoryCache.Set(ipCacheKey,ipAttempts,TimeSpan.FromMinutes(10));

        await _unitOfWork.InsertAsyncReturnId<Logs>(
            new Logs
            {
                Id_User = user.Id,
                Log = $"{user.Name} solicitou um novo código de confirmação para o e-mail {user.Email}.",
                Tipo = "Cadastro",
                Nivel = "CLIENTE",
                Acao = $"O Cliente {user.Name} solicitou o reenvio do código de confirmação.",
                Info = $"{user.Name} solicitou um novo código de confirmação em {DateTime.Now:dd/MM/yyyy HH:mm:ss}.",
                InsertDate = DateTime.Now
            }
        );
         return Result<RegisterEmailResponse>.Success(new RegisterEmailResponse
            {
                IdUser = user.Id,
                NextStep = RegistrationStatusEnum.EmailVerificationPending.ToString(),
                Name = user.Name,
                Phone = user.Phone,
                Email = email,
                ExpiresAt = expiresAt,
                BackRegistration = false
            });
    }
    public async Task<Result<RegisterEmailResponse>> EditEmailNew(string emailInvalid,int userId)
    {
        if (string.IsNullOrWhiteSpace(emailInvalid))
        {
            return Result<RegisterEmailResponse>.Failure(Error.Failure("Cadastro", "E-mail não informado."));
        }

        var email = emailInvalid.Trim().ToLowerInvariant();

        var user = await _unitOfWork.GetClassAsyncWhere<User_Customer>(x => x.Email.ToLower() == email && x.Id == userId);

        if (user == null)
        {
            return Result<RegisterEmailResponse>.Failure(Error.NotFound("Cadastro", "Cadastro não encontrado."));
        }
        var CartEmpty = await _unitOfWork.DeleteAllByColumnAsync<EmailVerification>("UserId", user.Id);

        await _unitOfWork.UpdateFieldsAsync<User_Customer>(
            filters: new Dictionary<string, object>
            {
            { "Id", user.Id }
            },
            fieldsToUpdate: new Dictionary<string, object>
            {
            {
                "RegistrationStatus",
                RegistrationStatusEnum.PersonalDataCompleted.ToString()
            },
            { "UpdateDate", DateTime.UtcNow }
            });

        return Result<RegisterEmailResponse>.Success(new RegisterEmailResponse
            {
                IdUser = user.Id,
                NextStep = RegistrationStatusEnum.PersonalDataCompleted.ToString(),
                Name = user.Name,
                Phone = user.Phone,
                Email = user.Email,
                BackRegistration = true
            }
        );
    }

}
