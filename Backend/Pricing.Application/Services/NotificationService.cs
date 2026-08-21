using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Baldan.Pricing.Application.Interfaces.Repositories;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces.Services;
using Mercado.Craibas.Application.InterfacesAdmin;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork;

        public NotificationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> SendNotification(NotificationRequest notification,List<NotificationUserRequest> notificationUsers)
        {
            if (notification == null)
            {
                return Result<bool>.Failure(Error.Failure("Notificação","Dados da notificação não informados."));
            }

            if (notificationUsers == null || !notificationUsers.Any())
            {
                return Result<bool>.Failure(Error.Failure("Notificação","Nenhum usuário informado para receber a notificação."));
            }

            try
            {
                var insertNotify = await _unitOfWork.InsertAsyncReturnId<Notification>(
                    new Notification
                    {
                        Kind = notification.Kind,
                        Title = notification.Title,
                        Description = notification.Description,
                        Icone = notification.Icone,
                        ActionUrl = notification.ActionUrl,
                        ReferenceId = notification.ReferenceId,
                        ReferenceType = notification.ReferenceType,
                        InsertDate = DateTime.Now,
                        Isdelete = false
                    }
                );

                if (insertNotify == null || insertNotify.Id <= 0)
                {
                    return Result<bool>.Failure(Error.Failure("Notificação","Não foi possível criar a notificação."));
                }

                foreach (var user in notificationUsers)
                {
                    if (user.UserId <= 0)
                        continue;

                    var insertNotifyUser = await _unitOfWork.InsertAsyncReturnId<NotificationUser>(
                            new NotificationUser
                            {
                                NotificationId = insertNotify.Id,
                                UserId = user.UserId,
                                IsRead = false,
                                ReadDate = null,
                                InsertDate = DateTime.Now,
                                Isdelete = false,
                                Role = notification.Role
                            }
                        );

                    if (insertNotifyUser == null || insertNotifyUser.Id <= 0)
                    {
                        return Result<bool>.Failure(Error.Failure("Notificação",$"Não foi possível vincular a notificação ao usuário {user.UserId}."));
                    }
                }
                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure(Error.Failure("Notificação",ex.Message));
            }
        }

        public async Task<Result<List<NotificationResponse>>> GetAllNotifications(int userId ,string Role)
        {
            if (userId <= 0)
            {
                return Result<List<NotificationResponse>>.Failure(Error.Failure("Notificação", "Id Usuário Inválido!"));
            }

            try
            {
                var notifications = await (
                    from notificationUser in _unitOfWork.Query<NotificationUser>()
                    join notification in _unitOfWork.Query<Notification>() on notificationUser.NotificationId equals notification.Id

                    where notificationUser.UserId == userId
                          && notificationUser.Isdelete == false
                          && notification.Isdelete == false
                          && notificationUser.Role == Role

                    orderby notification.InsertDate descending

                    select new NotificationResponse
                    {
                        IdNotification = notification.Id,
                        IdNotificationUser = notificationUser.Id,
                        Kind = notification.Kind,
                        Title = notification.Title,
                        Description = notification.Description,
                        Icone = notification.Icone,
                        ActionUrl = notification.ActionUrl,
                        ReferenceId = notification.ReferenceId,
                        ReferenceType = notification.ReferenceType,
                        IsRead = notificationUser.IsRead,
                        ReadDate = notificationUser.ReadDate,
                        InsertDate = notification.InsertDate,
                        UpdateDate = notification.UpdateDate,
                        Role = notificationUser.Role
                    }
                ).AsNoTracking().ToListAsync();

                return Result<List<NotificationResponse>>.Success(notifications);
            }
            catch (Exception ex)
            {
                return Result<List<NotificationResponse>>.Failure(
                    Error.Failure("Notificação", ex.Message)
                );
            }
        }
        public async Task<Result<bool>> PostNotificationRead(int notificationUserIdRead,string role)
        {
            if (notificationUserIdRead <= 0)
            {
                return Result<bool>.Failure(Error.Failure("Notificação", "Id Inválido!"));
            }
            if (string.IsNullOrWhiteSpace(role))
            {
                return Result<bool>.Failure(Error.Failure("Notificação", "Role Inválido!"));
            }
            try
            {
                var UpdateNotifyVRead = await _unitOfWork.UpdateFieldsAsync<NotificationUser>(filters: new Dictionary<string, object>
                      {
                              { "Id", notificationUserIdRead},
                              { "Role", role}
                      },

                        fieldsToUpdate: new Dictionary<string, object>
                        {
                                 { "IsRead", true  },
                                 {"ReadDate",DateTime.Now },
                                 {"UpdateDate",DateTime.Now }

                        });
                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure(Error.Failure("Notificação", ex.Message));
            }
        }
        public async Task<Result<bool>> PostAllNotificationRead(int UserId,string role)
        {
            if (UserId <= 0)
            {
                return Result<bool>.Failure(Error.Failure("Notificação", "Id Inválido!"));
            }
            if (string.IsNullOrWhiteSpace(role))
            {
                return Result<bool>.Failure(Error.Failure("Notificação", "Role Inválido!"));
            }
            try
            {
                var UpdateNotifyVRead = await _unitOfWork.UpdateFieldsAsync<NotificationUser>(filters: new Dictionary<string, object>
                      {
                              { "UserId", UserId},
                              { "Role", role},
                              { "IsRead", false}
                      },

                        fieldsToUpdate: new Dictionary<string, object>
                        {
                                 { "IsRead", true  },
                                 {"ReadDate",DateTime.Now },
                                 {"UpdateDate",DateTime.Now }

                        });
                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure(Error.Failure("Notificação", ex.Message));
            }
        }
    }
}