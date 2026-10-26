using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Caching.Memory;

namespace Pricing.Api.Security;

/// <summary>
/// Limites de requisições (proteção contra força bruta, robôs e teste de cartões roubados).
///
/// Valores padrão pensados para não atrapalhar o uso normal. Podem ser ajustados no appsettings:
///   "RateLimit": { "GlobalPerMinute": 600, "LoginPerMinute": 20, "RegistrationPer10Min": 40,
///                  "PaymentPer10Min": 20, "CardPer10Min": 6 }
/// Se a API ficar atrás de um proxy (IIS/Nginx), configure os cabeçalhos encaminhados para que o IP real
/// do cliente seja usado; senão todos os clientes contam como um só IP.
/// </summary>
public static class RateLimitPolicies
{
    public const string Login = "login";
    public const string Registration = "registration";
    public const string Payment = "payment";
    public const string PaymentCard = "payment-card";

    public static IServiceCollection AddAppRateLimiting(this IServiceCollection services, IConfiguration configuration)
    {
        int Read(string key, int fallback) => int.TryParse(configuration[$"RateLimit:{key}"], out var v) && v > 0 ? v : fallback;

        var globalPerMinute = Read("GlobalPerMinute", 600);
        var loginPerMinute = Read("LoginPerMinute", 20);
        var registrationPer10Min = Read("RegistrationPer10Min", 40);
        var paymentPer10Min = Read("PaymentPer10Min", 20);
        var cardPer10Min = Read("CardPer10Min", 6);

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = async (context, cancellationToken) =>
            {
                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                    context.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString();

                await context.HttpContext.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    data = (object?)null,
                    error = new { code = "RateLimit", message = "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente." }
                }, cancellationToken);
            };

            // Limite geral por IP (protege a API inteira contra robôs). O webhook do Mercado Pago fica de fora.
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                context.Request.Path.StartsWithSegments("/api/v1/payment/webhook")
                    ? RateLimitPartition.GetNoLimiter("webhook")
                    : RateLimitPartition.GetFixedWindowLimiter("ip:" + ClientIp(context), _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = globalPerMinute,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0,
                    }));

            // Login: por IP.
            options.AddPolicy(Login, context => RateLimitPartition.GetFixedWindowLimiter("login:" + ClientIp(context), _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = loginPerMinute,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));

            // Cadastro e reenvio de código: por IP.
            options.AddPolicy(Registration, context => RateLimitPartition.GetFixedWindowLimiter("reg:" + ClientIp(context), _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = registrationPer10Min,
                Window = TimeSpan.FromMinutes(10),
                QueueLimit = 0,
            }));

            // Pagamento: por cliente logado (ou IP).
            options.AddPolicy(Payment, context => RateLimitPartition.GetFixedWindowLimiter("pay:" + UserOrIp(context), _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = paymentPer10Min,
                Window = TimeSpan.FromMinutes(10),
                QueueLimit = 0,
            }));

            // Cartão: poucas tentativas por cliente (impede usar a loja para testar cartões roubados).
            options.AddPolicy(PaymentCard, context => RateLimitPartition.GetFixedWindowLimiter("card:" + UserOrIp(context), _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = cardPer10Min,
                Window = TimeSpan.FromMinutes(10),
                QueueLimit = 0,
            }));
        });

        services.AddSingleton<LoginAttemptGuard>();
        return services;
    }

    private static string ClientIp(HttpContext context) => context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

    private static string UserOrIp(HttpContext context)
    {
        var id = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = context.User.FindFirst(ClaimTypes.Role)?.Value;
        return string.IsNullOrEmpty(id) ? "ip:" + ClientIp(context) : $"user:{role}:{id}";
    }
}

/// <summary>
/// Bloqueio temporário por e-mail depois de muitas senhas erradas seguidas
/// (protege a conta mesmo se o atacante trocar de IP).
/// </summary>
public sealed class LoginAttemptGuard
{
    public const int MaxFailures = 8;
    public static readonly TimeSpan LockTime = TimeSpan.FromMinutes(15);

    private readonly IMemoryCache _cache;

    public LoginAttemptGuard(IMemoryCache cache) => _cache = cache;

    private static string Key(string? email) => "login-fail:" + (email ?? string.Empty).Trim().ToLowerInvariant();

    public bool IsLocked(string? email)
        => _cache.TryGetValue<int>(Key(email), out var failures) && failures >= MaxFailures;

    public void RegisterFailure(string? email)
    {
        if (string.IsNullOrWhiteSpace(email)) return;
        var key = Key(email);
        var failures = _cache.TryGetValue<int>(key, out var current) ? current + 1 : 1;
        _cache.Set(key, failures, LockTime);
    }

    public void Reset(string? email) => _cache.Remove(Key(email));
}
