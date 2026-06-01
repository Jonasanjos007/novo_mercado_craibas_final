using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces.Repositories;
using Mercado.Craibas.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;
using Pricing.Api.DTOs.Requests;
using Pricing.Api.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Infrastructure.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppDbContext _context;

        public AuthRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User_Customer?> GetByEmailAsyncCustomer(string email)
        {
            try
            {
                return await _context.User_Customer
                    .FirstOrDefaultAsync(u => u.Email == email);
            }
            catch (Exception ex)
            {
                Console.WriteLine("ERRO:");
                Console.WriteLine(ex.ToString());
                throw;
            }
        }
        public async Task<User_Delivery?> GetByEmailAsyncDelivery(string email)
        {
            return await _context.User_Delivery
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }
        public async Task<User_Admin?> GetByEmailAsyncAdmin(string email)
        {
            return await _context.User_Admin
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        //public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
        //{
        //    return await _context.Users
        //        .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        //}

        public async Task UpdateRefreshTokenAsync(
                 int userId,
                string refreshToken,
                string expiresAt)
        {
            await _context.User_Admin
                .Where(u => u.Id == userId)
                .ExecuteUpdateAsync(setters =>
                    setters
                        .SetProperty(u => u.RefreshToken, refreshToken)
                        .SetProperty(u => u.RefreshTokenExpiresAt, expiresAt)
                );
        }
    }

}
