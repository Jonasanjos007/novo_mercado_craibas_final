using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;

namespace Mercado.Craibas.Application.InterfacesAdmin.Services
{
    /// <summary>
    /// Entregas no painel do admin:
    /// - "Minhas entregas": o admin entrega ele mesmo (não conta ganho).
    /// - "Deliverys": atribuir pedidos, configurar gorjeta, dar baixa e estornar.
    /// </summary>
    public interface IDeliveryServiceAdmin
    {
        // ── Minhas entregas ──
        Task<Result<List<DeliveryOrderResponse>>> GetBoardAsync(int adminId);
        Task<Result<List<DeliveryOrderResponse>>> GetMyHistoryAsync(int adminId);
        Task<Result<bool>> TakeAsync(int adminId, int orderId, TakeDeliveryOrderRequest request);
        Task<Result<bool>> ReleaseAsync(int adminId, int orderId);
        Task<Result<bool>> DispatchAsync(int adminId, int orderId);
        Task<Result<bool>> DeliverAsync(int adminId, int orderId, DeliverOrderRequest request);

        // ── Deliverys ──
        Task<Result<List<DeliveryDriverAdminResponse>>> GetDeliverersAsync();
        Task<Result<bool>> AssignAsync(int adminId, int orderId, AssignDeliveryRequest request);
        Task<Result<bool>> UnassignAsync(int adminId, int orderId);

        Task<Result<DeliverySettingsResponse>> GetSettingsAsync();
        Task<Result<DeliverySettingsResponse>> SaveSettingsAsync(int adminId, DeliverySettingsRequest request);
        Task<Result<bool>> SaveRatesAsync(int adminId, int deliveryId, DeliveryRatesRequest request);
        Task<Result<bool>> SetOrderTipAsync(int adminId, int orderId, DeliveryOrderTipRequest request);

        Task<Result<DeliveryPayablesResponse>> GetPayablesAsync(int deliveryId);
        Task<Result<DeliveryPayoutResponse>> CreatePayoutAsync(int adminId, CreateDeliveryPayoutRequest request);
        Task<Result<List<DeliveryPayoutResponse>>> GetPayoutsAsync(int? deliveryId);
        Task<Result<bool>> ReversePayoutAsync(int adminId, int payoutId, ReverseDeliveryPayoutRequest request);
    }
}
