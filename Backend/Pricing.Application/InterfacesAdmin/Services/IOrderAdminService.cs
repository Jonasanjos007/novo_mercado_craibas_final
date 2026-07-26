using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.DTOs.Responses;
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
        Task<Result<List<Logs>>> GetAlllogs();
        Task<Result<List<Product_Category>>> GetAllCategory();
        Task<Result<bool>> PostUpdateStatusOrder(int Id_Order, string NewStatus);
    }
}
