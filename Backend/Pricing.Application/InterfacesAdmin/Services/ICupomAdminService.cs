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
    public interface ICupomAdminService
    {
        Task<Result<bool>> PostSaveCupom(CupomRequest cupomReques,int IdUser);
        Task<Result<List<CupomResponseAdmin>>> GetListAllCupons();
        Task<Result<bool>> PostUpdateCupom(CupomUpdateRequest request,int IdUser);
        Task<Result<bool>> DeleteCupom(int IdCupom, int IdUser);
        Task<Result<bool>> PostUpdateActive(int IdCupom, int IdUser);
    }
}
