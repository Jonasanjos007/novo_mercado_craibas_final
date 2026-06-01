using Baldan.Pricing.Application.Domain.Entities;

namespace Pricing.Api.DTOs.Responses;

public class ProducrResponse
{
    public string Id { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Descripition { get; set; } = default!;
    public double? Price_Unic { get; set; } = default!;
    public double? Origin_Price { get; set; } = default!;
    public List<Imagens_Products?> Imagens { get; set; } = default!;
    public string? Category { get; set; } = default!;
    public double? Rating { get; set; } = default!;
    public int? reviewCount { get; set; } = default!;
    public int? Count_Sold { get; set; } = default!;
    public List<Variante_Products?> Variantes { get; set; }
    public int? Total_Stock { get; set; }
    public string? badge { get; set; }
    public bool? freeShipping { get; set; }
    public double? installments { get; set; }
    public string? Tags { get; set; }
    public bool? featured { get; set; }
}
