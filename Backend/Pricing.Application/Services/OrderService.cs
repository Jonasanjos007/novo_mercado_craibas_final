using Backend.Services.Interfaces;
using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Domain.Enums;
using Baldan.Pricing.Application.Interfaces;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using Pricing.Api.DTOs.Requests;
using Pricing.Api.DTOs.Responses;
namespace Mercado.Craibas.Application.Services;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;

    public OrderService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
    public async Task<Result<bool>> PostSaveOrder(int userId, OrderSaveRequest Order)
    {
        if (userId == 0 || userId == null)
        {
            return Result<bool>.Failure(Error.Failure("Pedido", "Erro ao salvar o pedido. Sua sessão expirou. Faça login novamente."));
        }
        try
        {
            var random = Random.Shared.Next(1000, 9999);
            string numeroPedido = $"PED-{DateTime.Now:yyyyMMdd}-{random}";

            var OrderSave = new Orders();
            var OrderLineItens = new OrderLineItens();
            if(Order.Cupom == null)
            {
                OrderSave = new Orders
                {
                    Number_Order = numeroPedido,
                    Total_Value_Order = Order.Total_Value_Order,
                    Discont_Percentage = Order.Discont_Percentage,
                    Status_Pay = Order.Status_Pay,
                    Payment_terms = Order.Payment_terms,
                    Id_User_Customer = userId,
                    Id_Address = Order.Address.Id,
                    InsertDate = DateTime.Now
                };
            }
            else
            {
                OrderSave = new Orders
                {
                    Number_Order = numeroPedido,
                    Total_Value_Order = Order.Total_Value_Order,
                    Discont = Order.Discont,
                    Discont_Percentage = Order.Discont_Percentage,
                    Id_Cupom = Order.Cupom.Id,
                    Status_Pay = Order.Status_Pay,
                    Payment_terms = Order.Payment_terms,
                    Id_User_Customer = userId,
                    Id_Address = Order.Address.Id,
                    InsertDate = DateTime.Now
                };
            }
               

            var InsertOrderId = await _unitOfWork.InsertAsyncReturnId(OrderSave);

            if (InsertOrderId.Id == 0)
            {
                return Result<bool>.Failure(Error.Failure("Pedido", "Erro ao salvar o pedido. Entre em contato com suporte!"));
            }
            var InsertOrderLineItens = new OrderLineItens();
            foreach (var OrderLine in Order.Products)
            {

                OrderLineItens = new OrderLineItens
                {
                    Id_Order = InsertOrderId.Id,
                    Id_Product = OrderLine.Id,
                    Name_Product = OrderLine.Name,
                    Id_Variante_Product = OrderLine.Variations.Id,
                    Variante_Name = OrderLine.Variations.Name,
                    Variante_Type = OrderLine.Variations.Type,
                    Quantity = OrderLine.Quantity,
                    Total_Price = (OrderLine.Price_Unic * Order.Discont),
                    Origin_Price = OrderLine.Origin_Price,
                    Price_Unit = OrderLine.Price_Unic,
                    Discont = (OrderLine.Origin_Price - OrderLine.Price_Unic) * OrderLine.Quantity
                };

                InsertOrderLineItens = await _unitOfWork.InsertAsyncReturnId(OrderLineItens);

            }
            if(InsertOrderLineItens is not null && InsertOrderId is not null)
            {
                var GetCart = await _unitOfWork.GetClassById<Cart>(userId, "Id_User_Customer");

                if(GetCart == null)
                {
                    return Result<bool>.Failure(Error.Failure("Carrnho", "Erro ao Esvaziar o carrinho. Entre em contato com suporte!"));
                }

                var CartEmpty = await _unitOfWork.DeleteAllByColumnAsync<Cart_Item>( "Id_Cart", GetCart.Id);
            }
                return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            return Result<bool>.Failure(Error.Failure("Pedido", ex.Message));
        }
    }
    public async Task<Result<List<OrderResponse>>> GetOrderAll(int userId)
    {
        var OrderResponseList = new List<OrderResponse>();

        var orderResponseList = await _unitOfWork.Query<Orders>()
     .Where(x => x.Id_User_Customer == userId)
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
         Estimated_Delivery_Date = x.Estimated_Delivery_Date,
         Discont = x.Discont,
         Quantity = x.OrderLineItens.Sum(i => i.Quantity),
         Category = x.OrderLineItens
    .Select(i => i.Product.Product_Category.Category)
    .FirstOrDefault(),
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
         }).ToList(),

     })
     .ToListAsync();

        return Result<List<OrderResponse>>.Success(orderResponseList);

    }
}
