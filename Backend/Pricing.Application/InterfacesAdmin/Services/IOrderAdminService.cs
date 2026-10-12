using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.DTOs.Requests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.InterfacesAdmin.Services
{
    public interface IOrderAdminService
    {
        Task<Result<List<OrderResponse>>> GetOrderAllListAdmin();

        // ── Paginação (filtros aplicados no banco antes de paginar) ──
        Task<Result<PagedResult<OrderResponse>>> GetOrdersPagedAsync(int page, int pageSize, string? search, string? status);
        Task<Result<OrderStatusSummaryResponse>> GetOrdersSummaryAsync();
        Task<Result<AdminDashboardResponse>> GetDashboardAsync();
        Task<Result<PagedResult<Logs>>> GetLogsPagedAsync(int page, int pageSize, string? search, string? type, string? level, string? period);
        Task<Result<LogsSummaryResponse>> GetLogsSummaryAsync();
        Task<Result<List<Logs>>> GetLogsByUserAsync(int userId);
        Task<Result<List<Logs>>> GetAlllogs();
        Task<Result<List<Product_Category>>> GetAllCategory();
        Task<Result<bool>> PostUpdateStatusOrder(int Id_Order, string NewStatus,int IdUser, string? WhoReceivedIt);
        Task<Result<SendMessageViaWhatsAppResponse>> NotifyViaWhatsAppUpdateEnviado(int IdOrders, int Id_User);

    }
}
