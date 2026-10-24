#nullable enable
using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;

namespace Mercado.Craibas.Application.Interfaces.Services;

public interface IProductSearchService
{
    Task<Result<ProductSearchResponse>> SearchAsync(ProductSearchRequest request, CancellationToken cancellationToken = default);

    Task<Result<ProductSuggestResponse>> SuggestAsync(string? query, int limit, CancellationToken cancellationToken = default);
}
