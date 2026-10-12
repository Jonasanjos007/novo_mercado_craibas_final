/** Resposta paginada do servidor (filtros aplicados antes de paginar). */
export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

export const emptyPaged = <T,>(): PagedResult<T> => ({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 });

/** Quantidades por página (iguais às da Lixeira). */
export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;

export interface OrderStatusSummary {
    total: number;
    byStatus: Record<string, number>;
}

export interface DashboardMonthPoint { year: number; month: number; count: number; total: number; }
export interface DashboardDayPoint { date: string; count: number; total: number; }

export interface AdminDashboard {
    monthlyOrders: DashboardMonthPoint[];
    dailyOrders: DashboardDayPoint[];
    dailyCancelled: DashboardDayPoint[];
    monthlyClientAccess: DashboardMonthPoint[];
    currentMonthByStatus: Record<string, number>;
}

export interface LogsSummary {
    total: number;
    acessos: number;
    administrativas: number;
    today: number;
    types: { tipo: string; count: number }[];
    levels: string[];
}

export interface UsersPage<T> extends PagedResult<T> {
    activeCount: number;
    inactiveCount: number;
}

export interface UsersSummary {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    clients: number;
    delivery: number;
}

export interface ProductsPage<T> extends PagedResult<T> {
    searchTotal: number;
    countsByCategory: Record<string, number>;
}

export interface TrashSummary {
    total: number;
    users: number;
    addresses: number;
    orders: number;
}
