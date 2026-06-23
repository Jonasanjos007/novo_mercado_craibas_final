
namespace backend.controllers.v1;
using backend.services.interfaces;
using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;
using System.Threading.Tasks;

[ApiController]
[Route("api/v1/users")]
public class userscontroller : ControllerBase
{
    private readonly IUserService _service;

    public userscontroller(IUserService service)
    {
        _service = service;
    }

    //[httppost("register")]
    //public async task<iactionresult> register(createuserrequest request)
    //{
    //    var result = await _service.createuser(request);

    //    return result.toactionresult();
    //}

    //[Authorize]
    [HttpGet("me/{role}")]
    public async Task<IActionResult> Me(string role)
    {
        var userid = User.GetUserId(); // ou como você obtém o id

        var result = await _service.GetbyIdUser(userid, role);

        return result.ToActionResult();
    }

    [HttpPost("postSaveAddressUser")]
    public async Task<IActionResult> postSaveAddressUser([FromBody] AddressRequest NewAnddress )
    {
        var result = await _service.PostSaveAddressUserService(NewAnddress);

        return result.ToActionResult();
    }
    [HttpGet("GetAddresByIdUser/{Id_User}")]

    public async Task<IActionResult> GetAddresByIdUser( int Id_User)
    {

        var result = await _service.GetAddressbyIdUserService(Id_User);

        return result.ToActionResult();
    }
    [HttpPost("PostUpdateAddres")]
    public async Task<IActionResult> PostUpdateAddres([FromBody] AddressRequest NewAnddress)
    {
        var result = await _service.PostUpdateAddressUserService(NewAnddress);

        return result.ToActionResult();
    }
    [HttpPost("DeleteAddress")]
    public async Task<IActionResult> DeleteAddress([FromBody] AddressRequest DeleteAnddress)
    {
        var result = await _service.DeleteAddressService(DeleteAnddress);

        return result.ToActionResult();
    }
    [HttpPost("SaveColorGlobalInsert")]
    public async Task<IActionResult> SaveColorGlobalInsert([FromBody] CustomizeRequest customize)
    {
        var result = await _service.SaveColorGlobalInsertService(customize.Global_Site_Color, customize.Id);

        return result.ToActionResult();
    }
}
