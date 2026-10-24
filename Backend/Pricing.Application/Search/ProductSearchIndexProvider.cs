#nullable enable
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Mercado.Craibas.Application.Search;

/// <summary>Invalida o índice de busca (chamado quando produtos/categorias são salvos).</summary>
public interface IProductSearchIndexInvalidator
{
    void Invalidate();
}

public interface IProductSearchIndexProvider : IProductSearchIndexInvalidator
{
    Task<ProductSearchIndex> GetIndexAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Guarda o índice no IMemoryCache que a API já registra (AddMemoryCache).
/// - Montado com 4 consultas em lote (produtos, categorias, variantes, imagens), sem N+1.
/// - Refeito na próxima busca depois de qualquer gravação em produto, variante, imagem ou categoria
///   (o interceptor do EF chama <see cref="Invalidate"/>).
/// - Validade máxima configurável (ProductSearch:IndexCacheSeconds), que cobre outras instâncias da API
///   e alterações feitas direto no banco.
/// - Uma única montagem por vez; quem chega durante a montagem espera a mesma.
/// </summary>
public sealed class ProductSearchIndexProvider : IProductSearchIndexProvider
{
    private const string CacheKey = "product-search-index";

    private readonly IMemoryCache _cache;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IOptionsMonitor<ProductSearchOptions> _options;
    private readonly SemaphoreSlim _buildLock = new(1, 1);
    private long _version;

    public ProductSearchIndexProvider(
        IMemoryCache cache,
        IServiceScopeFactory scopeFactory,
        IOptionsMonitor<ProductSearchOptions> options)
    {
        _cache = cache;
        _scopeFactory = scopeFactory;
        _options = options;
    }

    public async Task<ProductSearchIndex> GetIndexAsync(CancellationToken cancellationToken = default)
    {
        if (_cache.TryGetValue(CacheKey, out ProductSearchIndex? cached) && cached is not null)
            return cached;

        await _buildLock.WaitAsync(cancellationToken);
        try
        {
            if (_cache.TryGetValue(CacheKey, out cached) && cached is not null)
                return cached;

            var versionAtStart = Interlocked.Read(ref _version);
            var index = await BuildAsync(cancellationToken);

            // Se alguém salvou um produto enquanto o índice era montado, ele pode estar velho:
            // serve esta busca, mas não guarda; a próxima monta de novo.
            if (Interlocked.Read(ref _version) == versionAtStart)
            {
                _cache.Set(CacheKey, index, new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(Math.Max(10, _options.CurrentValue.IndexCacheSeconds))
                });
            }

            return index;
        }
        finally
        {
            _buildLock.Release();
        }
    }

    public void Invalidate()
    {
        Interlocked.Increment(ref _version);
        _cache.Remove(CacheKey);
    }

    private async Task<ProductSearchIndex> BuildAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var products = unitOfWork.Query<Product>()
            .AsNoTracking()
            .Where(p => p.Ativo == true && p.Isdelete != true);

        var productList = await products.ToListAsync(cancellationToken);

        var categories = await unitOfWork.Query<Product_Category>()
            .AsNoTracking()
            .Where(c => c.Isdelete != true && c.Ativo)
            .ToListAsync(cancellationToken);

        var variants = await unitOfWork.Query<Variante_Products>()
            .AsNoTracking()
            .Where(v => v.Isdelete != true && products.Select(p => p.Id).Contains(v.Id_Product))
            .ToListAsync(cancellationToken);

        var images = await unitOfWork.Query<Imagens_Products>()
            .AsNoTracking()
            .Where(i => i.Isdelete != true && products.Select(p => p.Id).Contains(i.Id_Product))
            .ToListAsync(cancellationToken);

        return ProductSearchIndexBuilder.Build(productList, categories, variants, images, _options.CurrentValue);
    }
}
