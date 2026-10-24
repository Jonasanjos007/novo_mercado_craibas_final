#nullable enable
namespace Mercado.Craibas.Application.Payments;

/// <summary>Status interno de uma tentativa de pagamento (coluna Payment_Transactions.Status).</summary>
public static class PaymentStatus
{
    /// <summary>PIX gerado aguardando pagamento.</summary>
    public const string Pendente = "PENDENTE";
    /// <summary>Cartão em análise antifraude (o Mercado Pago responde depois via webhook).</summary>
    public const string EmAnalise = "EM_ANALISE";
    public const string Aprovado = "APROVADO";
    public const string Recusado = "RECUSADO";
    public const string Expirado = "EXPIRADO";
    public const string Cancelado = "CANCELADO";
    public const string Estornado = "ESTORNADO";
    /// <summary>Não chegou a ser processado (falha de comunicação, dados inválidos).</summary>
    public const string Erro = "ERRO";

    /// <summary>Status que ainda podem mudar sozinhos (o Mercado Pago ainda vai responder).</summary>
    public static bool IsOpen(string? status) => status is Pendente or EmAnalise;
}

public static class PaymentMethod
{
    public const string Pix = "PIX";
    public const string CreditCard = "CREDIT_CARD";
    public const string DebitCard = "DEBIT_CARD";
}

/// <summary>Valores das colunas Orders.Status_Pay / Orders.Order_Status usados pelo pagamento.</summary>
public static class OrderPaymentValues
{
    public const string Pendente = "PENDENTE";
    public const string Confirmado = "CONFIRMADO";
    public const string Cancelado = "CANCELADO";
}

/// <summary>Converte o status do Mercado Pago no status interno e na mensagem para o cliente.</summary>
public static class PaymentStatusMapper
{
    /// <summary>
    /// Tabela "Status de order" da API Orders:
    /// created · processing · action_required (waiting_transfer/waiting_payment) · processed (accredited) ·
    /// failed · canceled · expired · refunded · charged_back.
    /// </summary>
    public static string Map(string? orderStatus, string? orderDetail, string? paymentStatus = null, string? paymentDetail = null)
    {
        var status = (orderStatus ?? paymentStatus ?? "").Trim().ToLowerInvariant();
        var detail = $"{orderDetail} {paymentDetail}".ToLowerInvariant();

        return status switch
        {
            "processed" or "accredited" or "approved" => PaymentStatus.Aprovado,
            "processing" or "in_process" or "in_review" => PaymentStatus.EmAnalise,
            "created" or "action_required" or "pending" => PaymentStatus.Pendente,
            "failed" or "rejected" => detail.Contains("expired") ? PaymentStatus.Expirado : PaymentStatus.Recusado,
            "expired" => PaymentStatus.Expirado,
            "canceled" or "cancelled" => detail.Contains("expired") ? PaymentStatus.Expirado : PaymentStatus.Cancelado,
            "refunded" or "charged_back" => PaymentStatus.Estornado,
            _ => PaymentStatus.Pendente,
        };
    }

    /// <summary>Mensagem amigável para o cliente quando o cartão é recusado.</summary>
    public static string RejectionMessage(string? detail)
    {
        var d = (detail ?? "").ToLowerInvariant();

        if (d.Contains("insufficient_amount"))
            return "Saldo ou limite insuficiente no cartão. Tente outro cartão ou pague com PIX.";
        if (d.Contains("bad_filled") || d.Contains("invalid_card") || d.Contains("security_code"))
            return "Algum dado do cartão está incorreto. Confira número, validade e código de segurança.";
        if (d.Contains("call_for_authorize"))
            return "O banco pediu autorização. Ligue para o banco para liberar a compra ou use outro cartão.";
        if (d.Contains("card_disabled"))
            return "Este cartão está desativado. Ative com o banco ou use outro cartão.";
        if (d.Contains("max_attempts"))
            return "Limite de tentativas atingido para este cartão. Use outro cartão ou pague com PIX.";
        if (d.Contains("installments"))
            return "Este cartão não aceita o número de parcelas escolhido. Escolha outra opção.";
        if (d.Contains("duplicated"))
            return "Este pagamento parece duplicado. Confira em Meus pedidos antes de tentar de novo.";
        if (d.Contains("high_risk") || d.Contains("blacklist") || d.Contains("fraud"))
            return "Pagamento recusado pela análise de segurança. Tente outro cartão ou pague com PIX.";
        if (d.Contains("by_issuer") || d.Contains("by_bank"))
            return "O banco emissor recusou o pagamento. Fale com o banco ou use outro cartão.";

        return "O pagamento não foi aprovado. Tente outro cartão ou pague com PIX.";
    }

    /// <summary>Converte uma duração em horas para ISO 8601 (ex.: 24 → "PT24H", 0.5 → "PT30M").</summary>
    public static string ToIsoDuration(double hours)
    {
        var minutes = (int)Math.Round(Math.Clamp(hours, 0.5, 24 * 30) * 60);
        return minutes % 60 == 0 ? $"PT{minutes / 60}H" : $"PT{minutes}M";
    }
}
