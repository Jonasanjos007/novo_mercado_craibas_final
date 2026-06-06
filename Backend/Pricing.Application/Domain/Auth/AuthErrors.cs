using Baldan.Pricing.Application.Commons;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Domain.Auth;
public static class AuthErrors
{
    public static Error InvalidCredentials =>
        Error.Unauthorized(
            "Auth.InvalidCredentials",
            "Credenciais inválidas");

    public static Error InvalidRefreshToken =>
        Error.Unauthorized(
            "Auth.InvalidRefreshToken",
            "Refresh token inválido");
}
