namespace Pricing.Api.DTOs.Responses;

public class CollectionDetailResponse
{
    public string Id { get; set; } = default!;
    public string UserId { get; set; } = default!;
    public string CycleName { get; set; } = default!;
    public string CycleStatus { get; set; } = default!;
    public string Vertical { get; set; } = default!;
    public string OwnProductName { get; set; } = default!;
    public decimal? Price { get; set; }
    public string? City { get; set; }
    public string? Uf { get; set; }
    public string? CompetitorBrand { get; set; }
    public string? CompetitorModel { get; set; }
}
