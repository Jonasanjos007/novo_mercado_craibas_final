using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces;
using Mercado.Craibas.Application.Interfaces.Repositories;
using Mercado.Craibas.Application.Interfaces.Services;
using Mercado.Craibas.Application.InterfacesAdmin;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Mercado.Craibas.Application.Services;
using Microsoft.EntityFrameworkCore;
using Pricing.Api.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.ServicesAdmin
{
    public class OrderServiceAdmin : IOrderAdminService
    {
        private readonly IUnitOfWorkAdmin _unitOfWorkAdmin;
        private readonly IEmailService _email;
        private readonly INotificationService _notification;
        private readonly IOrderStatusNotifier _statusNotifier;
        private readonly IOrderStockService _stock;


        public OrderServiceAdmin(IUnitOfWorkAdmin unitOfWorkAdmin,IEmailService email, INotificationService notification, IOrderStatusNotifier statusNotifier, IOrderStockService stock)
        {
            _stock = stock;
            _unitOfWorkAdmin = unitOfWorkAdmin;
            _email = email;
            _notification = notification;
            _statusNotifier = statusNotifier;
        }

        /// <summary>
        /// Projeção da lista de pedidos do admin (mesmo formato de sempre).
        /// Usada pela lista completa e pela lista paginada, para as duas devolverem o mesmo resultado.
        /// </summary>
        private static readonly System.Linq.Expressions.Expression<Func<Orders, OrderResponse>> OrderListProjection =
         x => new OrderResponse
         {
             Id_Order = x.Id,
             Number_Order = x.Number_Order,
             Total_Value_Order = x.Total_Value_Order,
             Status_Pay = x.Status_Pay,
             Order_Status = x.Order_Status,
             Payment_terms = x.Payment_terms,
             InsertDate = x.InsertDate,
             NotifyViaWhatsApp = x.NotifyViaWhatsApp,
             Estimated_Delivery_Date = x.Estimated_Delivery_Date,
             Discont = x.Discont,
             Quantity = x.OrderLineItens.Sum(i => i.Quantity),
             Category = x.OrderLineItens.Select(i => i.Product.Product_Category.Category).FirstOrDefault(),
             WhoReceivedIt = x.WhoReceivedIt,
             CustomerDeliveryDate = x.CustomerDeliveryDate,
             Cancel_Reason = x.Cancel_Reason,
             Canceled_At = x.Canceled_At,
             Canceled_By = x.Canceled_By,
             Return_Status = x.Return_Status,
             Return_Reason = x.Return_Reason,
             Return_Requested_At = x.Return_Requested_At,
             Return_Admin_Note = x.Return_Admin_Note,
             Return_Deadline = x.Order_Status == "ENTREGUE"
                 ? (x.CustomerDeliveryDate ?? x.UpdateDate ?? x.InsertDate).AddDays(7)
                 : (DateTime?)null,
             Cancel_Status = x.Cancel_Status,
             Cancel_Requested_At = x.Cancel_Requested_At,
             Cancel_Admin_Note = x.Cancel_Admin_Note,
             DeliveryName = x.User_Delivery != null
                 ? x.User_Delivery.Name
                 : (x.User_Admin_Delivery != null ? x.User_Admin_Delivery.Name : null),
             DeliveryAssigneeType = x.Id_User_Delivery != null ? "DELIVERY" : (x.Id_User_Admin_Delivery != null ? "ADMIN" : null),
             Address = new AddressResponse
             {
                 Id = x.Address.Id,
                 Name = x.Address.Name,
                 Road = x.Address.Road,
                 Number = x.Address.Number,
                 Neighborhood = x.Address.Neighborhood,
                 Supplement = x.Address.Supplement,
                 ReferencePoint = x.Address.ReferencePoint,
                 Standard = x.Address.Standard,
                 City = x.Address.City
             },

             Products = x.OrderLineItens.Select(i => new ProductResponse
             {
                 Id = i.Product.Id,
                 Name = i.Product.Name,
                 Description = i.Product.Description,
                 Price_Unic = i.Price_Unit,
                 Origin_Price = i.Origin_Price,
                 Quantity = i.Quantity,
                 Count_Rating = i.Product.Rating,
                 Review_Count = i.Product.ReviewCount,
                 Count_Sold = i.Product.CountSold,
                 Total_Stock = i.Product.Total_Stock,
                 Badge = i.Product.Badge,
                 FreeShipping = i.Product.FreeShipping,
                 Installments = i.Product.installments,
                 Tags = i.Product.Tags,
                 Featured = i.Product.Featured,
                 Imagens = i.Product.Imagens_Products.ToList(),
                 variations = i.Product.Variante_Products.ToList()
             }).ToList()
         };

        public async Task<Result<List<OrderResponse>>> GetOrderAllListAdmin()
        {
            var OrderResponseList = new List<OrderResponse>();

            // AsNoTracking: só leitura, o EF não precisa rastrear milhares de objetos.
            // AsSplitQuery: uma consulta por lista (itens, imagens, variações) em vez de um
            // único JOIN que multiplica imagens x variações de cada item (causava timeout).
            var orderResponseList = await _unitOfWorkAdmin.Query<Orders>()
         .AsNoTracking()
         .AsSplitQuery()
         .OrderByDescending(x => x.InsertDate)
         .Select(OrderListProjection)
         .ToListAsync();

            return Result<List<OrderResponse>>.Success(orderResponseList);

        }

        // ═════════════════════════ PAGINAÇÃO ═════════════════════════

        /// <summary>
        /// Lista de pedidos paginada. Mesmas regras da tela:
        /// - busca: o número (Id) do pedido contém o texto digitado;
        /// - status: igual ao status escolhido (comparação exata);
        /// - ordem: mais recentes primeiro.
        /// Filtros aplicados antes de paginar.
        /// </summary>
        public async Task<Result<PagedResult<OrderResponse>>> GetOrdersPagedAsync(int page, int pageSize, string? search, string? status)
        {
            page = Paging.Page(page);
            pageSize = Paging.Size(pageSize);

            var query = _unitOfWorkAdmin.Query<Orders>().AsNoTracking();

            var term = search ?? string.Empty;
            if (term.Length > 0)
                query = query.Where(x => x.Id.ToString().Contains(term));

            if (!string.IsNullOrEmpty(status) && status != "all")
                query = query.Where(x => EF.Functions.Collate(x.Order_Status, Paging.ExactCollation) == status);

            var total = await query.CountAsync();

            var items = await query
                .OrderByDescending(x => x.InsertDate)
                .ThenByDescending(x => x.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .AsSplitQuery()
                .Select(OrderListProjection)
                .ToListAsync();

            return Result<PagedResult<OrderResponse>>.Success(new PagedResult<OrderResponse>(items, total, page, pageSize));
        }

        /// <summary>Contadores dos filtros de status (sobre todos os pedidos).</summary>
        public async Task<Result<OrderStatusSummaryResponse>> GetOrdersSummaryAsync()
        {
            // Só a coluna de status (leve). A contagem é feita com comparação exata, igual à tela.
            var statuses = await _unitOfWorkAdmin.Query<Orders>()
                .AsNoTracking()
                .Select(x => x.Order_Status)
                .ToListAsync();

            var byStatus = statuses
                .GroupBy(x => x, StringComparer.Ordinal)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToList();

            return Result<OrderStatusSummaryResponse>.Success(new OrderStatusSummaryResponse
            {
                Total = byStatus.Sum(x => x.Count),
                ByStatus = byStatus
                    .Where(x => x.Status != null)
                    .ToDictionary(x => x.Status!, x => x.Count)
            });
        }

        /// <summary>
        /// Números do Dashboard calculados no banco (antes eram somados na tela com todos os pedidos/logs).
        /// Mesmas regras: pedidos cancelados ficam de fora dos totais; acessos = logs "Acesso" de nível "CLIENTE"
        /// dentro da mesma janela de 6 meses usada na tela de movimentação.
        /// </summary>
        public async Task<Result<AdminDashboardResponse>> GetDashboardAsync()
        {
            var now = DateTime.Now;
            var firstMonth = new DateTime(now.Year, now.Month, 1).AddMonths(-6);
            var firstDay = now.Date.AddDays(-8);

            var orders = _unitOfWorkAdmin.Query<Orders>().AsNoTracking();

            var monthly = await orders
                .Where(x => x.InsertDate >= firstMonth
                            && (x.Order_Status == null || EF.Functions.Collate(x.Order_Status, Paging.ExactCollation) != "CANCELADO"))
                .GroupBy(x => new { x.InsertDate.Year, x.InsertDate.Month })
                .Select(g => new DashboardMonthPoint
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Count = g.Count(),
                    Total = g.Sum(x => x.Total_Value_Order)
                })
                .ToListAsync();

            var daily = await orders
                .Where(x => x.InsertDate >= firstDay
                            && (x.Order_Status == null || EF.Functions.Collate(x.Order_Status, Paging.ExactCollation) != "CANCELADO"))
                .GroupBy(x => x.InsertDate.Date)
                .Select(g => new { Day = g.Key, Count = g.Count(), Total = g.Sum(x => x.Total_Value_Order) })
                .ToListAsync();

            var dailyCancelled = await orders
                .Where(x => x.InsertDate >= firstDay
                            && EF.Functions.Collate(x.Order_Status, Paging.ExactCollation) == "CANCELADO")
                .GroupBy(x => x.InsertDate.Date)
                .Select(g => new { Day = g.Key, Count = g.Count(), Total = g.Sum(x => x.Total_Value_Order) })
                .ToListAsync();

            // Mês atual por status (comparação exata, igual à tela)
            var monthStart = new DateTime(now.Year, now.Month, 1);
            var nextMonth = monthStart.AddMonths(1);

            var currentMonthStatuses = await orders
                .Where(x => x.InsertDate >= monthStart && x.InsertDate < nextMonth)
                .Select(x => x.Order_Status)
                .ToListAsync();

            var currentMonthByStatus = currentMonthStatuses
                .Where(x => x != null)
                .GroupBy(x => x!, StringComparer.Ordinal)
                .ToDictionary(g => g.Key, g => g.Count());

            var logsFrom = now.AddMonths(-7);

            var access = await _unitOfWorkAdmin.Query<Logs>()
                .AsNoTracking()
                .Where(x => x.InsertDate >= logsFrom
                            &&  EF.Functions.Collate(x.Tipo, Paging.ExactCollation) == "ACESSO"
                            && (EF.Functions.Collate(x.Nivel, Paging.ExactCollation) == "CLIENTE" || EF.Functions.Collate(x.Nivel, Paging.ExactCollation) == "DELIVERY")
                            && x.Isdelete != true )
                .GroupBy(x => new { x.InsertDate.Year, x.InsertDate.Month })
                .Select(g => new DashboardMonthPoint
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Count = g.Count()
                })
                .ToListAsync();

            return Result<AdminDashboardResponse>.Success(new AdminDashboardResponse
            {
                MonthlyOrders = monthly,
                DailyOrders = daily
                    .Select(x => new DashboardDayPoint { Date = x.Day.ToString("yyyy-MM-dd"), Count = x.Count, Total = x.Total })
                    .ToList(),
                DailyCancelled = dailyCancelled
                    .Select(x => new DashboardDayPoint { Date = x.Day.ToString("yyyy-MM-dd"), Count = x.Count, Total = x.Total })
                    .ToList(),
                MonthlyClientAccess = access,
                CurrentMonthByStatus = currentMonthByStatus
            });
        }

        /// <summary>
        /// Movimentação paginada. Mesma janela (últimos 6 meses) e mesmas regras da tela:
        /// - busca: texto contido em log, ação, info, tipo, nível ou id do usuário;
        /// - tipo e nível: comparação exata;
        /// - período: hoje / últimos 7 dias / últimos 30 dias;
        /// - ordem: mais recentes primeiro.
        /// </summary>
        public async Task<Result<PagedResult<Logs>>> GetLogsPagedAsync(int page, int pageSize, string? search, string? type, string? level, string? period)
        {
            page = Paging.Page(page);
            pageSize = Paging.Size(pageSize);

            var now = DateTime.Now;
            var query = LogsWindow(now);

            var term = Paging.Term(search);
            if (term != null)
            {
                query = query.Where(x =>
                    (x.Log != null && x.Log.Contains(term))
                    || (x.Acao != null && x.Acao.Contains(term))
                    || (x.Info != null && x.Info.Contains(term))
                    || (x.Tipo != null && x.Tipo.Contains(term))
                    || (x.Nivel != null && x.Nivel.Contains(term))
                    || x.Id_User.ToString().Contains(term));
            }

            if (!string.IsNullOrEmpty(type) && type != "all")
                query = query.Where(x => EF.Functions.Collate(x.Tipo, Paging.ExactCollation) == type);

            if (!string.IsNullOrEmpty(level) && level != "all")
                query = query.Where(x => EF.Functions.Collate(x.Nivel, Paging.ExactCollation) == level);

            switch (period)
            {
                case "today":
                    var startToday = now.Date;
                    query = query.Where(x => x.InsertDate >= startToday);
                    break;
                case "7days":
                    var from7 = now.AddDays(-7);
                    query = query.Where(x => x.InsertDate >= from7);
                    break;
                case "30days":
                    var from30 = now.AddDays(-30);
                    query = query.Where(x => x.InsertDate >= from30);
                    break;
            }

            var total = await query.CountAsync();

            var items = await query
                .OrderByDescending(x => x.InsertDate)
                .ThenBy(x => x.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Result<PagedResult<Logs>>.Success(new PagedResult<Logs>(items, total, page, pageSize));
        }

        /// <summary>Cards e filtros da movimentação (sobre todos os logs da janela).</summary>
        public async Task<Result<LogsSummaryResponse>> GetLogsSummaryAsync()
        {
            var now = DateTime.Now;
            var query = LogsWindow(now);
            var startToday = now.Date;
            var startTomorrow = startToday.AddDays(1);

            var total = await query.CountAsync();
            var acessos = await query.CountAsync(x => x.Tipo == "Acesso");
            var administrativas = await query.CountAsync(x => x.Nivel == "ADMIN");
            var today = await query.CountAsync(x => x.InsertDate >= startToday && x.InsertDate < startTomorrow);

            // Só as colunas de tipo e nível (leve). Agrupadas com comparação exata, igual à tela.
            var typeLevel = await query
                .Select(x => new { x.Tipo, x.Nivel })
                .ToListAsync();

            var types = typeLevel
                .Where(x => !string.IsNullOrEmpty(x.Tipo))
                .GroupBy(x => x.Tipo, StringComparer.Ordinal)
                .Select(g => new LogTypeCount { Tipo = g.Key, Count = g.Count() })
                .ToList();

            var levels = typeLevel
                .Where(x => !string.IsNullOrEmpty(x.Nivel))
                .Select(x => x.Nivel)
                .Distinct(StringComparer.Ordinal)
                .ToList();

            return Result<LogsSummaryResponse>.Success(new LogsSummaryResponse
            {
                Total = total,
                Acessos = acessos,
                Administrativas = administrativas,
                Today = today,
                // Mesma ordem do .sort() da tela (ordinal)
                Types = types.OrderBy(x => x.Tipo, StringComparer.Ordinal).ToList(),
                Levels = levels.OrderBy(x => x, StringComparer.Ordinal).ToList()
            });
        }

        /// <summary>Logs de um usuário (tela de usuários), mesma janela, mais recentes primeiro.</summary>
        public async Task<Result<List<Logs>>> GetLogsByUserAsync(int userId)
        {
            var logs = await LogsWindow(DateTime.Now)
                .Where(x => x.Id_User == userId)
                .OrderByDescending(x => x.InsertDate)
                .ThenBy(x => x.Id)
                .ToListAsync();

            return Result<List<Logs>>.Success(logs);
        }

        /// <summary>Mesma janela do GetAlllogs: últimos 6 meses.</summary>
        private IQueryable<Logs> LogsWindow(DateTime now)
        {
            var from = now.AddMonths(-6);
            return _unitOfWorkAdmin.Query<Logs>().AsNoTracking().Where(x => x.InsertDate >= from);
        }

        public async Task<Result<List<Logs>>> GetAlllogs()
        {
            var logs = await _unitOfWorkAdmin.GetClassListAsyncWhere<Logs>(x => x.InsertDate >= DateTime.Now.AddMonths(-6));

            if (logs == null)
            {
                return Result<List<Logs>>.Failure(Error.Failure("Logs", "Erro ao Carregar Logs!"));
            }

            return Result<List<Logs>>.Success(logs);
        }
       public async Task<Result<List<Product_Category>>> GetAllCategory()
        {
            var Categorys = await _unitOfWorkAdmin.GetClassListAsyncWhere<Product_Category>(x => x.Isdelete != true && x.Ativo == true);

            if (Categorys == null)
            {
                return Result<List<Product_Category>>.Failure(Error.Failure("Categorys", "Erro ao Carregar Categorys!"));
            }

           return Result<List<Product_Category>>.Success(Categorys);
       }

        public async Task<Result<bool>> PostUpdateStatusOrder(int Id_Order,string NewStatus,int IdUser, string? WhoReceivedIt)
        {

            var Order = await _unitOfWorkAdmin.GetClassAsyncWhere<Orders>(x => x.Id == Id_Order);

            if (Order == null)
            {
                return Result<bool>.Failure(Error.Failure("Pedido", "Pedido não encontrado!"));
            }

            // Só os status conhecidos pela loja (evita gravar texto qualquer no pedido).
            NewStatus = (NewStatus ?? "").Trim().ToUpperInvariant();
            if (NewStatus is not ("PENDENTE" or "CONFIRMADO" or "PREPARANDO" or "SAIU_PARA_ENTREGA" or "ENTREGUE" or "CANCELADO"))
            {
                return Result<bool>.Failure(Error.Failure("Status", "Status inválido!"));
            }

            var statusAnterior = Order.Order_Status;
            var dataEntregaAnterior = Order.CustomerDeliveryDate;

            var User = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == IdUser);

            if (User == null)
            {
                return Result<bool>.Failure(Error.Failure("Usuário", "Administrador não encontrado!"));
            }


            var newdate = DateTime.Now;
            var UserConsumer = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Customer>(x => x.Id == Order.Id_User_Customer);
            bool Update_StatusOrder;
            if (NewStatus == "ENTREGUE" && WhoReceivedIt is not null)
            {
                 Update_StatusOrder = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Orders>(filters: new Dictionary<string, object>
                        {
                                { "Id", Id_Order }
                        },

                    fieldsToUpdate: new Dictionary<string, object>
                    {
                             {"Order_Status",NewStatus },
                             {"NotifyViaWhatsApp",true },
                             {"UpdateDate",newdate },
                             {"WhoReceivedIt" , WhoReceivedIt },
                             {"CustomerDeliveryDate" , newdate }
                     });
            }
            else
            {
                 Update_StatusOrder = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Orders>(filters: new Dictionary<string, object>
                        {
                                { "Id", Id_Order }
                        },

                      fieldsToUpdate: NewStatus == "ENTREGUE" && Order.CustomerDeliveryDate == null
                      // Entregue sem "quem recebeu": grava a data da entrega mesmo assim
                      // (é dela que conta o prazo de 7 dias da devolução).
                      ? new Dictionary<string, object>
                      {
                             {"Order_Status",NewStatus },
                             {"NotifyViaWhatsApp",true },
                             {"UpdateDate",newdate },
                             {"CustomerDeliveryDate", newdate }
                      }
                      : new Dictionary<string, object>
                      {
                             {"Order_Status",NewStatus },
                             {"NotifyViaWhatsApp",true },
                             {"UpdateDate",newdate }

                       });
            }
            

            if (!Update_StatusOrder)
            {
                return Result<bool>.Failure(Error.Failure("Status", "Erro ao atualizar status!"));
            }

            // Estoque: pedido confirmado (ou já em andamento) baixa a quantidade vendida;
            // pedido cancelado devolve o que tinha sido baixado. Cada um acontece uma vez só.
            var stockMessage = "";
            if (NewStatus is "CONFIRMADO" or "PREPARANDO" or "SAIU_PARA_ENTREGA" or "ENTREGUE")
            {
                if (await _stock.DeductAsync(Id_Order)) stockMessage = "Estoque baixado (itens vendidos retirados do estoque).\n";
            }
            else if (NewStatus == "CANCELADO")
            {
                if (await _stock.RestockAsync(Id_Order)) stockMessage = "Estoque devolvido (pedido cancelado).\n";
                // Havia um pedido de cancelamento do cliente esperando: o admin cancelou, então fica aprovado.
                await _unitOfWorkAdmin.Query<Orders>()
                    .Where(x => x.Id == Id_Order && x.Cancel_Status == "SOLICITADO")
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(x => x.Cancel_Status, "APROVADO")
                        .SetProperty(x => x.Cancel_Decided_At, (DateTime?)newdate));
            }



            var alteracoes = new List<string>();

            if (statusAnterior != NewStatus)
            {
                alteracoes.Add(
                    $"Status: '{statusAnterior}' → '{NewStatus}'\n"
                );
            }

            if (stockMessage != "")
            {
                alteracoes.Add(stockMessage);
            }

            if (NewStatus == "ENTREGUE" && WhoReceivedIt is not null)
            {
      
                    alteracoes.Add(
                        $"Recebido por: → {WhoReceivedIt}\n"
                    );
                

                alteracoes.Add(
                    $"Data da entrega: {newdate:dd/MM/yyyy HH:mm:ss}\n"
                );
            }

            await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(
                    new Logs
                    {
                        Id_User = IdUser,
                        Log =
                            $"O administrador {User.Name} atualizou o status do pedido N°:{Order.Number_Order} (ID: {Order.Id}). \n" +
                            $"Status anterior: '{statusAnterior}' | Novo status: '{NewStatus}'  \n" +
                            $"Cliente: {UserConsumer?.Name ?? "Não identificado"} | ID Cliente: {UserConsumer?.Id} | \n" +
                            $"Data/Hora: {newdate:dd/MM/yyyy HH:mm:ss} | \n" +
                            $"Alterações: " +
                            $"{(alteracoes.Count > 0
                                ? string.Join(" | ", alteracoes)
                                : "Nenhuma alteração identificada.")}",
                   
                        Tipo = "Atualizar status",
                        Nivel = "ADMIN",
                        Acao = "Atualizou o status do pedido",
                        Info =$"{User.Name} atualizou o pedido #{Order.Number_Order} " + $"de '{statusAnterior}' para '{NewStatus}' " + $"em {newdate:dd/MM/yyyy HH:mm}.",
                        InsertDate = newdate
                    });

            // E-mail + notificação para o cliente (mesmo aviso usado pelo portal de entregas)
            var enviado = await _statusNotifier.NotifyCustomerAsync(Order.Id, NewStatus, WhoReceivedIt, newdate);

            if (!enviado)
            {
                return Result<bool>.Failure(Error.Failure("Enviar Email", "Não foi possível enviar o e-mail ao cliente. Verifique se o endereço de e-mail informado está correto e tente novamente!"));
            }


            return Result<bool>.Success(true);
        }
        public async Task<Result<SendMessageViaWhatsAppResponse>> NotifyViaWhatsAppUpdateEnviado(int IdOrders,int Id_User)
        {
            var order = await _unitOfWorkAdmin.GetClassAsyncWhere<Orders>(x => x.Id == IdOrders && x.Isdelete != true);

            var user = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == Id_User && x.Isdelete != true);

            var userConsumer = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Customer>(x => x.Id == order.Id_User_Customer && x.Isdelete != true);

            if (!order.NotifyViaWhatsApp)
            {
                return Result<SendMessageViaWhatsAppResponse>.Failure(Error.Failure("Envio Via WhatsApp","Não tem nenhum status pendente a ser avisado!"));
            }

            var dataLog = DateTime.Now;

            var updateNotifyViaWhatsApp =
                await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Orders>(
                    filters: new Dictionary<string, object>
                    {
                { "Id", order.Id }
                    },

                    fieldsToUpdate: new Dictionary<string, object>
                    {
                { "NotifyViaWhatsApp", false },
                { "UpdateDate", dataLog }
                    }
                );

            if (!updateNotifyViaWhatsApp)
            {
                return Result<SendMessageViaWhatsAppResponse>.Failure(Error.Failure("Pedido","Pedido Não Encontrado!"));
            }

            if (user != null)
            {
                await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(
                    new Logs
                    {
                        Id_User = user.Id,
                        Log =
                            $"O administrador {user.Name} avisou o cliente sobre a atualização do status do pedido.\n" +
                            $"Pedido: #{order.Number_Order} (ID: {order.Id})\n" +
                            $"Status informado: '{order.Order_Status}'\n" +
                            $"Cliente: {userConsumer?.Name ?? "Não identificado"}\n" +
                            $"Telefone: {userConsumer?.Phone ?? "Não informado"}\n" +
                            $"Data/Hora: {dataLog:dd/MM/yyyy HH:mm:ss}",
                        Tipo = "AVISOU O CLIENTE VIA WHATSAPP",
                        Nivel = "ADMIN",
                        Acao = "Avisou o cliente via WhatsApp",
                        Info =
                            $"{user.Name} avisou o cliente sobre o status do pedido " +
                            $"#{order.Number_Order} via WhatsApp " +
                            $"em {dataLog:dd/MM/yyyy HH:mm}.",
                        InsertDate = dataLog
                    }
                );
            }

            return Result<SendMessageViaWhatsAppResponse>.Success(
                new SendMessageViaWhatsAppResponse
                {
                    IdOrder = order.Id,
                    Status = order.Order_Status,
                    Number_Order = order.Number_Order,
                    Telefone = userConsumer.Phone,
                    NomeCliente = userConsumer.Name
                }
            );
        }
    }
}
