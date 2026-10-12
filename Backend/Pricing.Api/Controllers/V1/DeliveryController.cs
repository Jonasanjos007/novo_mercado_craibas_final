using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Pricing.Api.Extensions;

namespace Mercado.Api.Controllers.V1
{
    /// <summary>
    /// Portal do entregador. Somente DELIVERY.
    /// O id do entregador sempre vem do token (nunca da requisição).
    /// </summary>
    [ApiController]
    [Route("api/v1/delivery")]
    [Authorize(Roles = "DELIVERY")]
    public class DeliveryController : ControllerBase
    {
        private readonly IDeliveryService _service;

        public DeliveryController(IDeliveryService service)
        {
            _service = service;
        }

        /// <summary>Pedidos atribuídos a mim (preparando e em rota).</summary>
        [HttpGet("orders")]
        public async Task<IActionResult> GetMyOrders()
        {
            var result = await _service.GetMyOrdersAsync(User.GetUserId());

            return result.ToActionResult();
        }

        /// <summary>Saiu para entrega.</summary>
        [HttpPost("orders/{orderId:int}/dispatch")]
        public async Task<IActionResult> Dispatch(int orderId)
        {
            var result = await _service.DispatchAsync(User.GetUserId(), orderId);

            return result.ToActionResult();
        }

        /// <summary>Entregue (com o nome de quem recebeu).</summary>
        [HttpPost("orders/{orderId:int}/deliver")]
        public async Task<IActionResult> Deliver(int orderId, [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] DeliverOrderRequest? request)
        {
            var result = await _service.DeliverAsync(User.GetUserId(), orderId, request ?? new DeliverOrderRequest());

            return result.ToActionResult();
        }

        /// <summary>Histórico de entregas.</summary>
        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            var result = await _service.GetHistoryAsync(User.GetUserId());

            return result.ToActionResult();
        }

        /// <summary>Ganhos (vazio quando a gorjeta está desligada).</summary>
        [HttpGet("earnings")]
        public async Task<IActionResult> GetEarnings()
        {
            var result = await _service.GetEarningsAsync(User.GetUserId());

            return result.ToActionResult();
        }

        /// <summary>Perfil do entregador.</summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var result = await _service.GetProfileAsync(User.GetUserId());

            return result.ToActionResult();
        }
    }
}
