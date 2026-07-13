using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Pricing.Api.DTOs.Requests;
using Pricing.Api.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Interfaces.Repositories
{
    public interface IAuthRepository
    {
        Task<User_Customer?> GetByEmailAsyncCustomer(string email);

        Task<User_Admin?> GetByEmailAsyncAdmin(string email);

        Task<User_Delivery?> GetByEmailAsyncDelivery(string email);

        Task<User_Customer?> GetByRefreshTokenAsync(string refreshToken);

        Task UpdateRefreshTokenAsync(int userId,string refreshToken,DateTime expiresAt);
    }
}
