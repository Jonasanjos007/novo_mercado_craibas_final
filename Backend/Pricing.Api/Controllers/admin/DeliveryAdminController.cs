using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Pricing.Api.Extensions;

namespace Mercado.Api.Controllers.admin
{
    /// <summary>
    /// Entregas no painel do admin. Somente ADMIN.
    /// </summary>
    [ApiController]
    [Route("api/admin/delivery")]
    [Authorize(Roles = "ADMIN")]
    public class DeliveryAdminController : ControllerBase
    {
        private readonly IDeliveryServiceAdmin _service;

        public DeliveryAdminController(IDeliveryServiceAdmin service)
        {
            _service = service;
        }

        // ── Pedidos (Minhas entregas e atribuição) ──

        /// <summary>Pedidos em preparando e em rota, com quem está entregando.</summary>
        [HttpGet("board")]
        public async Task<IActionResult> GetBoard()
        {
            var result = await _service.GetBoardAsync(User.GetUserId());

            return result.ToActionResult();
        }

        /// <summary>Entregas feitas pelo próprio admin.</summary>
        [HttpGet("my-history")]
        public async Task<IActionResult> GetMyHistory()
        {
            var result = await _service.GetMyHistoryAsync(User.GetUserId());

            return result.ToActionResult();
        }

        /// <summary>Admin pega o pedido para ele mesmo entregar.</summary>
        [HttpPost("orders/{orderId:int}/take")]
        public async Task<IActionResult> Take(int orderId, [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] TakeDeliveryOrderRequest? request)
        {
            var result = await _service.TakeAsync(User.GetUserId(), orderId, request ?? new TakeDeliveryOrderRequest());

            return result.ToActionResult();
        }

        /// <summary>Admin solta o pedido que estava com ele.</summary>
        [HttpPost("orders/{orderId:int}/release")]
        public async Task<IActionResult> Release(int orderId)
        {
            var result = await _service.ReleaseAsync(User.GetUserId(), orderId);

            return result.ToActionResult();
        }

        [HttpPost("orders/{orderId:int}/dispatch")]
        public async Task<IActionResult> Dispatch(int orderId)
        {
            var result = await _service.DispatchAsync(User.GetUserId(), orderId);

            return result.ToActionResult();
        }

        [HttpPost("orders/{orderId:int}/deliver")]
        public async Task<IActionResult> Deliver(int orderId, [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] DeliverOrderRequest? request)
        {
            var result = await _service.DeliverAsync(User.GetUserId(), orderId, request ?? new DeliverOrderRequest());

            return result.ToActionResult();
        }

        /// <summary>Atribui (ou troca) o entregador do pedido.</summary>
        [HttpPost("orders/{orderId:int}/assign")]
        public async Task<IActionResult> Assign(int orderId, [FromBody] AssignDeliveryRequest request)
        {
            var result = await _service.AssignAsync(User.GetUserId(), orderId, request);

            return result.ToActionResult();
        }

        /// <summary>Remove o responsável (só antes de sair para entrega).</summary>
        [HttpPost("orders/{orderId:int}/unassign")]
        public async Task<IActionResult> Unassign(int orderId)
        {
            var result = await _service.UnassignAsync(User.GetUserId(), orderId);

            return result.ToActionResult();
        }

        /// <summary>Gorjeta específica do pedido (Amount null = volta ao padrão).</summary>
        [HttpPut("orders/{orderId:int}/tip")]
        public async Task<IActionResult> SetTip(int orderId, [FromBody] DeliveryOrderTipRequest request)
        {
            var result = await _service.SetOrderTipAsync(User.GetUserId(), orderId, request);

            return result.ToActionResult();
        }

        // ── Entregadores ──

        [HttpGet("deliverers")]
        public async Task<IActionResult> GetDeliverers()
        {
            var result = await _service.GetDeliverersAsync();

            return result.ToActionResult();
        }

        /// <summary>Valores próprios do entregador (null = usa o geral).</summary>
        [HttpPut("deliverers/{deliveryId:int}/rates")]
        public async Task<IActionResult> SaveRates(int deliveryId, [FromBody] DeliveryRatesRequest request)
        {
            var result = await _service.SaveRatesAsync(User.GetUserId(), deliveryId, request);

            return result.ToActionResult();
        }

        /// <summary>O que falta pagar para o entregador.</summary>
        [HttpGet("deliverers/{deliveryId:int}/payables")]
        public async Task<IActionResult> GetPayables(int deliveryId)
        {
            var result = await _service.GetPayablesAsync(deliveryId);

            return result.ToActionResult();
        }

        // ── Configuração ──

        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings()
        {
            var result = await _service.GetSettingsAsync();

            return result.ToActionResult();
        }

        [HttpPut("settings")]
        public async Task<IActionResult> SaveSettings([FromBody] DeliverySettingsRequest request)
        {
            var result = await _service.SaveSettingsAsync(User.GetUserId(), request);

            return result.ToActionResult();
        }

        // ── Baixas ──

        [HttpGet("payouts")]
        public async Task<IActionResult> GetPayouts([FromQuery] int? deliveryId)
        {
            var result = await _service.GetPayoutsAsync(deliveryId);

            return result.ToActionResult();
        }

        [HttpPost("payouts")]
        public async Task<IActionResult> CreatePayout([FromBody] CreateDeliveryPayoutRequest request)
        {
            var result = await _service.CreatePayoutAsync(User.GetUserId(), request);

            return result.ToActionResult();
        }

        [HttpPost("payouts/{payoutId:int}/reverse")]
        public async Task<IActionResult> ReversePayout(int payoutId, [FromBody] ReverseDeliveryPayoutRequest request)
        {
            var result = await _service.ReversePayoutAsync(User.GetUserId(), payoutId, request);

            return result.ToActionResult();
        }
    }
}
