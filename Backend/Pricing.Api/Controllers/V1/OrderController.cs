using backend.services.interfaces;
using Backend.Services.Interfaces;
using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;
using System.Security.Claims;

namespace backend.controllers.v1;

[ApiController]
[Route("api/v1/order")]
public class OrderController : ControllerBase
{
    private readonly IOrderService _service;

    public OrderController(IOrderService service)
    {
        _service = service;
    }

    [HttpPost("PostSaveOrder")]
    public async Task<IActionResult> PostSaveOrder([FromBody] OrderSaveRequest orderSave)
    {
        var userid = User.GetUserId();

        var result = await _service.PostSaveOrder(userid,orderSave);

        return result.ToActionResult();
    }
    [HttpGet("GetAllOrderResponse")]
    public async Task<IActionResult> GetAllOrderResponse()
    {
        var userid = User.GetUserId();

        var result = await _service.GetOrderAll(userid);

        return result.ToActionResult();
    }
    [Authorize]
    [HttpPost("PostSaveAssessment")]
    public async Task<IActionResult> PostSaveAssessment ([FromForm] ProductReviewrequest ProductReview)
    {
        var Id_User = User.GetUserId();
        var result = await _service.PostUpdateAssessment(Id_User,ProductReview);

        return result.ToActionResult();
    }

    [Authorize]
    [HttpPost("PostEditeAssessment")]
    public async Task<IActionResult> PostEditeAssessment([FromForm] ProductReviewEditerequest ProductReview)
    {
        var Id_User = User.GetUserId();
        var result = await _service.PostUpdateEditeAssessment(Id_User, ProductReview);

        return result.ToActionResult();
    }
    [Authorize]
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
