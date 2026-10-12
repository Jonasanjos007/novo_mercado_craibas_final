using Pricing.Api.DTOs.Responses;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    // ───────────── Pedidos ─────────────

    /// <summary>Contadores dos filtros de status da tela de pedidos.</summary>
    public class OrderStatusSummaryResponse
    {
        public int Total { get; set; }
        public Dictionary<string, int> ByStatus { get; set; } = new();
    }

    /// <summary>Números do Dashboard calculados no banco.</summary>
    public class AdminDashboardResponse
    {
        /// <summary>Pedidos não cancelados por mês (últimos meses).</summary>
        public List<DashboardMonthPoint> MonthlyOrders { get; set; } = new();

        /// <summary>Pedidos não cancelados por dia (últimos dias).</summary>
        public List<DashboardDayPoint> DailyOrders { get; set; } = new();

        /// <summary>Pedidos cancelados por dia (últimos dias).</summary>
        public List<DashboardDayPoint> DailyCancelled { get; set; } = new();

        /// <summary>Acessos de clientes por mês (logs tipo "Acesso" e nível "CLIENTE").</summary>
        public List<DashboardMonthPoint> MonthlyClientAccess { get; set; } = new();

        /// <summary>Pedidos do mês atual por status (todos os status, para o gráfico de rosca).</summary>
        public Dictionary<string, int> CurrentMonthByStatus { get; set; } = new();
    }

    public class DashboardMonthPoint
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public int Count { get; set; }
        public double Total { get; set; }
    }

    public class DashboardDayPoint
    {
        /// <summary>yyyy-MM-dd</summary>
        public string Date { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Total { get; set; }
    }

    // ───────────── Movimentação ─────────────

    public class LogsSummaryResponse
    {
        public int Total { get; set; }
        public int Acessos { get; set; }
        public int Administrativas { get; set; }
        public int Today { get; set; }
        public List<LogTypeCount> Types { get; set; } = new();
        public List<string> Levels { get; set; } = new();
    }

    public class LogTypeCount
    {
        public string Tipo { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    // ───────────── Usuários ─────────────

    public class UsersPageResponse
    {
        public List<UserAdminResponse> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }

        /// <summary>Ativos/inativos dentro do filtro atual (contadores do seletor de status).</summary>
        public int ActiveCount { get; set; }
        public int InactiveCount { get; set; }
    }

    public class UsersSummaryResponse
    {
        public int Total { get; set; }
        public int Active { get; set; }
        public int Inactive { get; set; }
        public int Admins { get; set; }
        public int Clients { get; set; }
        public int Delivery { get; set; }
    }

    // ───────────── Produtos ─────────────

    public class ProductsPageResponse
    {
        public List<ProductResponse> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }

        /// <summary>Total da busca em todas as categorias (chip "Todos").</summary>
        public int SearchTotal { get; set; }

        /// <summary>Total da busca por categoria (chips de categoria).</summary>
        public Dictionary<int, int> CountsByCategory { get; set; } = new();
    }

    // ───────────── Lixeira ─────────────

    public class TrashSummaryResponse
    {
        public int Total { get; set; }
        public int Users { get; set; }
        public int Addresses { get; set; }
        public int Orders { get; set; }
    }
}
