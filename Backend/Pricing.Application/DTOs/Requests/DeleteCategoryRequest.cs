namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class DeleteCategoryRequest
    {
        public int Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public int? ReplacementCategoryId { get; set; }
    }
}
