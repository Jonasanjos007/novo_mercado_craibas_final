using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Domain.Enums;
using Baldan.Pricing.Application.Interfaces.Repositories;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Enums;
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

        public async Task InvalidateSessionsAsync(int userId, ProfileEnum role, SessionRevokeReasonEnum reason)
        {
            switch (role)
            {
                case ProfileEnum.CLIENTE:
                    await _context.User_Customer
                        .Where(x => x.Id == userId)
                        .ExecuteUpdateAsync(x => x
                            .SetProperty(y => y.TokenVersion, y => y.TokenVersion + 1)
                            .SetProperty(y => y.RefreshToken, (string?)null)
                            .SetProperty(y => y.RefreshTokenExpiresAt, (DateTime?)null));
                    break;

                case ProfileEnum.ADMIN:
                    await _context.User_Admin
                        .Where(x => x.Id == userId)
                        .ExecuteUpdateAsync(x => x
                            .SetProperty(y => y.TokenVersion, y => y.TokenVersion + 1)
                            .SetProperty(y => y.RefreshToken, (string?)null)
                            .SetProperty(y => y.RefreshTokenExpiresAt, (DateTime?)null));
                    break;

                case ProfileEnum.DELIVERY:
                    await _context.User_Delivery
                        .Where(x => x.Id == userId)
                        .ExecuteUpdateAsync(x => x
                            .SetProperty(y => y.TokenVersion, y => y.TokenVersion + 1)
                            .SetProperty(y => y.RefreshToken, (string?)null)
                            .SetProperty(y => y.RefreshTokenExpiresAt, (DateTime?)null));
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(role), role, null);
            }

            // Encerra todas as sessões (todos os dispositivos) guardando o motivo
            var now = DateTime.UtcNow;

            await _context.UserSessions
                .Where(x => x.UserId == userId
                         && x.Role == role
                         && x.RevokedAt == null)
                .ExecuteUpdateAsync(x => x
                    .SetProperty(y => y.RevokedAt, now)
                    .SetProperty(y => y.RevokedReason, (SessionRevokeReasonEnum?)reason)
                    .SetProperty(y => y.UpdateDate, now));
        }

        // ───────────── Sessões por dispositivo (UserSessions) ─────────────

        public async Task<UserResponse?> GetUserByIdAsync(int userId, ProfileEnum role)
        {
            switch (role)
            {
                case ProfileEnum.CLIENTE:
                    var customer = await _context.User_Customer
                        .AsNoTracking()
                        .FirstOrDefaultAsync(x => x.Id == userId);

                    return customer is null ? null : MapUser(customer);

                case ProfileEnum.ADMIN:
                    var admin = await _context.User_Admin
                        .AsNoTracking()
                        .FirstOrDefaultAsync(x => x.Id == userId);

                    return admin is null ? null : MapUser(admin);

                case ProfileEnum.DELIVERY:
                    var delivery = await _context.User_Delivery
                        .AsNoTracking()
                        .FirstOrDefaultAsync(x => x.Id == userId);

                    return delivery is null ? null : MapUser(delivery);

                default:
                    return null;
            }
        }

        public async Task<int> CreateSessionAsync(UserSession session)
        {
            _context.UserSessions.Add(session);

            await _context.SaveChangesAsync();

            return session.Id;
        }

        public async Task<UserSession?> GetSessionByTokenHashAsync(string refreshTokenHash)
        {
            return await _context.UserSessions
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.RefreshTokenHash == refreshTokenHash);
        }

        public async Task UpdateSessionTokenAsync(
            int sessionId,
            string newRefreshTokenHash,
            DateTime expiresAt,
            string? ipAddress)
        {
            var now = DateTime.UtcNow;

            await _context.UserSessions
                .Where(x => x.Id == sessionId)
                .ExecuteUpdateAsync(x => x
                    .SetProperty(y => y.RefreshTokenHash, newRefreshTokenHash)
                    .SetProperty(y => y.ExpiresAt, expiresAt)
                    .SetProperty(y => y.LastUsedAt, now)
                    .SetProperty(y => y.UpdateDate, now)
                    .SetProperty(y => y.IpAddress, ipAddress));
        }

        public async Task DeleteSessionByTokenHashAsync(string refreshTokenHash)
        {
            await _context.UserSessions
                .Where(x => x.RefreshTokenHash == refreshTokenHash)
                .ExecuteDeleteAsync();
        }

        public async Task DeleteSessionByIdAsync(int sessionId)
        {
            await _context.UserSessions
                .Where(x => x.Id == sessionId)
                .ExecuteDeleteAsync();
        }

        public async Task<List<UserSession>> GetActiveSessionsAsync(int userId, ProfileEnum role)
        {
            var now = DateTime.UtcNow;

            return await _context.UserSessions
                .AsNoTracking()
                .Where(x => x.UserId == userId
                         && x.Role == role
                         && x.RevokedAt == null
                         && x.ExpiresAt > now)
                .OrderByDescending(x => x.LastUsedAt)
                .ToListAsync();
        }

        public async Task<bool> RevokeUserSessionAsync(int userId, ProfileEnum role, int sessionId)
        {
            var now = DateTime.UtcNow;

            // Filtra também pelo usuário: ninguém encerra sessão de outra pessoa
            var revoked = await _context.UserSessions
                .Where(x => x.Id == sessionId
                         && x.UserId == userId
                         && x.Role == role
                         && x.RevokedAt == null)
                .ExecuteUpdateAsync(x => x
                    .SetProperty(y => y.RevokedAt, now)
                    .SetProperty(y => y.RevokedReason, (SessionRevokeReasonEnum?)SessionRevokeReasonEnum.DeviceRemoved)
                    .SetProperty(y => y.UpdateDate, now));

            return revoked > 0;
        }

        public async Task<int> RevokeOtherUserSessionsAsync(int userId, ProfileEnum role, int currentSessionId)
        {
            var now = DateTime.UtcNow;

            return await _context.UserSessions
                .Where(x => x.UserId == userId
                         && x.Role == role
                         && x.Id != currentSessionId
                         && x.RevokedAt == null)
                .ExecuteUpdateAsync(x => x
                    .SetProperty(y => y.RevokedAt, now)
                    .SetProperty(y => y.RevokedReason, (SessionRevokeReasonEnum?)SessionRevokeReasonEnum.DeviceRemoved)
                    .SetProperty(y => y.UpdateDate, now));
        }

        public async Task DeleteExpiredSessionsAsync(int userId, ProfileEnum role)
        {
            var now = DateTime.UtcNow;

            await _context.UserSessions
                .Where(x => x.UserId == userId
                         && x.Role == role
                         && x.ExpiresAt <= now)
                .ExecuteDeleteAsync();
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
                RefreshTokenExpiresAt = user.RefreshTokenExpiresAt,
                Isdelete = user.Isdelete ?? false,
                TokenVersion = user.TokenVersion
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
                RefreshTokenExpiresAt = user.RefreshTokenExpiresAt,
                Isdelete = user.Isdelete ?? false,
                TokenVersion = user.TokenVersion
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
                RefreshTokenExpiresAt = user.RefreshTokenExpiresAt,
                Isdelete = user.Isdelete ?? false,
                TokenVersion = user.TokenVersion
            };
        }
    }

}
