using Mercado.Craibas.Application.Domain.Enums;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class DeletionRecordRequest
    {
        public EntityTypeDelete EntityType { get; set; }
        public int EntityId { get; set; }

        public string DisplayName { get; set; } = string.Empty;
        public int? OwnerUserId { get; set; }
        public string? OwnerRole { get; set; }
        public int DeletedByUserId { get; set; }
        public string? DeletedByRole { get; set; }
        public string DeletedByUserName { get; set; } = string.Empty;
        public string? Reason { get; set; }
        public object? Entity { get; set; }
        public Dictionary<string, object?>? Extra { get; set; }
        public int? ParentRecordId { get; set; }
    }
}
