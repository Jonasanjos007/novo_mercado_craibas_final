using backend.services.interfaces;
using Backend.Services.Interfaces;
using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Auth;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Baldan.Pricing.Application.Interfaces.Repositories;
using BCrypt.Net;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces;
using Mercado.Craibas.Application.Interfaces.Services;
using Mercado.Craibas.Application.InterfacesAdmin;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Pricing.Api.DTOs.Requests;
using Pricing.Api.DTOs.Responses;

public class AuthService : IAuthService
{
    private readonly ITokenService _tokenService;
    private readonly IAuthRepository _authRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserService _useService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IEmailService _email;
    private readonly INotificationService _notification;


    public AuthService(
        ITokenService tokenService,
        IAuthRepository authRepository,
        IUnitOfWork unitOfWork,
        IUserService userService,
        IPasswordHasher passwordHasher,
        IEmailService email,
         INotificationService notification
        )
    {
        _tokenService = tokenService;
        _authRepository = authRepository;
        _unitOfWork = unitOfWork;
        _useService = userService;
        _passwordHasher = passwordHasher;
        _email = email;
        _notification = notification;
    }
    private static readonly HashSet<string> SenhasFracas = new(StringComparer.OrdinalIgnoreCase)
    {
        "12345678",
        "123456789",
        "1234567890",
        "password",
        "password123",
        "qwerty123",
        "senha123",
        "senha1234",
        "admin123"
    };

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
            
