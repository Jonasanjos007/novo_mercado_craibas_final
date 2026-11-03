using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;

namespace Mercado.Api.Controllers.Admin
{
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    [Route("api/admin/financas")]
    public class FinancasAdminController : ControllerBase
    {
        private readonly IFinancasAdminService _service;

        public FinancasAdminController(IFinancasAdminService service)
        {
            _service = service;
        }

        [Authorize]
        [HttpGet("GetResumoMensal")]
        public async Task<IActionResult> GetResumoMensal([FromQuery] int ano, [FromQuery] int mes)
        {
            var result = await _service.GetResumoMensal(ano, mes);
            return result.ToActionResult();
        }

        [Authorize]
        [HttpGet("GetSerieMensal")]
        public async Task<IActionResult> GetSerieMensal([FromQuery] int ano)
        {
            var result = await _service.GetSerieMensal(ano);
            return result.ToActionResult();
        }

        [Authorize]
        [HttpGet("GetTopProdutosLucro")]
        public async Task<IActionResult> GetTopProdutosLucro([FromQuery] int ano, [FromQuery] int mes)
        {
            var result = await _service.GetTopProdutosLucro(ano, mes);
            return result.ToActionResult();
        }

        [Authorize]
        [HttpGet("GetListAllDespesas")]
        public async Task<IActionResult> GetListAllDespesas([FromQuery] int ano, [FromQuery] int mes)
        {
            var result = await _service.GetListAllDespesas(ano, mes);
            return result.ToActionResult();
        }

        [Authorize]
        [HttpGet("GetCategoriasDespesa")]
        public async Task<IActionResult> GetCategoriasDespesa()
        {
            var result = await _service.GetCategoriasDespesa();
            return result.ToActionResult();
        }

        [Authorize]
        [HttpPost("PostSaveDespesa")]
        public async Task<IActionResult> PostSaveDespesa([FromBody] DespesaRequest request)
        {
            var Id_User = User.GetUserId();
            var result = await _service.PostSaveDespesa(request, Id_User);
            return result.ToActionResult();
        }

        [Authorize]
        [HttpPost("PostUpdateDespesa")]
        public async Task<IActionResult> PostUpdateDespesa([FromBody] DespesaUpdateRequest request)
        {
            var Id_User = User.GetUserId();
            var result = await _service.PostUpdateDespesa(request, Id_User);
            return result.ToActionResult();
        }

        [Authorize]
        [HttpDelete("DeleteDespesa/{IdDespesa}")]
        public async Task<IActionResult> DeleteDespesa(int IdDespesa, [FromQuery] string? reason)
        {
            var Id_User = User.GetUserId();
            var result = await _service.DeleteDespesa(IdDespesa, Id_User, reason);
            return result.ToActionResult();
        }
    }
}
