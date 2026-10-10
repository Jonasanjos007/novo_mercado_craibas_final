using backend.services.interfaces;
using Backend.Middlewares;
using Backend.Services.Interfaces;
using Baldan.Pricing.Application;
using Baldan.Pricing.Application.Interfaces;
using Baldan.Pricing.Application.Interfaces.Repositories;
using Baldan.Pricing.Application.Services;
using Mercado.Craibas.Application.Interfaces;
using Mercado.Craibas.Application.Interfaces.Repositories;
using Mercado.Craibas.Application.Interfaces.Services;
using Mercado.Craibas.Application.InterfacesAdmin;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Mercado.Craibas.Application.Services;
using Mercado.Craibas.Application.ServicesAdmin;
using Mercado.Craibas.Infrastructure;
using Mercado.Craibas.Infrastructure.Data;
using Mercado.Craibas.Infrastructure.Data.Context;
using Mercado.Craibas.Infrastructure.Repositories;
using Mercado.Craibas.Infrastructure.RepositoriesAdmin;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Pricing.Infrastructure.Repositories;
using System.Text;


namespace Pricing.Api

{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Controllers + Swagger
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // DbContext - SQL
            builder.Services.AddDbContext<AppDbContext>(options =>
            {
                options.UseSqlServer(
                    builder.Configuration.GetConnectionString("Default")
                );
            });

            // CORS

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy
                        .WithOrigins("http://192.168.15.11:5173")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });
            // Auth

            builder.Services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
