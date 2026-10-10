using Baldan.Pricing.Application.Commons;

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

    public static Error UserInactive =>
        Error.Unauthorized(
            "Auth.UserInactive",
            "Usuário inativo");

    public static Error UserDeleted =>
        Error.Unauthorized(
            "Auth.UserDeleted",
            "Usuário excluído");

    public static Error SessionInvalidated =>
        Error.Unauthorized(
            "Auth.SessionInvalidated",
            "Sessão invalidada");

    public static Error PasswordChanged =>
        Error.Unauthorized(
            "Auth.PasswordChanged",
            "A senha da conta foi alterada");

    public static Error TokenExpired =>
        Error.Unauthorized(
            "Auth.TokenExpired",
            "Sessão expirada");
}