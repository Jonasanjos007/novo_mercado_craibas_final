using Backend.Services.Interfaces;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;
using System.Security.Claims;

namespace Mercado.Api.Controllers.Admin
{
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    [Route("api/admin/orders")]
    public class OrderAdminController : ControllerBase
    {
        private readonly IOrderAdminService _service;
        private readonly Mercado.Craibas.Application.Services.IOrderAfterSaleService _afterSale;

        public OrderAdminController(IOrderAdminService service, Mercado.Craibas.Application.Services.IOrderAfterSaleService afterSale)
        {
            _service = service;
            _afterSale = afterSale;
        }
        [HttpGet("returns")]
        public async Task<IActionResult> GetReturns([FromQuery] string? filter = "open")
        {
            var result = await _afterSale.GetReturnsAsync(filter);
            return result.ToActionResult();
        }

        [HttpPost("returns/{orderId:int}/status")]
        public async Task<IActionResult> UpdateReturnStatus(int orderId, [FromBody] UpdateReturnStatusRequest request)
        {
            var result = await _afterSale.UpdateReturnStatusAsync(User.GetUserId(), orderId, request?.Status ?? "", request?.Note);
            return result.ToActionResult();
        }
        [HttpGet("cancellations")]
        public async Task<IActionResult> GetCancellations([FromQuery] string? filter = "open")
        {
            var result = await _afterSale.GetCancellationsAsync(filter);
            return result.ToActionResult();
        }
        [HttpPost("cancellations/{orderId:int}/decision")]
        public async Task<IActionResult> DecideCancellation(int orderId, [FromBody] CancelDecisionRequest request)
        {
            var result = await _afterSale.DecideCancellationAsync(User.GetUserId(), orderId, request?.Approve == true, request?.Note);
            return result.ToActionResult();
        }

        [Authorize(Roles = "ADMIN")]
        [HttpGet("paged")]
        public async Task<IActionResult> GetOrdersPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, [FromQuery] string? status = null)
        {
            var result = await _service.GetOrdersPagedAsync(page, pageSize, search, status);

            return result.ToActionResult();
        }

        [Authorize(Roles = "ADMIN")]
        [HttpGet("summary")]
        public async Task<IActionResult> GetOrdersSummary()
        {
            var result = await _service.GetOrdersSummaryAsync();

            return result.ToActionResult();
        }

        [Authorize(Roles = "ADMIN")]
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var result = await _service.GetDashboardAsync();

            return result.ToActionResult();
        }

        [Authorize(Roles = "ADMIN")]
        [HttpGet("logs/paged")]
        public async Task<IActionResult> GetLogsPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, [FromQuery] string? type = null, [FromQuery] string? level = null, [FromQuery] string? period = null)
        {
            var result = await _service.GetLogsPagedAsync(page, pageSize, search, type, level, period);

            return result.ToActionResult();
        }

        [Authorize(Roles = "ADMIN")]
        [HttpGet("logs/summary")]
        public async Task<IActionResult> GetLogsSummary()
        {
            var result = await _service.GetLogsSummaryAsync();

            return result.ToActionResult();
        }

        [Authorize(Roles = "ADMIN")]
        [HttpGet("logs/user/{userId:int}")]
        public async Task<IActionResult> GetLogsByUser(int userId)
        {
            var result = await _service.GetLogsByUserAsync(userId);

            return result.ToActionResult();
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
                return Forbid();
            }

            var result = await _service.GetAlllogs();

            return result.ToActionResult();
        }
        // Lista de categorias é pública (menu do site).
        [AllowAnonymous]
        [HttpGet("GetCategoryAllListAdmin")]
        public async Task<IActionResult> GetCategoryAllListAdmin()
        {
            var result = await _service.GetAllCategory();

            return result.ToActionResult();
        }


        [Authorize]
        [HttpPost("PostUpdateOrderNewStatus")]
        public async Task<IActionResult> PostUpdateOrderNewStatus(int Id_Order,string NewStatus, string? WhoReceivedIt)
        {
            var Id_User = User.GetUserId();

            var result = await _service.PostUpdateStatusOrder(Id_Order, NewStatus,Id_User, WhoReceivedIt);
            return result.ToActionResult();
        }

        [Authorize]
        [HttpPost("PostUpdateNotifyViaWhatsApp")]
        public async Task<IActionResult> PostUpdateNotifyViaWhatsApp(int Id_Order)
        {
            var Id_User = User.GetUserId();

            var result = await _service.NotifyViaWhatsAppUpdateEnviado(Id_Order, Id_User);
            return result.ToActionResult();
        }
    }
}
