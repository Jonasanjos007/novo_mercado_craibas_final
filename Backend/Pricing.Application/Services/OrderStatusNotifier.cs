using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.Interfaces;
using Mercado.Craibas.Application.Interfaces.Services;

namespace Mercado.Craibas.Application.Services
{
    public class OrderStatusNotifier : IOrderStatusNotifier
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _email;
        private readonly INotificationService _notification;

        public OrderStatusNotifier(IUnitOfWork unitOfWork, IEmailService email, INotificationService notification)
        {
            _unitOfWork = unitOfWork;
            _email = email;
            _notification = notification;
        }

        public async Task<bool> NotifyCustomerAsync(int orderId, string newStatus, string? whoReceivedIt, DateTime changedAt)
        {
            var order = await _unitOfWork.GetClassAsyncWhere<Orders>(x => x.Id == orderId);

            if (order?.Id_User_Customer == null)
                return false;

            var customer = await _unitOfWork.GetClassAsyncWhere<User_Customer>(x => x.Id == order.Id_User_Customer);

            if (customer == null)
                return false;

            var layoutEmail = _email.EmailPedidoLayout(titulo: "Atualização do seu pedido", subtitulo: "Temos novidades sobre sua compra.", status: newStatus,
                  conteudoHtml: $@"
                      <p style='margin:0;'>
                          Olá, <strong>{customer.Name}</strong>!
                      </p>
                      <p style='margin:14px 0 0 0;'>Pedido<strong style='color:#f97316;'>#{order.Id}</strong></p>
                     <p style='margin:8px 0 0 0;'>Total:<strong>R$ {order.Total_Value_Order.ToString("N2", new System.Globalization.CultureInfo("pt-BR"))}</strong></p>
                  ",
                   textoBotao: "Acompanhar pedido",
                   linkBotao: $"https://mavihstudio.com.br/pedidos/orders",
                    whoReceivedIt: whoReceivedIt, customerDeliveryDate: changedAt);

            var enviado = await _email.EnviarEmailAsync(customer.Email, "Mercado Craibas", layoutEmail);

            string mensagemNotificacao = newStatus switch
            {
                "CONFIRMADO" =>
                    $"Seu pedido Nº {order.Number_Order} foi confirmado e já está sendo processado.",

                "PREPARANDO" =>
                    $"Seu pedido Nº {order.Number_Order} está sendo preparado. Em breve teremos novas atualizações!",

                "SAIU_PARA_ENTREGA" =>
                    $"Seu pedido Nº {order.Number_Order} saiu para entrega e está a caminho do endereço informado.",

                "ENTREGUE" =>
                    $"Seu pedido Nº {order.Number_Order} foi entregue. Esperamos que você aproveite sua compra!",

                "CANCELADO" =>
                    $"Seu pedido Nº {order.Number_Order} foi cancelado. Consulte os detalhes do pedido para mais informações.",

                _ =>
                    $"O status do seu pedido Nº {order.Number_Order} foi atualizado."
            };

            string iconeNotificacao = newStatus switch
            {
                "CONFIRMADO" => "CircleCheck",
                "PREPARANDO" => "Package",
                "SAIU_PARA_ENTREGA" => "Truck",
                "ENTREGUE" => "PackageCheck",
                "CANCELADO" => "CircleX",
                _ => "Bell"
            };

            await _notification.SendNotification(
                new NotificationRequest
                {
                    Kind = "Novo status",
                    Title = newStatus == "ENTREGUE" ? "Pedido Entregue" : "Pedido atualizado",
                    Description = mensagemNotificacao,
                    Icone = iconeNotificacao,
                    ActionUrl = "/orders",
                    ReferenceId = order.Id,
                    ReferenceType = newStatus == "ENTREGUE" ? "DELIVERY" : "ORDER",
                    Role = "CLIENTE"
                },
                new List<NotificationUserRequest>
                {
                    new NotificationUserRequest
                    {
                        UserId = customer.Id
                    }
                }
            );

            return enviado;
        }
    }
}
