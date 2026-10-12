namespace Mercado.Craibas.Application.Interfaces.Services
{
    /// <summary>
    /// Avisa o cliente (e-mail + notificação no site) quando o status do pedido muda.
    /// Usado pelo admin e pelo portal de entregas.
    /// </summary>
    public interface IOrderStatusNotifier
    {
        /// <summary>Retorna true se o e-mail foi enviado.</summary>
        Task<bool> NotifyCustomerAsync(int orderId, string newStatus, string? whoReceivedIt, DateTime changedAt);
    }
}
