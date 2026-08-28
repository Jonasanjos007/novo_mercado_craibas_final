
using Backend.Services.Interfaces;
using Baldan.Pricing.Application.Domain.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    public AuthController(IAuthService service)
    {
        _service = service;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {

        var result = await _service.LoginAsync(request);

        if (result.IsSuccess)
        {
            SetRefreshTokenCookie(result.Value);
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

        var result = await _service.RefreshAsync(refreshToken);

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
