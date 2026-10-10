using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Domain.Enums;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Enums;
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

        Task<UserResponse?> GetByRefreshTokenAsync(string refreshToken);

        Task UpdateRefreshTokenAsync(int userId, ProfileEnum role, string refreshToken, DateTime expiresAt);

        Task ClearRefreshTokenAsync(string refreshToken);

        /// <summary>
        /// Derruba todas as sessões do usuário em todos os dispositivos:
        /// incrementa o TokenVersion (+1) e encerra todas as sessões
        /// guardando o motivo (para cada dispositivo ver a mensagem certa).
        /// </summary>
        Task InvalidateSessionsAsync(int userId, ProfileEnum role, SessionRevokeReasonEnum reason);

        // ───────────── Sessões por dispositivo (UserSessions) ─────────────

        /// <summary>Busca o usuário pelo Id e perfil (usado no refresh).</summary>
        Task<UserResponse?> GetUserByIdAsync(int userId, ProfileEnum role);

        /// <summary>Cria a sessão de um novo login e retorna o Id gerado.</summary>
        Task<int> CreateSessionAsync(UserSession session);

        /// <summary>Busca a sessão pelo hash do Refresh Token.</summary>
        Task<UserSession?> GetSessionByTokenHashAsync(string refreshTokenHash);

        /// <summary>Rotaciona o Refresh Token somente desta sessão.</summary>
        Task UpdateSessionTokenAsync(int sessionId, string newRefreshTokenHash, DateTime expiresAt, string? ipAddress);

        /// <summary>Remove a sessão pelo hash do Refresh Token (logout).</summary>
        Task DeleteSessionByTokenHashAsync(string refreshTokenHash);

        /// <summary>Remove a sessão pelo Id.</summary>
        Task DeleteSessionByIdAsync(int sessionId);

        /// <summary>Lista as sessões válidas do usuário.</summary>
        Task<List<UserSession>> GetActiveSessionsAsync(int userId, ProfileEnum role);

        /// <summary>Encerra uma sessão do usuário (dispositivo removido). Retorna false se não existir.</summary>
        Task<bool> RevokeUserSessionAsync(int userId, ProfileEnum role, int sessionId);

        /// <summary>Encerra todas as sessões do usuário, menos a atual. Retorna quantas foram encerradas.</summary>
        Task<int> RevokeOtherUserSessionsAsync(int userId, ProfileEnum role, int currentSessionId);

        /// <summary>Remove as sessões vencidas do usuário (limpeza).</summary>
        Task DeleteExpiredSessionsAsync(int userId, ProfileEnum role);
    }
}
