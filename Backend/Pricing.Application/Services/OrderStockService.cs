#nullable enable
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Mercado.Craibas.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Mercado.Craibas.Application.Services;

/// <summary>
/// Baixa e devolução de estoque dos pedidos.
///
/// - Baixa (DeductAsync): quando o pedido é confirmado (pagamento aprovado ou admin confirmando).
///   Tira a quantidade vendida do estoque da variação (Variante_Products.Stoke) e do produto
///   (Product.Total_Stock) e soma em "vendidos" (Product.CountSold).
/// - Devolução (RestockAsync): se um pedido que já baixou estoque for cancelado.
///
/// Cada pedido baixa no máximo uma vez: a coluna Orders.Stock_Deducted_At é marcada de forma
/// atômica antes de mexer no estoque, então webhook, consulta do cliente e admin ao mesmo tempo
/// não baixam duas vezes. O estoque nunca fica negativo.
/// </summary>
public interface IOrderStockService
{
    /// <summary>true = baixou agora; false = já tinha baixado (ou pedido não existe).</summary>
    Task<bool> DeductAsync(int orderId);
    /// <summary>true = devolveu agora; false = não havia baixa para devolver.</summary>
    Task<bool> RestockAsync(int orderId);
}

public sealed class OrderStockService : IOrderStockService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<OrderStockService> _logger;

    public OrderStockService(IUnitOfWork unitOfWork, ILogger<OrderStockService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<bool> DeductAsync(int orderId)
    {
        var now = DateTime.Now;
        var claimed = await _unitOfWork.Query<Orders>()
            .Where(x => x.Id == orderId && x.Stock_Deducted_At == null)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.Stock_Deducted_At, now));
        if (claimed == 0) return false;

        var lines = await Lines(orderId);
        foreach (var variant in lines.Where(x => x.VariantId > 0).GroupBy(x => x.VariantId))
        {
            var id = variant.Key;
            var qty = variant.Sum(x => x.Quantity);
            await _unitOfWork.Query<Variante_Products>().Where(x => x.Id == id)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.Stoke, x => x.Stoke >= qty ? x.Stoke - qty : 0));
        }
        foreach (var product in lines.GroupBy(x => x.ProductId))
        {
            var id = product.Key;
            var qty = product.Sum(x => x.Quantity);
            await _unitOfWork.Query<Product>().Where(x => x.Id == id)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.Total_Stock, x => x.Total_Stock >= qty ? x.Total_Stock - qty : 0)
                    .SetProperty(x => x.CountSold, x => x.CountSold + qty));
        }

        _logger.LogInformation("Estoque baixado para o pedido {OrderId} ({Items} itens).", orderId, lines.Sum(x => x.Quantity));
        return true;
    }

    public async Task<bool> RestockAsync(int orderId)
    {
        var claimed = await _unitOfWork.Query<Orders>()
            .Where(x => x.Id == orderId && x.Stock_Deducted_At != null)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.Stock_Deducted_At, (DateTime?)null));
        if (claimed == 0) return false;

        var lines = await Lines(orderId);
        foreach (var variant in lines.Where(x => x.VariantId > 0).GroupBy(x => x.VariantId))
        {
            var id = variant.Key;
            var qty = variant.Sum(x => x.Quantity);
            await _unitOfWork.Query<Variante_Products>().Where(x => x.Id == id)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.Stoke, x => x.Stoke + qty));
        }
        foreach (var product in lines.GroupBy(x => x.ProductId))
        {
            var id = product.Key;
            var qty = product.Sum(x => x.Quantity);
            await _unitOfWork.Query<Product>().Where(x => x.Id == id)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.Total_Stock, x => x.Total_Stock + qty)
                    .SetProperty(x => x.CountSold, x => x.CountSold >= qty ? x.CountSold - qty : 0));
        }

        _logger.LogInformation("Estoque devolvido do pedido cancelado {OrderId}.", orderId);
        return true;
    }

    private async Task<List<(int ProductId, int VariantId, int Quantity)>> Lines(int orderId)
    {
        var rows = await _unitOfWork.Query<OrderLineItens>().AsNoTracking()
            .Where(x => x.Id_Order == orderId && x.Isdelete != true && x.Quantity > 0)
            .Select(x => new { x.Id_Product, x.Id_Variante_Product, x.Quantity })
            .ToListAsync();
        return rows.Select(x => (x.Id_Product, x.Id_Variante_Product ?? 0, x.Quantity)).ToList();
    }
}
