using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Baldan.Pricing.Application.Interfaces.Repositories;
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
                Descripition = product.Description,
                Price_Unic = product.Price_Unit,
                Origin_Price = product.Origin_Price,
                Imagens = imagens_,
                Count_Rating = product.Rating,
                Review_Count = product.ReviewCount,
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
            var Products = await _productRepository.GetAllProductAsyncList<Product>();

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
                var variants = await _productRepository.GetAllVariantAsyncListById<Variante_Products>(Product.Id,"Id_Product");

                if(variants == null || !variants.Any())
                {
                    continue;
                }

                var Imagens_Product = await _productRepository.GetAllVariantAsyncListById<Imagens_Products>(Product.Id, "Id_Product");

                if(Imagens_Product is null)
                {
                    continue;
                }

                var CategoryName = await _productRepository.GetVariantByIdAsync<Product_Category>(Product.Id_Category, "Id");
                if(CategoryName is null)
                {
                    continue;
                }
                productList.Add(new ProductResponse
                {
                    Id = Product.Id,
                    Name = Product.Name,
                    Descripition = Product.Description,
                    Price_Unic = Product.Price_Unit,
                    Origin_Price = Product.Origin_Price,
                    Imagens = Imagens_Product,
                    Category = CategoryName.Category,
                    Count_Rating = Product.Rating,
                    Review_Count = Product.ReviewCount,
                    Count_Sold = Product.CountSold,
                    variations = variants,
                    Total_Stock = Product.Total_Stock,
                    Badge = Product.Badge,
                    FreeShipping = Product.FreeShipping,
                    Installments = Product.installments,
                    Tags = Product.Tags,
                    Featured = Product.Featured

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

        public async Task<Result<List<CartItemResponse>>> GetProductCartList(int Id_Customer)
        {
            var Cart = await _unitOfWork.GetClassById<Cart>(Id_Customer, "Id_User_Customer");

            if (Cart == null)
            {
                return Result<List<CartItemResponse>>.Failure(Error.Failure("Carriho","Você Não Tem Carrinho Entre em Contato com Suporte!"));
            }

            var ListItens = await _unitOfWork.GetClassListById<Cart_Item>(Cart.Id, "Id_Cart");

            var CartProductList = new List<CartItemResponse>();

            foreach (var Product in ListItens)
            {
                var ProductSelected = await _unitOfWork.GetClassById<Product>(Product.Id_Product,"Id");

                var ImageProductSelected = await _productRepository.GetAllVariantAsyncListById<Imagens_Products>(ProductSelected.Id, "Id_Product");


                var Variants = await _unitOfWork.GetClassById<Variante_Products>(Product.Id_Variante, "Id");

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
                    Id = Product.Id,
                    Id_Cart = Cart.Id,
                    Quantity = Product.Quantity,
                    SelectedVariation = CartVariant,
                    Product = MapToResponse(ProductSelected, ImageProductSelected)


                });
            }
            return Result<List<CartItemResponse>>.Success(CartProductList);
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
