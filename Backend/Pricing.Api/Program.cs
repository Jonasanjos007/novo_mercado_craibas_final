using backend.services.interfaces;
using Backend.Middlewares;
using Backend.Services.Interfaces;
using Baldan.Pricing.Application;
using Baldan.Pricing.Application.Interfaces;
using Baldan.Pricing.Application.Interfaces.Repositories;
using Baldan.Pricing.Application.Services;
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
            //builder.Services.AddDbContext<AppDbContext>(options =>
            //{
            //    options.UseSqlServer(
            //        builder.Configuration.GetConnectionString("Default")
            //    );
            //});

            // CORS
            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                {
                    policy.WithOrigins("https://mavihstudio.com.br")
                          .AllowAnyHeader()
                          .AllowAnyMethod();
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
                });

            builder.Services.AddAuthorization();

            // DI
            builder.Services.AddScoped<IUnitOfWork, UnitOfWorkRepository>();
            builder.Services.AddScoped<IUnitOfWorkAdmin, IUnitOfWorkAdminRepository>();
            builder.Services.AddScoped<IProductServiceAdmin, ProductServiceAdmin>();
            builder.Services.AddScoped<IOrderAdminService, OrderServiceAdmin>();
            builder.Services.AddScoped<ICupomAdminService, CupomServiceAdmin>();
            builder.Services.AddScoped<IProductService, ProductService>();
            builder.Services.AddScoped<IProductRepository, ProductRepository>();
            builder.Services.AddScoped<IOrderService, OrderService>();
            builder.Services.AddScoped<IAuthService, AuthService>();
            //builder.Services.AddScoped<ICheckoutService, CheckoutService>();
            builder.Services.AddScoped<IAuthRepository, AuthRepository>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<ITokenService, TokenService>();
            builder.Services.AddScoped<ICupomService, CupomService>();
            //builder.Services.AddScoped<IProfileRepository, ProfileRepository>();
            //builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();
            //builder.Services.AddScoped<IDashboardService, DashboardService>();

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

            app.UseCors();

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
