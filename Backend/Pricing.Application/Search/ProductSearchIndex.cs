#nullable enable
using Baldan.Pricing.Application.Domain.Entities;
using Pricing.Api.DTOs.Responses;

namespace Mercado.Craibas.Application.Search;

public sealed class ProductSearchDocument
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public int CategoryId { get; init; }
    public string CategoryName { get; init; } = string.Empty;
    public double Price { get; init; }
    public double OriginPrice { get; init; }
    public double Rating { get; init; }
    public int ReviewCount { get; init; }
    public int CountSold { get; init; }
    public int TotalStock { get; init; }
    public bool FreeShipping { get; init; }
    public string? Badge { get; init; }
    public string? FirstImage { get; init; }

    public ProductResponse Response { get; init; } = new();

    public IReadOnlyList<string> NameTokens { get; init; } = Array.Empty<string>();
    public HashSet<string> NameSet { get; init; } = new(StringComparer.Ordinal);
    public HashSet<string> TagSet { get; init; } = new(StringComparer.Ordinal);
    public HashSet<string> CategorySet { get; init; } = new(StringComparer.Ordinal);
    public HashSet<string> VariantSet { get; init; } = new(StringComparer.Ordinal);
    public HashSet<string> DescriptionSet { get; init; } = new(StringComparer.Ordinal);

    public HashSet<string> NameNumbers { get; init; } = new(StringComparer.Ordinal);
    public HashSet<string> OtherNumbers { get; init; } = new(StringComparer.Ordinal);

    public bool IsAccessory { get; init; }
}

public sealed class ProductSearchIndex
{
    public IReadOnlyList<ProductSearchDocument> Documents { get; }

    public IReadOnlyDictionary<string, List<int>> Postings { get; }

    public IReadOnlyDictionary<string, int> Vocabulary { get; }
    public IReadOnlyDictionary<string, string> DisplayForms { get; }

    public IReadOnlyList<Product_Category> Categories { get; }

    public DateTime BuiltAtUtc { get; }

    public ProductSearchIndex(
        IReadOnlyList<ProductSearchDocument> documents,
        IReadOnlyDictionary<string, List<int>> postings,
        IReadOnlyDictionary<string, int> vocabulary,
        IReadOnlyDictionary<string, string> displayForms,
        IReadOnlyList<Product_Category> categories)
    {
        Documents = documents;
        Postings = postings;
        Vocabulary = vocabulary;
        DisplayForms = displayForms;
        Categories = categories;
        BuiltAtUtc = DateTime.UtcNow;
    }

    public static readonly ProductSearchIndex Empty = new(
        Array.Empty<ProductSearchDocument>(),
        new Dictionary<string, List<int>>(),
        new Dictionary<string, int>(),
        new Dictionary<string, string>(),
        Array.Empty<Product_Category>());
}
