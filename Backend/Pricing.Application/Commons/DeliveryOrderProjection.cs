using Baldan.Pricing.Application.Domain.Entities;
using Mercado.Craibas.Application.DTOs.Responses;

namespace Baldan.Pricing.Application.Commons;

/// <summary>
/// Monta o pedido do portal de entregas direto na consulta (uma ida ao banco).
/// Só leva o que o entregador precisa: endereço, contato, itens e pagamento.
/// </summary>
public static class DeliveryOrderProjection
{
    public static IQueryable<DeliveryOrderResponse> Project(IQueryable<Orders> query)
    {
        return query.Select(x => new DeliveryOrderResponse
        {
            Id = x.Id,
            Number_Order = x.Number_Order,
            Order_Status = x.Order_Status,
            Payment_terms = x.Payment_terms,
            Status_Pay = x.Status_Pay,
            Total_Value_Order = x.Total_Value_Order,
            ShippingCost = x.ShippingCost,
            Quantity = x.OrderLineItens.Sum(i => i.Quantity),

            InsertDate = x.InsertDate,
            Estimated_Delivery_Date = x.Estimated_Delivery_Date,
            AssignedAt = x.Delivery_AssignedAt,
            DispatchedAt = x.Delivery_DispatchedAt,
            DeliveredAt = x.CustomerDeliveryDate,
            WhoReceivedIt = x.WhoReceivedIt,

            CustomerName = x.Address.Name ?? x.User_Customer.Name,
            CustomerPhone = x.Address.Phone ?? x.User_Customer.Phone,

            Address = new AddressResponse
            {
                Id = x.Address.Id,
                Name = x.Address.Name,
                Phone = x.Address.Phone,
                Road = x.Address.Road,
                Number = x.Address.Number,
                Neighborhood = x.Address.Neighborhood,
                Supplement = x.Address.Supplement,
                ReferencePoint = x.Address.ReferencePoint,
                City = x.Address.City,
                State = x.Address.State
            },

            Items = x.OrderLineItens
                .Select(i => new DeliveryOrderItemResponse
                {
                    Name = i.Name_Product,
                    Variation = i.Variante_Value,
                    Quantity = i.Quantity
                })
                .ToList(),

            AssigneeType = x.Id_User_Delivery != null
                ? "DELIVERY"
                : (x.Id_User_Admin_Delivery != null ? "ADMIN" : "NONE"),

            AssigneeId = x.Id_User_Delivery ?? x.Id_User_Admin_Delivery,

            AssigneeName = x.User_Delivery != null
                ? x.User_Delivery.Name
                : (x.User_Admin_Delivery != null ? x.User_Admin_Delivery.Name : null)
        });
    }
}
