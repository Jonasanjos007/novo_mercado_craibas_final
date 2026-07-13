using Backend.Services.Interfaces;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;
using System.Security.Claims;

namespace Mercado.Api.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/orders")]
    public class OrderAdminController : ControllerBase
    {
        private readonly IOrderAdminService _service;

        public OrderAdminController(IOrderAdminService service)
        {
            _service = service;
        }
        [Authorize]
        [HttpGet("GetAllOrderAdmin")]
        public async Task<IActionResult> GetAllOrderAdmin()
        {

            var result = await _service.GetOrderAllListAdmin();

            return result.ToActionResult();
        }

        [Authorize]
        [HttpGet("GetAllLogsAdmin")]
        public async Task<IActionResult> GetAllLogsAdmin()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (role != "ADMIN")
            {
                return null;
            }

            var result = await _service.GetAlllogs();

            return result.ToActionResult();
        }
        [Authorize]
        [HttpGet("GetCategoryAllListAdmin")]
        public async Task<IActionResult> GetCategoryAllListAdmin()
        {
            var result = await _service.GetAllCategory();

            return result.ToActionResult();
        }
    }
}
