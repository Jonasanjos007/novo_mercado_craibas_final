using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;

namespace Mercado.Api.Controllers.Admin
{
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    [Route("api/admin/brinde")]
    public class BrindeAdminController : ControllerBase
    {
        private readonly IBrindeAdminService _service;

        public BrindeAdminController(IBrindeAdminService service)
        {
            _service = service;
        }

        [Authorize]
        [HttpPost("PostSaveBrinde")]
        public async Task<IActionResult> PostSaveBrinde([FromForm] BrindeRequest request)
        {
            var Id_User = User.GetUserId();
            var result = await _service.PostSaveBrinde(request, Id_User);
            return result.ToActionResult();
        }

        [Authorize]
        [HttpGet("GetListAllBrindes")]
        public async Task<IActionResult> GetListAllBrindes()
        {
            var result = await _service.GetListAllBrindes();
            return result.ToActionResult();
        }

        [Authorize]
        [HttpPost("PostUpdateBrinde")]
        public async Task<IActionResult> PostUpdateBrinde([FromForm] BrindeUpdateRequest request)
        {
            var Id_User = User.GetUserId();
            var result = await _service.PostUpdateBrinde(request, Id_User);
            return result.ToActionResult();
        }

        [Authorize]
        [HttpDelete("DeleteBrinde/{IdBrinde}")]
        public async Task<IActionResult> DeleteBrinde(int IdBrinde, [FromQuery] string? reason)
        {
            var Id_User = User.GetUserId();
            var result = await _service.DeleteBrinde(IdBrinde, Id_User, reason);
            return result.ToActionResult();
        }

        [Authorize]
        [HttpPost("PostUpdateActive")]
        public async Task<IActionResult> PostUpdateActive([FromBody] int IdBrinde)
        {
            var Id_User = User.GetUserId();
            var result = await _service.PostUpdateActive(IdBrinde, Id_User);
            return result.ToActionResult();
        }

        [Authorize]
        [HttpPost("PostAtribuirBrinde")]
        public async Task<IActionResult> PostAtribuirBrinde([FromBody] AtribuirBrindeRequest request)
        {
            var Id_User = User.GetUserId();
            var result = await _service.PostAtribuirBrinde(request, Id_User);
            return result.ToActionResult();
        }

        [Authorize]
        [HttpPost("PostEntregarBrinde")]
        public async Task<IActionResult> PostEntregarBrinde([FromBody] int IdBrindeCliente)
        {
            var Id_User = User.GetUserId();
            var result = await _service.PostEntregarBrinde(IdBrindeCliente, Id_User);
            return result.ToActionResult();
        }

        [Authorize]
        [HttpGet("GetListEntregas")]
        public async Task<IActionResult> GetListEntregas([FromQuery] string? status)
        {
            var result = await _service.GetListEntregas(status);
            return result.ToActionResult();
        }

        [Authorize]
        [HttpGet("GetBrindesByOrder/{IdOrder}")]
        public async Task<IActionResult> GetBrindesByOrder(int IdOrder)
        {
            var result = await _service.GetBrindesByOrder(IdOrder);
            return result.ToActionResult();
        }
    }
}
