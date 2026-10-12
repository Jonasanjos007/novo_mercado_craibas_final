using Backend.Services.Interfaces;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;
using System.Security.Claims;

namespace Mercado.Api.Controllers.admin
{
    /// <summary>
    /// Usuários no painel do admin. Somente ADMIN.
    /// </summary>
    [ApiController]
    [Route("api/admin/User")]
    [Authorize(Roles = "ADMIN")]
    public class UserAdminController : ControllerBase
    {
        private readonly IUserServiceAdmin _service;
        private readonly IAuthService _authService;

        public UserAdminController(IUserServiceAdmin service, IAuthService authService)
        {
            _service = service;
            _authService = authService;
        }

        /// <summary>
        /// Cria um novo ADMIN ou DELIVERY.
        /// Criar outro ADMIN exige a senha do admin logado (mesma janela de 10 minutos dos dispositivos).
        /// </summary>
        [HttpPost("CreateUser")]
        public async Task<IActionResult> CreateUser([FromBody] AdminCreateUserRequest request)
        {
            var adminId = User.GetUserId();

            if (string.Equals(request?.Role?.Trim(), "ADMIN", StringComparison.OrdinalIgnoreCase))
            {
                var reauth = await _authService.ConfirmRecentPasswordAsync(adminId, User.GetUserRole(), User.GetSessionId(), request?.AdminPassword);

                if (reauth.IsFailure)
                {
                    return reauth.ToActionResult();
                }
            }

            var result = await _service.CreateUserAsync(request!, adminId);

            return result.ToActionResult();
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
        [Authorize]
        [HttpPost("UpdateInfor")]
        public async Task<IActionResult> UpdateInfor([FromForm] InfoSiteRequest request)
        {
            var Id_User = User.GetUserId();

            var result = await _service.PostUpdateInfoSite(request, Id_User);

            return result.ToActionResult();
        }
        [Authorize]
        [HttpPost("UpdaTaxasBasesAdmin")]
        public async Task<IActionResult> UpdaTaxasBasesAdmin([FromBody] TaxasBasesRequest request)
        {
            var result = await _service.PostUpdateTaxasBases(request);

            return result.ToActionResult();
        }
        // ───────────── Paginação (filtros aplicados no banco antes de paginar) ─────────────

        [HttpGet("paged")]
        public async Task<IActionResult> GetUsersPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, [FromQuery] string? role = null, [FromQuery] string? status = null)
        {
            var result = await _service.GetUsersPagedAsync(page, pageSize, search, role, status);

            return result.ToActionResult();
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetUsersSummary()
        {
            var result = await _service.GetUsersSummaryAsync();

            return result.ToActionResult();
        }

        [Authorize]
        [HttpGet("GetUsersAll")]
        public async Task<IActionResult> GetUsersAll()
        {
            var result = await _service.GetAllUsers();

            return result.ToActionResult();
        }
        [Authorize]
        [HttpPost("PostDesactivUser")]
        public async Task<IActionResult> PostDesactivUser(int UserIdCostumer,string role)
        {
            var Id_User = User.GetUserId();
            var result = await _service.DeactivateClient(UserIdCostumer,role, Id_User);

            return result.ToActionResult();
        }
        [Authorize]
        [HttpGet("GetAddress/{UserIdCostumer}")]
        public async Task<IActionResult> GetAddress(int UserIdCostumer)
        {
            var result = await _service.GetAddressesAll(UserIdCostumer);

            return result.ToActionResult();
        }
        [Authorize]
        [HttpGet("GeneralOrderInformation/{UserIdCostumer}")]
        public async Task<IActionResult> GeneralOrderInformation(int UserIdCostumer)
        {
            var result = await _service.GetInforGeneral(UserIdCostumer);

            return result.ToActionResult();
        }
        [Authorize]
        [HttpDelete("DeleteUserSelected")]
        public async Task<IActionResult> DeleteUserSelected(int UserIdCostumer,string role, string? reason)
        {
            var Id_UserResponsavel = User.GetUserId();
            var roleResponsavel = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;


            var result = await _service.DeleteUserIsDelete(UserIdCostumer,role,Id_UserResponsavel,roleResponsavel, reason);

            return result.ToActionResult();
        }
    }
}
