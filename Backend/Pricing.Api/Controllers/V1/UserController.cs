
namespace backend.controllers.v1;
using backend.services.interfaces;
using Backend.Services.Interfaces;
using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

[ApiController]
[Route("api/v1/users")]
public class UserController : ControllerBase
{
    private readonly IUserService _service;

    public UserController(IUserService service)
    {
        _service = service;
    }

    //[httppost("register")]
    //public async task<iactionresult> register(createuserrequest request)
    //{
    //    var result = await _service.createuser(request);

    //    return result.toactionresult();
    //}
    [Authorize]
    [HttpGet("teste")]
    public IActionResult Teste()
    {
        return Ok("Funcionou");
    }
    [Authorize]
    [HttpGet("me/{role}")]
    public async Task<IActionResult> Me(string role)
    {
        var userid = User.GetUserId(); // ou como você obtém o id
        var role2 = User.FindFirst(ClaimTypes.Role)?.Value;

        var result = await _service.GetbyIdUser(userid, role);

        return result.ToActionResult();
    }
    [Authorize]
    [HttpPost("postSaveAddressUser")]
    public async Task<IActionResult> postSaveAddressUser([FromBody] AddressRequest NewAnddress )
    {
        var result = await _service.PostSaveAddressUserService(NewAnddress);

        return result.ToActionResult();
    }
    [Authorize]
    [HttpGet("GetAddresByIdUser")]
    public async Task<IActionResult> GetAddresByIdUser()
    {
        var Id_User = User.GetUserId();
        var result = await _service.GetAddressbyIdUserService(Id_User);

        return result.ToActionResult();
    }

    [Authorize]
    [HttpPost("PostUpdateAddres")]
    public async Task<IActionResult> PostUpdateAddres([FromBody] AddressRequest NewAnddress)
    {
        var result = await _service.PostUpdateAddressUserService(NewAnddress);

        return result.ToActionResult();
    }
    [Authorize]
    [HttpPost("DeleteAddress")]
    public async Task<IActionResult> DeleteAddress([FromBody] AddressRequest DeleteAnddress)
    {
        var result = await _service.DeleteAddressService(DeleteAnddress);

        return result.ToActionResult();
    }
    [Authorize]
    [HttpPost("SaveColorGlobalInsert")]
    public async Task<IActionResult> SaveColorGlobalInsert([FromBody] CustomizeRequest customize)
    {

        var result = await _service.SaveColorGlobalInsertService(customize.Global_Site_Color, customize.Id);

        return result.ToActionResult();
    }
    [HttpPost("SaveUSerInitialData")]
    public async Task<IActionResult> SaveUSerInitialData([FromBody] RegisterStartRequest Request)
    {
        var result = await _service.RegisterStartAsync(Request);

        return result.ToActionResult();
    }
    [HttpPost("SaveEmailConfirm")]
    public async Task<IActionResult> SaveEmailConfirm([FromBody] RegisterEmailRequest Request)
    {
        var result = await _service.RegisterEmailConfirm(Request);

        return result.ToActionResult();
    }

    [HttpPost("SaveEmailConfirmCode")]
    public async Task<IActionResult> SaveEmailConfirmCode([FromBody] RegisterEmailCodeRequest request)
    {
        var result = await _service.RegisterEmailCodeConfirm(request.UserId,request.Code);

        return result.ToActionResult();
    }

    [HttpPost("SaveRegisterPassword")]
    public async Task<IActionResult> SaveRegisterPassword(
    [FromBody] RegisterPasswordRequest request)
    {
        var result = await _service.RegisterPassword(
            request.UserId,
            request.Password,
            request.ConfirmPassword
        );

        return result.ToActionResult();
    }

    [HttpPost("ResendCode")]
    public async Task<IActionResult> ResendCode([FromBody] ResendCodeRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        var result = await _service.ResendCode(request.UserId,request.Email,request.Phone,ipAddress ?? "unknown");

        return result.ToActionResult();
    }
    [HttpPost("EditEmailEndEtap")]
    public async Task<IActionResult> EditEmailEndEtap([FromBody] ResendCodeRequest request)
    {

        var result = await _service.EditEmailNew(request.Email, request.UserId);

        return result.ToActionResult();
    }
}
