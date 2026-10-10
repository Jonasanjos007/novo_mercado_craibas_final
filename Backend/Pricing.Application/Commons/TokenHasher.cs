using System.Security.Cryptography;
using System.Text;

namespace Baldan.Pricing.Application.Commons;

public static class TokenHasher
{
    public static string Hash(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));

        return Convert.ToHexString(bytes);
    }
}
