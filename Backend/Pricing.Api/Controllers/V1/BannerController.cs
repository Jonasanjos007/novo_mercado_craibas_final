using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;

namespace backend.controllers.v1
{
    [ApiController]
    [Route("api/v1/banner")]
    public class BannerController : ControllerBase
    {
        private readonly IBannerAdminService _service;

        public BannerController(IBannerAdminService service)
        {
            _service = service;
        }

        [HttpGet("GetBannersAtivos")]
        public async Task<IActionResult> GetBannersAtivos()
        {
            var result = await _service.GetBannersAtivos();
            return result.ToActionResult();
        }
    }
}