.AddJwtBearer(options =>
{
    var jwt = builder.Configuration.GetSection("Jwt");

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = jwt["Issuer"],
        ValidAudience = jwt["Audience"],

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwt["Key"]!)
        ),

        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        /*
         * Quando a autenticação falha, devolve um 401 COM o código do motivo
         * no mesmo formato das outras respostas da API:
         *
         * { success: false, data: null, error: { code, message } }
         *
         * Códigos:
         *  Auth.UserDeleted          → usuário excluído / não encontrado
         *  Auth.UserInactive         → usuário desativado
         *  Auth.SessionInvalidated   → TokenVersion diferente / dispositivo removido
         *  Auth.PasswordChanged      → senha alterada em outro dispositivo
         *  Auth.TokenExpired         → access token expirado ou ausente
         *  Auth.ValidationUnavailable→ falha ao consultar o banco (503, não derruba a sessão)
         */
        OnChallenge = async context =>
        {
            context.HandleResponse();

            if (context.Response.HasStarted)
            {
                return;
            }

            var code = context.HttpContext.Items["AuthErrorCode"] as string
                       ?? "Auth.TokenExpired";

            var message = code switch
            {
                "Auth.UserDeleted" => "Usuário excluído.",
                "Auth.UserInactive" => "Usuário inativo.",
                "Auth.SessionInvalidated" => "Sessão encerrada. Faça login novamente.",
                "Auth.PasswordChanged" => "A senha da conta foi alterada. Faça login novamente.",
                "Auth.ValidationUnavailable" => "Não foi possível validar a sessão no momento.",
                _ => "Sessão expirada."
            };

            context.Response.StatusCode = code == "Auth.ValidationUnavailable"
                ? StatusCodes.Status503ServiceUnavailable
                : StatusCodes.Status401Unauthorized;

            await context.Response.WriteAsJsonAsync(new
            {
                success = false,
                data = (object?)null,
                error = new { code, message }
            });
        },

        OnTokenValidated = async context =>
        {
            try
            {
                var userIdClaim = context.Principal?
                    .FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?
                    .Value;

                var roleClaim = context.Principal?
                    .FindFirst(System.Security.Claims.ClaimTypes.Role)?
                    .Value;

                var tokenVersionClaim = context.Principal?
                    .FindFirst("token_version")?
                    .Value;

                // Claims obrigatórias
                if (string.IsNullOrWhiteSpace(userIdClaim) ||
                    string.IsNullOrWhiteSpace(roleClaim) ||
                    string.IsNullOrWhiteSpace(tokenVersionClaim))
                {
                    context.HttpContext.Items["AuthErrorCode"] = "Auth.SessionInvalidated";
                    context.Fail("Token inválido.");
                    return;
                }

                if (!int.TryParse(userIdClaim, out var userId))
                {
                    context.HttpContext.Items["AuthErrorCode"] = "Auth.SessionInvalidated";
                    context.Fail("Token inválido.");
                    return;
                }

                if (!int.TryParse(tokenVersionClaim, out var tokenVersion))
                {
                    context.HttpContext.Items["AuthErrorCode"] = "Auth.SessionInvalidated";
                    context.Fail("Token inválido.");
                    return;
                }

                // Pega o DbContext que já está registrado no DI
                var db = context.HttpContext.RequestServices
                    .GetRequiredService<AppDbContext>();

                // SESSÃO (dispositivo)
                // Verificada primeiro para devolver o MOTIVO certo quando
                // ela foi encerrada (conta excluída, senha alterada,
                // dispositivo removido em "Dispositivos conectados").
                var sessionIdClaim = context.Principal?
                    .FindFirst("session_id")?
                    .Value;

                if (!int.TryParse(sessionIdClaim, out var sessionId) ||
                    !Enum.TryParse<Baldan.Pricing.Application.Domain.Enums.ProfileEnum>(roleClaim, out var sessionRole))
                {
                    context.HttpContext.Items["AuthErrorCode"] = "Auth.SessionInvalidated";
                    context.Fail("Sessão inválida.");
                    return;
                }

                var session = await db.UserSessions
                    .AsNoTracking()
                    .Where(x => x.Id == sessionId
                             && x.UserId == userId
                             && x.Role == sessionRole)
                    .Select(x => new
                    {
                        x.ExpiresAt,
                        x.RevokedAt,
                        x.RevokedReason
                    })
                    .FirstOrDefaultAsync();

                if (session is not null && session.RevokedAt is not null)
                {
                    context.HttpContext.Items["AuthErrorCode"] = session.RevokedReason switch
                    {
                        Mercado.Craibas.Application.Domain.Enums.SessionRevokeReasonEnum.UserDeleted => "Auth.UserDeleted",
                        Mercado.Craibas.Application.Domain.Enums.SessionRevokeReasonEnum.PasswordChanged => "Auth.PasswordChanged",
                        _ => "Auth.SessionInvalidated"
                    };
                    context.Fail("Sessão encerrada.");
                    return;
                }

                // CLIENTE
                if (roleClaim == "CLIENTE")
                {
                    var user = await db.User_Customer
                        .FirstOrDefaultAsync(x => x.Id == userId);

                    if (user is null)
                    {
                        context.HttpContext.Items["AuthErrorCode"] = "Auth.UserDeleted";
                        context.Fail("Usuário não encontrado.");
                        return;
                    }

                    if (user.Isdelete == true)
                    {
                        context.HttpContext.Items["AuthErrorCode"] = "Auth.UserDeleted";
                        context.Fail("Usuário excluído.");
                        return;
                    }

                    if (!user.Ativo)
                    {
                        context.HttpContext.Items["AuthErrorCode"] = "Auth.UserInactive";
                        context.Fail("Usuário inativo.");
                        return;
                    }

                    if (user.TokenVersion != tokenVersion)
                    {
                        context.HttpContext.Items["AuthErrorCode"] = "Auth.SessionInvalidated";
                        context.Fail("Token invalidado.");
                        return;
                    }
                }

                // ADMIN
                else if (roleClaim == "ADMIN")
                {
                    var user = await db.User_Admin
                        .FirstOrDefaultAsync(x => x.Id == userId);

                    if (user is null)
                    {
                        context.HttpContext.Items["AuthErrorCode"] = "Auth.UserDeleted";
                        context.Fail("Usuário não encontrado.");
                        return;
                    }

                    if (user.Isdelete == true)
                    {
                        context.HttpContext.Items["AuthErrorCode"] = "Auth.UserDeleted";
                        context.Fail("Usuário excluído.");
                        return;
                    }

                    if (!user.Ativo)
                    {
                        context.HttpContext.Items["AuthErrorCode"] = "Auth.UserInactive";
                        context.Fail("Usuário inativo.");
                        return;
                    }

                    if (user.TokenVersion != tokenVersion)
                    {
                        context.HttpContext.Items["AuthErrorCode"] = "Auth.SessionInvalidated";
                        context.Fail("Token invalidado.");
                        return;
                    }
                }

                // DELIVERY
                else if (roleClaim == "DELIVERY")
                {
                    var user = await db.User_Delivery
                        .FirstOrDefaultAsync(x => x.Id == userId);

                    if (user is null)
                    {
                        context.HttpContext.Items["AuthErrorCode"] = "Auth.UserDeleted";
                        context.Fail("Usuário não encontrado.");
                        return;
                    }

                    if (user.Isdelete == true)
                    {
                        context.HttpContext.Items["AuthErrorCode"] = "Auth.UserDeleted";
                        context.Fail("Usuário excluído.");
                        return;
                    }

                    if (!user.Ativo)
                    {
                        context.HttpContext.Items["AuthErrorCode"] = "Auth.UserInactive";
                        context.Fail("Usuário inativo.");
                        return;
                    }

                    if (user.TokenVersion != tokenVersion)
                    {
                        context.HttpContext.Items["AuthErrorCode"] = "Auth.SessionInvalidated";
                        context.Fail("Token invalidado.");
                        return;
                    }
                }

                else
                {
                    context.HttpContext.Items["AuthErrorCode"] = "Auth.SessionInvalidated";
                    context.Fail("Perfil de usuário inválido.");
                    return;
                }

                // SESSÃO (dispositivo) precisa continuar ativa
                if (session is null || session.ExpiresAt <= DateTime.UtcNow)
                {
                    context.HttpContext.Items["AuthErrorCode"] = "Auth.SessionInvalidated";
                    context.Fail("Sessão encerrada.");
                    return;
                }
            }
            catch
            {
                context.HttpContext.Items["AuthErrorCode"] = "Auth.ValidationUnavailable";
                context.Fail("Não foi possível validar o usuário.");
            }
        }
    };
});

            builder.Services.AddAuthorization();

            // DI
            builder.Services.AddScoped<IUnitOfWork, UnitOfWorkRepository>();
            builder.Services.AddScoped<IEmailService, EmailService>();
            builder.Services.AddScoped<IUnitOfWorkAdmin, IUnitOfWorkAdminRepository>();
            builder.Services.AddScoped<IProductServiceAdmin, ProductServiceAdmin>();
            builder.Services.AddScoped<IOrderAdminService, OrderServiceAdmin>();
            builder.Services.AddScoped<ICupomAdminService, CupomServiceAdmin>();
            builder.Services.AddScoped<IProductService, ProductService>();
            builder.Services.AddScoped<IProductRepository, ProductRepository>();
            builder.Services.AddScoped<IOrderService, OrderService>();
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<INotificationService, NotificationService>();
            //builder.Services.AddScoped<ICheckoutService, CheckoutService>();
            builder.Services.AddScoped<IAuthRepository, AuthRepository>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<ITokenService, TokenService>();
            builder.Services.AddScoped<ICupomService, CupomService>();
            builder.Services.AddScoped<ICategoriaServiceAdmin, CategoriaServiceAdmin>();
            builder.Services.AddScoped<IUserServiceAdmin, UserServiceAdmin>();
            builder.Services.AddScoped<IDeletionRecordService, DeletionRecordService>();
            builder.Services.AddScoped<ITrashServiceAdmin, TrashServiceAdmin>();
            builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
            //builder.Services.AddScoped<IProfileRepository, ProfileRepository>();
            //builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();
            //builder.Services.AddScoped<IDashboardService, DashboardService>();
            builder.Services.AddMemoryCache();
            //Trocar DI
            builder.Services.AddApplication();
            builder.Services.AddControllers().AddJsonOptions(options =>
             { 
               options.JsonSerializerOptions.Converters.Add(
                      new System.Text.Json.Serialization.JsonStringEnumConverter()
                        );
              });
            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            app.UseCors("AllowFrontend");

            app.UseMiddleware<ExceptionMiddleware>();
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();



            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var context = services.GetRequiredService<AppDbContext>();
                    if (context.Database.CanConnect())
                    {
                        Console.WriteLine("✅ Conexão com o Azure SQL estabelecida com sucesso!");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Erro ao conectar no banco: {ex.Message}");
                }
            }


            app.Run();
        }
    }
}
