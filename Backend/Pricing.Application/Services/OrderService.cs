using Backend.Services.Interfaces;
using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Domain.Enums;
using Baldan.Pricing.Application.Interfaces;
using Baldan.Pricing.Application.Models.Enums;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces;
using Mercado.Craibas.Application.Interfaces.Repositories;
using Mercado.Craibas.Application.Interfaces.Services;
using Microsoft.EntityFrameworkCore;
using Pricing.Api.DTOs.Requests;
using Pricing.Api.DTOs.Responses;
namespace Mercado.Craibas.Application.Services;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _email;
    private readonly INotificationService _notification;

  
    public OrderService(IUnitOfWork unitOfWork, IEmailService email, INotificationService notification)
    {
        _unitOfWork = unitOfWork;
        _email = email;
        _notification = notification;
    }
    public async Task<Result<bool>> PostSaveOrder(int userId, OrderSaveRequest Order)
    {
        if (userId == 0 || userId == null)
        {
            return Result<bool>.Failure(Error.Failure("Pedido", "Erro ao salvar o pedido. Sua sessão expirou. Faça login novamente."));
        }
        try
        {
            
            if(Order.Id_Cupom is not null)
            {
                var cupom = await _unitOfWork.GetClassByIdAnyType<Cupom, int?>(Order.Id_Cupom, "Id");

                if (cupom == null)
                    return Result<bool>.Failure(Error.Failure("Cupom", "Código inválido."));

                // Ativo
                if (!cupom.Active)
                    return Result<bool>.Failure(Error.Failure("Cupom", "Cupom inativo."));

                // Ainda não iniciou
                if (DateTime.Now < cupom.Date_Start)
                    return Result<bool>.Failure(Error.Failure("Cupom", "Este cupom ainda não iniciou."));

                // Expirado
                if (DateTime.Now > cupom.Date_End)
                    return Result<bool>.Failure(Error.Failure("Cupom", "Este cupom expirou."));

                // Quantidade total
                if (cupom.Quantity_Used >= cupom.Quantity_Uses)
                    return Result<bool>.Failure(Error.Failure("Cupom", "Cupom esgotado."));

                // Utilizações do usuário
                var couponUses = await _unitOfWork.Query<Coupon_Use>().Where(x => x.Id_Cupom == cupom.Id && x.Id_User == userId).ToListAsync();

                // Primeira compra
                if (cupom.First_Order_Only)
                {
                    var hasOrders = await _unitOfWork.Query<Orders>().AnyAsync(x => x.Id_User_Customer == userId && x.Id_Cupom == cupom.Id && x.Isdelete != true);

                    if (hasOrders)
                        return Result<bool>.Failure(Error.Failure("Cupom", "Cupom válido apenas para primeira compra."));
                }

                // Limite por usuário
                if (couponUses.Count >= cupom.Per_User_Limit)
                    return Result<bool>.Failure(Error.Failure("Cupom", "Você atingiu o limite de utilizações."));

                var cart = await _unitOfWork.GetClassById<Cart>(userId, "Id_User_Customer");

                if (cart == null)
                    return Result<bool>.Failure(Error.Failure("Carrinho", "Carrinho vazio."));

                var cartItems = await _unitOfWork.Query<Cart_Item>().Where(x => x.Id_Cart == cart.Id).Include(x => x.Product).ThenInclude(x => x.Product_Category).ToListAsync();

                if (!cartItems.Any())
                    return Result<bool>.Failure(Error.Failure("Carrinho", "Carrinho vazio."));

                var subtotal = cartItems.Sum(x => x.Quantity * x.Product.Price_Unit);

                if (subtotal < cupom.Minimum_Value)
                {
                    return Result<bool>.Failure(Error.Failure("Cupom", $"Pedido mínimo de R$ {cupom.Minimum_Value:N2}"));
                }
            }
            var random = Random.Shared.Next(1000, 9999);
            string numeroPedido = $"PED-{DateTime.Now:yyyyMMdd}-{random}";

            var OrderSave = new Orders();
            var OrderLineItens = new OrderLineItens();
            if(Order.Id_Cupom == null)
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
                    InsertDate = DateTime.Now,
                    Order_Status = "PENDENTE",
                    Isdelete = false,
                    ShippingCost = Order.ShippingCost,

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
                    Id_Cupom = Order.Id_Cupom,
                    Status_Pay = Order.Status_Pay,
                    Payment_terms = Order.Payment_terms,
                    Id_User_Customer = userId,
                    Id_Address = Order.Address.Id,
                    InsertDate = DateTime.Now,
                    Order_Status = "PENDENTE",
                    Isdelete = false,
                    Total_Value_OrderCupom = Order.Total_Value_OrderCupom,
                    ShippingCost = Order.ShippingCost,
                    Discount_Type = Order.Discount_Type,
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
                    Discont = (OrderLine.Origin_Price - OrderLine.Price_Unic) * OrderLine.Quantity,
                    Isdelete = false
                };

                InsertOrderLineItens = await _unitOfWork.InsertAsyncReturnId(OrderLineItens);

            }
                var GetCart = await _unitOfWork.GetClassAsyncWhere<Cart>(x => x.Id_User_Customer == userId && x.Isdelete != true);

            if (InsertOrderLineItens is not null && InsertOrderId is not null)
            {

                if(GetCart == null)
                {
                    return Result<bool>.Failure(Error.Failure("Carrnho", "Erro ao Esvaziar o carrinho. Entre em contato com suporte!"));
                }

                //var CartEmpty = await _unitOfWork.DeleteAllByColumnAsync<Cart_Item>( "Id_Cart", GetCart.Id);
                var CartEmpty = await _unitOfWork.UpdateFieldsAsync<Cart_Item>(filters: new Dictionary<string, object>
                   {
                         { "Id_Cart", GetCart.Id}
                   },

                   fieldsToUpdate: new Dictionary<string, object>
                   {
                            { "Isdelete", true  }
                   });
            }
            if (OrderSave.Id_Cupom is not null)
            {
                var cupom = await _unitOfWork.GetClassByIdAnyType<Cupom, int?>(Order.Id_Cupom, "Id");

                var CouponUsed = new Coupon_Use
                    {
                        Id_Cupom = OrderSave.Id_Cupom,
                        Id_User = userId,
                        InsertDate = DateTime.Now,
                        Isdelete = false,
                        Id_Order = InsertOrderId.Id,
                    };

                    await _unitOfWork.InsertAsyncReturnId(CouponUsed);

                await _unitOfWork.UpdateFieldsAsync<Cupom>(filters: new Dictionary<string, object>
                      {
                              { "Id", OrderSave.Id_Cupom }
                      },

                      fieldsToUpdate: new Dictionary<string, object>
                      {
                                 { "Quantity_Used", cupom.Quantity_Used += 1  }
                      });
                await _unitOfWork.UpdateFieldsAsync<Cart>(filters: new Dictionary<string, object>
                      {
                              { "Id_User_Customer",userId  }
                      },

                   fieldsToUpdate: new Dictionary<string, object>
                   {
                                 { "Id_Cupom", null  }
                   });
            }
            var User = await _unitOfWork.GetClassAsyncWhere<User_Customer>(x => x.Id == userId);
            var UserAdminNotify = await _unitOfWork.GetClassListAsyncWhere<User_Admin>(x => x.Isdelete != true);

            var users = UserAdminNotify.Select(x => new NotificationUserRequest
            {
                UserId = x.Id
            }).ToList();

            var InsertNotificacao = await _notification.SendNotification(new NotificationRequest
            {
                Kind = "Novo Pedido",
                Title = "Novo pedido recebido",
                Description = $"Novo pedido Nº {InsertOrderId.Number_Order} realizado por {User.Name}. Verifique os produtos e acompanhe a confirmação do pagamento.",
                Icone = "ShoppingBag",
                ActionUrl = "/admin",
                ReferenceId = InsertOrderId.Id,
                ReferenceType = "ORDER",
                Role = "ADMIN"
            },users);

            var InsertNotificacaoClient = await _notification.SendNotification(new NotificationRequest
            {
                Kind = "Pedido Pendente",
                Title = "Pedido com pagamento pendente",
                Description = $"Seu pedido Nº {InsertOrderId.Number_Order} foi realizado com sucesso e está aguardando a confirmação do pagamento. Assim que o pagamento for confirmado, você receberá uma nova atualização.",
                Icone = "Clock",
                ActionUrl = "/orders",
                ReferenceId = InsertOrderId.Id,
                ReferenceType = "PAYMENT",
                Role = "CLIENTE"
            }, new List<NotificationUserRequest>
     {
        new NotificationUserRequest
        {
            UserId = userId
        }
     });

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
            .Where(x => x.Id_User_Customer == userId && x.Isdelete != true)
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
                Id_Cupom = x.Id_Cupom,
                Total_Value_OrderCupom = x.Total_Value_OrderCupom,
                ShippingCost = x.ShippingCost,
                Discount_Type = x.Discount_Type,
                Quantity = x.OrderLineItens
                    .Where(i => i.Isdelete != true)
                    .Sum(i => i.Quantity),

                Category = x.OrderLineItens
                    .Where(i => i.Isdelete != true)
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

                Products = x.OrderLineItens
                    .Where(i => i.Isdelete != true)
                    .Select(i => new ProductResponse
                    {
                        Id = i.Product.Id,
                        Name = i.Product.Name,
                        Description = i.Product.Description,
                        Price_Unic = i.Price_Unit,
                        Origin_Price = i.Origin_Price,
                        Quantity = i.Quantity,
                        Count_Rating = i.Product.Rating,
                        Review_Count = i.Product.ReviewCount,
                        Id_category = i.Product.Id_Category,
                        Count_Sold = i.Product.CountSold,
                        Total_Stock = i.Product.Total_Stock,
                        Badge = i.Product.Badge,
                        FreeShipping = i.Product.FreeShipping,
                        Installments = i.Product.installments,
                        Tags = i.Product.Tags,
                        Featured = i.Product.Featured,

                        Imagens = i.Product.Imagens_Products
                            .Where(img => img.Isdelete != true)
                            .ToList(),

                        variations = i.Product.Variante_Products
                            .Where(v => v.Isdelete != true)
                            .ToList()

                    }).ToList()

            })
            .ToListAsync();


        foreach (var order in orderResponseList)
        {
            var fees = await _unitOfWork.GetClassAsyncWhere<BaseRates>(x => x.Isdelete != true);

            if (order.Id_Cupom == null)
                continue;

            var cupom = await _unitOfWork.GetClassAsyncWhere<Cupom>(x => x.Id == order.Id_Cupom && x.Isdelete != true);

            if (cupom == null)
                continue;

            order.CouponApplied = true;

            var couponProducts = await _unitOfWork.GetClassListAsyncWhere<Coupon_Product>(
                x => x.Id_Cupom == cupom.Id && x.Isdelete != true);

            var couponCategories = await _unitOfWork.GetClassListAsyncWhere<Coupon_Category>(
                x => x.Id_Cupom == cupom.Id && x.Isdelete != true);

            switch (cupom.Discount_Type)
            {
                case DiscountType.Percentage:

                    if (couponProducts.Any())
                    {
                        var ids = couponProducts
                            .Select(x => x.Id_Product)
                            .ToHashSet();

                        foreach (var product in order.Products)
                        {
                            if (ids.Contains(product.Id))
                            {
                                product.ValorDicont = product.Price_Unic * product.Quantity * (cupom.Discount / 100d);
                            }
                        }
                    }

                    if (couponCategories.Any())
                    {
                        var ids = couponCategories.Select(x => x.Id_Category).ToHashSet();

                        foreach (var product in order.Products)
                        {
                            if (ids.Contains(product.Id_category))
                            {
                                product.ValorDicont = product.Price_Unic * product.Quantity * (cupom.Discount / 100d);
                            }
                        }
                        order.ShippingCost = fees.ShippingCost;
                    }

                    break;

                case DiscountType.FixedValue:
                    order.Discont = cupom.Discount;
                    order.ShippingCost = fees.ShippingCost;
                    break;

                case DiscountType.FreeShipping:

                    break;
            }
        }
        return Result<List<OrderResponse>>.Success(orderResponseList);

    }
   
}