                await _useService.SaveLogUser(new LogRequest
                {
                    Id_User = User.Id,
                    Log = "Acesou a Home Cliete",
                    Tipo = "Acesso",
                    Nivel = User.Role.ToString(),
                    Acao = $"{string.Join(" ", User.Name.Split(' ', StringSplitOptions.RemoveEmptyEntries).Take(2))} acessou o sistema",
                    Info = $"Acessou o sistema em {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
                    InsertDate = DateTime.Now
                }, null);
          
        }
        var User_Admin = await _authRepository.GetByEmailAsyncAdmin(request.Email);

        if (User_Admin is not null)
        {
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
            await _useService.SaveLogUser(new LogRequest
            {
                Id_User = User.Id,
                Log = "Acesou a Home Admin",
                Tipo = "Acesso",
                Nivel = User.Role.ToString(),
                Acao = $"{string.Join(" ", User.Name.Split(' ', StringSplitOptions.RemoveEmptyEntries).Take(2))} acessou o sistema",
                Info = $"Acessou o sistema em {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
                InsertDate = DateTime.Now
            }, null);
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
            await _useService.SaveLogUser(new LogRequest
            {
                Id_User = User.Id,
                Log = "Acesou a Home Deliveri",
                Tipo = "Acesso",
                Nivel = User.Role.ToString(),
                Acao = $"{string.Join(" ", User.Name.Split(' ', StringSplitOptions.RemoveEmptyEntries).Take(2))} acessou o sistema",
                Info = $"Acessou o sistema em {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
                InsertDate = DateTime.Now
            }, null);
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

        var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(20);

        var userId = User.Id;
        await _authRepository.UpdateRefreshTokenAsync(userId, refreshToken, refreshTokenExpiresAt);

        await _unitOfWork.CommitAsync();

        return Result<LoginResponse>.Success(new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            Role = User.Role
        });
    }

    public async Task<Result<LoginResponse>> RefreshAsync(string refreshToken)
    {
        var user = await _authRepository.GetByRefreshTokenAsync(refreshToken);

        if (user == null)
        {
            return Result<LoginResponse>.Failure(AuthErrors.InvalidRefreshToken);
        }

        // Verifica se o Refresh Token expirou
        if (user.RefreshTokenExpiresAt <= DateTime.UtcNow)
        {
            return Result<LoginResponse>.Failure(AuthErrors.InvalidRefreshToken);
        }

        var accessToken = _tokenService.GenerateAccessToken(
            user.Id,
            user.Email,
            user.Role);

        var newRefreshToken = _tokenService.GenerateRefreshToken();

        var newExpiresAt = DateTime.UtcNow.AddMinutes(60);

        await _authRepository.UpdateRefreshTokenAsync(
            user.Id,
            newRefreshToken,
            newExpiresAt);

        await _unitOfWork.CommitAsync();

        return Result<LoginResponse>.Success(new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = newRefreshToken,
            Role = user.Role
        });

    }
    public async Task<Result<bool>> ChangePassword(int userId,ChangePasswordRequest request)
    {
        // 1. Validar request
        if (request == null)
            return Result<bool>.Failure(Error.Failure("Senha", "Dados inválidos."));

        if (string.IsNullOrWhiteSpace(request.CurrentPassword))
            return Result<bool>.Failure(Error.Failure("Senha", "Informe sua senha atual."));

        if (string.IsNullOrWhiteSpace(request.NewPassword))
            return Result<bool>.Failure(Error.Failure("Senha", "Informe uma nova senha."));

        if (string.IsNullOrWhiteSpace(request.ConfirmPassword))
            return Result<bool>.Failure(Error.Failure("Senha", "Confirme sua nova senha."));

        // 2. Confirmar nova senha
        if (request.NewPassword != request.ConfirmPassword)
            return Result<bool>.Failure(Error.Failure("Senha", "As senhas não coincidem."));

        // 3. Tamanho mínimo
        if (request.NewPassword.Length < 8)
            return Result<bool>.Failure(Error.Failure("Senha","A nova senha deve possuir pelo menos 8 caracteres."));

        // 4. Senhas muito fracas
        if (SenhasFracas.Contains(request.NewPassword))
        {
            return Result<bool>.Failure(Error.Failure("Senha","Essa senha é muito fácil de descobrir. Escolha uma senha mais forte."));
        }

        // 5. Complexidade
        bool temMaiuscula = request.NewPassword.Any(char.IsUpper);
        bool temMinuscula = request.NewPassword.Any(char.IsLower);
        bool temNumero = request.NewPassword.Any(char.IsDigit);

        if (!temMaiuscula || !temMinuscula || !temNumero)
        {
            return Result<bool>.Failure(Error.Failure("Senha","A senha deve conter letras maiúsculas, minúsculas e números."));
        }

        // 6. Buscar usuário
        var user = await _unitOfWork.GetClassAsyncWhere<User_Customer>(
            x => x.Id == userId
        );

        if (user == null)
        {
            return Result<bool>.Failure(Error.Failure("Senha","Não foi possível alterar a senha."));
        }

        // 7. Verificar senha atual
        var validPassword = _passwordHasher.Verify(request.CurrentPassword,user.PasswordHash);

        if (!validPassword)
        {
            return Result<bool>.Failure(Error.Failure("Senha","Senha atual inválida."));
        }

        // 8. Impedir reutilização da senha atual
        var samePassword = _passwordHasher.Verify(request.NewPassword,user.PasswordHash);

        if (samePassword)
        {
            return Result<bool>.Failure(Error.Failure("Senha","A nova senha deve ser diferente da senha atual."));
        }

        // 9. Gerar novo hash
        var newHash = _passwordHasher.Hash(request.NewPassword);

        // 10. Atualizar somente o PasswordHash
        await _unitOfWork.UpdateFieldsAsync<User_Customer>(
            filters: new Dictionary<string, object>
            {
            { "Id", user.Id }
            },
            fieldsToUpdate: new Dictionary<string, object>
            {
            { "PasswordHash", newHash },
            { "UpdateDate", DateTime.Now }

            }
        );
        var layoutEmail = $@"
                 <!DOCTYPE html>
                 <html lang='pt-BR'>
                 <head>
                     <meta charset='UTF-8'>
                     <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                 </head>
                 
                 <body style='margin:0; padding:0; background-color:#f5f5f5; font-family:Arial, Helvetica, sans-serif;'>
                 
                     <div style='max-width:600px; margin:30px auto; background:#ffffff; 
                                 border-radius:16px; overflow:hidden; 
                                 box-shadow:0 4px 15px rgba(0,0,0,0.08);'>
                 
                         <!-- Cabeçalho -->
                         <div style='background:#f97316; padding:25px; text-align:center;'>
                             <h1 style='margin:0; color:#ffffff; font-size:24px;'>
                                 Mercado Craibas
                             </h1>
                         </div>
                 
                         <!-- Conteúdo -->
                         <div style='padding:35px 30px; color:#333333;'>
                 
                             <h2 style='margin:0 0 20px 0; color:#222222; font-size:22px;'>
                                 🔐 Alerta de segurança
                             </h2>
                 
                             <p style='margin:0 0 15px 0; font-size:16px; line-height:1.6;'>
                                 Olá, <strong>{user.Name}</strong>!
                             </p>
                 
                             <p style='margin:0 0 15px 0; font-size:15px; line-height:1.6;'>
                                 Informamos que a senha da sua conta no 
                                 <strong>Mercado Craibas</strong> foi alterada com sucesso.
                             </p>
                 
                             <div style='margin:25px 0; padding:18px; 
                                         background:#fff7ed; 
                                         border-left:4px solid #f97316; 
                                         border-radius:8px;'>
                 
                                 <p style='margin:0; font-size:15px; line-height:1.6; color:#444444;'>
                                     Se <strong>foi você</strong> quem realizou essa alteração,
                                     nenhuma ação é necessária.
                                 </p>
                 
                             </div>
                 
                             <div style='margin:25px 0; padding:18px; 
                                         background:#fef2f2; 
                                         border-left:4px solid #ef4444; 
                                         border-radius:8px;'>
                 
                                 <p style='margin:0; font-size:15px; line-height:1.6; color:#444444;'>
                                     <strong>Não foi você?</strong>
                                     Entre em contato com nosso suporte imediatamente
                                     para que possamos ajudar a proteger sua conta.
                                 </p>
                 
                             </div>
                 
                             <!-- Botão WhatsApp -->
                             <div style='text-align:center; margin:30px 0;'>
                 
                                 <a href='https://wa.me/19993466756'
                                    style='display:inline-block;
                                           background:#25D366;
                                           color:#ffffff;
                                           text-decoration:none;
                                           font-weight:bold;
                                           font-size:15px;
                                           padding:14px 24px;
                                           border-radius:10px;'>
                                     Falar com o suporte pelo WhatsApp
                                 </a>
                 
                             </div>
                 
                             <p style='margin:25px 0 0 0; font-size:13px; 
                                       line-height:1.6; color:#777777;'>
                                 Por segurança, nunca compartilhe sua senha com outras pessoas.
                                 Nossa equipe nunca solicitará sua senha por WhatsApp, telefone
                                 ou e-mail.
                             </p>
                 
                         </div>
                 
                         <!-- Rodapé -->
                         <div style='padding:20px 30px; 
                                     background:#fafafa; 
                                     border-top:1px solid #eeeeee;
                                     text-align:center;'>
                 
                             <p style='margin:0; font-size:12px; color:#999999;'>
                                 Este é um e-mail automático de segurança.
                                 Por favor, não responda diretamente a esta mensagem.
                             </p>
                 
                             <p style='margin:8px 0 0 0; font-size:12px; color:#999999;'>
                                 © {DateTime.Now.Year} Mercado Craibas
                             </p>
                 
                         </div>
                 
                     </div>
                 
                 </body>
                 </html>
                 ";

        var enviado = await _email.EnviarEmailAsync(user.Email,"Mercado Craibas - Alerta de segurança",layoutEmail);


        var InsertNotificacao = await _notification.SendNotification(
            new NotificationRequest
            {
                Kind = "Segurança",
                Title = "Senha alterada",
                Description = "Sua senha foi alterada com sucesso. Se você não realizou essa alteração, entre em contato com nosso suporte.",
                Icone = "Lock",
                ActionUrl = "/profile",
                ReferenceId = user.Id,
                ReferenceType = "PASSWORD_CHANGE",
                Role = "CLIENTE"
            },
            new List<NotificationUserRequest>
            {
                new NotificationUserRequest
                {
                    UserId = user.Id
                }
            });

        await _unitOfWork.InsertAsyncReturnId<Logs>(new Logs
        {
            Id_User = user.Id,
            Log = "Alterou a senha da conta",
            Tipo = "Alteração de senha",
            Nivel = "Cliente",
            Acao = $"Usuário Id = {user.Id} do email {user.Email} alterou a senha da própria conta",
            Info = $"Alteração de senha realizada em {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
            InsertDate = DateTime.Now
        });
        var UserAdminNotify = await _unitOfWork.GetClassListAsyncWhere<User_Admin>(x => x.Isdelete != true && x.Ativo == true);

        var users = UserAdminNotify.Select(x => new NotificationUserRequest
              {
                  UserId = x.Id
              })
              .ToList();

        var insertNotificacao = await _notification.SendNotification(
            new NotificationRequest
            {
                Kind = "Segurança",
                Title = "Senha de cliente alterada",
                Description =
                    $"O cliente {user.Name} alterou a senha da própria conta. " +
                    "Verifique os registros caso seja necessário.",
                Icone = "Lock",
                ActionUrl = "/admin",
                ReferenceId = user.Id,
                ReferenceType = "PASSWORD_CHANGE",
                Role = "ADMIN"
            },
            users
        );

        return Result<bool>.Success(true);
    }

}

