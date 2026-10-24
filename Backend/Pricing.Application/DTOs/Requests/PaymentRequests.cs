#nullable enable
namespace Mercado.Craibas.Application.DTOs.Requests
{
    /// <summary>Gera (ou reaproveita, se ainda válido) o PIX de um pedido.</summary>
    public class CreatePixPaymentRequest
    {
        public int Id_Order { get; set; }
    }

    /// <summary>
    /// Dados que o Card Payment Brick do Mercado Pago entrega no onSubmit.
    /// O número do cartão nunca passa pelo nosso servidor: só o token.
    /// </summary>
    public class CreateCardPaymentRequest
    {
        public int Id_Order { get; set; }
        /// <summary>formData.token</summary>
        public string Token { get; set; } = "";
        /// <summary>formData.payment_method_id (bandeira: master, visa, elo...)</summary>
        public string Payment_Method_Id { get; set; } = "";
        /// <summary>additionalData.paymentTypeId: credit_card ou debit_card</summary>
        public string? Payment_Type_Id { get; set; }
        public int Installments { get; set; } = 1;
        public string? Payer_Email { get; set; }
        public string? Identification_Type { get; set; }
        public string? Identification_Number { get; set; }
        /// <summary>additionalData.lastFourDigits (só para exibição)</summary>
        public string? Last_Four_Digits { get; set; }
    }
}
