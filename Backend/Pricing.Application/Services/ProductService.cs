using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Baldan.Pricing.Application.Interfaces.Repositories;
using Baldan.Pricing.Application.Models.Enums;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces.Repositories;
using Mercado.Craibas.Application.Interfaces.Services;
using Pricing.Api.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        //private readonly IProfileRepository _profileRepository;
        private readonly IUnitOfWork _unitOfWork;

        public ProductService(IProductRepository productRepository, IUnitOfWork unitOfWork)
        {
            _productRepository = productRepository;
            _unitOfWork = unitOfWork;
        }

        private static ProductResponse MapToResponse(Product product,List<Imagens_Products> imagens_)
        {
            return new ProductResponse
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price_Unic = product.Price_Unit,
                Origin_Price = product.Origin_Price,
                Imagens = imagens_,
                Count_Rating = product.Rating,
                Review_Count = product.ReviewCount,
                Id_category = product.Id_Category,
                Count_Sold = product.CountSold,
                variations = product.Variante_Products.ToList(),
                Total_Stock = product.Total_Stock,
                Badge = product.Badge,
                FreeShipping = product.FreeShipping,
                Installments = product.installments,
                Tags = product.Tags,
                Featured = product.Featured
            };
        }
        public async Task<Result<List<ProductResponse>>> GetProductList()
        {
            var Products = await _unitOfWork.GetClassListAsyncWhere<Product>(x => x.Ativo == true && x.Isdelete != true);

            if (Products == null || !Products.Any())
            {
                return Result<List<ProductResponse>>
                    .Failure(Error.Failure(
                        "Produtos",
                        "Produtos não encontrados!"
                    ));
            }

            var productList = new List<ProductResponse>();

            foreach (var Product in Products)
            {
                var variants = await _unitOfWork.GetClassListAsyncWhere<Variante_Products>(x => x.Id_Product == Product.Id && x.Isdelete != true);

                if(variants == null || !variants.Any())
                {
                    continue;
                }

                var Imagens_Product = await _unitOfWork.GetClassListAsyncWhere<Imagens_Products>(x => x.Id_Product == Product.Id && x.Isdelete != true);

                if(Imagens_Product is null)
                {
                    continue;
                }

                var CategoryName = await _unitOfWork.GetClassAsyncWhere<Product_Category>(x => x.Id == Product.Id_Category && x.Isdelete != true && x.Ativo == true);
                if(CategoryName is null)
                {
                    continue;
                }
                productList.Add(new ProductResponse
                {
                    Id = Product.Id,
                    Name = Product.Name,
                    Description = Product.Description,
                    Price_Unic = Product.Price_Unit,
                    Origin_Price = Product.Origin_Price,
                    Imagens = Imagens_Product,
                    Id_category = CategoryName.Id,
                    Count_Rating = Product.Rating,
                    Review_Count = Product.ReviewCount,
                    Count_Sold = Product.CountSold,
                    variations = variants,
                    Total_Stock = Product.Total_Stock,
                    Badge = Product.Badge,
                    FreeShipping = Product.FreeShipping,
                    Installments = Product.installments,
                    Tags = Product.Tags,
                    Featured = Product.Featured,
                    InsertDate = Product.InsertDate,
                    Ativo = Product.Ativo,
                    ShowBanner = Product.ShowBanner
                    

                });
            }
            return Result<List<ProductResponse>>.Success(productList);
        }
        public async Task<Result<bool>> PostCartItensSave(CartItensRequest CartProduto, int userid)
        {

            var Cart = await  _unitOfWork.GetClassById<Cart>(CartProduto.User.Id, "Id_User_Customer");
            var Cart_Itens = new Cart_Item
            {
                Id_Cart = Cart.Id,
                Quantity = CartProduto.Quantity,
                Id_Product = CartProduto.Product.Id,
                Id_Variante = CartProduto.SelectedVariation.Id,
                Isdelete = false,
                InsertDate = DateTime.Now
                
            };


            var Insert_Cart_Itens = await _productRepository.InsertCartProductAsync<Cart_Item>(Cart_Itens);

            if(Insert_Cart_Itens == 0)
            {
               return Result<bool>.Failure(Error.Failure("Carrinho","Nenhum Produto Adicionado no carrinho Entre em Contato Com Suporte!"));
            }
            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> PostCartItensUpdate(int Id,int Quantity,string Soma_Sub)
        {
            int? QuantityTotal = Quantity;

            if (Soma_Sub == "Soma")
            {
                QuantityTotal = (QuantityTotal ?? 1) + 1;
            }
            else
            {
                QuantityTotal = (QuantityTotal ?? 1) - 1;

            }

            var insert_cart_itens = await _unitOfWork.UpdateFieldsAsync<Cart_Item>(filters: new Dictionary<string, object>
        {
                { "Id", Id }
        },

        fieldsToUpdate: new Dictionary<string, object>
        {
                { "Quantity", QuantityTotal }
        });
            if (!insert_cart_itens)
            {
                return Result<bool>.Failure(Error.Failure("carrinho", "nenhum produto adicionado no carrinho entre em contato com suporte!"));
            }
            return Result<bool>.Success(true);
        }

        public async Task<Result<CartUserResponse>> GetProductCartList(int Id_Customer)
        {
            var Cart = await _unitOfWork.GetClassById<Cart>(Id_Customer, "Id_User_Customer");

            if (Cart is null)
            {
                return Result<CartUserResponse>.Failure(Error.Failure("Carriho","Você Não Tem Carrinho Entre em Contato com Suporte!"));
            }

            var ListItens = await _unitOfWork.GetClassListAsyncWhere<Cart_Item>(x => x.Id_Cart ==Cart.Id && x.Isdelete != true);

            var CartProductList = new List<CartItemResponse>();

            foreach (var ProductOne in ListItens)
            {
                var ProductSelected = await _unitOfWork.GetClassAsyncWhere<Product>(x => x.Id == ProductOne.Id_Product && x.Isdelete != true);

                var ImageProductSelected = await _unitOfWork.GetClassListAsyncWhere<Imagens_Products>(x => x.Id_Product == ProductSelected.Id && x.Isdelete != true);


                var Variants = await _unitOfWork.GetClassAsyncWhere<Variante_Products>(x => x.Id_Product == ProductSelected.Id && x.Isdelete != true);

                if (Variants == null)
                {
                    continue;
                }
                var CartVariant = new ProductVariationResponse();
               
                    CartVariant = new ProductVariationResponse
                    {
                        Id = Variants.Id,
                        Name = Variants.Name,
                        Value = Variants.Value,
                        Type = Variants.Type,
                        Stock = Variants.Stoke,
                        Price_Modifier = Variants.Price_Modifier
                    };

                CartProductList.Add(new CartItemResponse
                {
                    Id = ProductOne.Id,
                    Id_Cart = Cart.Id,
                    Quantity = ProductOne.Quantity,
                    SelectedVariation = CartVariant,
                    Product = MapToResponse(ProductSelected, ImageProductSelected)


                });
            }
            var total = CartProductList.Sum(x => x.Quantity * x.Product.Price_Unic);

            var subtotal = CartProductList.Sum(x =>x.Quantity * x.Product.Price_Unic);
            double discount = 0;
            int? IdCupom = null ;
            bool? ErroCupom = false;
            string message = "";
            string? Cod_Cupom = null;
            string? DiscountTypeValue = null;
            bool CouponApplied = false;
            string? WhereApplyCoupon = null;

            var getCupom = await _unitOfWork.GetClassAsyncWhere<Cupom>(x => x.Id == Cart.Id_Cupom && x.Isdelete != true);

            var fees = await _unitOfWork.GetClassAsyncWhere<BaseRates>(x => x.Isdelete != true);


            if (getCupom is not null)
            {
                IdCupom = getCupom.Id;
                bool cupomValido = true;

                if (!getCupom.Active)
                {
                    if(DateTime.Now > getCupom.Date_End)
                    {
                        ErroCupom = true;
                        message = "Cupom Expirou! Cupom Vencido chegou a data de expiração!";
                        cupomValido = false;
                    }
                    else
                    {
                        ErroCupom = true;
                        message = "Cupom Inativo!";
                        cupomValido = false;
                    }

                }
                if(cupomValido && DateTime.Now < getCupom.Date_Start)
                {
                    ErroCupom = true;
                    message = "Cupom ainda não está disponível";
                    cupomValido = false;
                }
                if(cupomValido && DateTime.Now > getCupom.Date_End)
                {
                    ErroCupom = true;
                    message = "Cupom expirado";
                    cupomValido = false;
                }
                if(cupomValido && getCupom.Quantity_Used >= getCupom.Quantity_Uses)
                {
                    ErroCupom = true;
                    message = "O limite de uso deste cupom foi atingido e ele foi removido do carrinho.";
                    cupomValido = false;
                }
                if(cupomValido && getCupom.First_Order_Only)
                {
                    var OrderQuantity = await _unitOfWork.GetClassListAsyncWhere<Coupon_Use>(x => x.Id_User == Id_Customer && x.Id_Cupom == getCupom.Id && x.Isdelete != true);
                    if(OrderQuantity.Count() > 0)
                    {
                        ErroCupom = true;
                        message = "Este cupom é válido apenas para a primeira compra e foi removido do carrinho.";
                        cupomValido = false;
                    }
                }
                var usos = await _unitOfWork.GetClassListById<Coupon_Use>(Id_Customer, "Id_User");
                if (cupomValido && usos.Count() >= getCupom.Per_User_Limit)
                {
                    ErroCupom = true;
                    message = "Você já atingiu o limite de uso deste cupom.";
                    cupomValido = false;
                }

                if(cupomValido && subtotal < getCupom.Minimum_Value)
                {
                    ErroCupom = true;
                    message = "O valor mínimo da compra não foi atingido para utilizar este cupom.";
                    cupomValido = false;
                }

                var Coupon_Product = await _unitOfWork.GetClassListAsyncWhere<Coupon_Product>(x => x.Id_Cupom == getCupom.Id && x.Isdelete != true);

                var Coupon_Category = await _unitOfWork.GetClassListAsyncWhere<Coupon_Category>(x => x.Id_Cupom == getCupom.Id && x.Isdelete != true);

            
                // tipo porcentagem
                if (getCupom.Discount_Type == DiscountType.Percentage)
                {
                    DiscountTypeValue = "Percentage";
                    if (cupomValido && Coupon_Product.Count > 0)
                    {
                        WhereApplyCoupon = "Products";
                        var productIds = Coupon_Product.Select(x => x.Id_Product).ToList();

                        subtotal = CartProductList.Sum(x =>
                        {
                            var valor = x.Quantity * x.Product.Price_Unic;

                            if (productIds.Contains(x.Product.Id))
                            {
                                var desconto = valor * (getCupom.Discount / 100.0);

                                x.Product.ValorDicont = desconto;

                                valor -= desconto;
                            }
                            else
                            {
                                x.Product.ValorDicont = 0;
                            }

                            return valor;
                        });
                        subtotal += fees.ShippingCost;
                        CouponApplied = true;
                    }

                    if (cupomValido && Coupon_Category.Count > 0)
                    {
                        WhereApplyCoupon = "Categories";
                        var categoryIds = Coupon_Category
                            .Select(x => x.Id_Category)
                            .ToHashSet();

                        subtotal = CartProductList.Sum(x =>
                        {
                            var valor = x.Quantity * x.Product.Price_Unic;

                            if (categoryIds.Contains(x.Product.Id_category))
                            {
                                var desconto = valor * (getCupom.Discount / 100.0);

                                x.Product.ValorDicont = desconto;

                                valor -= desconto;
                            }
                            else
                            {
                                x.Product.ValorDicont = 0;
                            }

                            return valor;
                        });

                        subtotal += fees.ShippingCost;
                        CouponApplied = true;
                    }
                    discount = getCupom.Discount;
                }
                //Tipo Fixo 
                if(getCupom.Discount_Type == DiscountType.FixedValue )
                {
                    DiscountTypeValue = "FixedValue";
                    subtotal -= getCupom.Discount;
                    discount = getCupom.Discount;
                    subtotal += fees.ShippingCost;
                    CouponApplied = true;
                }

                //Frete Gratis
                if(getCupom.Discount_Type == DiscountType.FreeShipping)
                {
                    CouponApplied = true;
                    DiscountTypeValue = "FreeShipping";
                }
            }
            else
            {
                subtotal += fees.ShippingCost;
            }

                return Result<CartUserResponse>.Success(new CartUserResponse
                {
                    CartItensProduct = CartProductList,
                    SubTotal = subtotal,
                    Discount = discount,
                    Total = total,
                    Cupom = Cod_Cupom,
                    Id_Cupom = IdCupom,
                    ErroCupom = ErroCupom,
                    Menssege = message,
                    ShippingCost = DiscountTypeValue == "FreeShipping" ? 0 : fees.ShippingCost ?? 0,
                    Discount_Type = DiscountTypeValue,
                    CouponApplied = CouponApplied,
                    WhereApplyCoupon = WhereApplyCoupon
                });
        }
        public async Task<Result<bool>>DeleteProductCartList(int Id_Customer)
        {
            var Delete = await _productRepository.DeleteByColumnAsync<Cart_Item>("Id", Id_Customer);

            if(!Delete)
            {
                return Result<bool>.Failure(Error.Failure("","Produto Não Encontrado"));
            }
            return Result<bool>.Success(true);
        }


    }
}
