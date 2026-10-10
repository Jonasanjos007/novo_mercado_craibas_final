using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;

namespace Mercado.Craibas.Application.InterfacesAdmin.Services
{
    public interface ITrashServiceAdmin
    {
        Task<Result<List<TrashItemResponse>>> GetTrashAsync();
        Task<Result<bool>> RestoreAsync(int recordId, int adminId);
        Task<Result<bool>> PurgeAsync(int recordId, int adminId);
        Task<Result<TrashBulkResponse>> BulkAsync(TrashBulkRequest request, int adminId);
    }
}
