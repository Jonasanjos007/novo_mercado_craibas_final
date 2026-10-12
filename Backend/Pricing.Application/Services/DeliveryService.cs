using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Enums;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces.Services;
using Microsoft.EntityFrameworkCore;

namespace Mercado.Craibas.Application.Services
{
    /// <summary>
    /// Portal do entregador.
    /// Ele só enxerga e só altera os pedidos que o admin atribuiu a ele.
    /// As mudanças de status são feitas com uma condição no próprio UPDATE
    /// (dono + status atual), então dois cliques ou duas abas não geram erro de estado.
    /// </summary>
    public class DeliveryService : IDeliveryService
    {
        private const int HistoryLimit = 300;

        private readonly IUnitOfWork _unitOfWork;
        private readonly IOrderStatusNotifier _statusNotifier;

        public DeliveryService(IUnitOfWork unitOfWork, IOrderStatusNotifier statusNotifier)
        {
            _unitOfWork = unitOfWork;
            _statusNotifier = statusNotifier;
        }

        public async Task<Result<List<DeliveryOrderResponse>>> GetMyOrdersAsync(int deliveryId)
        {
            var query = _unitOfWork.Query<Orders>()
                .AsNoTracking()
                .Where(x => x.Id_User_Delivery == deliveryId
                            && x.Isdelete != true
                            && (x.Order_Status == DeliveryOrderStatus.Preparando
                                || x.Order_Status == DeliveryOrderStatus.SaiuParaEntrega))
                .OrderBy(x => x.Delivery_AssignedAt ?? x.InsertDate);

            var orders = await DeliveryOrderProjection.Project(query).ToListAsync();

            foreach (var order in orders)
                order.IsMine = true;

            await FillEstimatedEarningAsync(deliveryId, orders);

            return Result<List<DeliveryOrderResponse>>.Success(orders);
        }

        public async Task<Result<bool>> DispatchAsync(int deliveryId, int orderId)
        {
            var now = DateTime.Now;

            var updated = await _unitOfWork.Query<Orders>()
                .Where(x => x.Id == orderId
                            && x.Id_User_Delivery == deliveryId
                            && x.Order_Status == DeliveryOrderStatus.Preparando
                            && x.Isdelete != true)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.Order_Status, DeliveryOrderStatus.SaiuParaEntrega)
                    .SetProperty(x => x.Delivery_DispatchedAt, (DateTime?)now)
                    .SetProperty(x => x.NotifyViaWhatsApp, true)
                    .SetProperty(x => x.UpdateDate, (DateTime?)now));

            if (updated == 0)
                return Result<bool>.Failure(await ExplainFailureAsync(deliveryId, orderId));

            var order = await _unitOfWork.GetClassAsyncWhere<Orders>(x => x.Id == orderId);

            await SaveLogAsync(deliveryId,
                acao: "Saiu para entrega",
                info: $"Entregador saiu com o pedido #{order?.Number_Order} em {now:dd/MM/yyyy HH:mm}.",
                log: $"O entregador (ID {deliveryId}) marcou o pedido N° {order?.Number_Order} (ID {orderId}) como SAIU_PARA_ENTREGA em {now:dd/MM/yyyy HH:mm:ss}.");

