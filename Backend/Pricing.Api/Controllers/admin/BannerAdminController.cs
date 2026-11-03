using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;

namespace Mercado.Api.Controllers.Admin
{
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    [Route("api/admin/banner")]
    public class BannerAdminController : ControllerBase
    {
        private readonly IBannerAdminService _service;

        public BannerAdminController(IBannerAdminService service)
        {
            _service = service;
        }

        [Authorize]
        [HttpPost("PostSaveBanner")]
        public async Task<IActionResult> PostSaveBanner([FromForm] BannerRequest request)
        {
            var Id_User = User.GetUserId();
            var result = await _service.PostSaveBanner(request, Id_User);
            return result.ToActionResult();
        }

        [Authorize]
        [HttpGet("GetListAllBanners")]
        public async Task<IActionResult> GetListAllBanners()
        {
            var result = await _service.GetListAllBanners();
            return result.ToActionResult();
        }

        [Authorize]
        [HttpPost("PostUpdateBanner")]
        public async Task<IActionResult> PostUpdateBanner([FromForm] BannerRequest request)
        {
            var Id_User = User.GetUserId();
            var result = await _service.PostUpdateBanner(request, Id_User);
            return result.ToActionResult();
        }

        [Authorize]
        [HttpPost("PostUpdateActive")]
        public async Task<IActionResult> PostUpdateActive([FromBody] int IdBanner)
        {
            var Id_User = User.GetUserId();
            var result = await _service.PostUpdateActive(IdBanner, Id_User);
            return result.ToActionResult();
        }

        [Authorize]
        [HttpDelete("DeleteBanner/{IdBanner}")]
        public async Task<IActionResult> DeleteBanner(int IdBanner, [FromQuery] string? reason)
        {
            var Id_User = User.GetUserId();
            var result = await _service.DeleteBanner(IdBanner, Id_User, reason);
            return result.ToActionResult();
        }
    }
}
