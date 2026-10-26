using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.DTOs.API;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.Interfaces.Services;
using Mercado.Craibas.Application.Payments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Pricing.Api.Extensions;

namespace backend.controllers.v1;

/// <summary>
/// Pagamento dos pedidos (Mercado Pago · API Orders · PIX e cartão).
///
///   GET  api/v1/payment/config            chave pública e regras (front monta o formulário)
///   GET  api/v1/payment/order/{orderId}   situação do pagamento do pedido (o front consulta enquanto espera)
///   POST api/v1/payment/pix               gera o PIX (ou devolve o que ainda está válido)
///   POST api/v1/payment/card              paga com o token do cartão gerado pelo Card Payment Brick
///   POST api/v1/payment/webhook           avisos do Mercado Pago (configurar no painel: tópico "Order (Mercado Pago)")
/// </summary>
[ApiController]
[Route("api/v1/payment")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _service;

    public PaymentController(IPaymentService service)
    {
        _service = service;
    }

    [Authorize]
    [HttpGet("config")]
    public IActionResult GetConfig() => Result<Mercado.Craibas.Application.DTOs.Responses.PaymentConfigResponse>.Success(_service.GetConfig()).ToActionResult();

    [Authorize(Roles = "CLIENTE")]
    [HttpGet("order/{orderId:int}")]
    public async Task<IActionResult> GetOrderPayment(int orderId)
    {
        var result = await _service.GetOrderPaymentAsync(User.GetUserId(), orderId);
        return result.ToActionResult();
    }

    [Authorize(Roles = "CLIENTE")]
    [EnableRateLimiting(Pricing.Api.Security.RateLimitPolicies.Payment)]
    [HttpPost("pix")]
    public async Task<IActionResult> CreatePix([FromBody] CreatePixPaymentRequest request)
    {
        var result = await _service.CreatePixAsync(User.GetUserId(), request);
        return result.ToActionResult();
    }

    [Authorize(Roles = "CLIENTE")]
    [EnableRateLimiting(Pricing.Api.Security.RateLimitPolicies.PaymentCard)]
    [HttpPost("card")]
    public async Task<IActionResult> CreateCard([FromBody] CreateCardPaymentRequest request)
    {
        var result = await _service.CreateCardAsync(User.GetUserId(), request);
        return result.ToActionResult();
    }

    /// <summary>
    /// Webhook do Mercado Pago. Sem login (quem chama é o Mercado Pago); a segurança é a assinatura x-signature.
    /// Responde 200 rápido; se não conseguir consultar a order responde 500 e o Mercado Pago tenta de novo.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook()
    {
        string body;
        using (var reader = new StreamReader(Request.Body))
            body = await reader.ReadToEndAsync();

        var result = await _service.HandleWebhookAsync(
            queryDataId: Request.Query["data.id"].FirstOrDefault() ?? Request.Query["id"].FirstOrDefault(),
            queryType: Request.Query["type"].FirstOrDefault() ?? Request.Query["topic"].FirstOrDefault(),
            signature: Request.Headers["x-signature"].FirstOrDefault(),
            requestId: Request.Headers["x-request-id"].FirstOrDefault(),
            rawBody: body);

        return result.ToActionResult();
    }
}
