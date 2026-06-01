using Baldan.Pricing.Application.Commons;
using Pricing.Api.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Interfaces.Services
{
    public interface IProductService
    {
        Task<Result<UserResponse>> GetProductList();
    }
}
