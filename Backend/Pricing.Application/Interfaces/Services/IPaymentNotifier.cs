using Baldan.Pricing.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Interfaces.Services
{
    public interface IPaymentNotifier
    {
        Task PixGeneratedAsync(Orders order, Payment_Transactions tx);
        Task ApprovedAsync(Orders order, Payment_Transactions tx, string source);
        Task InAnalysisAsync(Orders order, Payment_Transactions tx);
        Task RejectedAsync(Orders order, Payment_Transactions tx);
        Task ExpiredAsync(Orders order, Payment_Transactions tx);
        Task RefundedAsync(Orders order, Payment_Transactions tx);
        /// <summary>Pagamento aprovado num pedido que já estava pago ou cancelado: o admin precisa estornar.</summary>
        Task NeedsRefundAlertAsync(Orders order, Payment_Transactions tx, string reason);
        Task ErrorAsync(Orders order, Payment_Transactions tx);
    }
}
