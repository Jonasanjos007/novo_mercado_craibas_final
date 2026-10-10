using System.Text.Json;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    /// <summary>
    /// Item exibido na Lixeira do admin.
    /// </summary>
    public class TrashItemResponse
    {
        public int Id { get; set; }
        public string EntityType { get; set; } = string.Empty;
        public int EntityId { get; set; }
        public string EntityName { get; set; } = string.Empty;
        public int? UserId { get; set; }
        public string? UserName { get; set; }
        public string? UserEmail { get; set; }
        public string? UserRole { get; set; }
        public DateTime? DeletedAt { get; set; }
        public DateTime? PermanentDeleteAt { get; set; }

        public string? Description { get; set; }
        public string? Reason { get; set; }
        public int DeletedById { get; set; }
        public string? DeletedByName { get; set; }
        public string? DeletedByRole { get; set; }
        public Dictionary<string, JsonElement>? Data { get; set; }
        public Dictionary<string, List<TrashItemResponse>>? Related { get; set; }
    }

    public class TrashBulkResponse
    {
        public int Succeeded { get; set; }
        public List<TrashBulkFailure> Failed { get; set; } = new();
    }

    public class TrashBulkFailure
    {
        public int Id { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
