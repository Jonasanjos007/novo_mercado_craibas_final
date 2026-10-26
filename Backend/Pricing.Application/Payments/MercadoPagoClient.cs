#nullable enable
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Mercado.Craibas.Application.Interfaces.Payment;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Mercado.Craibas.Application.Payments;

public sealed class MercadoPagoClient : IMercadoPagoClient
{
    private static readonly JsonSerializerOptions Json = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
    };

    private readonly HttpClient _http;
    private readonly MercadoPagoOptions _options;
    private readonly ILogger<MercadoPagoClient> _logger;

    public MercadoPagoClient(HttpClient http, IOptions<MercadoPagoOptions> options, ILogger<MercadoPagoClient> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
    }

    public Task<MpApiResult> CreateOrderAsync(MpCreateOrderRequest request, string idempotencyKey, CancellationToken ct = default)
    {
        var body = JsonSerializer.Serialize(request, Json);
        return SendAsync(HttpMethod.Post, "/v1/orders", body, idempotencyKey, ct);
    }

    public Task<MpApiResult> GetOrderAsync(string orderId, CancellationToken ct = default)
        => SendAsync(HttpMethod.Get, $"/v1/orders/{Uri.EscapeDataString(orderId)}", null, null, ct);

    public Task<MpApiResult> CancelOrderAsync(string orderId, string idempotencyKey, CancellationToken ct = default)
        => SendAsync(HttpMethod.Post, $"/v1/orders/{Uri.EscapeDataString(orderId)}/cancel", null, idempotencyKey, ct);

    // Estorno total: a doc pede o corpo vazio (sem valor). Prazo: até 180 dias após a aprovação.
    public Task<MpApiResult> RefundOrderAsync(string orderId, string idempotencyKey, CancellationToken ct = default)
        => SendAsync(HttpMethod.Post, $"/v1/orders/{Uri.EscapeDataString(orderId)}/refund", null, idempotencyKey, ct);

    private async Task<MpApiResult> SendAsync(HttpMethod method, string path, string? body, string? idempotencyKey, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_options.AccessToken))
        {
            return new MpApiResult
            {
                CommunicationFailure = true,
                ErrorCode = "not_configured",
                ErrorMessage = "Mercado Pago não configurado (MercadoPago:AccessToken vazio).",
            };
        }

        using var message = new HttpRequestMessage(method, _options.BaseUrl.TrimEnd('/') + path);
        message.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.AccessToken);
        if (!string.IsNullOrEmpty(idempotencyKey))
            message.Headers.Add("X-Idempotency-Key", idempotencyKey);
        if (body != null)
            message.Content = new StringContent(body, Encoding.UTF8, "application/json");

        string raw;
        int status;
        try
        {
            using var response = await _http.SendAsync(message, ct);
            status = (int)response.StatusCode;
            raw = await response.Content.ReadAsStringAsync(ct);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            _logger.LogWarning(ex, "Mercado Pago: falha de comunicação em {Method} {Path}", method, path);
            return new MpApiResult
            {
                CommunicationFailure = true,
                ErrorCode = "communication_failure",
                ErrorMessage = "Não foi possível falar com o Mercado Pago agora.",
            };
        }

        var success = status is >= 200 and < 300;
        var order = TryParse<MpOrder>(raw);
        // Só vale como order se tiver id (um corpo de erro também "parseia")
        if (order != null && string.IsNullOrWhiteSpace(order.Id)) order = null;

        if (success)
            return new MpApiResult { Success = true, StatusCode = status, Order = order, RawBody = raw };

        var error = TryParse<MpErrorResponse>(raw);
        var first = error?.Errors?.FirstOrDefault();
        _logger.LogWarning("Mercado Pago: {Status} em {Method} {Path}: {Body}", status, method, path, Truncate(raw, 2000));

        return new MpApiResult
        {
            Success = false,
            StatusCode = status,
            Order = order,
            ErrorCode = first?.Code ?? error?.Error ?? status.ToString(),
            ErrorMessage = first?.Message ?? error?.Message,
            RawBody = raw,
            // 5xx e 429: o Mercado Pago não processou; dá para tentar de novo.
            CommunicationFailure = status >= 500 || status == 429,
        };
    }

    private static T? TryParse<T>(string raw) where T : class
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;
        try { return JsonSerializer.Deserialize<T>(raw, Json); }
        catch (JsonException) { return null; }
    }

    internal static string? Truncate(string? value, int max)
        => value == null || value.Length <= max ? value : value[..max];
}
