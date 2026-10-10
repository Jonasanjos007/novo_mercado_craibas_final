namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class TrashBulkRequest
    {
        public List<int> Ids { get; set; } = new();
        public string Action { get; set; } = string.Empty;
    }
}
