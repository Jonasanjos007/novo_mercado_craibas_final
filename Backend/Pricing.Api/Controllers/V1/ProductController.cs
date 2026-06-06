using backend.services.interfaces;
using Mercado.Craibas.Application.DTOs.Requests;
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
        [HttpPost("postCartSave")]
        public async Task<IActionResult> PostCartSave(
       [FromBody] CartItensRequest Cart_Itens)
        {
            var result = await _service.PostCartItensSave(Cart_Itens);

            return result.ToActionResult();
        }
        [HttpPost("postCartUpdate")]
        public async Task<IActionResult> PostCartUpdate([FromBody] CartItensRequest Cart_Itens)
        {
            var result = await _service.PostCartItensUpdate(Cart_Itens.Id,Cart_Itens.Quantity,Cart_Itens.Operador);

            return result.ToActionResult();
        }
        [HttpPost("PostUpdateQuantity")]
        public async Task<IActionResult> PostUpdateQuantity([FromBody] UpdateQuantityRequest request)
        {
            var result = await _service.PostCartItensUpdate(request.Cart_Itens_Id, request.Quantity, request.Operador);

            return result.ToActionResult();
        }

        [HttpGet("GetProductCart/{Id}")]
        public async Task<IActionResult> GetProductCart(int Id)
        {
            var result = await _service.GetProductCartList(Id);

            return result.ToActionResult();
        }

        [HttpDelete("DeleteProductCart/{Cart_Itens_Id}")]
        public async Task<IActionResult> DeleteProductCart(int Cart_Itens_Id)
        {
            var result = await _service.DeleteProductCartList(Cart_Itens_Id);

            return result.ToActionResult();
        }
    }
}
