using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Interfaces.Services
{
    public interface INotificationService
    {
        Task<Result<bool>> SendNotification(NotificationRequest notification, List<NotificationUserRequest> notificationUsers);
        Task<Result<List<NotificationResponse>>> GetAllNotifications(int userId, string Role);
        Task<Result<bool>> PostNotificationRead(int notificationUserIdRead, string role);
        Task<Result<bool>> PostAllNotificationRead(int UserId, string role);
    }
}
