#nullable enable
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;

namespace Mercado.Api.Controllers.V1
{
    /// <summary>
    /// Busca de produtos da loja (pública, como o GET /api/v1/product/list).
    /// Só devolve produtos visíveis na loja: ativos, não removidos, com variante e categoria ativa.
    /// </summary>
    [ApiController]
    [Route("api/v1/product")]
    public class ProductSearchController : ControllerBase
    {
        private readonly IProductSearchService _service;

        public ProductSearchController(IProductSearchService service)
        {
            _service = service;
        }

        /// <summary>Busca completa com ranking, filtros, ordenação e paginação.</summary>
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] ProductSearchRequest request, CancellationToken cancellationToken)
        {
            var result = await _service.SearchAsync(request, cancellationToken);

            return result.ToActionResult();
        }

        /// <summary>Autocomplete do campo de busca: até 8 produtos + sugestões de termo e categoria.</summary>
        [HttpGet("suggest")]
        public async Task<IActionResult> Suggest([FromQuery] string? q, [FromQuery] int limit = 0, CancellationToken cancellationToken = default)
        {
            var result = await _service.SuggestAsync(q, limit, cancellationToken);

            return result.ToActionResult();
        }
    }
}
