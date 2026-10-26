
namespace backend.controllers.v1;
using backend.services.interfaces;
using Backend.Services.Interfaces;
using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;
using Pricing.Api.Security;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

[ApiController]
[Route("api/v1/users")]
public class UserController : ControllerBase
{
    private readonly IUserService _service;
    private readonly IConfiguration _configuration;

    public UserController(IUserService service, IConfiguration configuration)
    {
        _service = service;
        _configuration = configuration;
    }

    /// <summary>Etapa do cadastro chamada de outro navegador ou com id que não é deste cadastro.</summary>
    private IActionResult RegistrationExpired()
        => Error.Validation("Cadastro", "Por segurança, continue o cadastro no mesmo navegador em que começou ou recomece informando nome e telefone.").ToActionResult();

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
        // Segurança: o perfil vem do token. O da URL é ignorado (antes um cliente
        // podia pedir "me/ADMIN" e ver os dados do administrador com o mesmo id).
        var tokenRole = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

        var result = await _service.GetbyIdUser(userid, tokenRole);

        return result.ToActionResult();
    }
    [Authorize(Roles = "CLIENTE")]
    [HttpPost("postSaveAddressUser")]
    public async Task<IActionResult> postSaveAddressUser([FromBody] AddressRequest NewAnddress )
    {
        // Segurança: o dono do endereço é sempre o usuário logado.
        NewAnddress.Id_User_Customer = User.GetUserId();
        var result = await _service.PostSaveAddressUserService(NewAnddress);

        return result.ToActionResult();
    }
    [Authorize(Roles = "CLIENTE")]
    [HttpGet("GetAddresByIdUser")]
    public async Task<IActionResult> GetAddresByIdUser()
    {
        var Id_User = User.GetUserId();
        var result = await _service.GetAddressbyIdUserService(Id_User);

        return result.ToActionResult();
    }

    [Authorize(Roles = "CLIENTE")]
    [HttpPost("PostUpdateAddres")]
    public async Task<IActionResult> PostUpdateAddres([FromBody] AddressRequest NewAnddress)
    {
        NewAnddress.Id_User_Customer = User.GetUserId();
        var result = await _service.PostUpdateAddressUserService(NewAnddress);

        return result.ToActionResult();
    }
    [Authorize(Roles = "CLIENTE")]
    [HttpPost("DeleteAddress")]
    public async Task<IActionResult> DeleteAddress([FromBody] AddressRequest DeleteAnddress)
    {
        DeleteAnddress.Id_User_Customer = User.GetUserId();
        var result = await _service.DeleteAddressService(DeleteAnddress);

        return result.ToActionResult();
    }
    [Authorize(Roles = "CLIENTE")]
    [HttpPost("SaveColorGlobalInsert")]
    public async Task<IActionResult> SaveColorGlobalInsert([FromBody] CustomizeRequest customize)
    {
        // Segurança: usa o id do token (antes vinha da tela e permitia mudar a cor de outro cliente).
        var result = await _service.SaveColorGlobalInsertService(customize.Global_Site_Color, User.GetUserId());

        return result.ToActionResult();
    }
    [EnableRateLimiting(RateLimitPolicies.Registration)]
    [HttpPost("SaveUSerInitialData")]
    public async Task<IActionResult> SaveUSerInitialData([FromBody] RegisterStartRequest Request)
    {
        var result = await _service.RegisterStartAsync(Request);

        // Liga o cadastro a este navegador (as próximas etapas exigem este cookie).
        if (result.IsSuccess && result.Value != null)
            RegistrationSession.Issue(HttpContext, _configuration, result.Value.IdUser);

        return result.ToActionResult();
    }
    [EnableRateLimiting(RateLimitPolicies.Registration)]
    [HttpPost("SaveEmailConfirm")]
    public async Task<IActionResult> SaveEmailConfirm([FromBody] RegisterEmailRequest Request)
    {
        if (!RegistrationSession.IsValid(HttpContext, _configuration, Request.UserId))
            return RegistrationExpired();
        var result = await _service.RegisterEmailConfirm(Request);

        return result.ToActionResult();
    }

    [EnableRateLimiting(RateLimitPolicies.Registration)]
    [HttpPost("SaveEmailConfirmCode")]
    public async Task<IActionResult> SaveEmailConfirmCode([FromBody] RegisterEmailCodeRequest request)
    {
        if (!RegistrationSession.IsValid(HttpContext, _configuration, request.UserId))
            return RegistrationExpired();
        var result = await _service.RegisterEmailCodeConfirm(request.UserId,request.Code);

        return result.ToActionResult();
    }

    [EnableRateLimiting(RateLimitPolicies.Registration)]
    [HttpPost("SaveRegisterPassword")]
    public async Task<IActionResult> SaveRegisterPassword(
    [FromBody] RegisterPasswordRequest request)
    {
        if (!RegistrationSession.IsValid(HttpContext, _configuration, request.UserId))
            return RegistrationExpired();
        var result = await _service.RegisterPassword(
            request.UserId,
            request.Password,
            request.ConfirmPassword
        );

        return result.ToActionResult();
    }

    [EnableRateLimiting(RateLimitPolicies.Registration)]
    [HttpPost("ResendCode")]
    public async Task<IActionResult> ResendCode([FromBody] ResendCodeRequest request)
    {
        if (!RegistrationSession.IsValid(HttpContext, _configuration, request.UserId))
            return RegistrationExpired();
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        var result = await _service.ResendCode(request.UserId,request.Email,request.Phone,ipAddress ?? "unknown");

        return result.ToActionResult();
    }
    [EnableRateLimiting(RateLimitPolicies.Registration)]
    [HttpPost("EditEmailEndEtap")]
    public async Task<IActionResult> EditEmailEndEtap([FromBody] ResendCodeRequest request)
    {
        if (!RegistrationSession.IsValid(HttpContext, _configuration, request.UserId))
            return RegistrationExpired();

        var result = await _service.EditEmailNew(request.Email, request.UserId);

        return result.ToActionResult();
    }
    [HttpGet("GetBaseSite")]
    public async Task<IActionResult> GetBaseSite()
    {
        var result = await _service.GetBaseSite();

        return result.ToActionResult();
    }
}
