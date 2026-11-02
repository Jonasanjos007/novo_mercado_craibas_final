using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.InterfacesAdmin.Services
{
    public interface IBrindeAdminService
    {
        Task<Result<bool>> PostSaveBrinde(BrindeRequest request, int IdUser);
        Task<Result<List<BrindeResponse>>> GetListAllBrindes();
        Task<Result<bool>> PostUpdateBrinde(BrindeUpdateRequest request, int IdUser);
        Task<Result<bool>> DeleteBrinde(int IdBrinde, int IdUser, string? reason);
        Task<Result<bool>> PostUpdateActive(int IdBrinde, int IdUser);
        Task<Result<bool>> PostAtribuirBrinde(AtribuirBrindeRequest request, int IdUser);
        Task<Result<bool>> PostEntregarBrinde(int IdBrindeCliente, int IdUser);
        Task<Result<List<BrindeClienteResponse>>> GetListEntregas(string? status);
        Task<Result<BrindePedidoResponse>> GetBrindesByOrder(int IdOrder);
    }
}
