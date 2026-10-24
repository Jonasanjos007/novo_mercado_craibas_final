#nullable enable
namespace Mercado.Craibas.Application.DTOs.Requests;

/// <summary>Parâmetros do GET /api/v1/product/search (todos opcionais, exceto q).</summary>
public sealed class ProductSearchRequest
{
    public string? Q { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; }
    public int? CategoryId { get; set; }
    public double? MinPrice { get; set; }
    public double? MaxPrice { get; set; }
    public bool? FreeShipping { get; set; }
    public double? MinRating { get; set; }
    public string? Badge { get; set; }
    public string? Sort { get; set; }
}
