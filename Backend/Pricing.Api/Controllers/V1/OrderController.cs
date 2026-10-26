using backend.services.interfaces;
using Backend.Services.Interfaces;
using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Security;
using Pricing.Api.Extensions;
using System.Security.Claims;

namespace backend.controllers.v1;

[ApiController]
[Route("api/v1/order")]
public class OrderController : ControllerBase
{
    private readonly IOrderService _service;
    private readonly Mercado.Craibas.Application.Services.IOrderAfterSaleService _afterSale;

    public OrderController(IOrderService service, Mercado.Craibas.Application.Services.IOrderAfterSaleService afterSale)
    {
        _service = service;
        _afterSale = afterSale;
    }

    /// <summary>Cliente cancela o próprio pedido (PENDENTE ou CONFIRMADO; pago = estorno automático).</summary>
    [Authorize(Roles = "CLIENTE")]
    [HttpPost("{orderId:int}/cancel")]
    public async Task<IActionResult> CancelOrder(int orderId, [FromBody] CancelOrderRequest? request)
    {
        var result = await _afterSale.CancelByCustomerAsync(User.GetUserId(), orderId, request?.Reason);
        return result.ToActionResult();
    }

    /// <summary>Cliente pede devolução (pedido entregue, até 7 dias).</summary>
    [Authorize(Roles = "CLIENTE")]
    [HttpPost("{orderId:int}/return")]
    public async Task<IActionResult> RequestReturn(int orderId, [FromBody] ReturnOrderRequest request)
    {
        var result = await _afterSale.RequestReturnAsync(User.GetUserId(), orderId, request?.Reason ?? "");
        return result.ToActionResult();
    }

    [Authorize(Roles = "CLIENTE")]
    [HttpPost("PostSaveOrder")]
    public async Task<IActionResult> PostSaveOrder([FromBody] OrderSaveRequest orderSave)
    {
        var userid = User.GetUserId();

        var result = await _service.PostSaveOrder(userid,orderSave);

        return result.ToActionResult();
    }
    [Authorize(Roles = "CLIENTE")]
    [HttpGet("GetAllOrderResponse")]
    public async Task<IActionResult> GetAllOrderResponse()
    {
        var userid = User.GetUserId();

        var result = await _service.GetOrderAll(userid);

        return result.ToActionResult();
    }
    [Authorize(Roles = "CLIENTE")]
    [AllowVideoUploads]
    [HttpPost("PostSaveAssessment")]
    public async Task<IActionResult> PostSaveAssessment ([FromForm] ProductReviewrequest ProductReview)
    {
        var Id_User = User.GetUserId();
        var result = await _service.PostUpdateAssessment(Id_User,ProductReview);

        return result.ToActionResult();
    }

    [Authorize(Roles = "CLIENTE")]
    [AllowVideoUploads]
    [HttpPost("PostEditeAssessment")]
    public async Task<IActionResult> PostEditeAssessment([FromForm] ProductReviewEditerequest ProductReview)
    {
        var Id_User = User.GetUserId();
        var result = await _service.PostUpdateEditeAssessment(Id_User, ProductReview);

        return result.ToActionResult();
    }
    [Authorize(Roles = "CLIENTE")]
    [HttpPost("GetAssessment")]
    public async Task<IActionResult> GetAssessment(
    [FromQuery] int IdProduct,
    [FromQuery] int IdOrder)
    {
        var Id_User = User.GetUserId();
        var result = await _service.GetAssessment(Id_User, IdProduct, IdOrder);

        return result.ToActionResult();
    }

}