            await NotifyCustomerSafeAsync(orderId, DeliveryOrderStatus.SaiuParaEntrega, null, now);

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> DeliverAsync(int deliveryId, int orderId, DeliverOrderRequest request)
        {
            var whoReceivedIt = request?.WhoReceivedIt?.Trim();

            if (string.IsNullOrWhiteSpace(whoReceivedIt) || whoReceivedIt.Length < 2)
                return Result<bool>.Failure(Error.Validation("Delivery.ReceiverRequired", "Informe o nome de quem recebeu o pedido."));

            if (whoReceivedIt.Length > 100)
                return Result<bool>.Failure(Error.Validation("Delivery.ReceiverTooLong", "O nome de quem recebeu deve ter no máximo 100 caracteres."));

            var now = DateTime.Now;

            var updated = await _unitOfWork.Query<Orders>()
                .Where(x => x.Id == orderId
                            && x.Id_User_Delivery == deliveryId
                            && x.Order_Status == DeliveryOrderStatus.SaiuParaEntrega
                            && x.Isdelete != true)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.Order_Status, DeliveryOrderStatus.Entregue)
                    .SetProperty(x => x.WhoReceivedIt, whoReceivedIt)
                    .SetProperty(x => x.CustomerDeliveryDate, (DateTime?)now)
                    .SetProperty(x => x.NotifyViaWhatsApp, true)
                    .SetProperty(x => x.UpdateDate, (DateTime?)now));

            if (updated == 0)
                return Result<bool>.Failure(await ExplainFailureAsync(deliveryId, orderId));

            var order = await _unitOfWork.GetClassAsyncWhere<Orders>(x => x.Id == orderId);

            await SaveLogAsync(deliveryId,
                acao: "Entregou o pedido",
                info: $"Pedido #{order?.Number_Order} entregue para {whoReceivedIt} em {now:dd/MM/yyyy HH:mm}.",
                log: $"O entregador (ID {deliveryId}) entregou o pedido N° {order?.Number_Order} (ID {orderId}). Recebido por: {whoReceivedIt}. Data/Hora: {now:dd/MM/yyyy HH:mm:ss}.");

            await NotifyCustomerSafeAsync(orderId, DeliveryOrderStatus.Entregue, whoReceivedIt, now);

            return Result<bool>.Success(true);
        }

        public async Task<Result<List<DeliveryOrderResponse>>> GetHistoryAsync(int deliveryId)
        {
            var query = _unitOfWork.Query<Orders>()
                .AsNoTracking()
                .Where(x => x.Id_User_Delivery == deliveryId
                            && x.Order_Status == DeliveryOrderStatus.Entregue
                            && x.Isdelete != true)
                .OrderByDescending(x => x.CustomerDeliveryDate ?? x.UpdateDate ?? x.InsertDate)
                .Take(HistoryLimit);

            var orders = await DeliveryOrderProjection.Project(query).ToListAsync();

            foreach (var order in orders)
                order.IsMine = true;

            // Ganho de cada pedido (só no modo por pedido e com a gorjeta ativa)
            var settings = await DeliveryLedger.LoadSettingsAsync(_unitOfWork.Query<DeliverySettings>());

            if (settings.TipEnabled && settings.Mode == DeliveryPayModeEnum.POR_PEDIDO)
            {
                var ledger = await BuildLedgerAsync(deliveryId, settings);

                var amounts = ledger.Pending.Concat(ledger.Paid)
                    .Where(x => x.OrderId.HasValue)
                    .GroupBy(x => x.OrderId!.Value)
                    .ToDictionary(g => g.Key, g => g.First().Amount);

                foreach (var order in orders)
                {
                    if (amounts.TryGetValue(order.Id, out var amount))
                        order.Earning = amount;
                }
            }

            return Result<List<DeliveryOrderResponse>>.Success(orders);
        }

        public async Task<Result<DeliveryEarningsResponse>> GetEarningsAsync(int deliveryId)
        {
            var settings = await DeliveryLedger.LoadSettingsAsync(_unitOfWork.Query<DeliverySettings>());

            // Gorjeta desligada: o portal não mostra nada
            if (!settings.TipEnabled)
            {
                return Result<DeliveryEarningsResponse>.Success(new DeliveryEarningsResponse { Enabled = false });
            }

            var delivery = await _unitOfWork.GetClassAsyncWhere<User_Delivery>(x => x.Id == deliveryId);

            var ledger = await BuildLedgerAsync(deliveryId, settings);

            var entries = ledger.Pending.Concat(ledger.Paid)
                .OrderByDescending(x => x.Date)
                .ToList();

            return Result<DeliveryEarningsResponse>.Success(new DeliveryEarningsResponse
            {
                Enabled = true,
                Mode = settings.Mode.ToString(),
                OrderValueType = settings.OrderValueType.ToString(),
                CurrentValue = DeliveryLedger.CurrentValue(settings, delivery?.CommissionDelivers, delivery?.DailyRate),
                PendingTotal = ledger.PendingTotal,
                PaidTotal = ledger.PaidTotal,
                Entries = entries
            });
        }

        public async Task<Result<DeliveryProfileResponse>> GetProfileAsync(int deliveryId)
        {
            var delivery = await _unitOfWork.GetClassAsyncWhere<User_Delivery>(x => x.Id == deliveryId && x.Isdelete != true);

            if (delivery == null)
                return Result<DeliveryProfileResponse>.Failure(Error.NotFound("Delivery.NotFound", "Entregador não encontrado."));

            var today = DateTime.Today;
            var weekStart = StartOfWeek(today);

            var mine = _unitOfWork.Query<Orders>()
                .AsNoTracking()
                .Where(x => x.Id_User_Delivery == deliveryId && x.Isdelete != true);

            var activeOrders = await mine.CountAsync(x =>
                x.Order_Status == DeliveryOrderStatus.Preparando
                || x.Order_Status == DeliveryOrderStatus.SaiuParaEntrega);

            var delivered = mine.Where(x => x.Order_Status == DeliveryOrderStatus.Entregue);

            return Result<DeliveryProfileResponse>.Success(new DeliveryProfileResponse
            {
                Id = delivery.Id,
                Name = delivery.Name,
                Email = delivery.Email,
                Phone = delivery.Phone,
                Transport = delivery.Transport,
                Avatar = delivery.Avatar,
                InsertDate = delivery.InsertDate,
                ActiveOrders = activeOrders,
                DeliveredTotal = await delivered.CountAsync(),
                DeliveredToday = await delivered.CountAsync(x => x.CustomerDeliveryDate >= today),
                DeliveredThisWeek = await delivered.CountAsync(x => x.CustomerDeliveryDate >= weekStart)
            });
        }

        // ───────────────────────── helpers ─────────────────────────

        private async Task<DeliveryLedgerResult> BuildLedgerAsync(int deliveryId, DeliverySettings settings)
        {
            var ledgers = await DeliveryLedger.BuildAsync(
                deliveryId,
                settings,
                _unitOfWork.Query<User_Delivery>(),
                _unitOfWork.Query<Orders>(),
                _unitOfWork.Query<DeliveryPayoutItem>());

            return ledgers.TryGetValue(deliveryId, out var ledger) ? ledger : new DeliveryLedgerResult();
        }

        /// <summary>Mostra quanto ele vai ganhar no pedido (modo por pedido).</summary>
        private async Task FillEstimatedEarningAsync(int deliveryId, List<DeliveryOrderResponse> orders)
        {
            if (orders.Count == 0)
                return;

            var settings = await DeliveryLedger.LoadSettingsAsync(_unitOfWork.Query<DeliverySettings>());

            if (!settings.TipEnabled || settings.Mode != DeliveryPayModeEnum.POR_PEDIDO)
                return;

            var delivery = await _unitOfWork.GetClassAsyncWhere<User_Delivery>(x => x.Id == deliveryId);

            var tips = await _unitOfWork.Query<Orders>()
                .AsNoTracking()
                .Where(x => x.Id_User_Delivery == deliveryId
                            && x.Delivery_Commission != null
                            && (x.Order_Status == DeliveryOrderStatus.Preparando
                                || x.Order_Status == DeliveryOrderStatus.SaiuParaEntrega))
                .Select(x => new { x.Id, x.Delivery_Commission })
                .ToDictionaryAsync(x => x.Id, x => x.Delivery_Commission);

            foreach (var order in orders)
            {
                tips.TryGetValue(order.Id, out var tip);
                order.Earning = DeliveryLedger.OrderAmount(settings, delivery?.CommissionDelivers, order.Total_Value_Order, tip);
            }
        }

        /// <summary>Por que a mudança de status não aconteceu.</summary>
        private async Task<Error> ExplainFailureAsync(int deliveryId, int orderId)
        {
            var order = await _unitOfWork.GetClassAsyncWhere<Orders>(x => x.Id == orderId && x.Isdelete != true);

            if (order == null || order.Id_User_Delivery != deliveryId)
                return Error.NotFound("Delivery.OrderNotFound", "Este pedido não está mais com você. Atualize a lista.");

            return Error.Conflict("Delivery.InvalidStatus", $"Este pedido está como '{StatusLabel(order.Order_Status)}'. Atualize a lista.");
        }

        private async Task NotifyCustomerSafeAsync(int orderId, string status, string? whoReceivedIt, DateTime when)
        {
            try
            {
                await _statusNotifier.NotifyCustomerAsync(orderId, status, whoReceivedIt, when);
            }
            catch
            {
                // A entrega já foi registrada; falha no e-mail não desfaz.
            }
        }

        private async Task SaveLogAsync(int deliveryId, string acao, string info, string log)
        {
            await _unitOfWork.InsertAsyncReturnId<Logs>(new Logs
            {
                Id_User = deliveryId,
                Nivel = "Delivery",
                Tipo = "Entrega",
                Acao = acao,
                Info = info,
                Log = log,
                InsertDate = DateTime.Now
            });
        }

        public static DateTime StartOfWeek(DateTime date)
        {
            var diff = ((int)date.DayOfWeek + 6) % 7; // segunda-feira
            return date.Date.AddDays(-diff);
        }

        public static string StatusLabel(string status) => status switch
        {
            "PENDENTE" => "Pendente",
            "CONFIRMADO" => "Confirmado",
            "PREPARANDO" => "Preparando",
            "SAIU_PARA_ENTREGA" => "Saiu para entrega",
            "ENTREGUE" => "Entregue",
            "CANCELADO" => "Cancelado",
            _ => status ?? "-"
        };
    }
}
