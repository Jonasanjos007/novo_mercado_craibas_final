#nullable enable
using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces.Services;
using Mercado.Craibas.Application.Search;
using Microsoft.Extensions.Options;

namespace Mercado.Craibas.Application.Services;

/// <summary>
/// Busca de produtos da loja. Valida a entrada e delega ao motor (<see cref="ProductSearchEngine"/>),
/// que trabalha sobre o índice em memória (<see cref="IProductSearchIndexProvider"/>).
/// </summary>
public sealed class ProductSearchService : IProductSearchService
{
    private static readonly HashSet<string> AllowedSorts = new(StringComparer.Ordinal)
    {
        ProductSearchEngine.SortRelevance,
        ProductSearchEngine.SortPriceAsc,
        ProductSearchEngine.SortPriceDesc,
        ProductSearchEngine.SortReviews,
        ProductSearchEngine.SortBestSellers
    };

    private readonly IProductSearchIndexProvider _indexProvider;
    private readonly IOptionsMonitor<ProductSearchOptions> _options;

    public ProductSearchService(IProductSearchIndexProvider indexProvider, IOptionsMonitor<ProductSearchOptions> options)
    {
        _indexProvider = indexProvider;
        _options = options;
    }

    public async Task<Result<ProductSearchResponse>> SearchAsync(ProductSearchRequest request, CancellationToken cancellationToken = default)
    {
        var options = _options.CurrentValue;
        var validation = Validate(request.Q, options);
        if (validation is not null)
            return Result<ProductSearchResponse>.Failure(validation);

        if (request.Page < 1)
            request.Page = 1;
        if (request.PageSize < 0 || request.PageSize > options.MaxPageSize)
            return Result<ProductSearchResponse>.Failure(Error.Validation(
                "Busca.TamanhoPagina", $"A quantidade por página deve ser de 1 a {options.MaxPageSize}."));
        if (request.Sort is not null && !AllowedSorts.Contains(request.Sort))
            return Result<ProductSearchResponse>.Failure(Error.Validation("Busca.Ordenacao", "Ordenação inválida."));
        if (request.MinPrice < 0 || request.MaxPrice < 0 || request.MinRating < 0 || request.MinRating > 5)
            return Result<ProductSearchResponse>.Failure(Error.Validation("Busca.Filtro", "Filtro inválido."));

        var index = await _indexProvider.GetIndexAsync(cancellationToken);
        return Result<ProductSearchResponse>.Success(ProductSearchEngine.Execute(index, request, options));
    }

    public async Task<Result<ProductSuggestResponse>> SuggestAsync(string? query, int limit, CancellationToken cancellationToken = default)
    {
        var options = _options.CurrentValue;
        var validation = Validate(query, options);
        if (validation is not null)
            return Result<ProductSuggestResponse>.Failure(validation);

        var text = (query ?? string.Empty).Trim();
        if (SearchText.Normalize(text).Length < options.SuggestMinLength)
            return Result<ProductSuggestResponse>.Success(new ProductSuggestResponse { Query = text });

        var index = await _indexProvider.GetIndexAsync(cancellationToken);
        return Result<ProductSuggestResponse>.Success(ProductSearchEngine.Suggest(index, text, limit, options));
    }

    private static Error? Validate(string? query, ProductSearchOptions options)
    {
        if (query is not null && query.Length > options.MaxQueryLength)
            return Error.Validation("Busca.Termo", $"A busca pode ter no máximo {options.MaxQueryLength} caracteres.");
        return null;
    }
}
