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

        /// <summary>Produtos paginados (filtros aplicados no banco antes de paginar).</summary>
        [Authorize(Roles = "ADMIN")]
        [HttpGet("paged")]
        public async Task<IActionResult> GetProductsPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, [FromQuery] int? categoryId = null)
        {
            var result = await _service.GetProductsPagedAsync(page, pageSize, search, categoryId);

            return result.ToActionResult();
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
            var Id_User = User.GetUserId();

            var result = await _service.PostEditProduct(product,Id_User);

            return result.ToActionResult();
        }

        [Authorize]
        [HttpDelete("DeleteProductId/{id_Product}")]
        public async Task<IActionResult> DeleteProductId(int Id_Product, [FromQuery] string? reason)
        {
            var Id_User = User.GetUserId();

            var result = await _service.DeleteProductId(Id_Product, Id_User, reason);

            return result.ToActionResult();
        }
    }
}
