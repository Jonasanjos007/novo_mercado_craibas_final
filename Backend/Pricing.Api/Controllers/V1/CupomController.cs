namespace Backend.Controllers.V1;
using backend.services.interfaces;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;
[ApiController]
[Route("api/v1/cupom")]
public class CupomController : ControllerBase
{
    private readonly ICheckoutService _service;

    public CupomController(ICheckoutService service)
    {
        _service = service;
    }

    [HttpGet("Cupom/{CodCupom}")]
    public async Task<IActionResult> GetCupomApproved(string CodCupom)
    {

        var result = await _service.GetCupom(CodCupom);

        return result.ToActionResult();
    }

}
