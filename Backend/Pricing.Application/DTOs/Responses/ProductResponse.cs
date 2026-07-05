using Baldan.Pricing.Application.Domain.Entities;
using Mercado.Craibas.Application.DTOs.Responses;

namespace Pricing.Api.DTOs.Responses;

public class ProductResponse
{
    public int Id { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Descripition { get; set; } = default!;
    public double? Price_Unic { get; set; } = default!;
    public double? Origin_Price { get; set; } = default!;
    public List<Imagens_Products?> Imagens { get; set; } = default!;
    public string? Category { get; set; } = default!;
    public double? Count_Rating { get; set; } = default!;
    public int? Review_Count { get; set; } = default!;
    public int? Count_Sold { get; set; } = default!;
    public List<Variante_Products?> variations { get; set; }
    public int? Total_Stock { get; set; }
    public int? Quantity { get; set; }
    public string? Badge { get; set; }
    public bool? FreeShipping { get; set; }
    public double? Installments { get; set; }
    public string? Tags { get; set; }
    public bool? Featured { get; set; }
}
