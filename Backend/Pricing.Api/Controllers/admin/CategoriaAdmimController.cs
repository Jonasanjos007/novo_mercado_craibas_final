using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;

namespace Mercado.Api.Controllers.admin
{
    [ApiController]
    [Route("api/admin/category")]
    public class CategoriaAdmimController : ControllerBase
    {
        private readonly ICategoriaServiceAdmin _service;

        public CategoriaAdmimController(ICategoriaServiceAdmin service)
        {
            _service = service;
        }

        [Authorize]
        [HttpPost("PostSaveCategory")]
        public async Task<IActionResult> PostSaveCategory([FromForm] CategoryRequest category)
        {
            var result = await _service.PostSaveCategory(category);

            return result.ToActionResult();
        }

        [Authorize]
        [HttpPost("UpdateCategory")]
        public async Task<IActionResult> UpdateCategory(
              [FromForm] int Id,
              [FromForm] string Name,
              [FromForm] string Description,
              [FromForm] string Color,
              [FromForm] string Meta_Title,
              [FromForm] string Meta_Description,
              [FromForm] bool Ativo,
              [FromForm] IFormFile? Imagem,
              [FromForm] List<IFormFile>? Banners,
              [FromForm] List<string>? ExistingBanners)
        {
            var request = new CategoryRequest
            {
                Id = Id,
                Name = Name,
                Description = Description,
                Color = Color,
                Meta_Title = Meta_Title,
                Meta_Description = Meta_Description,
                Ativo = Ativo,
                Imagem = Imagem,
                Banners = Banners,
                ExistingBanners = ExistingBanners
            };

            var result = await _service.UpdateCategory(request);

            return result.ToActionResult();
        }

        [Authorize]
        [HttpPost("DeleteCategory")]
        public async Task<IActionResult> DeleteCategory([FromBody] DeleteCategoryRequest request)
        {
            var result = await _service.DeleteCategory(request);

            return result.ToActionResult();
        }
    }
}
