
using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;

namespace Backend.Services.Interfaces;

public interface IOrderService
{
    Task<Result<bool>> PostSaveOrder(int userId, OrderSaveRequest Order);
    Task<Result<List<OrderResponse>>> GetOrderAll(int userId);
    Task<Result<bool>> PostUpdateAssessment(int userId, ProductReviewrequest review);
    Task<Result<RatingResponse>> GetAssessment(int userId, int IdProduct, int IdOrder);

}
