using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;
using System.Xml;

namespace Mercado.Api.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/cupom")]
    public class CupomAdminController : ControllerBase
    {
        private readonly ICupomAdminService _service;

        public CupomAdminController(ICupomAdminService service)
        {
            _service = service;
        }
        [Authorize]
        [HttpPost("PostSaveCupom")]
        public async Task<IActionResult> PostSaveCupom([FromBody] CupomRequest cupomRequest)
        {
            var Id_User = User.GetUserId();
            var result = await _service.PostSaveCupom(cupomRequest , Id_User);
                return result.ToActionResult();
        }
        [Authorize]
        [HttpGet("GetListCupons")]
        public async Task<IActionResult> GetListCupons()
        {
            var result = await _service.GetListAllCupons();
            return result.ToActionResult();
        }
        [Authorize]
        [HttpPost("PostUpdateCupom")]
        public async Task<IActionResult> PostUpdateCupom([FromBody] CupomUpdateRequest cupomRequest)
        {
            var Id_User = User.GetUserId();

            var result = await _service.PostUpdateCupom(cupomRequest, Id_User);
            return result.ToActionResult();
        }
        [Authorize]
        [HttpDelete("DeleteCupom/{IdCupom}")]
        public async Task<IActionResult> DeleteCupom(int IdCupom)
        {
            var Id_User = User.GetUserId();

            var result = await _service.DeleteCupom(IdCupom, Id_User);
            return result.ToActionResult();
        }
        [Authorize]
        [HttpPost("PostUpdateActive")]
        public async Task<IActionResult> PostUpdateActive([FromBody] int IdCupom)
        {
            var Id_User = User.GetUserId();

            var result = await _service.PostUpdateActive(IdCupom, Id_User);
            return result.ToActionResult();
        }
    }
}
