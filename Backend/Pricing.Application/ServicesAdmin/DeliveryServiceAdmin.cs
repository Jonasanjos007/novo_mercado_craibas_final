using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Enums;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces.Services;
using Mercado.Craibas.Application.InterfacesAdmin;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Mercado.Craibas.Application.Services;
using Microsoft.EntityFrameworkCore;

namespace Mercado.Craibas.Application.ServicesAdmin
{
    public class DeliveryServiceAdmin : IDeliveryServiceAdmin
    {
        private const int HistoryLimit = 300;

        /// <summary>Uma baixa por vez (evita pagar o mesmo item duas vezes num clique duplo).</summary>
        private static readonly SemaphoreSlim PayoutLock = new(1, 1);

        private readonly IUnitOfWorkAdmin _unitOfWorkAdmin;
        private readonly IOrderStatusNotifier _statusNotifier;

        public DeliveryServiceAdmin(IUnitOfWorkAdmin unitOfWorkAdmin, IOrderStatusNotifier statusNotifier)
        {
            _unitOfWorkAdmin = unitOfWorkAdmin;
            _statusNotifier = statusNotifier;
        }

        // ═════════════════════════ Minhas entregas ═════════════════════════

        public async Task<Result<List<DeliveryOrderResponse>>> GetBoardAsync(int adminId)
        {
            var query = _unitOfWorkAdmin.Query<Orders>()
                .AsNoTracking()
                .Where(x => x.Isdelete != true
                            && (x.Order_Status == DeliveryOrderStatus.Preparando
                                || x.Order_Status == DeliveryOrderStatus.SaiuParaEntrega))
                .OrderBy(x => x.InsertDate);

            var orders = await DeliveryOrderProjection.Project(query).ToListAsync();

            foreach (var order in orders)
                order.IsMine = order.AssigneeType == "ADMIN" && order.AssigneeId == adminId;

            return Result<List<DeliveryOrderResponse>>.Success(orders);
        }

        public async Task<Result<List<DeliveryOrderResponse>>> GetMyHistoryAsync(int adminId)
        {
            var query = _unitOfWorkAdmin.Query<Orders>()
                .AsNoTracking()
                .Where(x => x.Id_User_Admin_Delivery == adminId
                            && x.Order_Status == DeliveryOrderStatus.Entregue
                            && x.Isdelete != true)
                .OrderByDescending(x => x.CustomerDeliveryDate ?? x.UpdateDate ?? x.InsertDate)
                .Take(HistoryLimit);

            var orders = await DeliveryOrderProjection.Project(query).ToListAsync();

            foreach (var order in orders)
                order.IsMine = true;

            return Result<List<DeliveryOrderResponse>>.Success(orders);
        }

        public async Task<Result<bool>> TakeAsync(int adminId, int orderId, TakeDeliveryOrderRequest request)
        {
            var admin = await GetAdminAsync(adminId);
            if (admin == null)
                return Result<bool>.Failure(Error.NotFound("Admin.NotFound", "Administrador não encontrado."));

            var order = await GetActiveOrderAsync(orderId);
            if (order == null)
                return Result<bool>.Failure(Error.NotFound("Delivery.OrderNotFound", "Pedido não está disponível para entrega. Atualize a lista."));

            if (order.Id_User_Admin_Delivery == adminId)
                return Result<bool>.Success(true);

            var force = request?.Force == true;

            // Já está com alguém: avisa quem é (o front pergunta se quer assumir)
            if (!force && (order.Id_User_Delivery != null || order.Id_User_Admin_Delivery != null))
            {
                var holder = await GetAssigneeNameAsync(order);
                return Result<bool>.Failure(Error.Conflict("Delivery.AlreadyAssigned", $"Este pedido já está sendo entregue por {holder}."));
            }

            var now = DateTime.Now;
            var previousDelivery = order.Id_User_Delivery;
            var previousAdmin = order.Id_User_Admin_Delivery;

            // Só aplica se ninguém mexeu no pedido desde a leitura
            var updated = await _unitOfWorkAdmin.Query<Orders>()
                .Where(x => x.Id == orderId
                            && x.Isdelete != true
                            && x.Order_Status == order.Order_Status
                            && x.Id_User_Delivery == previousDelivery
                            && x.Id_User_Admin_Delivery == previousAdmin)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.Id_User_Delivery, (int?)null)
                    .SetProperty(x => x.Id_User_Admin_Delivery, (int?)adminId)
                    .SetProperty(x => x.Delivery_AssignedAt, (DateTime?)now)
                    .SetProperty(x => x.UpdateDate, (DateTime?)now));

            if (updated == 0)
                return Result<bool>.Failure(Error.Conflict("Delivery.Changed", "O pedido foi alterado por outra pessoa. Atualize a lista."));

            var previousName = previousDelivery != null || previousAdmin != null
                ? await GetAssigneeNameAsync(order)
                : null;

