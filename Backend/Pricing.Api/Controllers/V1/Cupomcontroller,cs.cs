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
}

