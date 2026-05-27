
//using Backend.Services.Interfaces;
//using Microsoft.AspNetCore.Mvc;
//using Pricing.Api.DTOs.Requests;
//using Pricing.Api.Extensions;

//namespace Backend.Controllers.V1;

//[ApiController]
//[Route("api/v1/auth")]
//public class AuthController : ControllerBase
//{
//    private readonly IAuthService _service;

//    public AuthController(IAuthService service)
//    {
//        _service = service;
//    }

//    [HttpPost("login")]
//    public async Task<IActionResult> Login(LoginRequest request)
//    {

//        var result = await _service.LoginAsync(request);

//        return result.ToActionResult();
//    }

//    [HttpPost("refresh")]
//    public async Task<IActionResult> Refresh(RefreshTokenRequest request)
//    {
//        var result = await _service.RefreshAsync(request.RefreshToken);

//        return result.ToActionResult();
//    }
//}
