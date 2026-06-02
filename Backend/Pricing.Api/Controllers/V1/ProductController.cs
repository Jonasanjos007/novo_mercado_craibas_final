using backend.services.interfaces;
using Mercado.Craibas.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;

namespace Mercado.Api.Controllers.V1
{
    [ApiController]
    [Route("api/v1/product")]
    public class ProductController
    {
        private readonly IProductService _service;

        public ProductController(IProductService service)
        {
            _service = service;
        }

        [HttpGet("list")]
        public async Task<IActionResult> ProductList()
        {
            var result = await _service.GetProductList();

            return result.ToActionResult();
        }
    }
}
