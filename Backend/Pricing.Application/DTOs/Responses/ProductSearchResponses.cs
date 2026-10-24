#nullable enable
using Pricing.Api.DTOs.Responses;

namespace Mercado.Craibas.Application.DTOs.Responses;

public sealed class ProductSearchResponse
{
    public List<ProductResponse> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public string Query { get; set; } = string.Empty;
    public string? CorrectedQuery { get; set; }
    public bool IsPartialMatch { get; set; }
}

public sealed class ProductSuggestResponse
{
    public string Query { get; set; } = string.Empty;
    public string? CorrectedQuery { get; set; }
    public bool IsPartialMatch { get; set; }
    public int TotalCount { get; set; }
    public List<ProductSuggestionItem> Products { get; set; } = new();
    public List<SearchTermSuggestion> Suggestions { get; set; } = new();
}

public sealed class ProductSuggestionItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public double Price { get; set; }
    public double OriginPrice { get; set; }
    public string? Image { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? Badge { get; set; }
    public bool FreeShipping { get; set; }
    public bool InStock { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
}

public sealed class SearchTermSuggestion
{
    public string Type { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public int Count { get; set; }
}
