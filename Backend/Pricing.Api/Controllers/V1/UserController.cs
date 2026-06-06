
namespace backend.controllers.v1;
using backend.services.interfaces;
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
}
