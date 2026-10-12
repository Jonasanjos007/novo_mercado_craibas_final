using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;

namespace Mercado.Craibas.Application.Interfaces.Services
{
    /// <summary>
    /// Portal do entregador. O id sempre vem do token.
    /// </summary>
    public interface IDeliveryService
    {
        /// <summary>Pedidos atribuídos a ele (preparando e em rota).</summary>
        Task<Result<List<DeliveryOrderResponse>>> GetMyOrdersAsync(int deliveryId);

        /// <summary>PREPARANDO → SAIU_PARA_ENTREGA.</summary>
        Task<Result<bool>> DispatchAsync(int deliveryId, int orderId);

        /// <summary>SAIU_PARA_ENTREGA → ENTREGUE (com o nome de quem recebeu).</summary>
        Task<Result<bool>> DeliverAsync(int deliveryId, int orderId, DeliverOrderRequest request);

        /// <summary>Entregas concluídas.</summary>
        Task<Result<List<DeliveryOrderResponse>>> GetHistoryAsync(int deliveryId);

        /// <summary>Ganhos (vazio se a gorjeta estiver desligada).</summary>
        Task<Result<DeliveryEarningsResponse>> GetEarningsAsync(int deliveryId);

        Task<Result<DeliveryProfileResponse>> GetProfileAsync(int deliveryId);
    }
}
