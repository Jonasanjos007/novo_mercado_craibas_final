using Backend.Services.Interfaces;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;

namespace Mercado.Api.Controllers.admin
{
    [ApiController]
    [Route("api/admin/Product")]

    public class ProductController : ControllerBase
    {
        private readonly IProductServiceAdmin _service;

        public ProductController(IProductServiceAdmin service)
        {
            _service = service;
        }

        [Authorize]
        [HttpGet("listProductAdmin")]
        public async Task<IActionResult> listProductAdmin()
        {
            var result = await _service.GetProductListAdmin();

            return result.ToActionResult();
        }

        [Authorize]
        [HttpPost("PostSaveProduct")]
        public async Task<IActionResult> PostSaveProduct([FromForm] ProductRequest product)
        {
            var result = await _service.PostSaveProduct(product);

            return result.ToActionResult();
        }
        [Authorize]
        [HttpPost("PostEditeProduct")]
        public async Task<IActionResult> PostEditeProduct([FromForm] ProductRequest product)
        {
            var result = await _service.PostEditProduct(product);

            return result.ToActionResult();
        }

        [Authorize]
        [HttpDelete("DeleteProductId/{id_Product}")]
        public async Task<IActionResult> DeleteProductId(int Id_Product)
        {
            var result = await _service.DeleteProductId(Id_Product);

            return result.ToActionResult();
        }
    }
}
