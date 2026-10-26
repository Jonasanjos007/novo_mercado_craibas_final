using System.Globalization;
using System.Security.Cryptography;
using System.Text;

namespace Pricing.Api.Security;

/// <summary>
/// Liga as etapas do cadastro ao navegador que começou o cadastro.
///
/// As etapas recebem o "UserId" do cadastro. Sem esta proteção, qualquer pessoa que
/// adivinhasse um id (eles são sequenciais) conseguiria trocar o e-mail ou definir a senha
/// de um cadastro que outra pessoa deixou pela metade.
///
/// Ao iniciar (ou retomar com nome + telefone) o servidor grava um cookie HttpOnly assinado
/// (HMAC com a chave do JWT) contendo o id e a validade. As etapas seguintes só aceitam o id
/// que está no cookie. Nada muda para o cliente: o navegador manda o cookie sozinho.
/// </summary>
public static class RegistrationSession
{
    public const string CookieName = "reg_session";
    private const string CookiePath = "/api/v1/users";
    private static readonly TimeSpan Lifetime = TimeSpan.FromDays(7);

    public static void Issue(HttpContext context, IConfiguration configuration, int userId)
    {
        if (userId <= 0) return;
        var expires = DateTimeOffset.UtcNow.Add(Lifetime);
        var payload = $"{userId}.{expires.ToUnixTimeSeconds()}";
        var value = $"{payload}.{Sign(payload, configuration)}";

        context.Response.Cookies.Append(CookieName, value, new CookieOptions
        {
            HttpOnly = true,
            Secure = context.Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = CookiePath,
            Expires = expires,
            IsEssential = true,
        });
    }

    /// <summary>true quando o cookie é válido, não venceu e pertence a este cadastro.</summary>
    public static bool IsValid(HttpContext context, IConfiguration configuration, int userId)
    {
        if (userId <= 0) return false;
        var raw = context.Request.Cookies[CookieName];
        if (string.IsNullOrWhiteSpace(raw)) return false;

        var parts = raw.Split('.');
        if (parts.Length != 3) return false;
        if (!int.TryParse(parts[0], NumberStyles.None, CultureInfo.InvariantCulture, out var cookieUserId) || cookieUserId != userId) return false;
        if (!long.TryParse(parts[1], NumberStyles.None, CultureInfo.InvariantCulture, out var expiresUnix)) return false;
        if (DateTimeOffset.FromUnixTimeSeconds(expiresUnix) < DateTimeOffset.UtcNow) return false;

        var expected = Sign($"{parts[0]}.{parts[1]}", configuration);
        return CryptographicOperations.FixedTimeEquals(Encoding.ASCII.GetBytes(expected), Encoding.ASCII.GetBytes(parts[2]));
    }

    private static string Sign(string payload, IConfiguration configuration)
    {
        var key = configuration["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(key)) throw new InvalidOperationException("Jwt:Key não configurado.");
        // Chave derivada: o cookie de cadastro nunca usa a mesma chave crua do JWT.
        using var hmac = new HMACSHA256(SHA256.HashData(Encoding.UTF8.GetBytes("registration:" + key)));
        return Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload))).ToLowerInvariant();
    }
}
