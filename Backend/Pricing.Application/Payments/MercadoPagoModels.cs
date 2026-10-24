#nullable enable
using System.Text.Json.Serialization;

namespace Mercado.Craibas.Application.Payments;

// Modelos da API Orders do Mercado Pago (POST/GET https://api.mercadopago.com/v1/orders).
// Valores monetários são STRING no formato "00.00", como a API exige.
// Doc: https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/overview

public sealed class MpCreateOrderRequest
{
    [JsonPropertyName("type")] public string Type { get; set; } = "online";
    [JsonPropertyName("processing_mode")] public string ProcessingMode { get; set; } = "automatic";
    [JsonPropertyName("total_amount")] public string TotalAmount { get; set; } = "0.00";
    [JsonPropertyName("external_reference")] public string ExternalReference { get; set; } = "";
    [JsonPropertyName("description")] public string? Description { get; set; }
    [JsonPropertyName("payer")] public MpPayer Payer { get; set; } = new();
    [JsonPropertyName("transactions")] public MpTransactionsRequest Transactions { get; set; } = new();
}

public sealed class MpPayer
{
    [JsonPropertyName("email")] public string Email { get; set; } = "";
    [JsonPropertyName("first_name")] public string? FirstName { get; set; }
    [JsonPropertyName("identification")] public MpIdentification? Identification { get; set; }
}

public sealed class MpIdentification
{
    [JsonPropertyName("type")] public string Type { get; set; } = "";
    [JsonPropertyName("number")] public string Number { get; set; } = "";
}

public sealed class MpTransactionsRequest
{
    [JsonPropertyName("payments")] public List<MpPaymentRequest> Payments { get; set; } = new();
}

public sealed class MpPaymentRequest
{
    [JsonPropertyName("amount")] public string Amount { get; set; } = "0.00";
    [JsonPropertyName("payment_method")] public MpPaymentMethodRequest PaymentMethod { get; set; } = new();
    /// <summary>Só PIX/boleto: duração ISO 8601 (ex.: "PT24H"). Mínimo 30 min, máximo 30 dias.</summary>
    [JsonPropertyName("expiration_time")] public string? ExpirationTime { get; set; }
}

public sealed class MpPaymentMethodRequest
{
    /// <summary>"pix" ou a bandeira do cartão ("master", "visa", "elo"...).</summary>
    [JsonPropertyName("id")] public string Id { get; set; } = "";
    /// <summary>"bank_transfer" (PIX), "credit_card" ou "debit_card".</summary>
    [JsonPropertyName("type")] public string Type { get; set; } = "";
    [JsonPropertyName("token")] public string? Token { get; set; }
    [JsonPropertyName("installments")] public int? Installments { get; set; }
}

// ── Resposta ───────────────────────────────────────────────────────────────

public sealed class MpOrder
{
    [JsonPropertyName("id")] public string? Id { get; set; }
    [JsonPropertyName("status")] public string? Status { get; set; }
    [JsonPropertyName("status_detail")] public string? StatusDetail { get; set; }
    [JsonPropertyName("external_reference")] public string? ExternalReference { get; set; }
    [JsonPropertyName("total_amount")] public string? TotalAmount { get; set; }
    [JsonPropertyName("transactions")] public MpTransactionsResponse? Transactions { get; set; }

    public MpPaymentResponse? FirstPayment => Transactions?.Payments?.FirstOrDefault();
}

public sealed class MpTransactionsResponse
{
    [JsonPropertyName("payments")] public List<MpPaymentResponse>? Payments { get; set; }
}

public sealed class MpPaymentResponse
{
    [JsonPropertyName("id")] public string? Id { get; set; }
    [JsonPropertyName("amount")] public string? Amount { get; set; }
    [JsonPropertyName("status")] public string? Status { get; set; }
    [JsonPropertyName("status_detail")] public string? StatusDetail { get; set; }
    [JsonPropertyName("date_of_expiration")] public string? DateOfExpiration { get; set; }
    [JsonPropertyName("payment_method")] public MpPaymentMethodResponse? PaymentMethod { get; set; }
}

public sealed class MpPaymentMethodResponse
{
    [JsonPropertyName("id")] public string? Id { get; set; }
    [JsonPropertyName("type")] public string? Type { get; set; }
    [JsonPropertyName("installments")] public int? Installments { get; set; }
    [JsonPropertyName("ticket_url")] public string? TicketUrl { get; set; }
    [JsonPropertyName("qr_code")] public string? QrCode { get; set; }
    [JsonPropertyName("qr_code_base64")] public string? QrCodeBase64 { get; set; }
}

public sealed class MpErrorResponse
{
    [JsonPropertyName("errors")] public List<MpError>? Errors { get; set; }
    [JsonPropertyName("message")] public string? Message { get; set; }
    [JsonPropertyName("error")] public string? Error { get; set; }
}

public sealed class MpError
{
    [JsonPropertyName("code")] public string? Code { get; set; }
    [JsonPropertyName("message")] public string? Message { get; set; }
}

/// <summary>Resultado de uma chamada à API (sucesso, recusa ou falha de comunicação).</summary>
public sealed class MpApiResult
{
    public bool Success { get; init; }
    public int StatusCode { get; init; }
    /// <summary>A API às vezes devolve a order mesmo com status HTTP de erro (ex.: pagamento recusado).</summary>
    public MpOrder? Order { get; init; }
    public string? ErrorCode { get; init; }
    public string? ErrorMessage { get; init; }
    public string RawBody { get; init; } = "";
    /// <summary>Não chegou ao Mercado Pago (rede, timeout, sem credencial).</summary>
    public bool CommunicationFailure { get; init; }
}

/// <summary>Corpo do webhook (topic "order").</summary>
public sealed class MpWebhookBody
{
    [JsonPropertyName("action")] public string? Action { get; set; }
    [JsonPropertyName("type")] public string? Type { get; set; }
    [JsonPropertyName("live_mode")] public bool? LiveMode { get; set; }
    [JsonPropertyName("data")] public MpWebhookData? Data { get; set; }
}

public sealed class MpWebhookData
{
    [JsonPropertyName("id")] public string? Id { get; set; }
    [JsonPropertyName("status")] public string? Status { get; set; }
    [JsonPropertyName("status_detail")] public string? StatusDetail { get; set; }
}
