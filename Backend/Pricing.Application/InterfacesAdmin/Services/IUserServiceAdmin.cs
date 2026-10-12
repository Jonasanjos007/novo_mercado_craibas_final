using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.InterfacesAdmin.Services
{
    public interface IUserServiceAdmin
    {
        Task<Result<bool>> PostEditeUserAdmin(UserAdminRequest User, int IdUser);

        /// <summary>Admin cria um novo ADMIN ou DELIVERY. Retorna o nome do usuário criado.</summary>
        Task<Result<string>> CreateUserAsync(AdminCreateUserRequest request, int adminId);
        Task<Result<bool>> PostEditeTemaAdmin(bool Tema, int IdUser);
        Task<Result<bool>> PostUpdateInfoSite(InfoSiteRequest request,int IdUserAdmin);
        Task<Result<bool>> PostUpdateTaxasBases(TaxasBasesRequest request);
        Task<Result<List<UserAdminResponse>>> GetAllUsers();
        Task<Result<string>> DeactivateClient(int userIdCliente, string role, int IdAdmin);
        Task<Result<GeneralUserInformationResponse>> GetInforGeneral(int userIdCliente);
        Task<Result<List<AddressResponse>>> GetAddressesAll(int userIdCliente);
        Task<Result<bool>> DeleteUserIsDelete(int userIdCliente, string role,int Id_UserResponsavel,string roleResponsavel, string? reason);
    }
}
