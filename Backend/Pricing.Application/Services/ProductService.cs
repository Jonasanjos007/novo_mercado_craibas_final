using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Baldan.Pricing.Application.Interfaces.Repositories;
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

        public async Task<Result<List<ProductResponse>>> GetProductList()
        {
            var products = await _productRepository.GetAllProductAsyncList<Product>();

            if (products == null || !products.Any())
            {
                return Result<List<ProductResponse>>
                    .Failure(Error.Failure(
                        "Produtos",
                        "Produtos não encontrados!"
                    ));
            }

            var productList = new List<ProductResponse>();

            foreach (var product in products)
            {
                var variants = await _productRepository.GetAllVariantAsyncListById<Variante_Products>(product.Id);

                if(variants == null || !variants.Any())
                {
                    continue;
                }

                productList.Add(new ProductResponse
                {
                    Id = product.Id,
                    Name = product.Name,
                    Price_Unic = product.Price_Unit,
                    Variantes = variants
                });
            }

            return Result<List<ProductResponse>>
                .Success(productList);
        }
    }
}
