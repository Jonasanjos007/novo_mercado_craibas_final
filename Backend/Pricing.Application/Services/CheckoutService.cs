//using Backend.Services.Interfaces;
//using Baldan.Pricing.Application.Commons;
//using Baldan.Pricing.Application.Domain.Entities;
//using Baldan.Pricing.Application.Interfaces;
//using Baldan.Pricing.Application.Interfaces.Repositories;
//using Mercado.Craibas.Application.Interfaces.Repositories;
//using Mercado.Craibas.Application.Interfaces.Services;
//using Pricing.Api.DTOs.Responses;


//namespace Mercado.Craibas.Application.Services
//{
//    public class CheckoutService : ICheckoutService
//    {

//        private readonly IUserRepository _userRepository;
//        //private readonly IProfileRepository _profileRepository;
//        private readonly IUnitOfWork _unitOfWork;

//        public CheckoutService(IUserRepository userRepository, IUnitOfWork unitOfWork)
//        {
//            _userRepository = userRepository;
//            _unitOfWork = unitOfWork;
//        }
//        public async Task<Result<>> GetCupom()
//        {
//            var Products = await _productRepository.GetAllProductAsyncList<Product>();

//            if (Products == null || !Products.Any())
//            {
//                return Result<List<ProductResponse>>
//                    .Failure(Error.Failure(
//                        "Produtos",
//                        "Produtos não encontrados!"
//                    ));
//            }

//            var productList = new List<ProductResponse>();

//            foreach (var Product in Products)
//            {
//                var variants = await _productRepository.GetAllVariantAsyncListById<Variante_Products>(Product.Id, "Id_Product");

//                if (variants == null || !variants.Any())
//                {
//                    continue;
//                }

//                var Imagens_Product = await _productRepository.GetAllVariantAsyncListById<Imagens_Products>(Product.Id, "Id_Product");

//                if (Imagens_Product is null)
//                {
//                    continue;
//                }

//                var CategoryName = await _productRepository.GetVariantByIdAsync<Product_Category>(Product.Id_Category, "Id");
//                if (CategoryName is null)
//                {
//                    continue;
//                }
//                productList.Add(new ProductResponse
//                {
//                    Id = Product.Id,
//                    Name = Product.Name,
//                    Descripition = Product.Description,
//                    Price_Unic = Product.Price_Unit,
//                    Origin_Price = Product.Origin_Price,
//                    Imagens = Imagens_Product,
//                    Category = CategoryName.Category,
//                    Count_Rating = Product.Rating,
//                    Review_Count = Product.ReviewCount,
//                    Count_Sold = Product.CountSold,
//                    variations = variants,
//                    Total_Stock = Product.Total_Stock,
//                    Badge = Product.Badge,
//                    FreeShipping = Product.FreeShipping,
//                    Installments = Product.installments,
//                    Tags = Product.Tags,
//                    Featured = Product.Featured

//                });
//            }
//            return Result<List<ProductResponse>>.Success(productList);
//        }


//    }
//}
