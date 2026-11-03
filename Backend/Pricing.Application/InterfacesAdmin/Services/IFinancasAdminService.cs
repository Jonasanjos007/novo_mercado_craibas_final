using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.InterfacesAdmin.Services
{
    public interface IFinancasAdminService
    {
        Task<Result<FinancasResumoResponse>> GetResumoMensal(int ano, int mes);
        Task<Result<List<FinancasMesResponse>>> GetSerieMensal(int ano);
        Task<Result<List<TopProdutoLucroResponse>>> GetTopProdutosLucro(int ano, int mes);
        Task<Result<List<DespesaResponse>>> GetListAllDespesas(int ano, int mes);
        Task<Result<List<string>>> GetCategoriasDespesa();
        Task<Result<bool>> PostSaveDespesa(DespesaRequest request, int IdUser);
        Task<Result<bool>> PostUpdateDespesa(DespesaUpdateRequest request, int IdUser);
        Task<Result<bool>> DeleteDespesa(int IdDespesa, int IdUser, string? reason);
    }
}
