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
using Mercado.Craibas.Application.InterfacesAdmin;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Pricing.Api.DTOs.Requests;
using Pricing.Api.DTOs.Responses;
using System;
namespace Mercado.Craibas.Application.Services;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _email;
    private readonly INotificationService _notification;
    private readonly IConfiguration _configuration;
    private readonly IProductService _productService;



    public OrderService(IUnitOfWork unitOfWork, IEmailService email, INotificationService notification, IConfiguration configuration, IProductService productService)
    {
        _unitOfWork = unitOfWork;
        _email = email;
        _notification = notification;
        _configuration = configuration;
        _productService = productService;
    }
    private string GetImagesFolder(string subPasta)
    {
        var pastaBase = _configuration["Storage:ImagesPath"];

        if (string.IsNullOrWhiteSpace(pastaBase))
        {
            throw new Exception(
                "O caminho Storage:ImagesPath não foi configurado."
            );
        }

        if (string.IsNullOrWhiteSpace(subPasta))
        {
            throw new Exception(
                "A subpasta da imagem não foi informada."
            );
        }

        var nomeSeguro = Path.GetFileName(subPasta);

        var pastaDestino = Path.Combine(
            pastaBase,
            nomeSeguro
        );

        Directory.CreateDirectory(pastaDestino);

        return pastaDestino;
    }
    public async Task<Result<OrderCreatedResponse>> PostSaveOrder(int userId, OrderSaveRequest Order)
    {
        if (userId == 0 || userId == null)
        {
            return Result<OrderCreatedResponse>.Failure(Error.Failure("Pedido", "Erro ao salvar o pedido. Sua sessão expirou. Faça login novamente."));
        }
        try
        {
            // Segurança: tudo que define o que é cobrado e entregue vem do carrinho do servidor
            // (itens, quantidades, preços, cupom e frete). Da tela usamos só a forma de pagamento
            // e o endereço (que precisa ser do próprio cliente).
            if (Order == null)
                return Result<OrderCreatedResponse>.Failure(Error.Validation("Pedido", "Dados do pedido não informados."));

            var serverCart = await _productService.GetProductCartList(userId);
            if (!serverCart.IsSuccess || serverCart.Value == null || serverCart.Value.CartItensProduct.Count == 0)
                return Result<OrderCreatedResponse>.Failure(Error.Validation("Carrinho", "Carrinho vazio."));

            Order.Id_Cupom = serverCart.Value.Id_Cupom;

            if(Order.Id_Cupom is not null)
            {
                var cupom = await _unitOfWork.GetClassByIdAnyType<Cupom, int?>(Order.Id_Cupom, "Id");

                if (cupom == null)
                    return Result<OrderCreatedResponse>.Failure(Error.Failure("Cupom", "Código inválido."));

                // Ativo
                if (!cupom.Active)
                    return Result<OrderCreatedResponse>.Failure(Error.Failure("Cupom", "Cupom inativo."));

                // Ainda não iniciou
                if (DateTime.Now < cupom.Date_Start)
                    return Result<OrderCreatedResponse>.Failure(Error.Failure("Cupom", "Este cupom ainda não iniciou."));

                // Expirado
                if (DateTime.Now > cupom.Date_End)
                    return Result<OrderCreatedResponse>.Failure(Error.Failure("Cupom", "Este cupom expirou."));

                // Quantidade total
                if (cupom.Quantity_Used >= cupom.Quantity_Uses)
                    return Result<OrderCreatedResponse>.Failure(Error.Failure("Cupom", "Cupom esgotado."));

                // Utilizações do usuário
                var couponUses = await _unitOfWork.Query<Coupon_Use>().Where(x => x.Id_Cupom == cupom.Id && x.Id_User == userId).ToListAsync();

                // Primeira compra
                if (cupom.First_Order_Only)
                {
                    // Primeira compra = o cliente não tem outro pedido (cancelados não contam).
                    var hasOrders = await _unitOfWork.Query<Orders>().AnyAsync(x => x.Id_User_Customer == userId && x.Isdelete != true && x.Order_Status != "CANCELADO");

                    if (hasOrders)
                        return Result<OrderCreatedResponse>.Failure(Error.Failure("Cupom", "Cupom válido apenas para primeira compra."));
                }

                // Limite por usuário
                if (couponUses.Count >= cupom.Per_User_Limit)
                    return Result<OrderCreatedResponse>.Failure(Error.Failure("Cupom", "Você atingiu o limite de utilizações."));

                var cart = await _unitOfWork.GetClassById<Cart>(userId, "Id_User_Customer");

                if (cart == null)
                    return Result<OrderCreatedResponse>.Failure(Error.Failure("Carrinho", "Carrinho vazio."));

                var cartItems = await _unitOfWork.Query<Cart_Item>().Where(x => x.Id_Cart == cart.Id).Include(x => x.Product).ThenInclude(x => x.Product_Category).ToListAsync();

                if (!cartItems.Any())
                    return Result<OrderCreatedResponse>.Failure(Error.Failure("Carrinho", "Carrinho vazio."));

                var subtotal = cartItems.Sum(x => x.Quantity * x.Product.Price_Unit);

                if (subtotal < cupom.Minimum_Value)
                {
                    return Result<OrderCreatedResponse>.Failure(Error.Failure("Cupom", $"Pedido mínimo de R$ {cupom.Minimum_Value:N2}"));
                }
            }
            // Pagamento: valor e forma conferidos no servidor.
            // O total cobrado vem do carrinho calculado aqui (preços do banco, cupom e frete),
            // o mesmo cálculo que a tela mostra. Se o valor enviado for diferente, o pedido é recusado.
            var paymentTerms = (Order.Payment_terms ?? "").Trim().ToLowerInvariant();
            if (paymentTerms != "pix" && paymentTerms != "credit")
                return Result<OrderCreatedResponse>.Failure(Error.Validation("Pagamento", "Escolha PIX ou cartão para continuar."));

            if (Order.Address == null || Order.Address.Id <= 0)
                return Result<OrderCreatedResponse>.Failure(Error.Validation("Pedido", "Escolha o endereço de entrega."));

            if (Order.Products == null || Order.Products.Count == 0)
                return Result<OrderCreatedResponse>.Failure(Error.Validation("Carrinho", "Carrinho vazio."));

            // Endereço precisa ser do próprio cliente.
            var addressId = Order.Address.Id;
            var ownAddress = await _unitOfWork.GetClassAsyncWhere<Address>(x => x.Id == addressId && x.Id_User_Customer == userId && x.Isdelete != true);
            if (ownAddress == null)
                return Result<OrderCreatedResponse>.Failure(Error.Validation("Pedido", "Endereço de entrega inválido. Escolha um dos seus endereços."));

            // Quantidades do carrinho precisam ser válidas (nada de zero ou negativo).
            if (serverCart.Value.CartItensProduct.Any(x => x.Quantity < 1 || x.Quantity > 999 || x.Product == null || x.SelectedVariation == null))
                return Result<OrderCreatedResponse>.Failure(Error.Validation("Carrinho", "Há um item inválido no carrinho. Remova e adicione o produto novamente."));

            if (serverCart.Value.ErroCupom == true)
                return Result<OrderCreatedResponse>.Failure(Error.Validation("Cupom", string.IsNullOrWhiteSpace(serverCart.Value.Menssege) ? "O cupom aplicado não é mais válido. Revise o pedido." : serverCart.Value.Menssege));

            var serverTotal = Math.Round(serverCart.Value.SubTotal ?? 0, 2, MidpointRounding.AwayFromZero);
            var serverQuantity = serverCart.Value.CartItensProduct.Sum(x => x.Quantity);
            var clientQuantity = Order.Products.Sum(x => x.Quantity);

            if (serverTotal <= 0
                || Math.Abs(serverTotal - Math.Round(Order.Total_Value_Order, 2, MidpointRounding.AwayFromZero)) > 0.01
                || serverQuantity != clientQuantity)
            {
                return Result<OrderCreatedResponse>.Failure(Error.Validation("Pedido",
                    $"Os valores do seu carrinho foram atualizados (preço, frete ou cupom). O total correto é R$ {serverTotal.ToString("N2", new System.Globalization.CultureInfo("pt-BR"))}. Revise o pedido e confirme novamente."));
            }

            Order.Total_Value_Order = serverTotal;
            Order.ShippingCost = serverCart.Value.ShippingCost;
            // Mesmos cálculos que a tela fazia, agora com os valores do servidor.
            Order.Discont = (serverCart.Value.Total ?? 0) - ((serverCart.Value.SubTotal ?? 0) - (serverCart.Value.ShippingCost ?? 0));
            Order.Discont_Percentage = serverCart.Value.Discount ?? 0;
            Order.Total_Value_OrderCupom = serverCart.Value.Total;
            Order.Discount_Type = serverCart.Value.Discount_Type ?? "";

            // Cupom: reserva 1 uso de forma atômica (dois pedidos ao mesmo tempo não passam do limite).
            if (Order.Id_Cupom is not null)
            {
                var cupomId = Order.Id_Cupom;
                var reserved = await _unitOfWork.Query<Cupom>()
                    .Where(c => c.Id == cupomId && (c.Quantity_Uses == null || (c.Quantity_Used ?? 0) < c.Quantity_Uses))
                    .ExecuteUpdateAsync(s => s.SetProperty(c => c.Quantity_Used, c => (c.Quantity_Used ?? 0) + 1));
                if (reserved == 0)
                    return Result<OrderCreatedResponse>.Failure(Error.Validation("Cupom", "Cupom esgotado."));
            }
            Order.Payment_terms = paymentTerms;
            Order.Status_Pay = "PENDENTE";

            // Número do pedido sem repetir no mesmo dia (antes dois pedidos podiam sair com o mesmo número).
            string numeroPedido = "";
            for (var tentativa = 0; tentativa < 20; tentativa++)
            {
                var random = Random.Shared.Next(1000, 10000);
                numeroPedido = $"PED-{DateTime.Now:yyyyMMdd}-{random}";
                if (!await _unitOfWork.Query<Orders>().AnyAsync(x => x.Number_Order == numeroPedido))
                    break;
                if (tentativa == 19)
                    numeroPedido = $"PED-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";
            }

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
                return Result<OrderCreatedResponse>.Failure(Error.Failure("Pedido", "Erro ao salvar o pedido. Entre em contato com suporte!"));
            }
            var InsertOrderLineItens = new OrderLineItens();
            // Segurança: itens gravados a partir do carrinho do servidor (antes vinham da tela).
            foreach (var CartLine in serverCart.Value.CartItensProduct)
            {
                var priceUnic = CartLine.Product.Price_Unic ?? 0;
                var originPrice = CartLine.Product.Origin_Price ?? 0;

                OrderLineItens = new OrderLineItens
                {
                    Id_Order = InsertOrderId.Id,
                    Id_Product = CartLine.Product.Id,
                    Name_Product = CartLine.Product.Name,
                    Id_Variante_Product = CartLine.SelectedVariation.Id,
                    Variante_Name = CartLine.SelectedVariation.Name,
                    Variante_Type = CartLine.SelectedVariation.Type,
                    Quantity = CartLine.Quantity,
                    Total_Price = (priceUnic * Order.Discont),
                    Origin_Price = originPrice,
                    Price_Unit = priceUnic,
                    Evaluated = false,
                    Discont = (originPrice - priceUnic) * CartLine.Quantity,
                    Isdelete = false
                };

                InsertOrderLineItens = await _unitOfWork.InsertAsyncReturnId(OrderLineItens);

            }
                var GetCart = await _unitOfWork.GetClassAsyncWhere<Cart>(x => x.Id_User_Customer == userId && x.Isdelete != true);

            if (InsertOrderLineItens is not null && InsertOrderId is not null)
            {

                if(GetCart == null)
                {
                    return Result<OrderCreatedResponse>.Failure(Error.Failure("Carrnho", "Erro ao Esvaziar o carrinho. Entre em contato com suporte!"));
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

                // (o uso do cupom já foi reservado de forma atômica antes de criar o pedido)
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
            var UserAdminNotify = await _unitOfWork.GetClassListAsyncWhere<User_Admin>(x => x.Isdelete != true && x.Ativo == true);

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

            return Result<OrderCreatedResponse>.Success(new OrderCreatedResponse
            {
                Id_Order = InsertOrderId.Id,
                Number_Order = InsertOrderId.Number_Order,
                Total_Value_Order = InsertOrderId.Total_Value_Order,
                Payment_Terms = InsertOrderId.Payment_terms,
            });
        }
        catch (Exception ex)
        {
            // Segurança: o detalhe técnico fica só no log do servidor.
            Console.WriteLine($"ERRO PostSaveOrder (usuário {userId}): {ex}");
            return Result<OrderCreatedResponse>.Failure(Error.Failure("Pedido", "Não foi possível salvar o pedido agora. Tente novamente em instantes."));
        }
    }
    public async Task<Result<List<OrderResponse>>> GetOrderAll(int userId)
    {
        var OrderResponseList = new List<OrderResponse>();
        var orderResponseList = await _unitOfWork.Query<Orders>()
            .Where(x => x.Id_User_Customer == userId && x.Isdelete != true)
            .OrderByDescending(x => x.InsertDate)
            // Uma consulta por lista (itens, imagens, variações) em vez de uma consulta gigante
            // que repete o pedido para cada combinação (deixava "Meus Pedidos" lento).
            .AsSplitQuery()
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
                WhoReceivedIt = x.WhoReceivedIt,
                CustomerDeliveryDate = x.CustomerDeliveryDate,
                Cancel_Reason = x.Cancel_Reason,
                Canceled_At = x.Canceled_At,
                Canceled_By = x.Canceled_By,
                Return_Status = x.Return_Status,
                Return_Reason = x.Return_Reason,
                Return_Requested_At = x.Return_Requested_At,
                Return_Admin_Note = x.Return_Admin_Note,
                Return_Deadline = x.Order_Status == "ENTREGUE"
                    ? (x.CustomerDeliveryDate ?? x.UpdateDate ?? x.InsertDate).AddDays(7)
                    : (DateTime?)null,
                Cancel_Status = x.Cancel_Status,
                Cancel_Requested_At = x.Cancel_Requested_At,
                Cancel_Admin_Note = x.Cancel_Admin_Note,
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
                        Evaluated = i.Evaluated,
                        Imagens = i.Product.Imagens_Products
                            .Where(img => img.Isdelete != true)
                            .ToList(),

                        variations = i.Product.Variante_Products
                            .Where(v => v.Isdelete != true)
                            .ToList()

                    }).ToList()

            })
            .ToListAsync();


        // Taxas da loja: busca uma vez só (antes era uma consulta por pedido).
        var fees = orderResponseList.Any(o => o.Id_Cupom != null)
            ? await _unitOfWork.GetClassAsyncWhere<BaseRates>(x => x.Isdelete != true)
            : null;

        foreach (var order in orderResponseList)
        {

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
                        order.ShippingCost = fees?.ShippingCost ?? order.ShippingCost;
                    }

                    break;

                case DiscountType.FixedValue:
                    order.Discont = cupom.Discount;
                    order.ShippingCost = fees?.ShippingCost ?? order.ShippingCost;
                    break;

                case DiscountType.FreeShipping:

                    break;
            }
        }
        return Result<List<OrderResponse>>.Success(orderResponseList);

    }

    public async Task<Result<bool>> PostUpdateAssessment(int userId,ProductReviewrequest review)
    {
        try
        {
            if (userId <= 0)
            {
                return Result<bool>.Failure(Error.Failure("Avaliação", "Usuário inválido."));
            }

            if (review == null)
            {
                return Result<bool>.Failure(Error.Failure("Avaliação", "Avaliação inválida."));
            }

            if (review.Rating < 1 || review.Rating > 5)
            {
                return Result<bool>.Failure(Error.Failure("Avaliação","A avaliação deve ser entre 1 e 5."));
            }

            var order = await _unitOfWork.Query<Orders>().FirstOrDefaultAsync(x =>x.Id == review.OrderId && x.Id_User_Customer == userId && x.Isdelete != true);

            if (order == null)
            {
                return Result<bool>.Failure(Error.Failure("Avaliação","Pedido não encontrado."));
            }

            var orderItem = await _unitOfWork.Query<OrderLineItens>().FirstOrDefaultAsync(x =>x.Id_Order == review.OrderId &&x.Id_Product == review.ProductId &&x.Isdelete != true);

            if (orderItem == null)
            {
                return Result<bool>.Failure(Error.Failure("Avaliação","Produto não encontrado neste pedido."));
            }

            // Só avalia produto de pedido entregue (a tela já mostra o botão só nesse caso).
            if (!string.Equals(order.Order_Status, "ENTREGUE", StringComparison.OrdinalIgnoreCase))
            {
                return Result<bool>.Failure(Error.Failure("Avaliação","Você pode avaliar depois que o pedido for entregue."));
            }

            // Produto em devolução (ou devolvido) não pode ser avaliado.
            if (OrderReturnStatus.BlocksReview(order.Return_Status))
            {
                return Result<bool>.Failure(Error.Failure("Avaliação","Este pedido está em devolução, então os produtos não podem ser avaliados."));
            }

            if (orderItem.Evaluated)
            {
                return Result<bool>.Failure(Error.Failure("Avaliação","Este produto já foi avaliado."));
            }

            var nomesArquivos = new List<string>();

            if (review.Media != null && review.Media.Any())
            {
                var pastaDestino = GetImagesFolder("Avaliacoes");

                var extensoesPermitidas = new[]
                { ".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mov", ".webm"};

                foreach (var arquivo in review.Media)
                {
                    if (arquivo == null || arquivo.Length == 0)
                        continue;

                    var extensao = Path.GetExtension(arquivo.FileName).ToLowerInvariant();

                    if (!extensoesPermitidas.Contains(extensao))
                    {
                        return Result<bool>.Failure(Error.Failure("Avaliação",$"Formato {extensao} não permitido."));
                    }

                    var nomeArquivo = $"{Guid.NewGuid()}{extensao}";

                    var caminhoCompleto = Path.Combine(pastaDestino,nomeArquivo);

                    using var stream = new FileStream(caminhoCompleto,FileMode.Create);

                    await arquivo.CopyToAsync(stream);

                    nomesArquivos.Add(nomeArquivo);
                }
            }

            // Salva somente os nomes separados por ;
            var mediaBanco = nomesArquivos.Any()? string.Join(";", nomesArquivos): null;

            var rating = new Rating
            {
                Id_Product = review.ProductId,
                Id_Order = review.OrderId,
                Id_User_Customer = userId, 
                Ranting = review.Rating,
                Comment = review.Comment,
                Media = mediaBanco,
                Recommend = review.Recommend,
                InsertDate = DateTime.Now,
                Isdelete = false
            };

            var ratingInsert =await _unitOfWork.InsertAsyncReturnId(rating);

            if (ratingInsert == null || ratingInsert.Id <= 0)
            {
                return Result<bool>.Failure(Error.Failure("Avaliação","Erro ao salvar avaliação."));
            }

            await _unitOfWork.UpdateFieldsAsync<OrderLineItens>(
                filters: new Dictionary<string, object>
                {
                { "Id_Order", review.OrderId },
                { "Id_Product", review.ProductId }
                },
                fieldsToUpdate: new Dictionary<string, object>
                {
                { "Evaluated", true }
                }
            );
            var user = await _unitOfWork.GetClassAsyncWhere<User_Customer>(x => x.Id == userId && x.Isdelete != true && x.Ativo == true);
            var userAdmin = await _unitOfWork.GetClassListAsyncWhere<User_Admin>(x => x.Isdelete != true && x.Ativo == true);

            var Product = await _unitOfWork.GetClassAsyncWhere<Product>(x => x.Id == review.ProductId && x.Isdelete != true);

            var ProductRanting = await _unitOfWork.GetClassListAsyncWhere<Rating>(x => x.Id_Product == review.ProductId && x.Isdelete != true);
            var Countranting = ProductRanting.Count > 0 ? (double)ProductRanting.Sum(x => x.Ranting) / ProductRanting.Count : 5;

            await _unitOfWork.UpdateFieldsAsync<Product>(
               filters: new Dictionary<string, object>
               {
                { "Id", Product.Id },
               },
               fieldsToUpdate: new Dictionary<string, object>
               {
                { "ReviewCount", Product.ReviewCount += 1 },
                { "Rating", Countranting }

               }
           );
            await _unitOfWork.InsertAsyncReturnId<Logs>(new Logs
            {
                Id_User = userId,
                Log = $"{user.Name} Avaliou Produto Comentario:{review.Comment}",
                Tipo = "Avaliação Produto",
                Nivel = "CLIENTE",
                Acao = $"O Cliente {user.Name} Avaliou o Produto {Product.Name} com {review.Rating} Estrelas.",
                Info = $"{user.Name} avaliou Produto {Product.Name} em {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
                InsertDate = DateTime.Now
            });



            await _notification.SendNotification(
                new NotificationRequest
                {
                    Kind = "Avaliação Produto",
                    Title = "Obrigado pela sua avaliação!",
                    Description = $"Obrigado por avaliar {Product.Name}! Sua opinião ajuda outros clientes e nos ajuda a melhorar cada vez mais.",
                    Icone = "Star",
                    ActionUrl = "/orders",
                    ReferenceId = review.ProductId,
                    ReferenceType = "ASSESSMENT",
                    Role = "CLIENTE"
                },
                new List<NotificationUserRequest>
                {
                   new NotificationUserRequest
                   {
                       UserId = userId
                   }
                           });

            var users = userAdmin.Select(x => new NotificationUserRequest
            {
                UserId = x.Id
            }).ToList();

            await _notification.SendNotification(new NotificationRequest
         {
             Kind = "Nova Avaliação",
             Title = "Nova avaliação de produto",
             Description = $"{user.Name} avaliou o produto {Product.Name} do pedido Nº {order.Number_Order}. Confira a avaliação e verifique se ela está de acordo com as regras da plataforma.",
             Icone = "Star",
             ActionUrl = "/admin",
             ReferenceId = Product.Id,
             ReferenceType = "ASSESSMENT",
             Role = "ADMIN"
         },users);

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            return Result<bool>.Failure(Error.Failure("Avaliação", "Não foi possível salvar a avaliação. Tente novamente."));
        }
    }
    public async Task<Result<bool>> PostUpdateEditeAssessment(int userId,ProductReviewEditerequest review)
    {
        try
        {
            if (userId <= 0)
            {
                return Result<bool>.Failure(Error.Failure("Avaliação", "Usuário inválido."));
            }

            if (review == null)
            {
                return Result<bool>.Failure(Error.Failure("Avaliação", "Avaliação inválida."));
            }

            if (review.Rating < 1 || review.Rating > 5)
            {
                return Result<bool>.Failure(Error.Failure("Avaliação", "A avaliação deve ser entre 1 e 5."));
            }

            // ==========================================
            // 1. LOCALIZA O ITEM DO PEDIDO
            // ==========================================

            var orderItem = await _unitOfWork.Query<OrderLineItens>().FirstOrDefaultAsync(x =>x.Id_Order == review.OrderId && x.Id_Product == review.ProductId && x.Isdelete != true);

            if (orderItem == null)
            {
                return Result<bool>.Failure(Error.Failure("Avaliação","Produto não encontrado neste pedido."));
            }

            // Produto em devolução (ou devolvido) não pode ter a avaliação alterada.
            var returnStatus = await _unitOfWork.Query<Orders>().Where(x => x.Id == review.OrderId).Select(x => x.Return_Status).FirstOrDefaultAsync();
            if (OrderReturnStatus.BlocksReview(returnStatus))
            {
                return Result<bool>.Failure(Error.Failure("Avaliação","Este pedido está em devolução, então os produtos não podem ser avaliados."));
            }

            // ==========================================
            // 2. BUSCA A AVALIAÇÃO EXISTENTE
            // ==========================================

            var rating = await _unitOfWork.Query<Rating>().FirstOrDefaultAsync(x =>x.Id_Order == review.OrderId &&x.Id_Product == review.ProductId &&x.Id_User_Customer == userId &&x.Isdelete != true);

            if (rating == null)
            {
                return Result<bool>.Failure(Error.Failure("Avaliação","Avaliação não encontrada."));
            }

            // ==========================================
            // 3. MÍDIAS ANTIGAS
            // ==========================================

            var pastaDestino = GetImagesFolder("Avaliacoes");

            var extensoesPermitidas = new[]
            {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".mp4",
            ".mov",
            ".webm"
        };

            var midiasAntigas = string.IsNullOrWhiteSpace(rating.Media)
                ? new List<string>()
                : rating.Media
                    .Split(';', StringSplitOptions.RemoveEmptyEntries)
                    .ToList();

            // ==========================================
            // 4. MÍDIAS QUE O USUÁRIO MANTEVE
            // ==========================================

            var midiasMantidas = string.IsNullOrWhiteSpace(review.MediaEdite)
                ? new List<string>()
                : review.MediaEdite
                    .Split(';', StringSplitOptions.RemoveEmptyEntries)
                    .Select(x => Path.GetFileName(x.Trim()))
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    // Segurança: só pode manter arquivos que já eram desta avaliação
                    // (impede apontar/apagar mídia de avaliações de outras pessoas).
                    .Where(x => midiasAntigas.Contains(x, StringComparer.OrdinalIgnoreCase))
                    .ToList();

            // ==========================================
            // 5. REMOVE FISICAMENTE AS MÍDIAS EXCLUÍDAS
            // ==========================================

            var midiasRemovidas = midiasAntigas
                .Except(midiasMantidas, StringComparer.OrdinalIgnoreCase)
                .ToList();

            foreach (var nomeArquivo in midiasRemovidas)
            {
                var caminhoArquivo = Path.Combine(
                    pastaDestino,
                    nomeArquivo);

                if (File.Exists(caminhoArquivo))
                {
                    File.Delete(caminhoArquivo);
                }
            }

            // ==========================================
            // 6. SALVA NOVAS MÍDIAS
            // ==========================================

            var novasMidias = new List<string>();

            if (review.Media != null && review.Media.Any())
            {
                foreach (var arquivo in review.Media)
                {
                    if (arquivo == null || arquivo.Length == 0)
                        continue;

                    var extensao = Path
                        .GetExtension(arquivo.FileName)
                        .ToLowerInvariant();

                    if (!extensoesPermitidas.Contains(extensao))
                    {
                        return Result<bool>.Failure(Error.Failure("Avaliação",$"Formato {extensao} não permitido."));
                    }

                    var nomeArquivo = $"{Guid.NewGuid()}{extensao}";

                    var caminhoCompleto = Path.Combine(
                        pastaDestino,
                        nomeArquivo);

                    using var stream = new FileStream(
                        caminhoCompleto,
                        FileMode.Create);

                    await arquivo.CopyToAsync(stream);

                    novasMidias.Add(nomeArquivo);
                }
            }

            // ==========================================
            // 7. JUNTA MÍDIAS ANTIGAS + NOVAS
            // ==========================================

            var todasMidias = midiasMantidas
                .Concat(novasMidias)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            // ==========================================
            // 8. ATUALIZA A AVALIAÇÃO EXISTENTE
            // ==========================================

            //rating.Ranting = review.Rating;
            //rating.Comment = review.Comment;
            //rating.Recommend = review.Recommend;
            //rating.Media = todasMidias.Any()
            //    ? string.Join(";", todasMidias)
            //    : null;

            var teste = todasMidias.Any()
                ? string.Join(";", todasMidias)
                : null;
            await _unitOfWork.UpdateFieldsAsync<Rating>(
                filters: new Dictionary<string, object>
                {
                { "Id", rating.Id }
                },
                fieldsToUpdate: new Dictionary<string, object>
                {
                { "Id_Product",rating.Id_Product },
                { "Id_Order",rating.Id_Order },
                { "Ranting",review.Rating },
                { "Comment",review.Comment },
                { "Media",todasMidias.Any() ? string.Join(";", todasMidias) : null },
                { "Recommend",review.Recommend },
                { "UpdateDate",DateTime.Now },
                }
            );

            // ==========================================
            // 9. GARANTE QUE O PEDIDO CONTINUE AVALIADO
            // ==========================================

            await _unitOfWork.UpdateFieldsAsync<OrderLineItens>(
                filters: new Dictionary<string, object>
                {
                { "Id_Order", review.OrderId },
                { "Id_Product", review.ProductId }
                },
                fieldsToUpdate: new Dictionary<string, object>
                {
                { "Evaluated", true }
                }
            );

            // ==========================================
            // 10. RECALCULA MÉDIA DO PRODUTO
            // ==========================================

            var product = await _unitOfWork.GetClassAsyncWhere<Product>(x => x.Id == review.ProductId && x.Isdelete != true);

            if (product == null)
            {
                return Result<bool>.Failure(Error.Failure("Avaliação","Produto não encontrado."));
            }

            var productRatings = await _unitOfWork.GetClassListAsyncWhere<Rating>(x => x.Id_Product == review.ProductId && x.Isdelete != true);

            var countRating = productRatings.Count;

            var ratingAverage = countRating > 0 ? (double)productRatings.Sum(x => x.Ranting) / countRating : 5;

            await _unitOfWork.UpdateFieldsAsync<Product>(
                filters: new Dictionary<string, object>
                {
                { "Id", product.Id }
                },
                fieldsToUpdate: new Dictionary<string, object>
                {
                { "Rating", ratingAverage }
                }
            );

            // ==========================================
            // 11. LOG
            // ==========================================

            var user = await _unitOfWork.GetClassAsyncWhere<User_Customer>(x => x.Id == userId && x.Isdelete != true && x.Ativo == true);
            var userAdmin = await _unitOfWork.GetClassListAsyncWhere<User_Admin>(x => x.Isdelete != true && x.Ativo == true);
            var Order = await _unitOfWork.GetClassAsyncWhere<Orders>(x => x.Isdelete != true && x.Id == review.OrderId);


            if (user != null)
            {
                await _unitOfWork.InsertAsyncReturnId<Logs>(
                    new Logs
                    {
                        Id_User = userId,
                        Log = $"{user.Name} editou a avaliação do produto {product.Name}. Comentário: {review.Comment}",
                        Tipo = "Avaliação Produto",
                        Nivel = "CLIENTE",
                        Acao = $"O Cliente {user.Name} editou a avaliação do Produto {product.Name} para {review.Rating} Estrelas.",
                        Info = $"{user.Name} editou a avaliação do Produto {product.Name} em {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
                        InsertDate = DateTime.Now
                    });
            }
            var users = userAdmin.Select(x => new NotificationUserRequest
            {
                UserId = x.Id
            }).ToList();

            await _notification.SendNotification(
       new NotificationRequest
       {
           Kind = "Avaliação Editada",
           Title = "Avaliação de produto editada",
           Description =
               $"{user.Name} editou a avaliação do produto {product.Name} " +
               $"do pedido Nº {Order.Number_Order}. " +
               $"Confira a avaliação atualizada.",
           Icone = "Star",
           ActionUrl = "/admin",
           ReferenceId = product.Id,
           ReferenceType = "ASSESSMENT",
           Role = "ADMIN"
       },
       users
   );

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            return Result<bool>.Failure(Error.Failure("Avaliação", "Não foi possível salvar a avaliação. Tente novamente."));
        }
    } 
    public async Task<Result<RatingResponse>> GetAssessment(int userId, int IdProduct,int IdOrder)
    {
        try
        {
            if (IdProduct <= 0)
            {
                return Result<RatingResponse>.Failure(Error.Failure("Id", "Id do produto inválido"));
            }

            if (IdOrder == null || IdOrder == 0)
            {
                return Result<RatingResponse>.Failure(Error.Failure("Id", "Id do pedido inválido"));
            }

            var Review = await _unitOfWork.GetClassAsyncWhere<Rating>(x => x.Id_Product == IdProduct && x.Id_Order == IdOrder && x.Id_User_Customer == userId);

            return Result<RatingResponse>.Success(new RatingResponse{
                Id = Review.Id,
                Id_Product = Review.Id_Product,
                Id_User_Customer = userId,
                Id_Order = Review.Id_Order,
                Ranting = Review.Ranting,
                Comment = Review.Comment,
                Media = Review.Media,
                Recommend = Review.Recommend,
                InsertDate = Review.InsertDate,
                UpdateDate = Review.UpdateDate
            });
        }
        catch (Exception ex)
        {
            return Result<RatingResponse>.Failure(Error.Failure("Avaliação", "Não foi possível carregar a avaliação."));
        }
    }

}
