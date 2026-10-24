using Baldan.Pricing.Application.Domain.Entities;

namespace Mercado.Craibas.Application.Domain.Entities
{
    /// <summary>
    /// Cada tentativa de pagamento de um pedido (um PIX gerado ou um cartão enviado).
    /// Um pedido pode ter várias: PIX expirado + novo PIX, cartão recusado + outro cartão etc.
    /// O pedido só é confirmado quando uma delas é APROVADO.
    /// </summary>
    public class Payment_Transactions : EntityBase
    {
        public int Id_Order { get; set; }
        public Orders Orders { get; set; }
        public int Id_User_Customer { get; set; }

        /// <summary>Hoje sempre "MERCADO_PAGO".</summary>
        public string Provider { get; set; }
        /// <summary>PIX, CREDIT_CARD ou DEBIT_CARD.</summary>
        public string Method { get; set; }
        /// <summary>Status interno (veja PaymentStatus): PENDENTE, EM_ANALISE, APROVADO, RECUSADO, EXPIRADO, CANCELADO, ESTORNADO, ERRO.</summary>
        public string Status { get; set; }

        /// <summary>Status e detalhe exatamente como o Mercado Pago devolveu (ex.: processed / accredited).</summary>
        public string Provider_Status { get; set; }
        public string Provider_Status_Detail { get; set; }
        /// <summary>Id da order no Mercado Pago (ORD...).</summary>
        public string Provider_Order_Id { get; set; }
        /// <summary>Id do pagamento dentro da order (PAY...).</summary>
        public string Provider_Payment_Id { get; set; }
        /// <summary>external_reference enviado ao Mercado Pago (liga a order deles ao nosso pedido).</summary>
        public string External_Reference { get; set; }
        /// <summary>X-Idempotency-Key usado na criação (evita cobrança duplicada em reenvio).</summary>
        public string Idempotency_Key { get; set; }

        public decimal Amount { get; set; }
        public int? Installments { get; set; }
        public string Card_Brand { get; set; }
        public string Card_Last_Four { get; set; }

        public string Pix_Qr_Code { get; set; }
        public string Pix_Qr_Code_Base64 { get; set; }
        public string Pix_Ticket_Url { get; set; }
        public DateTime? Expires_At { get; set; }

        public DateTime? Paid_At { get; set; }
        /// <summary>Mensagem mostrada ao cliente quando recusado/erro.</summary>
        public string Error_Message { get; set; }
        /// <summary>Último JSON recebido do Mercado Pago (para conferência e suporte).</summary>
        public string Last_Response { get; set; }
        public DateTime? Last_Sync_At { get; set; }
        public DateTime? Last_Webhook_At { get; set; }
    }
}
