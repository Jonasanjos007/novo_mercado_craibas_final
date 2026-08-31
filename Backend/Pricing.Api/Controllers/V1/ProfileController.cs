namespace backend.controllers.v1;

using backend.services.interfaces;
using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;
using System.Security.Claims;

[ApiController]
[Route("api/v1/users/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IUserService _service;

    public ProfileController(IUserService service)
    {
        _service = service;
    }

    [HttpPost("PostUpdatePerfil")]
    public async Task<IActionResult> PostUpdatePerfil([FromForm] UpdateProfileRequest request)
    {
         var userId = User.GetUserId();
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
        var result = await _service.UpdateProfile(userId, role, request);

        return result.ToActionResult();
    }
}
