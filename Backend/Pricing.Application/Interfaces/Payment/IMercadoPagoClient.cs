using Mercado.Craibas.Application.Payments;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Interfaces.Payment
{
    public interface IMercadoPagoClient
    {
        Task<MpApiResult> CreateOrderAsync(MpCreateOrderRequest request, string idempotencyKey, CancellationToken ct = default);
        Task<MpApiResult> GetOrderAsync(string orderId, CancellationToken ct = default);
        Task<MpApiResult> CancelOrderAsync(string orderId, string idempotencyKey, CancellationToken ct = default);
        /// <summary>Estorno total do pagamento (POST /v1/orders/{id}/refund com corpo vazio).</summary>
        Task<MpApiResult> RefundOrderAsync(string orderId, string idempotencyKey, CancellationToken ct = default);
    }
}
