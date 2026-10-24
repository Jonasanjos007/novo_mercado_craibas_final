#nullable enable
using System.Security.Cryptography;
using System.Text;

namespace Mercado.Craibas.Application.Payments;

/// <summary>
/// Validação da assinatura dos webhooks (header x-signature).
///
/// Como o Mercado Pago assina (doc "Notificações / Webhooks"):
///   x-signature: ts=1704908010,v1=618c85345248dd820d5fd456117c2ab2ef8eda45a0282ff693eac24131a5e839
///   manifest   = "id:{data.id da URL, em minúsculas};request-id:{x-request-id};ts:{ts};"
///   v1         = HMAC-SHA256(manifest, chave secreta) em hexadecimal
/// Se data.id ou x-request-id não vierem, a parte correspondente sai do manifest.
/// </summary>
public static class MercadoPagoSignature
{
    public static string BuildManifest(string? dataId, string? requestId, string ts)
    {
        var sb = new StringBuilder();
        if (!string.IsNullOrWhiteSpace(dataId)) sb.Append("id:").Append(dataId.Trim().ToLowerInvariant()).Append(';');
        if (!string.IsNullOrWhiteSpace(requestId)) sb.Append("request-id:").Append(requestId.Trim()).Append(';');
        sb.Append("ts:").Append(ts).Append(';');
        return sb.ToString();
    }

    public static string ComputeHash(string manifest, string secret)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        return Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(manifest))).ToLowerInvariant();
    }

    /// <summary>Lê "ts" e "v1" do header x-signature.</summary>
    public static (string? Ts, string? V1) Parse(string? header)
    {
        string? ts = null, v1 = null;
        if (string.IsNullOrWhiteSpace(header)) return (ts, v1);
        foreach (var part in header.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            var kv = part.Split('=', 2, StringSplitOptions.TrimEntries);
            if (kv.Length != 2) continue;
            if (kv[0] == "ts") ts = kv[1];
            else if (kv[0] == "v1") v1 = kv[1];
        }
        return (ts, v1);
    }

    /// <param name="toleranceMinutes">0 = não confere o horário.</param>
    public static bool IsValid(string? signatureHeader, string? requestId, string? dataId, string secret, int toleranceMinutes, DateTimeOffset now)
    {
        var (ts, v1) = Parse(signatureHeader);
        if (string.IsNullOrEmpty(ts) || string.IsNullOrEmpty(v1)) return false;

        if (toleranceMinutes > 0 && long.TryParse(ts, out var tsValue))
        {
            // O Mercado Pago manda ts em milissegundos (às vezes em segundos): aceita os dois.
            var sent = tsValue > 10_000_000_000 ? DateTimeOffset.FromUnixTimeMilliseconds(tsValue) : DateTimeOffset.FromUnixTimeSeconds(tsValue);
            if (Math.Abs((now - sent).TotalMinutes) > toleranceMinutes) return false;
        }

        var expected = ComputeHash(BuildManifest(dataId, requestId, ts), secret);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.ASCII.GetBytes(expected),
            Encoding.ASCII.GetBytes(v1.Trim().ToLowerInvariant()));
    }
}
