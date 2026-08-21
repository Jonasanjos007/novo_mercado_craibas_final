using Backend.Services.Interfaces;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;

namespace Mercado.Api.Controllers.admin
{
        [ApiController]
        [Route("api/admin/User")]
    public class UserAdminController : ControllerBase
    {
        private readonly IUserServiceAdmin _service;

        public UserAdminController(IUserServiceAdmin service)
        {
            _service = service;
        }

        [Authorize]
        [HttpPost("UpdateUserAdmin")]
        public async Task<IActionResult> UpdateUserAdmin([FromForm] UserAdminRequest UserAdmin)
        {
            var Id_User = User.GetUserId();

            var result = await _service.PostEditeUserAdmin(UserAdmin,Id_User);

            return result.ToActionResult();
        }
        [Authorize]
        [HttpPost("UpdateTemaAdmin")]
        public async Task<IActionResult> UpdateTemaAdmin([FromBody] bool Tema)
        {
            var Id_User = User.GetUserId();

            var result = await _service.PostEditeTemaAdmin(Tema, Id_User);

            return result.ToActionResult();
        }
    }
}
