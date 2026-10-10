using Mercado.Craibas.Application.DTOs.Requests;

namespace Mercado.Craibas.Application.Interfaces.Services
{
    /// <summary>
    /// Registra na Lixeira (DeletionRecords) tudo o que é excluído.
    /// </summary>
    public interface IDeletionRecordService
    {
        Task<int> RegisterAsync(DeletionRecordRequest request);
        Task RegisterChildrenAsync(int parentRecordId, IEnumerable<DeletionRecordRequest> children);
    }
}
