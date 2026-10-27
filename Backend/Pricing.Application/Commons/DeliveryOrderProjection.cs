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
                : (x.User_Admin_Delivery != null ? x.User_Admin_Delivery.Name : null),

            Kind = "ENTREGA",
            CancelRequested = x.Cancel_Status == "SOLICITADO"
        });
    }

    /// <summary>
    /// Coleta da devolução no mesmo formato da entrega, para o quadro e o app do entregador.
    /// O status vira PREPARANDO (buscar) / SAIU_PARA_ENTREGA (a caminho) / ENTREGUE (coletado),
    /// e Kind = COLETA diz para a tela usar os textos de coleta.
    /// </summary>
    public static IQueryable<DeliveryOrderResponse> ProjectPickups(IQueryable<Orders> query)
    {
        return query.Select(x => new DeliveryOrderResponse
        {
            Id = x.Id,
            Number_Order = x.Number_Order,
            Order_Status = x.Return_Status == "AGUARDANDO_COLETA"
                ? "PREPARANDO"
                : (x.Return_Status == "EM_COLETA" ? "SAIU_PARA_ENTREGA" : "ENTREGUE"),
            Payment_terms = x.Payment_terms,
            Status_Pay = x.Status_Pay,
            Total_Value_Order = x.Total_Value_Order,
            ShippingCost = x.ShippingCost,
            Quantity = x.OrderLineItens.Sum(i => i.Quantity),

            InsertDate = x.Return_Requested_At ?? x.InsertDate,
            AssignedAt = x.Return_AssignedAt,
            DispatchedAt = x.Return_DispatchedAt,
            DeliveredAt = x.Return_CollectedAt,
            WhoReceivedIt = x.Return_WhoHanded,

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

            AssigneeType = x.Return_Id_User_Delivery != null
                ? "DELIVERY"
                : (x.Return_Id_User_Admin_Delivery != null ? "ADMIN" : "NONE"),

            AssigneeId = x.Return_Id_User_Delivery ?? x.Return_Id_User_Admin_Delivery,

            AssigneeName = x.Return_User_Delivery != null
                ? x.Return_User_Delivery.Name
                : (x.Return_User_Admin_Delivery != null ? x.Return_User_Admin_Delivery.Name : null),

            Kind = "COLETA",
            ReturnReason = x.Return_Reason
        });
    }

    /// <summary>Coletas em aberto (aguardando ou a caminho).</summary>
    public static IQueryable<Orders> OpenPickups(IQueryable<Orders> query) =>
        query.Where(x => x.Isdelete != true
                         && (x.Return_Status == "AGUARDANDO_COLETA" || x.Return_Status == "EM_COLETA"));

    /// <summary>Coletas já feitas (produto buscado).</summary>
    public static IQueryable<Orders> CollectedPickups(IQueryable<Orders> query) =>
        query.Where(x => x.Isdelete != true
                         && x.Return_CollectedAt != null
                         && (x.Return_Status == "COLETADO" || x.Return_Status == "DEVOLVIDO"));
}
