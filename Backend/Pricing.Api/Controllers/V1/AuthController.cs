
using Backend.Services.Interfaces;
using Baldan.Pricing.Application.Domain.Auth;
using Mercado.Craibas.Application.DTOs.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Pricing.Api.Security;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Pricing.Api.DTOs.Requests;
using Pricing.Api.DTOs.Responses;
using Pricing.Api.Extensions;

namespace Backend.Controllers.V1;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private const string RefreshTokenCookieName = "refreshToken";
    private const string RefreshTokenCookiePath = "/api/v1/auth";
    private readonly IAuthService _service;
    private readonly LoginAttemptGuard _loginGuard;

    public AuthController(IAuthService service, LoginAttemptGuard loginGuard)
    {
        _service = service;
        _loginGuard = loginGuard;
    }

    [EnableRateLimiting(RateLimitPolicies.Login)]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Baldan.Pricing.Application.Commons.Error.Validation("Credências", "Informe e-mail e senha.").ToActionResult();
        }

        if (_loginGuard.IsLocked(request?.Email))
        {
            return Baldan.Pricing.Application.Commons.Error.Validation("Credências",
                $"Muitas tentativas de login. Por segurança, aguarde {(int)LoginAttemptGuard.LockTime.TotalMinutes} minutos e tente novamente.").ToActionResult();
        }

        var result = await _service.LoginAsync(
            request,
            Request.Headers.UserAgent.ToString(),
            GetClientIp(),
            Request.Cookies[RefreshTokenCookieName]);

        if (result.IsSuccess)
        {
            _loginGuard.Reset(request.Email);
            SetRefreshTokenCookie(result.Value);
        }
        else
        {
            _loginGuard.RegisterFailure(request?.Email);
        }

        return result.ToActionResult();
     }

    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var refreshToken = Request.Cookies[RefreshTokenCookieName];

        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return AuthErrors.InvalidRefreshToken.ToActionResult();
        }

        var result = await _service.RefreshAsync(refreshToken, GetClientIp());

        if (result.IsSuccess)
        {
            SetRefreshTokenCookie(result.Value);
        }

        return result.ToActionResult();
    }

    [AllowAnonymous]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var refreshToken = Request.Cookies[RefreshTokenCookieName];

        var result = await _service.LogoutAsync(refreshToken ?? string.Empty);

        DeleteRefreshTokenCookie();

        return result.ToActionResult();
    }

    [Authorize]
    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions()
    {
        var result = await _service.GetSessionsAsync(
            User.GetUserId(),
            User.GetUserRole(),
            User.GetSessionId());

        return result.ToActionResult();
    }

    /// <summary>
    /// Desconecta um dispositivo. Exige a senha (vale 10 minutos depois de confirmada).
    /// </summary>
    [Authorize]
    [EnableRateLimiting(RateLimitPolicies.Login)]
    [HttpPost("sessions/{sessionId:int}/revoke")]
    public async Task<IActionResult> RevokeSession(
        int sessionId,
        [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] ConfirmPasswordRequest? request)
    {
        var result = await _service.RevokeSessionAsync(
            User.GetUserId(),
            User.GetUserRole(),
            sessionId,
            User.GetSessionId(),
            request?.Password);

        return result.ToActionResult();
    }

    /// <summary>
    /// Desconecta todos os outros dispositivos. Exige a senha.
    /// </summary>
    [Authorize]
    [EnableRateLimiting(RateLimitPolicies.Login)]
    [HttpPost("sessions/revoke-others")]
    public async Task<IActionResult> RevokeOtherSessions(
        [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] ConfirmPasswordRequest? request)
    {
        var result = await _service.RevokeOtherSessionsAsync(
            User.GetUserId(),
            User.GetUserRole(),
            User.GetSessionId(),
            request?.Password);

        return result.ToActionResult();
    }

    private string? GetClientIp()
    {
        return HttpContext.Connection.RemoteIpAddress?.ToString();
    }

    private void SetRefreshTokenCookie(LoginResponse response)
    {
        Response.Cookies.Append(
            RefreshTokenCookieName,
            response.RefreshToken,
            CreateRefreshTokenCookieOptions(response.RefreshTokenExpiresAt)
        );
    }

    private CookieOptions CreateRefreshTokenCookieOptions(DateTime expiresAt)
    {
        return new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Expires = new DateTimeOffset(DateTime.SpecifyKind(expiresAt, DateTimeKind.Utc)),
            Path = RefreshTokenCookiePath,
            IsEssential = true
        };
    }
    [Authorize]
    [EnableRateLimiting(RateLimitPolicies.Login)]
    [HttpPost("ChangePassword")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var userid = User.GetUserId();

        var result = await _service.ChangePassword(userid, User.GetUserRole(), request);

        return result.ToActionResult();
    }
    private void DeleteRefreshTokenCookie()
    {
        Response.Cookies.Delete(
            RefreshTokenCookieName,
            new CookieOptions
            {
                Secure = Request.IsHttps,
                SameSite = SameSiteMode.Lax,
                Path = RefreshTokenCookiePath
            }
        );
    }
}
