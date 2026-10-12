using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;

namespace Mercado.Api.Controllers.admin
{
    /// <summary>
    /// Lixeira do admin. Somente ADMIN.
    /// </summary>
    [ApiController]
    [Route("api/admin/trash")]
    [Authorize(Roles = "ADMIN")]
    public class TrashAdminController : ControllerBase
    {
        private readonly ITrashServiceAdmin _service;

        public TrashAdminController(ITrashServiceAdmin service)
        {
            _service = service;
        }

        /// <summary>Lixeira paginada (filtros aplicados antes de paginar).</summary>
        [HttpGet("paged")]
        public async Task<IActionResult> GetTrashPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, [FromQuery] string? filter = null)
        {
            var result = await _service.GetTrashPagedAsync(page, pageSize, search, filter);

            return result.ToActionResult();
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetTrashSummary()
        {
            var result = await _service.GetTrashSummaryAsync();

            return result.ToActionResult();
        }

        [HttpGet]
        public async Task<IActionResult> GetTrash()
        {
            var result = await _service.GetTrashAsync();

            return result.ToActionResult();
        }

        [HttpPost("{id:int}/restore")]
        public async Task<IActionResult> Restore(int id)
        {
            var result = await _service.RestoreAsync(id, User.GetUserId());

            return result.ToActionResult();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Purge(int id)
        {
            var result = await _service.PurgeAsync(id, User.GetUserId());

            return result.ToActionResult();
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> Bulk([FromBody] TrashBulkRequest request)
        {
            var result = await _service.BulkAsync(request, User.GetUserId());

            return result.ToActionResult();
        }
    }
}
