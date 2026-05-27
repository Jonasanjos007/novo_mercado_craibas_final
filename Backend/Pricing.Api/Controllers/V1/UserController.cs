//using Baldan.Pricing.Application.Models.Entities;
//using Microsoft.AspNetCore.Mvc;
//using System.Text;
//namespace Backend.Controllers.V1;
//using Backend.Services.Interfaces;
//using Baldan.Pricing.Application.Commons;
//using Microsoft.AspNetCore.Authorization;
//using Pricing.Api.Extensions;

//[ApiController]
//[Route("api/v1/users")]
//public class UsersController : ControllerBase
//{
//    private readonly IUserService _service;

//    public UsersController(IUserService service)
//    {
//        _service = service;
//    }

//    [HttpPost("register")] 
//    public async Task<IActionResult> Register(CreateUserRequest request)
//    {
//        var result = await _service.CreateUser(request);

//        return result.ToActionResult();
//    }

//    [Authorize]
//    [HttpGet("me")]
//    public async Task<IActionResult> Me()
//    {
//        var userId = User.GetUserId();
//        var result = await _service.GetLoggedUserAsync(userId);

//        return result.ToActionResult();
//    }
//}
