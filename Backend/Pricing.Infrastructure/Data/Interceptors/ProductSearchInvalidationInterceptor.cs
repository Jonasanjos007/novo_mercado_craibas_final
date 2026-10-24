#nullable enable
using System.Runtime.CompilerServices;
using Baldan.Pricing.Application.Domain.Entities;
using Mercado.Craibas.Application.Search;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Mercado.Craibas.Infrastructure.Data.Interceptors;

/// <summary>
/// Mantém o índice da busca atualizado sem mexer nas regras dos serviços:
/// depois de qualquer SaveChanges que tenha criado, alterado ou excluído
/// produto, variante, imagem ou categoria (cadastro, edição, exclusão, restauração da lixeira,
/// baixa de estoque, avaliação), o índice é descartado e refeito na próxima busca.
/// </summary>
public sealed class ProductSearchInvalidationInterceptor : SaveChangesInterceptor
{
    private static readonly HashSet<Type> WatchedTypes = new()
    {
        typeof(Product),
        typeof(Variante_Products),
        typeof(Imagens_Products),
        typeof(Product_Category)
    };

    private readonly IProductSearchIndexInvalidator _invalidator;
    private readonly ConditionalWeakTable<DbContext, object> _pending = new();

    public ProductSearchInvalidationInterceptor(IProductSearchIndexInvalidator invalidator)
    {
        _invalidator = invalidator;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        Track(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        Track(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override int SavedChanges(SaveChangesCompletedEventData eventData, int result)
    {
        Flush(eventData.Context);
        return base.SavedChanges(eventData, result);
    }

    public override ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData, int result, CancellationToken cancellationToken = default)
    {
        Flush(eventData.Context);
        return base.SavedChangesAsync(eventData, result, cancellationToken);
    }

    public override void SaveChangesFailed(DbContextErrorEventData eventData)
    {
        if (eventData.Context is not null)
            _pending.Remove(eventData.Context);
        base.SaveChangesFailed(eventData);
    }

    public override Task SaveChangesFailedAsync(DbContextErrorEventData eventData, CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null)
            _pending.Remove(eventData.Context);
        return base.SaveChangesFailedAsync(eventData, cancellationToken);
    }

    private void Track(DbContext? context)
    {
        if (context is null)
            return;

        var touchesSearch = context.ChangeTracker.Entries().Any(entry =>
            entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted
            && WatchedTypes.Contains(entry.Metadata.ClrType));

        if (touchesSearch)
            _pending.AddOrUpdate(context, true);
    }

    private void Flush(DbContext? context)
    {
        if (context is not null && _pending.TryGetValue(context, out _))
        {
            _pending.Remove(context);
            _invalidator.Invalidate();
        }
    }
}
