using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Interfaces;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Enums;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.Interfaces.Services;

namespace Mercado.Craibas.Application.Services
{
    public class DeletionRecordService : IDeletionRecordService
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeletionRecordService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<int> RegisterAsync(DeletionRecordRequest request)
        {
            var now = DateTime.UtcNow;

            var record = await _unitOfWork.InsertAsyncReturnId(new DeletionRecords
            {
                EntityType = request.EntityType,
                EntityId = request.EntityId,
                DisplayName = Truncate(string.IsNullOrWhiteSpace(request.DisplayName) ? request.EntityType.ToString() : request.DisplayName, 250)!,
                OwnerUserId = request.OwnerUserId,
                OwnerRole = Truncate(request.OwnerRole, 50),
                DeletedByUserId = request.DeletedByUserId,
                DeletedByRole = Truncate(request.DeletedByRole, 50),
                DeletedByUserName = Truncate(request.DeletedByUserName ?? string.Empty, 250)!,
                Reason = Truncate(request.Reason?.Trim(), 500),
                Snapshot = EntitySnapshot.ToJson(request.Entity, request.Extra),
                ParentRecordId = request.ParentRecordId,
                DeletedAt = now,
                Status = DeletionRecordStatusEnum.Deleted,
                InsertDate = now
            });

            return record.Id;
        }

        public async Task RegisterChildrenAsync(int parentRecordId, IEnumerable<DeletionRecordRequest> children)
        {
            foreach (var child in children)
            {
                child.ParentRecordId = parentRecordId;
                await RegisterAsync(child);
            }
        }

        private static string? Truncate(string? value, int max)
        {
            if (string.IsNullOrEmpty(value)) return value;
            return value.Length <= max ? value : value[..max];
        }
    }
}
