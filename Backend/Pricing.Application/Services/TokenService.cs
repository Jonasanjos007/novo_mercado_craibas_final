
//using System.Security.Claims;
//using System.Security.Cryptography;
//using System.Text;
//using Microsoft.Extensions.Configuration;
//using Microsoft.IdentityModel.Tokens;
//using System.IdentityModel.Tokens.Jwt;

//namespace Baldan.Pricing.Application.Services;

//public class TokenService : ITokenService
//{
//    private readonly IConfiguration _config;

//    public TokenService(IConfiguration config)
//    {
//        _config = config;
//    }

//    public string GenerateAccessToken(int userId, string email, string role)
//    {
//        var jwt = _config.GetSection("Jwt");

//        var claims = new[]
//        {
//            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
//            new Claim(ClaimTypes.Email, email),
//            new Claim(ClaimTypes.Role, role)
//        };

//        var key = new SymmetricSecurityKey(
//            Encoding.UTF8.GetBytes(jwt["Key"]!)
//        );

//        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

//        var token = new JwtSecurityToken(
//            issuer: jwt["Issuer"],
//            audience: jwt["Audience"],
//            claims: claims,
//            expires: DateTime.UtcNow.AddMinutes(60),
//            signingCredentials: creds
//        );

//        return new JwtSecurityTokenHandler().WriteToken(token);
//    }

//    public string GenerateRefreshToken()
//    {
//        return Convert.ToBase64String(
//            RandomNumberGenerator.GetBytes(64)
//        );
//    }
//}
