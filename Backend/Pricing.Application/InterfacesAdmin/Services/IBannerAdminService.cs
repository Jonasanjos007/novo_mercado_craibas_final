using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.InterfacesAdmin.Services
{
    public interface IBannerAdminService
    {
        Task<Result<bool>> PostSaveBanner(BannerRequest request, int IdUser);
        Task<Result<List<BannerResponse>>> GetListAllBanners();
        Task<Result<List<BannerResponse>>> GetBannersAtivos();
        Task<Result<bool>> PostUpdateBanner(BannerRequest request, int IdUser);
        Task<Result<bool>> PostUpdateActive(int IdBanner, int IdUser);
        Task<Result<bool>> DeleteBanner(int IdBanner, int IdUser, string? reason);
    }
}
