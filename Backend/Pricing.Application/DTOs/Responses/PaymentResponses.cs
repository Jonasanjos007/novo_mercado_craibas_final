#nullable enable
namespace Mercado.Craibas.Application.DTOs.Responses
{
    /// <summary>O que o front precisa para montar o pagamento (nunca inclui o Access Token).</summary>
    public class PaymentConfigResponse
    {
        public bool Enabled { get; set; }
        public string PublicKey { get; set; } = "";
        public double PixExpirationHours { get; set; }
        public double PixDiscountPercent { get; set; }
        public int MaxInstallments { get; set; }
    }

    /// <summary>Uma tentativa de pagamento, no formato da tela.</summary>
    public class PaymentTransactionResponse
    {
        public int Id { get; set; }
        /// <summary>PIX, CREDIT_CARD ou DEBIT_CARD</summary>
        public string Method { get; set; } = "";
        /// <summary>PENDENTE, EM_ANALISE, APROVADO, RECUSADO, EXPIRADO, CANCELADO, ESTORNADO, ERRO</summary>
        public string Status { get; set; } = "";
        public string? Status_Detail { get; set; }
        public string? Message { get; set; }
        public decimal Amount { get; set; }
        public int? Installments { get; set; }
        public string? Card_Brand { get; set; }
        public string? Card_Last_Four { get; set; }
        public string? Pix_Qr_Code { get; set; }
        public string? Pix_Qr_Code_Base64 { get; set; }
        public string? Pix_Ticket_Url { get; set; }
        public DateTime? Expires_At { get; set; }
        public DateTime? Paid_At { get; set; }
        public DateTime InsertDate { get; set; }
    }

    /// <summary>Situação do pagamento de um pedido (o front consulta enquanto espera o PIX).</summary>
    public class OrderPaymentResponse
    {
        public int Id_Order { get; set; }
        public string Number_Order { get; set; } = "";
        public string Status_Pay { get; set; } = "";
        public string Order_Status { get; set; } = "";
        public string Payment_Terms { get; set; } = "";
        /// <summary>Total do pedido (sem desconto do PIX).</summary>
        public double Total_Value_Order { get; set; }
        /// <summary>Quanto será cobrado no PIX (com o desconto configurado).</summary>
        public decimal Pix_Amount { get; set; }
        /// <summary>Quanto será cobrado no cartão.</summary>
        public decimal Card_Amount { get; set; }
        /// <summary>true = ainda pode pagar (pedido pendente, não cancelado).</summary>
        public bool Can_Pay { get; set; }
        /// <summary>Tentativa mais recente (a que a tela mostra).</summary>
        public PaymentTransactionResponse? Current { get; set; }
        /// <summary>Hora do servidor, para a contagem regressiva do PIX não depender do relógio do cliente.</summary>
        public DateTime Server_Time { get; set; }
    }

    /// <summary>Retorno do PostSaveOrder: o front segue direto para o pagamento.</summary>
    public class OrderCreatedResponse
    {
        public int Id_Order { get; set; }
        public string Number_Order { get; set; } = "";
        public double Total_Value_Order { get; set; }
        public string Payment_Terms { get; set; } = "";
    }
}
