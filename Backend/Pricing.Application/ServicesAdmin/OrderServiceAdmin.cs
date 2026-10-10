using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces;
using Mercado.Craibas.Application.Interfaces.Repositories;
using Mercado.Craibas.Application.Interfaces.Services;
using Mercado.Craibas.Application.InterfacesAdmin;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.EntityFrameworkCore;
using Pricing.Api.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.ServicesAdmin
{
    public class OrderServiceAdmin : IOrderAdminService
    {
        private readonly IUnitOfWorkAdmin _unitOfWorkAdmin;
        private readonly IEmailService _email;
        private readonly INotificationService _notification;


        public OrderServiceAdmin(IUnitOfWorkAdmin unitOfWorkAdmin,IEmailService email, INotificationService notification)
        {
            _unitOfWorkAdmin = unitOfWorkAdmin;
            _email = email;
            _notification = notification;
        }

        public async Task<Result<List<OrderResponse>>> GetOrderAllListAdmin()
        {
            var OrderResponseList = new List<OrderResponse>();

            var orderResponseList = await _unitOfWorkAdmin.Query<Orders>()
         .OrderByDescending(x => x.InsertDate)
         .Select(x => new OrderResponse
         {
             Id_Order = x.Id,
             Number_Order = x.Number_Order,
             Total_Value_Order = x.Total_Value_Order,
             Status_Pay = x.Status_Pay,
             Order_Status = x.Order_Status,
             Payment_terms = x.Payment_terms,
             InsertDate = x.InsertDate,
             NotifyViaWhatsApp = x.NotifyViaWhatsApp,
             Estimated_Delivery_Date = x.Estimated_Delivery_Date,
             Discont = x.Discont,
             Quantity = x.OrderLineItens.Sum(i => i.Quantity),
             Category = x.OrderLineItens.Select(i => i.Product.Product_Category.Category).FirstOrDefault(),
             WhoReceivedIt = x.WhoReceivedIt,
             CustomerDeliveryDate = x.CustomerDeliveryDate,
             Address = new AddressResponse
             {
                 Id = x.Address.Id,
                 Name = x.Address.Name,
                 Road = x.Address.Road,
                 Number = x.Address.Number,
                 Neighborhood = x.Address.Neighborhood,
                 Supplement = x.Address.Supplement,
                 ReferencePoint = x.Address.ReferencePoint,
                 Standard = x.Address.Standard,
                 City = x.Address.City
             },

             Products = x.OrderLineItens.Select(i => new ProductResponse
             {
                 Id = i.Product.Id,
                 Name = i.Product.Name,
                 Description = i.Product.Description,
                 Price_Unic = i.Price_Unit,
                 Origin_Price = i.Origin_Price,
                 Quantity = i.Quantity,
                 Count_Rating = i.Product.Rating,
                 Review_Count = i.Product.ReviewCount,
                 Count_Sold = i.Product.CountSold,
                 Total_Stock = i.Product.Total_Stock,
                 Badge = i.Product.Badge,
                 FreeShipping = i.Product.FreeShipping,
                 Installments = i.Product.installments,
                 Tags = i.Product.Tags,
                 Featured = i.Product.Featured,
                 Imagens = i.Product.Imagens_Products.ToList(),
                 variations = i.Product.Variante_Products.ToList()
             }).ToList()
         }).ToListAsync();

            return Result<List<OrderResponse>>.Success(orderResponseList);

        }

        public async Task<Result<List<Logs>>> GetAlllogs()
        {
            var logs = await _unitOfWorkAdmin.GetClassListAsyncWhere<Logs>(x => x.InsertDate >= DateTime.Now.AddMonths(-6));

            if (logs == null)
            {
                return Result<List<Logs>>.Failure(Error.Failure("Logs", "Erro ao Carregar Logs!"));
            }

            return Result<List<Logs>>.Success(logs);
        }
       public async Task<Result<List<Product_Category>>> GetAllCategory()
        {
            var Categorys = await _unitOfWorkAdmin.GetClassListAsyncWhere<Product_Category>(x => x.Isdelete != true && x.Ativo == true);

            if (Categorys == null)
            {
                return Result<List<Product_Category>>.Failure(Error.Failure("Categorys", "Erro ao Carregar Categorys!"));
            }

           return Result<List<Product_Category>>.Success(Categorys);
       }

        public async Task<Result<bool>> PostUpdateStatusOrder(int Id_Order,string NewStatus,int IdUser, string? WhoReceivedIt)
        {

            var Order = await _unitOfWorkAdmin.GetClassAsyncWhere<Orders>(x => x.Id == Id_Order);

            if (Order == null)
            {
                return Result<bool>.Failure(Error.Failure("Pedido", "Pedido não encontrado!"));
            }

            var statusAnterior = Order.Order_Status;
            var dataEntregaAnterior = Order.CustomerDeliveryDate;

            var User = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == IdUser);

            if (User == null)
            {
                return Result<bool>.Failure(Error.Failure("Usuário", "Administrador não encontrado!"));
            }


            var newdate = DateTime.Now;
            var UserConsumer = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Customer>(x => x.Id == Order.Id_User_Customer);
            bool Update_StatusOrder;
            if (NewStatus == "ENTREGUE" && WhoReceivedIt is not null)
            {
                 Update_StatusOrder = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Orders>(filters: new Dictionary<string, object>
                        {
                                { "Id", Id_Order }
                        },

                    fieldsToUpdate: new Dictionary<string, object>
                    {
                             {"Order_Status",NewStatus },
                             {"NotifyViaWhatsApp",true },
                             {"UpdateDate",newdate },
                             {"WhoReceivedIt" , WhoReceivedIt },
                             {"CustomerDeliveryDate" , newdate }
                     });
            }
            else
            {
                 Update_StatusOrder = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Orders>(filters: new Dictionary<string, object>
                        {
                                { "Id", Id_Order }
                        },

                      fieldsToUpdate: new Dictionary<string, object>
                      {
                             {"Order_Status",NewStatus },
                             {"NotifyViaWhatsApp",true },
                             {"UpdateDate",newdate }

                       });
            }
            

            if (Update_StatusOrder == null)
            {
                return Result<bool>.Failure(Error.Failure("Status", "Erro ao atualizar status!"));
            }



            var alteracoes = new List<string>();

            if (statusAnterior != NewStatus)
            {
                alteracoes.Add(
                    $"Status: '{statusAnterior}' → '{NewStatus}'\n"
                );
            }

            if (NewStatus == "ENTREGUE" && WhoReceivedIt is not null)
            {
      
                    alteracoes.Add(
                        $"Recebido por: → {WhoReceivedIt}\n"
                    );
                

                alteracoes.Add(
                    $"Data da entrega: {newdate:dd/MM/yyyy HH:mm:ss}\n"
                );
            }

            await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(
                    new Logs
                    {
                        Id_User = IdUser,
                        Log =
                            $"O administrador {User.Name} atualizou o status do pedido N°:{Order.Number_Order} (ID: {Order.Id}). \n" +
                            $"Status anterior: '{statusAnterior}' | Novo status: '{NewStatus}'  \n" +
                            $"Cliente: {UserConsumer?.Name ?? "Não identificado"} | ID Cliente: {UserConsumer?.Id} | \n" +
                            $"Data/Hora: {newdate:dd/MM/yyyy HH:mm:ss} | \n" +
                            $"Alterações: " +
                            $"{(alteracoes.Count > 0
                                ? string.Join(" | ", alteracoes)
                                : "Nenhuma alteração identificada.")}",
                   
                        Tipo = "Atualizar status",
                        Nivel = "Admin",
                        Acao = "Atualizou o status do pedido",
                        Info =$"{User.Name} atualizou o pedido #{Order.Number_Order} " + $"de '{statusAnterior}' para '{NewStatus}' " + $"em {newdate:dd/MM/yyyy HH:mm}.",
                        InsertDate = newdate
                    });

            var layoutEmail = _email.EmailPedidoLayout(titulo: "Atualização do seu pedido", subtitulo: "Temos novidades sobre sua compra.", status: NewStatus,
                  conteudoHtml: $@"
                      <p style='margin:0;'>
                          Olá, <strong>{UserConsumer.Name}</strong>!
                      </p>
                      <p style='margin:14px 0 0 0;'>Pedido<strong style='color:#f97316;'>#{Order.Id}</strong></p>
                     <p style='margin:8px 0 0 0;'>Total:<strong>R$ {Order.Total_Value_Order.ToString("N2", new System.Globalization.CultureInfo("pt-BR"))}</strong></p>
                  ",
                   textoBotao: "Acompanhar pedido",
                   linkBotao: $"https://mavihstudio.com.br/pedidos/orders",
                    whoReceivedIt : WhoReceivedIt,customerDeliveryDate: newdate);

            var enviado = await _email.EnviarEmailAsync(UserConsumer.Email, "Mercado Craibas", layoutEmail);

            string mensagemNotificacao = NewStatus switch
            {
                "CONFIRMADO" =>
                    $"Seu pedido Nº {Order.Number_Order} foi confirmado e já está sendo processado.",

                "PREPARANDO" =>
                    $"Seu pedido Nº {Order.Number_Order} está sendo preparado. Em breve teremos novas atualizações!",

                "SAIU_PARA_ENTREGA" =>
                    $"Seu pedido Nº {Order.Number_Order} saiu para entrega e está a caminho do endereço informado.",

                "ENTREGUE" =>
                    $"Seu pedido Nº {Order.Number_Order} foi entregue. Esperamos que você aproveite sua compra!",

                "CANCELADO" =>
                    $"Seu pedido Nº {Order.Number_Order} foi cancelado. Consulte os detalhes do pedido para mais informações.",

                _ =>
                    $"O status do seu pedido Nº {Order.Number_Order} foi atualizado."
            };


            string iconeNotificacao = NewStatus.ToString() switch
            {
                "CONFIRMADO" => "CircleCheck",
                "PREPARANDO" => "Package",
                "SAIU_PARA_ENTREGA" => "Truck",
                "ENTREGUE" => "PackageCheck",
                "CANCELADO" => "CircleX",
                _ => "Bell"
            };

            var InsertNotificacao = await _notification.SendNotification(
                      new NotificationRequest
                      {
                          Kind = "Novo status",
                          Title = NewStatus == "ENTREGUE" ? "Pedido Entregue" : "Pedido atualizado",
                          Description = mensagemNotificacao,
                          Icone = iconeNotificacao,
                          ActionUrl = "/orders",
                          ReferenceId = Order.Id,
                          ReferenceType = NewStatus == "ENTREGUE" ? "DELIVERY" : "ORDER",
                          Role = "CLIENTE"
                      },
                      new List<NotificationUserRequest>
                      {
                         new NotificationUserRequest
                         {
                             UserId = UserConsumer.Id
                         }
                      }
                  );

            if (!enviado)
            {
                return Result<bool>.Failure(Error.Failure("Enviar Email", "Não foi possível enviar o e-mail ao cliente. Verifique se o endereço de e-mail informado está correto e tente novamente!"));
            }


            return Result<bool>.Success(true);
        }
        public async Task<Result<SendMessageViaWhatsAppResponse>> NotifyViaWhatsAppUpdateEnviado(int IdOrders,int Id_User)
        {
            var order = await _unitOfWorkAdmin.GetClassAsyncWhere<Orders>(x => x.Id == IdOrders && x.Isdelete != true);

            var user = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == Id_User && x.Isdelete != true);

            var userConsumer = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Customer>(x => x.Id == order.Id_User_Customer && x.Isdelete != true);

            if (!order.NotifyViaWhatsApp)
            {
                return Result<SendMessageViaWhatsAppResponse>.Failure(Error.Failure("Envio Via WhatsApp","Não tem nenhum status pendente a ser avisado!"));
            }

            var dataLog = DateTime.Now;

            var updateNotifyViaWhatsApp =
                await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Orders>(
                    filters: new Dictionary<string, object>
                    {
                { "Id", order.Id }
                    },

                    fieldsToUpdate: new Dictionary<string, object>
                    {
                { "NotifyViaWhatsApp", false },
                { "UpdateDate", dataLog }
                    }
                );

            if (!updateNotifyViaWhatsApp)
            {
                return Result<SendMessageViaWhatsAppResponse>.Failure(Error.Failure("Pedido","Pedido Não Encontrado!"));
            }

            if (user != null)
            {
                await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(
                    new Logs
                    {
                        Id_User = user.Id,
                        Log =
                            $"O administrador {user.Name} avisou o cliente sobre a atualização do status do pedido.\n" +
                            $"Pedido: #{order.Number_Order} (ID: {order.Id})\n" +
                            $"Status informado: '{order.Order_Status}'\n" +
                            $"Cliente: {userConsumer?.Name ?? "Não identificado"}\n" +
                            $"Telefone: {userConsumer?.Phone ?? "Não informado"}\n" +
                            $"Data/Hora: {dataLog:dd/MM/yyyy HH:mm:ss}",
                        Tipo = "AVISOU O CLIENTE VIA WHATSAPP",
                        Nivel = "Admin",
                        Acao = "Avisou o cliente via WhatsApp",
                        Info =
                            $"{user.Name} avisou o cliente sobre o status do pedido " +
                            $"#{order.Number_Order} via WhatsApp " +
                            $"em {dataLog:dd/MM/yyyy HH:mm}.",
                        InsertDate = dataLog
                    }
                );
            }

            return Result<SendMessageViaWhatsAppResponse>.Success(
                new SendMessageViaWhatsAppResponse
                {
                    IdOrder = order.Id,
                    Status = order.Order_Status,
                    Number_Order = order.Number_Order,
                    Telefone = userConsumer.Phone,
                    NomeCliente = userConsumer.Name
                }
            );
        }
    }
}
