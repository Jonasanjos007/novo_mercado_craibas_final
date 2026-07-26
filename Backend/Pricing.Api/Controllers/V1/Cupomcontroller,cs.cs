using backend.services.interfaces;
using Mercado.Craibas.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;
using System.Threading.Tasks;


namespace backend.controllers.v1;

//[Authorize]
[ApiController]
[Route("api/v1/cupom")]
public class Cupomcontroller : ControllerBase
{
    private readonly ICupomService _service;

    public Cupomcontroller(ICupomService service)
    {
        _service = service;
    }

    [HttpGet("GetAllCupom")]
    public async Task<IActionResult> GetAllCupom()
    {
        var result = await _service.GetCupomList();

        return result.ToActionResult();
    }

    [HttpPost("ApplyCupom")]
    public async Task<IActionResult> ApplyCupom([FromBody] string Cod_Cupom)
    {
        var userid = User.GetUserId();
        var result = await _service.ApplyCupom(Cod_Cupom,userid);

        return result.ToActionResult();
    }

    [HttpPost("RemoveApllyCupom")]
    public async Task<IActionResult> RemoveApllyCupom()
    {
        var userid = User.GetUserId();
        var result = await _service.RemoveApllyCupom(userid);

        return result.ToActionResult();
    }
}

