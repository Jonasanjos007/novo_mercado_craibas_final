namespace Pricing.Api.DTOs.Responses;

public class DashboardCollectionResponse
{
    public string Id { get; set; } = default!;
    public string CycleName { get; set; } = default!;
    public string CycleStatus { get; set; } = default!;
    public string Vertical { get; set; } = default!;
    public string OwnProductName { get; set; } = default!;
    public string CompetitorName { get; set; } = "-";
    public string City { get; set; } = "-";
    public string Uf { get; set; } = "-";
    public decimal? Price { get; set; }
    public string Status { get; set; } = default!;
}
