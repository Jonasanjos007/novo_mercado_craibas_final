using backend.services.interfaces;
using Backend.Services.Interfaces;
using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
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


}
