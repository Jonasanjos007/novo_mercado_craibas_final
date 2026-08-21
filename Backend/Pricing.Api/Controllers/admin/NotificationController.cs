using Mercado.Craibas.Application.Interfaces.Services;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;
using System.Security.Claims;

namespace Mercado.Api.Controllers.admin
{
    [ApiController]
    [Route("api/admin/Notification")]
    public class NotificationController : Controller
    {
        private readonly INotificationService _service;

        public NotificationController(INotificationService service)
        {
            _service = service;
        }

        [Authorize]
        [HttpGet("GetAllNotification")]
        public async Task<IActionResult> GetAllNotification( )
         {
            var Id_User = User.GetUserId();
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            var result = await _service.GetAllNotifications(Id_User,role);

            return result.ToActionResult();
        }
        [Authorize]
        [HttpPost("PostUpdateReadNotification")]
        public async Task<IActionResult> PostUpdateReadNotification([FromBody] int Id)
        {
           
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            var result = await _service.PostNotificationRead(Id, role);

            return result.ToActionResult();
        }
        [Authorize]
        [HttpPost("PostUpdateReadAllNotification")]
        public async Task<IActionResult> PostUpdateReadAllNotification()
        {
            var Id_User = User.GetUserId();
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            var result = await _service.PostAllNotificationRead(Id_User, role);

            return result.ToActionResult();
        }

    }
}