            await SaveLogAsync(adminId,
                acao: "Pegou pedido para entregar",
                info: $"{admin.Name} pegou o pedido #{order.Number_Order} para entregar" + (previousName != null ? $" (antes com {previousName})." : "."),
                log: $"O administrador {admin.Name} pegou o pedido N° {order.Number_Order} (ID {order.Id}) para ele mesmo entregar. " +
                     $"Responsável anterior: {previousName ?? "nenhum"}. Data/Hora: {now:dd/MM/yyyy HH:mm:ss}.");

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> ReleaseAsync(int adminId, int orderId)
        {
            var admin = await GetAdminAsync(adminId);
            if (admin == null)
                return Result<bool>.Failure(Error.NotFound("Admin.NotFound", "Administrador não encontrado."));

            var now = DateTime.Now;

            var updated = await _unitOfWorkAdmin.Query<Orders>()
                .Where(x => x.Id == orderId
                            && x.Id_User_Admin_Delivery == adminId
                            && x.Order_Status == DeliveryOrderStatus.Preparando
                            && x.Isdelete != true)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.Id_User_Admin_Delivery, (int?)null)
                    .SetProperty(x => x.Delivery_AssignedAt, (DateTime?)null)
                    .SetProperty(x => x.UpdateDate, (DateTime?)now));

            if (updated == 0)
                return Result<bool>.Failure(Error.Conflict("Delivery.CannotRelease", "Só é possível soltar um pedido que está com você e ainda não saiu para entrega."));

            await SaveLogAsync(adminId,
                acao: "Soltou pedido",
                info: $"{admin.Name} soltou o pedido ID {orderId}.",
                log: $"O administrador {admin.Name} deixou de ser o responsável pela entrega do pedido ID {orderId}. Data/Hora: {now:dd/MM/yyyy HH:mm:ss}.");

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> DispatchAsync(int adminId, int orderId)
        {
            var admin = await GetAdminAsync(adminId);
            if (admin == null)
                return Result<bool>.Failure(Error.NotFound("Admin.NotFound", "Administrador não encontrado."));

            var now = DateTime.Now;

            var updated = await _unitOfWorkAdmin.Query<Orders>()
                .Where(x => x.Id == orderId
                            && x.Id_User_Admin_Delivery == adminId
                            && x.Order_Status == DeliveryOrderStatus.Preparando
                            && x.Isdelete != true)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.Order_Status, DeliveryOrderStatus.SaiuParaEntrega)
                    .SetProperty(x => x.Delivery_DispatchedAt, (DateTime?)now)
                    .SetProperty(x => x.NotifyViaWhatsApp, true)
                    .SetProperty(x => x.UpdateDate, (DateTime?)now));

            if (updated == 0)
                return Result<bool>.Failure(await ExplainAdminFailureAsync(adminId, orderId));

            var order = await _unitOfWorkAdmin.GetClassAsyncWhere<Orders>(x => x.Id == orderId);

            await SaveLogAsync(adminId,
                acao: "Saiu para entrega",
                info: $"{admin.Name} saiu para entregar o pedido #{order?.Number_Order} em {now:dd/MM/yyyy HH:mm}.",
                log: $"O administrador {admin.Name} marcou o pedido N° {order?.Number_Order} (ID {orderId}) como SAIU_PARA_ENTREGA (entrega feita por ele). Data/Hora: {now:dd/MM/yyyy HH:mm:ss}.");

            await NotifyCustomerSafeAsync(orderId, DeliveryOrderStatus.SaiuParaEntrega, null, now);

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> DeliverAsync(int adminId, int orderId, DeliverOrderRequest request)
        {
            var admin = await GetAdminAsync(adminId);
            if (admin == null)
                return Result<bool>.Failure(Error.NotFound("Admin.NotFound", "Administrador não encontrado."));

            var whoReceivedIt = request?.WhoReceivedIt?.Trim();

            if (string.IsNullOrWhiteSpace(whoReceivedIt) || whoReceivedIt.Length < 2)
                return Result<bool>.Failure(Error.Validation("Delivery.ReceiverRequired", "Informe o nome de quem recebeu o pedido."));

            if (whoReceivedIt.Length > 100)
                return Result<bool>.Failure(Error.Validation("Delivery.ReceiverTooLong", "O nome de quem recebeu deve ter no máximo 100 caracteres."));

            var now = DateTime.Now;

            var updated = await _unitOfWorkAdmin.Query<Orders>()
                .Where(x => x.Id == orderId
                            && x.Id_User_Admin_Delivery == adminId
                            && x.Order_Status == DeliveryOrderStatus.SaiuParaEntrega
                            && x.Isdelete != true)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.Order_Status, DeliveryOrderStatus.Entregue)
                    .SetProperty(x => x.WhoReceivedIt, whoReceivedIt)
                    .SetProperty(x => x.CustomerDeliveryDate, (DateTime?)now)
                    .SetProperty(x => x.NotifyViaWhatsApp, true)
                    .SetProperty(x => x.UpdateDate, (DateTime?)now));

            if (updated == 0)
                return Result<bool>.Failure(await ExplainAdminFailureAsync(adminId, orderId));

            var order = await _unitOfWorkAdmin.GetClassAsyncWhere<Orders>(x => x.Id == orderId);

            await SaveLogAsync(adminId,
                acao: "Entregou o pedido",
                info: $"{admin.Name} entregou o pedido #{order?.Number_Order} para {whoReceivedIt} em {now:dd/MM/yyyy HH:mm}.",
                log: $"O administrador {admin.Name} entregou o pedido N° {order?.Number_Order} (ID {orderId}). Recebido por: {whoReceivedIt}. Data/Hora: {now:dd/MM/yyyy HH:mm:ss}.");

            await NotifyCustomerSafeAsync(orderId, DeliveryOrderStatus.Entregue, whoReceivedIt, now);

            return Result<bool>.Success(true);
        }

        // ═════════════════════════ Deliverys ═════════════════════════

        public async Task<Result<List<DeliveryDriverAdminResponse>>> GetDeliverersAsync()
        {
            var deliverers = await _unitOfWorkAdmin.Query<User_Delivery>()
                .AsNoTracking()
                .Where(x => x.Isdelete != true)
                .OrderBy(x => x.Name)
                .ToListAsync();

            var today = DateTime.Today;

            var assigned = _unitOfWorkAdmin.Query<Orders>()
                .AsNoTracking()
                .Where(x => x.Id_User_Delivery != null && x.Isdelete != true);

            var active = await assigned
                .Where(x => x.Order_Status == DeliveryOrderStatus.Preparando
                            || x.Order_Status == DeliveryOrderStatus.SaiuParaEntrega)
                .GroupBy(x => new { x.Id_User_Delivery, x.Order_Status })
                .Select(g => new { DeliveryId = g.Key.Id_User_Delivery!.Value, Status = g.Key.Order_Status, Count = g.Count() })
                .ToListAsync();

            var delivered = await assigned
                .Where(x => x.Order_Status == DeliveryOrderStatus.Entregue)
                .GroupBy(x => x.Id_User_Delivery)
                .Select(g => new
                {
                    DeliveryId = g.Key!.Value,
                    Total = g.Count(),
                    Today = g.Count(x => x.CustomerDeliveryDate >= today),
                    Last = g.Max(x => x.CustomerDeliveryDate)
                })
                .ToListAsync();

            var settings = await DeliveryLedger.LoadSettingsAsync(_unitOfWorkAdmin.Query<DeliverySettings>());
            var ledgers = await BuildLedgersAsync(null, settings);

            var response = deliverers.Select(d =>
            {
                var stats = delivered.FirstOrDefault(x => x.DeliveryId == d.Id);
                ledgers.TryGetValue(d.Id, out var ledger);

                return new DeliveryDriverAdminResponse
                {
                    Id = d.Id,
                    Name = d.Name,
                    Email = d.Email,
                    Phone = d.Phone,
                    Transport = d.Transport,
                    Avatar = d.Avatar,
                    Ativo = d.Ativo,
                    PreparingOrders = active.Where(x => x.DeliveryId == d.Id && x.Status == DeliveryOrderStatus.Preparando).Sum(x => x.Count),
                    EnRouteOrders = active.Where(x => x.DeliveryId == d.Id && x.Status == DeliveryOrderStatus.SaiuParaEntrega).Sum(x => x.Count),
                    DeliveredTotal = stats?.Total ?? 0,
                    DeliveredToday = stats?.Today ?? 0,
                    LastDeliveryAt = stats?.Last,
                    PendingAmount = ledger?.PendingTotal ?? 0,
                    PendingItems = ledger?.Pending.Count ?? 0,
                    PaidAmount = ledger?.PaidTotal ?? 0,
                    CommissionDelivers = d.CommissionDelivers,
                    DailyRate = d.DailyRate
                };
            }).ToList();

            return Result<List<DeliveryDriverAdminResponse>>.Success(response);
        }

        public async Task<Result<bool>> AssignAsync(int adminId, int orderId, AssignDeliveryRequest request)
        {
            var admin = await GetAdminAsync(adminId);
            if (admin == null)
                return Result<bool>.Failure(Error.NotFound("Admin.NotFound", "Administrador não encontrado."));

            var deliveryId = request?.DeliveryId ?? 0;

            var delivery = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Delivery>(x => x.Id == deliveryId && x.Isdelete != true);

            if (delivery == null)
                return Result<bool>.Failure(Error.NotFound("Delivery.NotFound", "Entregador não encontrado."));

            if (!delivery.Ativo)
                return Result<bool>.Failure(Error.Validation("Delivery.Inactive", $"{delivery.Name} está desativado e não pode receber pedidos."));

            var order = await GetActiveOrderAsync(orderId);
            if (order == null)
                return Result<bool>.Failure(Error.NotFound("Delivery.OrderNotFound", "Só é possível atribuir pedidos em 'Preparando' ou 'Saiu para entrega'. Atualize a lista."));

            if (order.Id_User_Delivery == deliveryId)
                return Result<bool>.Success(true);

            var previousName = order.Id_User_Delivery != null || order.Id_User_Admin_Delivery != null
                ? await GetAssigneeNameAsync(order)
                : null;

            var now = DateTime.Now;
            var previousDelivery = order.Id_User_Delivery;
            var previousAdmin = order.Id_User_Admin_Delivery;

            var updated = await _unitOfWorkAdmin.Query<Orders>()
                .Where(x => x.Id == orderId
                            && x.Isdelete != true
                            && x.Order_Status == order.Order_Status
                            && x.Id_User_Delivery == previousDelivery
                            && x.Id_User_Admin_Delivery == previousAdmin)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.Id_User_Delivery, (int?)deliveryId)
                    .SetProperty(x => x.Id_User_Admin_Delivery, (int?)null)
                    .SetProperty(x => x.Delivery_AssignedAt, (DateTime?)now)
                    .SetProperty(x => x.UpdateDate, (DateTime?)now));

            if (updated == 0)
                return Result<bool>.Failure(Error.Conflict("Delivery.Changed", "O pedido foi alterado por outra pessoa. Atualize a lista."));

            await SaveLogAsync(adminId,
                acao: previousName == null ? "Atribuiu entrega" : "Trocou entregador",
                info: $"{admin.Name} atribuiu o pedido #{order.Number_Order} a {delivery.Name}" + (previousName != null ? $" (antes com {previousName})." : "."),
                log: $"O administrador {admin.Name} atribuiu o pedido N° {order.Number_Order} (ID {order.Id}) ao entregador {delivery.Name} (ID {delivery.Id}). " +
                     $"Responsável anterior: {previousName ?? "nenhum"}. Status: {order.Order_Status}. Data/Hora: {now:dd/MM/yyyy HH:mm:ss}.");

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> UnassignAsync(int adminId, int orderId)
        {
            var admin = await GetAdminAsync(adminId);
            if (admin == null)
                return Result<bool>.Failure(Error.NotFound("Admin.NotFound", "Administrador não encontrado."));

            var order = await GetActiveOrderAsync(orderId);
            if (order == null)
                return Result<bool>.Failure(Error.NotFound("Delivery.OrderNotFound", "Pedido não encontrado. Atualize a lista."));

            if (order.Order_Status != DeliveryOrderStatus.Preparando)
                return Result<bool>.Failure(Error.Conflict("Delivery.AlreadyDispatched", "O pedido já saiu para entrega. Troque o entregador em vez de remover."));

            if (order.Id_User_Delivery == null && order.Id_User_Admin_Delivery == null)
                return Result<bool>.Success(true);

            var previousName = await GetAssigneeNameAsync(order);
            var now = DateTime.Now;

            var updated = await _unitOfWorkAdmin.Query<Orders>()
                .Where(x => x.Id == orderId
                            && x.Isdelete != true
                            && x.Order_Status == DeliveryOrderStatus.Preparando)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.Id_User_Delivery, (int?)null)
                    .SetProperty(x => x.Id_User_Admin_Delivery, (int?)null)
                    .SetProperty(x => x.Delivery_AssignedAt, (DateTime?)null)
                    .SetProperty(x => x.UpdateDate, (DateTime?)now));

            if (updated == 0)
                return Result<bool>.Failure(Error.Conflict("Delivery.Changed", "O pedido foi alterado por outra pessoa. Atualize a lista."));

            await SaveLogAsync(adminId,
                acao: "Removeu entregador",
                info: $"{admin.Name} removeu {previousName} do pedido #{order.Number_Order}.",
                log: $"O administrador {admin.Name} removeu o responsável ({previousName}) do pedido N° {order.Number_Order} (ID {order.Id}). Data/Hora: {now:dd/MM/yyyy HH:mm:ss}.");

            return Result<bool>.Success(true);
        }

        public async Task<Result<DeliverySettingsResponse>> GetSettingsAsync()
        {
            var settings = await DeliveryLedger.LoadSettingsAsync(_unitOfWorkAdmin.Query<DeliverySettings>());

            string? updatedByName = null;
            if (settings.UpdatedById.HasValue)
                updatedByName = (await GetAdminAsync(settings.UpdatedById.Value))?.Name;

            return Result<DeliverySettingsResponse>.Success(MapSettings(settings, updatedByName));
        }

        public async Task<Result<DeliverySettingsResponse>> SaveSettingsAsync(int adminId, DeliverySettingsRequest request)
        {
            var admin = await GetAdminAsync(adminId);
            if (admin == null)
                return Result<DeliverySettingsResponse>.Failure(Error.NotFound("Admin.NotFound", "Administrador não encontrado."));

            if (request == null)
                return Result<DeliverySettingsResponse>.Failure(Error.Validation("Delivery.Settings", "Dados inválidos."));

            if (!Enum.TryParse<DeliveryPayModeEnum>(request.Mode, true, out var mode))
                return Result<DeliverySettingsResponse>.Failure(Error.Validation("Delivery.Settings", "Escolha o modo: por pedido ou por dia."));

            if (!Enum.TryParse<DeliveryValueTypeEnum>(request.OrderValueType, true, out var valueType))
                return Result<DeliverySettingsResponse>.Failure(Error.Validation("Delivery.Settings", "Escolha o tipo do valor: fixo ou porcentagem."));

            if (double.IsNaN(request.OrderValue) || request.OrderValue < 0 || request.OrderValue > 100000)
                return Result<DeliverySettingsResponse>.Failure(Error.Validation("Delivery.Settings", "Valor por pedido inválido."));

            if (valueType == DeliveryValueTypeEnum.PERCENTUAL && request.OrderValue > 100)
                return Result<DeliverySettingsResponse>.Failure(Error.Validation("Delivery.Settings", "A porcentagem deve ficar entre 0 e 100."));

            if (double.IsNaN(request.DailyValue) || request.DailyValue < 0 || request.DailyValue > 100000)
                return Result<DeliverySettingsResponse>.Failure(Error.Validation("Delivery.Settings", "Valor por dia inválido."));

            var orderValue = DeliveryLedger.Round(request.OrderValue);
            var dailyValue = DeliveryLedger.Round(request.DailyValue);
            var countFrom = request.CountFrom?.Date;
            var now = DateTime.Now;

            var before = await DeliveryLedger.LoadSettingsAsync(_unitOfWorkAdmin.Query<DeliverySettings>());

            var updated = await _unitOfWorkAdmin.Query<DeliverySettings>()
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.TipEnabled, request.TipEnabled)
                    .SetProperty(x => x.Mode, mode)
                    .SetProperty(x => x.OrderValueType, valueType)
                    .SetProperty(x => x.OrderValue, orderValue)
                    .SetProperty(x => x.DailyValue, dailyValue)
                    .SetProperty(x => x.CountFrom, countFrom)
                    .SetProperty(x => x.UpdatedById, (int?)adminId)
                    .SetProperty(x => x.UpdateDate, (DateTime?)now));

            if (updated == 0)
            {
                await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new DeliverySettings
                {
                    TipEnabled = request.TipEnabled,
                    Mode = mode,
                    OrderValueType = valueType,
                    OrderValue = orderValue,
                    DailyValue = dailyValue,
                    CountFrom = countFrom,
                    UpdatedById = adminId,
                    InsertDate = now,
                    UpdateDate = now
                });
            }

            var tipLabel = request.TipEnabled ? "ATIVA" : "DESATIVADA";
            var valueLabel = mode == DeliveryPayModeEnum.POR_DIA
                ? $"R$ {dailyValue:N2} por dia"
                : valueType == DeliveryValueTypeEnum.PERCENTUAL ? $"{orderValue:N2}% por pedido" : $"R$ {orderValue:N2} por pedido";

            await SaveLogAsync(adminId,
                acao: "Alterou configuração de entregas",
                info: $"{admin.Name} deixou a gorjeta {tipLabel} ({valueLabel}).",
                log: $"O administrador {admin.Name} alterou a configuração de pagamento dos entregadores. " +
                     $"Antes: gorjeta {(before.TipEnabled ? "ATIVA" : "DESATIVADA")}, modo {before.Mode}, tipo {before.OrderValueType}, por pedido {before.OrderValue:N2}, por dia {before.DailyValue:N2}, a partir de {before.CountFrom:dd/MM/yyyy}. " +
                     $"Agora: gorjeta {tipLabel}, modo {mode}, tipo {valueType}, por pedido {orderValue:N2}, por dia {dailyValue:N2}, a partir de {countFrom:dd/MM/yyyy}. Data/Hora: {now:dd/MM/yyyy HH:mm:ss}.");

            return await GetSettingsAsync();
        }

        public async Task<Result<bool>> SaveRatesAsync(int adminId, int deliveryId, DeliveryRatesRequest request)
        {
            var admin = await GetAdminAsync(adminId);
            if (admin == null)
                return Result<bool>.Failure(Error.NotFound("Admin.NotFound", "Administrador não encontrado."));

            var commission = request?.CommissionDelivers;
            var daily = request?.DailyRate;

            if (commission.HasValue && (double.IsNaN(commission.Value) || commission.Value < 0 || commission.Value > 100000))
                return Result<bool>.Failure(Error.Validation("Delivery.Rates", "Valor por pedido inválido."));

            if (daily.HasValue && (double.IsNaN(daily.Value) || daily.Value < 0 || daily.Value > 100000))
                return Result<bool>.Failure(Error.Validation("Delivery.Rates", "Valor por dia inválido."));

            var settings = await DeliveryLedger.LoadSettingsAsync(_unitOfWorkAdmin.Query<DeliverySettings>());
            if (commission.HasValue && settings.OrderValueType == DeliveryValueTypeEnum.PERCENTUAL && commission.Value > 100)
                return Result<bool>.Failure(Error.Validation("Delivery.Rates", "A porcentagem deve ficar entre 0 e 100."));

            var delivery = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Delivery>(x => x.Id == deliveryId && x.Isdelete != true);
            if (delivery == null)
                return Result<bool>.Failure(Error.NotFound("Delivery.NotFound", "Entregador não encontrado."));

            double? commissionValue = commission.HasValue ? DeliveryLedger.Round(commission.Value) : null;
            double? dailyValue = daily.HasValue ? DeliveryLedger.Round(daily.Value) : null;
            var now = DateTime.Now;

            await _unitOfWorkAdmin.Query<User_Delivery>()
                .Where(x => x.Id == deliveryId)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.CommissionDelivers, commissionValue)
                    .SetProperty(x => x.DailyRate, dailyValue)
                    .SetProperty(x => x.UpdateDate, (DateTime?)now));

            await SaveLogAsync(adminId,
                acao: "Alterou valor do entregador",
                info: $"{admin.Name} alterou os valores próprios de {delivery.Name}.",
                log: $"O administrador {admin.Name} alterou os valores próprios do entregador {delivery.Name} (ID {delivery.Id}). " +
                     $"Por pedido: {delivery.CommissionDelivers?.ToString("N2") ?? "geral"} → {commissionValue?.ToString("N2") ?? "geral"}. " +
                     $"Por dia: {delivery.DailyRate?.ToString("N2") ?? "geral"} → {dailyValue?.ToString("N2") ?? "geral"}. Data/Hora: {now:dd/MM/yyyy HH:mm:ss}.");

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> SetOrderTipAsync(int adminId, int orderId, DeliveryOrderTipRequest request)
        {
            var admin = await GetAdminAsync(adminId);
            if (admin == null)
                return Result<bool>.Failure(Error.NotFound("Admin.NotFound", "Administrador não encontrado."));

            var amount = request?.Amount;

            if (amount.HasValue && (double.IsNaN(amount.Value) || amount.Value < 0 || amount.Value > 100000))
                return Result<bool>.Failure(Error.Validation("Delivery.Tip", "Valor da gorjeta inválido."));

            var order = await _unitOfWorkAdmin.GetClassAsyncWhere<Orders>(x => x.Id == orderId && x.Isdelete != true);

            if (order == null || order.Id_User_Delivery == null)
                return Result<bool>.Failure(Error.NotFound("Delivery.OrderNotFound", "Pedido não encontrado ou sem entregador."));

            var alreadyPaid = await _unitOfWorkAdmin.Query<DeliveryPayoutItem>()
                .AsNoTracking()
                .AnyAsync(x => x.Id_Order == orderId && x.DeliveryPayout.ReversedAt == null);

            if (alreadyPaid)
                return Result<bool>.Failure(Error.Conflict("Delivery.AlreadyPaid", "Este pedido já foi pago. Estorne a baixa para alterar a gorjeta."));

            double? value = amount.HasValue ? DeliveryLedger.Round(amount.Value) : null;
            var now = DateTime.Now;

            await _unitOfWorkAdmin.Query<Orders>()
                .Where(x => x.Id == orderId)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.Delivery_Commission, value)
                    .SetProperty(x => x.UpdateDate, (DateTime?)now));

            await SaveLogAsync(adminId,
                acao: "Alterou gorjeta do pedido",
                info: $"{admin.Name} definiu a gorjeta do pedido #{order.Number_Order} como {(value.HasValue ? $"R$ {value:N2}" : "padrão")}.",
                log: $"O administrador {admin.Name} alterou a gorjeta do pedido N° {order.Number_Order} (ID {order.Id}) de " +
                     $"{order.Delivery_Commission?.ToString("N2") ?? "padrão"} para {value?.ToString("N2") ?? "padrão"}. Data/Hora: {now:dd/MM/yyyy HH:mm:ss}.");

            return Result<bool>.Success(true);
        }

        public async Task<Result<DeliveryPayablesResponse>> GetPayablesAsync(int deliveryId)
        {
            var delivery = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Delivery>(x => x.Id == deliveryId && x.Isdelete != true);
            if (delivery == null)
                return Result<DeliveryPayablesResponse>.Failure(Error.NotFound("Delivery.NotFound", "Entregador não encontrado."));

            var settings = await DeliveryLedger.LoadSettingsAsync(_unitOfWorkAdmin.Query<DeliverySettings>());
            var ledgers = await BuildLedgersAsync(deliveryId, settings);
            ledgers.TryGetValue(deliveryId, out var ledger);

            return Result<DeliveryPayablesResponse>.Success(new DeliveryPayablesResponse
            {
                Enabled = settings.TipEnabled,
                Mode = settings.Mode.ToString(),
                DeliveryId = delivery.Id,
                DeliveryName = delivery.Name,
                Total = ledger?.PendingTotal ?? 0,
                Entries = ledger?.Pending ?? new List<DeliveryEarningEntryResponse>()
            });
        }

        public async Task<Result<DeliveryPayoutResponse>> CreatePayoutAsync(int adminId, CreateDeliveryPayoutRequest request)
        {
            var admin = await GetAdminAsync(adminId);
            if (admin == null)
                return Result<DeliveryPayoutResponse>.Failure(Error.NotFound("Admin.NotFound", "Administrador não encontrado."));

            if (request == null)
                return Result<DeliveryPayoutResponse>.Failure(Error.Validation("Delivery.Payout", "Dados inválidos."));

            var note = request.Note?.Trim();
            if (note?.Length > 500)
                return Result<DeliveryPayoutResponse>.Failure(Error.Validation("Delivery.Payout", "A observação deve ter no máximo 500 caracteres."));

            var delivery = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Delivery>(x => x.Id == request.DeliveryId && x.Isdelete != true);
            if (delivery == null)
                return Result<DeliveryPayoutResponse>.Failure(Error.NotFound("Delivery.NotFound", "Entregador não encontrado."));

            await PayoutLock.WaitAsync();
            try
            {
                var settings = await DeliveryLedger.LoadSettingsAsync(_unitOfWorkAdmin.Query<DeliverySettings>());

                if (!settings.TipEnabled)
                    return Result<DeliveryPayoutResponse>.Failure(Error.Validation("Delivery.TipDisabled", "A gorjeta está desativada. Ative na configuração para dar baixa."));

                // Recalcula aqui: o valor pago é sempre o do servidor, nunca o da tela
                var ledgers = await BuildLedgersAsync(delivery.Id, settings);
                ledgers.TryGetValue(delivery.Id, out var ledger);
                var pending = ledger?.Pending ?? new List<DeliveryEarningEntryResponse>();

                List<DeliveryEarningEntryResponse> selected;

                if (settings.Mode == DeliveryPayModeEnum.POR_DIA)
                {
                    var days = (request.WorkDates ?? new List<DateTime>()).Select(x => x.Date).Distinct().ToList();
                    selected = pending.Where(x => x.Kind == "DIA" && days.Contains(x.Date.Date)).ToList();

                    if (days.Count == 0 || selected.Count != days.Count)
                        return Result<DeliveryPayoutResponse>.Failure(Error.Conflict("Delivery.PayablesChanged", "Alguns dias já foram pagos ou mudaram. Atualize a lista."));
                }
                else
                {
                    var ids = (request.OrderIds ?? new List<int>()).Distinct().ToList();
                    selected = pending.Where(x => x.Kind == "PEDIDO" && x.OrderId.HasValue && ids.Contains(x.OrderId.Value)).ToList();

                    if (ids.Count == 0 || selected.Count != ids.Count)
                        return Result<DeliveryPayoutResponse>.Failure(Error.Conflict("Delivery.PayablesChanged", "Alguns pedidos já foram pagos ou mudaram. Atualize a lista."));
                }

                var now = DateTime.Now;

                var payout = new DeliveryPayout
                {
                    Id_User_Delivery = delivery.Id,
                    Mode = settings.Mode,
                    PeriodStart = selected.Min(x => x.Date),
                    PeriodEnd = selected.Max(x => x.Date),
                    Total = DeliveryLedger.Round(selected.Sum(x => x.Amount)),
                    PaidAt = now,
                    PaidById = adminId,
                    Note = string.IsNullOrWhiteSpace(note) ? null : note,
                    InsertDate = now,
                    Items = selected.Select(x => new DeliveryPayoutItem
                    {
                        Id_Order = x.OrderId,
                        WorkDate = x.Kind == "DIA" ? x.Date.Date : null,
                        ReferenceDate = x.Date,
                        Deliveries = x.Deliveries,
                        Amount = x.Amount,
                        InsertDate = now
                    }).ToList()
                };

                await _unitOfWorkAdmin.InsertAsyncReturnObjeto(payout);

                await SaveLogAsync(adminId,
                    acao: "Deu baixa no entregador",
                    info: $"{admin.Name} pagou R$ {payout.Total:N2} para {delivery.Name} ({selected.Count} {(settings.Mode == DeliveryPayModeEnum.POR_DIA ? "dia(s)" : "pedido(s)")}).",
                    log: $"O administrador {admin.Name} deu baixa de R$ {payout.Total:N2} para o entregador {delivery.Name} (ID {delivery.Id}). " +
                         $"Baixa ID {payout.Id}. Modo: {settings.Mode}. Itens: {selected.Count}. Período: {payout.PeriodStart:dd/MM/yyyy} a {payout.PeriodEnd:dd/MM/yyyy}. " +
                         $"Observação: {note ?? "-"}. Data/Hora: {now:dd/MM/yyyy HH:mm:ss}.");

                var created = await LoadPayoutsAsync(null, payout.Id);
                return Result<DeliveryPayoutResponse>.Success(created.First());
            }
            finally
            {
                PayoutLock.Release();
            }
        }

        public async Task<Result<List<DeliveryPayoutResponse>>> GetPayoutsAsync(int? deliveryId)
        {
            var payouts = await LoadPayoutsAsync(deliveryId, null);
            return Result<List<DeliveryPayoutResponse>>.Success(payouts);
        }

        public async Task<Result<bool>> ReversePayoutAsync(int adminId, int payoutId, ReverseDeliveryPayoutRequest request)
        {
            var admin = await GetAdminAsync(adminId);
            if (admin == null)
                return Result<bool>.Failure(Error.NotFound("Admin.NotFound", "Administrador não encontrado."));

            var reason = request?.Reason?.Trim();

            if (string.IsNullOrWhiteSpace(reason) || reason.Length < 3)
                return Result<bool>.Failure(Error.Validation("Delivery.ReverseReason", "Informe o motivo do estorno."));

            if (reason.Length > 500)
                return Result<bool>.Failure(Error.Validation("Delivery.ReverseReason", "O motivo deve ter no máximo 500 caracteres."));

            var payout = await _unitOfWorkAdmin.GetClassAsyncWhere<DeliveryPayout>(x => x.Id == payoutId);
            if (payout == null)
                return Result<bool>.Failure(Error.NotFound("Delivery.PayoutNotFound", "Baixa não encontrada."));

            var now = DateTime.Now;

            var updated = await _unitOfWorkAdmin.Query<DeliveryPayout>()
                .Where(x => x.Id == payoutId && x.ReversedAt == null)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.ReversedAt, (DateTime?)now)
                    .SetProperty(x => x.ReversedById, (int?)adminId)
                    .SetProperty(x => x.ReversedReason, reason)
                    .SetProperty(x => x.UpdateDate, (DateTime?)now));

            if (updated == 0)
                return Result<bool>.Failure(Error.Conflict("Delivery.AlreadyReversed", "Esta baixa já foi estornada."));

            var delivery = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Delivery>(x => x.Id == payout.Id_User_Delivery);

            await SaveLogAsync(adminId,
                acao: "Estornou baixa do entregador",
                info: $"{admin.Name} estornou a baixa de R$ {payout.Total:N2} de {delivery?.Name}.",
                log: $"O administrador {admin.Name} estornou a baixa ID {payout.Id} (R$ {payout.Total:N2}) do entregador {delivery?.Name} (ID {payout.Id_User_Delivery}). " +
                     $"Motivo: {reason}. Os itens voltaram a ficar pendentes. Data/Hora: {now:dd/MM/yyyy HH:mm:ss}.");

            return Result<bool>.Success(true);
        }

        // ═════════════════════════ helpers ═════════════════════════

        private Task<Dictionary<int, DeliveryLedgerResult>> BuildLedgersAsync(int? deliveryId, DeliverySettings settings)
        {
            return DeliveryLedger.BuildAsync(
                deliveryId,
                settings,
                _unitOfWorkAdmin.Query<User_Delivery>(),
                _unitOfWorkAdmin.Query<Orders>(),
                _unitOfWorkAdmin.Query<DeliveryPayoutItem>());
        }

        private async Task<List<DeliveryPayoutResponse>> LoadPayoutsAsync(int? deliveryId, int? payoutId)
        {
            var query = _unitOfWorkAdmin.Query<DeliveryPayout>().AsNoTracking();

            if (deliveryId.HasValue)
                query = query.Where(x => x.Id_User_Delivery == deliveryId.Value);

            if (payoutId.HasValue)
                query = query.Where(x => x.Id == payoutId.Value);

            var payouts = await query
                .OrderByDescending(x => x.PaidAt)
                .Take(200)
                .Select(x => new
                {
                    x.Id,
                    x.Id_User_Delivery,
                    DeliveryName = x.User_Delivery.Name,
                    x.Mode,
                    x.PeriodStart,
                    x.PeriodEnd,
                    x.Total,
                    x.PaidAt,
                    x.PaidById,
                    x.Note,
                    x.ReversedAt,
                    x.ReversedById,
                    x.ReversedReason,
                    Items = x.Items.Select(i => new
                    {
                        i.Id_Order,
                        OrderNumber = i.Order != null ? i.Order.Number_Order : null,
                        i.WorkDate,
                        i.ReferenceDate,
                        i.Deliveries,
                        i.Amount
                    }).ToList()
                })
                .ToListAsync();

            // Nomes dos admins (quem pagou / quem estornou)
            var admins = await _unitOfWorkAdmin.Query<User_Admin>()
                .AsNoTracking()
                .Select(x => new { x.Id, x.Name })
                .ToDictionaryAsync(x => x.Id, x => x.Name);

            return payouts.Select(p => new DeliveryPayoutResponse
            {
                Id = p.Id,
                DeliveryId = p.Id_User_Delivery,
                DeliveryName = p.DeliveryName,
                Mode = p.Mode.ToString(),
                PeriodStart = p.PeriodStart,
                PeriodEnd = p.PeriodEnd,
                Total = p.Total,
                ItemsCount = p.Items.Count,
                Deliveries = p.Items.Sum(i => i.Deliveries),
                PaidAt = p.PaidAt,
                PaidByName = admins.TryGetValue(p.PaidById, out var paidBy) ? paidBy : null,
                Note = p.Note,
                ReversedAt = p.ReversedAt,
                ReversedByName = p.ReversedById.HasValue && admins.TryGetValue(p.ReversedById.Value, out var reversedBy) ? reversedBy : null,
                ReversedReason = p.ReversedReason,
                Items = p.Items
                    .OrderByDescending(i => i.ReferenceDate)
                    .Select(i => new DeliveryEarningEntryResponse
                    {
                        Kind = i.Id_Order.HasValue ? "PEDIDO" : "DIA",
                        OrderId = i.Id_Order,
                        OrderNumber = i.OrderNumber,
                        Date = i.ReferenceDate,
                        Deliveries = i.Deliveries,
                        Amount = i.Amount,
                        Paid = p.ReversedAt == null,
                        PaidAt = p.PaidAt,
                        PayoutId = p.Id
                    }).ToList()
            }).ToList();
        }

        private Task<User_Admin?> GetAdminAsync(int adminId) =>
            _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == adminId && x.Isdelete != true);

        /// <summary>Pedido em PREPARANDO ou SAIU_PARA_ENTREGA.</summary>
        private Task<Orders?> GetActiveOrderAsync(int orderId) =>
            _unitOfWorkAdmin.GetClassAsyncWhere<Orders>(x => x.Id == orderId
                && x.Isdelete != true
                && (x.Order_Status == DeliveryOrderStatus.Preparando
                    || x.Order_Status == DeliveryOrderStatus.SaiuParaEntrega));

        private async Task<string> GetAssigneeNameAsync(Orders order)
        {
            if (order.Id_User_Delivery.HasValue)
            {
                var delivery = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Delivery>(x => x.Id == order.Id_User_Delivery.Value);
                return delivery?.Name ?? "outro entregador";
            }

            if (order.Id_User_Admin_Delivery.HasValue)
            {
                var admin = await GetAdminAsync(order.Id_User_Admin_Delivery.Value);
                return admin != null ? $"{admin.Name} (admin)" : "outro administrador";
            }

            return "ninguém";
        }

        private async Task<Error> ExplainAdminFailureAsync(int adminId, int orderId)
        {
            var order = await _unitOfWorkAdmin.GetClassAsyncWhere<Orders>(x => x.Id == orderId && x.Isdelete != true);

            if (order == null)
                return Error.NotFound("Delivery.OrderNotFound", "Pedido não encontrado. Atualize a lista.");

            if (order.Id_User_Admin_Delivery != adminId)
            {
                var holder = await GetAssigneeNameAsync(order);
                return Error.Conflict("Delivery.AlreadyAssigned", $"Este pedido está com {holder}. Pegue o pedido antes de continuar.");
            }

            return Error.Conflict("Delivery.InvalidStatus", $"Este pedido está como '{DeliveryService.StatusLabel(order.Order_Status)}'. Atualize a lista.");
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

        private async Task SaveLogAsync(int adminId, string acao, string info, string log)
        {
            await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new Logs
            {
                Id_User = adminId,
                Nivel = "Admin",
                Tipo = "Entregas",
                Acao = acao,
                Info = info,
                Log = log,
                InsertDate = DateTime.Now
            });
        }

        private static DeliverySettingsResponse MapSettings(DeliverySettings settings, string? updatedByName) => new()
        {
            TipEnabled = settings.TipEnabled,
            Mode = settings.Mode.ToString(),
            OrderValueType = settings.OrderValueType.ToString(),
            OrderValue = settings.OrderValue,
            DailyValue = settings.DailyValue,
            CountFrom = settings.CountFrom,
            UpdateDate = settings.UpdateDate,
            UpdatedByName = updatedByName
        };
    }
}
