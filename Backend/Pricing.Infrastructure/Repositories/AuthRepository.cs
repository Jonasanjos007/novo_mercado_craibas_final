using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Domain.Enums;
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

        public async Task<UserResponse?> GetByRefreshTokenAsync(string refreshToken)
        {
            var customer = await _context.User_Customer
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.RefreshToken == refreshToken);

            if (customer is not null)
            {
                return MapUser(customer);
            }

            var admin = await _context.User_Admin
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.RefreshToken == refreshToken);

            if (admin is not null)
            {
                return MapUser(admin);
            }

            var delivery = await _context.User_Delivery
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.RefreshToken == refreshToken);

            if (delivery is not null)
            {
                return MapUser(delivery);
            }

            return null;
        }

        public async Task UpdateRefreshTokenAsync(
            int userId,
            ProfileEnum role,
            string refreshToken,
            DateTime expiresAt)
        {
            switch (role)
            {
                case ProfileEnum.CLIENTE:
                    await _context.User_Customer
                        .Where(x => x.Id == userId)
                        .ExecuteUpdateAsync(x => x
                            .SetProperty(y => y.RefreshToken, refreshToken)
                            .SetProperty(y => y.RefreshTokenExpiresAt, expiresAt));
                    break;

                case ProfileEnum.ADMIN:
                    await _context.User_Admin
                        .Where(x => x.Id == userId)
                        .ExecuteUpdateAsync(x => x
                            .SetProperty(y => y.RefreshToken, refreshToken)
                            .SetProperty(y => y.RefreshTokenExpiresAt, expiresAt));
                    break;

                case ProfileEnum.DELIVERY:
                    await _context.User_Delivery
                        .Where(x => x.Id == userId)
                        .ExecuteUpdateAsync(x => x
                            .SetProperty(y => y.RefreshToken, refreshToken)
                            .SetProperty(y => y.RefreshTokenExpiresAt, expiresAt));
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(role), role, null);
            }
        }

        public async Task ClearRefreshTokenAsync(string refreshToken)
        {
            await _context.User_Customer
                .Where(x => x.RefreshToken == refreshToken)
                .ExecuteUpdateAsync(x => x
                    .SetProperty(y => y.RefreshToken, (string?)null)
                    .SetProperty(y => y.RefreshTokenExpiresAt, (DateTime?)null));

            await _context.User_Admin
                .Where(x => x.RefreshToken == refreshToken)
                .ExecuteUpdateAsync(x => x
                    .SetProperty(y => y.RefreshToken, (string?)null)
                    .SetProperty(y => y.RefreshTokenExpiresAt, (DateTime?)null));

            await _context.User_Delivery
                .Where(x => x.RefreshToken == refreshToken)
                .ExecuteUpdateAsync(x => x
                    .SetProperty(y => y.RefreshToken, (string?)null)
                    .SetProperty(y => y.RefreshTokenExpiresAt, (DateTime?)null));
        }

        private static UserResponse MapUser(User_Customer user)
        {
            return new UserResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Avatar = user.Avatar ?? string.Empty,
                Role = user.Role,
                Ativo = user.Ativo,
                PasswordHash = user.PasswordHash,
                RefreshToken = user.RefreshToken ?? string.Empty,
                RefreshTokenExpiresAt = user.RefreshTokenExpiresAt
            };
        }

        private static UserResponse MapUser(User_Admin user)
        {
            return new UserResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Avatar = user.Avatar ?? string.Empty,
                Role = user.Role,
                Ativo = user.Ativo,
                PasswordHash = user.PasswordHash,
                RefreshToken = user.RefreshToken ?? string.Empty,
                RefreshTokenExpiresAt = user.RefreshTokenExpiresAt
            };
        }

        private static UserResponse MapUser(User_Delivery user)
        {
            return new UserResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Avatar = user.Avatar ?? string.Empty,
                Role = user.Role,
                Ativo = user.Ativo,
                PasswordHash = user.PasswordHash,
                RefreshToken = user.RefreshToken ?? string.Empty,
                RefreshTokenExpiresAt = user.RefreshTokenExpiresAt
            };
        }
    }

}
