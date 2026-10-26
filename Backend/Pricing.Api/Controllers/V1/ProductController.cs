using backend.services.interfaces;
using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Mercado.Api.Controllers.V1
{
    [ApiController]
    [Route("api/v1/product")]
    public class ProductController :ControllerBase
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
        [Authorize(Roles = "CLIENTE")]
        [HttpPost("postCartSave")]
        public async Task<IActionResult> PostCartSave([FromBody] CartItensRequest Cart_Itens)
        {
            var userid = User.GetUserId(); 

            var result = await _service.PostCartItensSave(Cart_Itens,userid);

            return result.ToActionResult();
        }
        [Authorize(Roles = "CLIENTE")]
        [HttpPost("postCartUpdate")]
        public async Task<IActionResult> PostCartUpdate([FromBody] CartItensRequest Cart_Itens)
        {
            var result = await _service.PostCartItensUpdate(User.GetUserId(), Cart_Itens.Id,Cart_Itens.Quantity,Cart_Itens.Operador,Cart_Itens.NewQuantity);

            return result.ToActionResult();
        }
        [Authorize(Roles = "CLIENTE")]
        [HttpPost("PostUpdateQuantity")]
        public async Task<IActionResult> PostUpdateQuantity([FromBody] UpdateQuantityRequest request)
        {
            var result = await _service.PostCartItensUpdate(User.GetUserId(), request.Cart_Itens_Id, request.Quantity, request.Operador,null);

            return result.ToActionResult();
        }

        [Authorize(Roles = "CLIENTE")]
        [HttpGet("GetProductCart")]
        public async Task<IActionResult> GetProductCart()
        {
            var Id_User = User.GetUserId();

            var result = await _service.GetProductCartList(Id_User);

            return result.ToActionResult();
        }
        [Authorize(Roles = "CLIENTE")]
        [HttpDelete("DeleteProductCart/{Cart_Itens_Id}")]
        public async Task<IActionResult> DeleteProductCart(int Cart_Itens_Id)
        {


            var result = await _service.DeleteProductCartList(User.GetUserId(), Cart_Itens_Id);

            return result.ToActionResult();
        }
        [HttpGet("GetAllRantingProduct/{Id_Product}")]
        public async Task<IActionResult> GetAllRantingProduct([FromRoute] int Id_Product)
        {
            var result = await _service.GetAssessmentAllProduct(Id_Product);

            return result.ToActionResult();
        }
        [Authorize(Roles = "CLIENTE")]
        [HttpPost("PostFavoriteSave")]
        public async Task<IActionResult> PostFavoriteSave([FromBody] int Id_Product)
        {
            var Id_User = User.GetUserId();

            var result = await _service.PostFavoriteSave(Id_User, Id_Product);

            return result.ToActionResult();
        }
        [Authorize(Roles = "CLIENTE")]
        [HttpGet("GetAllFavorites")]
        public async Task<IActionResult> GetAllFavorites()
        {
            var Id_User = User.GetUserId();

            var result = await _service.GetAllFavorites(Id_User);

            return result.ToActionResult();
        }

        [Authorize(Roles = "CLIENTE")]
        [HttpDelete("DeleteOneFavorite/{IdProduct}")]
        public async Task<IActionResult> DeleteOneFavorite(int IdProduct)
        {
            var result = await _service.DeleteFavorites(User.GetUserId(), IdProduct);

            return result.ToActionResult();
        }

    }
}
