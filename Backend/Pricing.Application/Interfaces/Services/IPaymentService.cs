using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Interfaces.Services
{
    public interface IPaymentService
    {
        PaymentConfigResponse GetConfig();
        Task<Result<OrderPaymentResponse>> GetOrderPaymentAsync(int userId, int orderId);
        Task<Result<OrderPaymentResponse>> CreatePixAsync(int userId, CreatePixPaymentRequest request);
        Task<Result<OrderPaymentResponse>> CreateCardAsync(int userId, CreateCardPaymentRequest request);
        /// <summary>Webhook do Mercado Pago (topic "order").</summary>
        Task<Result<bool>> HandleWebhookAsync(string? queryDataId, string? queryType, string? signature, string? requestId, string? rawBody);
        /// <summary>Marca como expirados os PIX vencidos (rotina em segundo plano). Devolve quantos expiraram.</summary>
        Task<int> ExpireOverduePixAsync(CancellationToken ct);
    }
}
