import { create } from "zustand";
import { makeResult, Result } from "../utils/Result";
import { OrderServiceAdmin } from "../adminService/OrderServiceAdmin";
import { Order, SendMessageViaWhatsAppResponse } from "../models/Order";
import { Logs } from "../models/Logs";
import { Category } from "../models/Product";
import { LogsPageQuery, OrdersPageQuery } from "../adminService/OrderServiceAdmin";
import { AdminDashboard, DEFAULT_PAGE_SIZE, LogsSummary, OrderStatusSummary } from "../models/Paged";

// Evita que uma resposta antiga (de um filtro anterior) sobrescreva a atual
let ordersRequest = 0;
let recentRequest = 0;
let logsRequest = 0;


interface OrderState {
    /** Pedidos da página atual (já filtrados no servidor). */
    ordersAdmin: Order[];
    Category: Category[];
    /** Logs da página atual (já filtrados no servidor). */
    logs: Logs[];

    // ── Paginação de pedidos ──
    ordersQuery: OrdersPageQuery;
    ordersTotal: number;
    ordersLoading: boolean;
    ordersSummary: OrderStatusSummary;
    SetOrdersQuery: (query: Partial<OrdersPageQuery>) => Promise<Result<boolean>>;
    LoadOrdersPage: () => Promise<Result<boolean>>;
    LoadOrdersSummary: () => Promise<Result<boolean>>;

    // ── Dashboard ──
    dashboard: AdminDashboard | null;
    recentOrders: Order[];
    recentStatus: string;
    LoadDashboard: () => Promise<Result<boolean>>;
    LoadRecentOrders: (status?: string) => Promise<Result<boolean>>;

    // ── Paginação da movimentação ──
    logsQuery: LogsPageQuery;
    logsTotal: number;
    logsLoading: boolean;
    logsSummary: LogsSummary;
    SetLogsQuery: (query: Partial<LogsPageQuery>) => Promise<Result<boolean>>;
    LoadLogsPage: () => Promise<Result<boolean>>;
    LoadLogsSummary: () => Promise<Result<boolean>>;
    /** Logs de um usuário (tela de usuários). */
    GetLogsByUser: (userId: number) => Promise<Result<Logs[]>>;

    LoadOrdersAdmin: () => Promise<Result<boolean>>;
    LoadLogsAdmin: () => Promise<Result<boolean>>;
    LoadCategoryAdmin: () => Promise<Result<boolean>>;
    PostSaveCategoryAdmin: (formData: FormData) => Promise<Result<boolean>>;
    PostUpdateCategoryAdmin: (formData: FormData) => Promise<Result<boolean>>;
    PostDeleteCategoryAdmin: (request: { id: number; action: 'move' | 'delete'; replacementCategoryId?: number; reason: string; }) => Promise<Result<boolean>>;
    UpdateNewStatusOrder: (Id_Order: number, New_Status: string, WhoReceivedIt?: string) => Promise<Result<boolean>>;
    PostMensegeViaWhatsApp: (Id_Order: number) => Promise<Result<SendMessageViaWhatsAppResponse>>;
}

export const UseOrderAdminStore = create<OrderState>((set, get) => ({
    ordersAdmin: [],
    logs: [] as Logs[],
    Category: [] as Category[],

    ordersQuery: { page: 1, pageSize: DEFAULT_PAGE_SIZE, search: '', status: 'all' },
    ordersTotal: 0,
    ordersLoading: false,
    ordersSummary: { total: 0, byStatus: {} },

    dashboard: null,
    recentOrders: [],
    recentStatus: 'all',

    logsQuery: { page: 1, pageSize: DEFAULT_PAGE_SIZE, search: '', type: 'all', level: 'all', period: 'all' },
    logsTotal: 0,
    logsLoading: false,
    logsSummary: { total: 0, acessos: 0, administrativas: 0, today: 0, types: [], levels: [] },

    /** Recarrega tudo que depende dos pedidos (página atual, contadores e Dashboard). */
    LoadOrdersAdmin: async (): Promise<Result<boolean>> => {
        const results = await Promise.all([
            get().LoadOrdersPage(),
            get().LoadOrdersSummary(),
            get().LoadDashboard(),
            get().LoadRecentOrders(),
        ]);
        const failed = results.find(r => !r.success);
        return failed ?? makeResult(true, true);
    },

    SetOrdersQuery: async (query) => {
        set({ ordersQuery: { ...get().ordersQuery, ...query } });
        return get().LoadOrdersPage();
    },

    LoadOrdersPage: async () => {
        const request = ++ordersRequest;
        set({ ordersLoading: true });

        const result = await OrderServiceAdmin.GetOrdersPaged(get().ordersQuery);
        if (request !== ordersRequest) return makeResult(true, true);

        set({ ordersLoading: false });

        if (!result.success || !result.data) {
            set({ ordersAdmin: [], ordersTotal: 0 });
            return makeResult(false, false, result.error);
        }

        // Página além do fim (ex.: depois de um filtro): volta para a última que existe
        const lastPage = Math.max(1, Math.ceil(result.data.totalCount / get().ordersQuery.pageSize));
        if (result.data.items.length === 0 && get().ordersQuery.page > lastPage) {
            set({ ordersQuery: { ...get().ordersQuery, page: lastPage } });
            return get().LoadOrdersPage();
        }

        set({ ordersAdmin: result.data.items, ordersTotal: result.data.totalCount });
        return makeResult(true, true);
    },

    LoadOrdersSummary: async () => {
        const result = await OrderServiceAdmin.GetOrdersSummary();
        if (!result.success || !result.data) return makeResult(false, false, result.error);
        set({ ordersSummary: result.data });
        return makeResult(true, true);
    },

    LoadDashboard: async () => {
        const result = await OrderServiceAdmin.GetDashboard();
        if (!result.success || !result.data) return makeResult(false, false, result.error);
        set({ dashboard: result.data });
        return makeResult(true, true);
    },

    /** 5 pedidos mais recentes do status escolhido (card do Dashboard). */
    LoadRecentOrders: async (status?: string) => {
        const current = status ?? get().recentStatus;
        const request = ++recentRequest;
        set({ recentStatus: current });

        const result = await OrderServiceAdmin.GetOrdersPaged({ page: 1, pageSize: 10, status: current });
        if (request !== recentRequest) return makeResult(true, true);

        if (!result.success || !result.data) {
            set({ recentOrders: [] });
            return makeResult(false, false, result.error);
        }

        set({ recentOrders: result.data.items.slice(0, 5) });
        return makeResult(true, true);
    },

    /** Recarrega a página atual e os contadores da movimentação. */
    LoadLogsAdmin: async (): Promise<Result<boolean>> => {
        const results = await Promise.all([get().LoadLogsPage(), get().LoadLogsSummary()]);
        const failed = results.find(r => !r.success);
        return failed ?? makeResult(true, true);
    },

    SetLogsQuery: async (query) => {
        set({ logsQuery: { ...get().logsQuery, ...query } });
        return get().LoadLogsPage();
    },

    LoadLogsPage: async () => {
        const request = ++logsRequest;
        set({ logsLoading: true });

        const result = await OrderServiceAdmin.GetLogsPaged(get().logsQuery);
        if (request !== logsRequest) return makeResult(true, true);

        set({ logsLoading: false });

        if (!result.success || !result.data) {
            set({ logs: [] as Logs[], logsTotal: 0 });
            return makeResult(false, false, result.error);
        }

        const lastPage = Math.max(1, Math.ceil(result.data.totalCount / get().logsQuery.pageSize));
        if (result.data.items.length === 0 && get().logsQuery.page > lastPage) {
            set({ logsQuery: { ...get().logsQuery, page: lastPage } });
            return get().LoadLogsPage();
        }

        set({ logs: result.data.items, logsTotal: result.data.totalCount });
        return makeResult(true, true);
    },

    GetLogsByUser: (userId: number) => OrderServiceAdmin.GetLogsByUser(userId),

    LoadLogsSummary: async () => {
        const result = await OrderServiceAdmin.GetLogsSummary();
        if (!result.success || !result.data) return makeResult(false, false, result.error);
        set({ logsSummary: result.data });
        return makeResult(true, true);
    },
    LoadCategoryAdmin: async (): Promise<Result<boolean>> => {
        const result = await OrderServiceAdmin.GetCategoryAllListAdmin();
        // console.log("resultigi.data", result.data);
        if (!result.success) {
            set({ Category: [] as Category[] });
            return makeResult(false, false, result.error);
        }
        set({ Category: result.data || [] as Category[] });
        return makeResult(true, true);
    },
    PostSaveCategoryAdmin: async (formData: FormData): Promise<Result<boolean>> => {
        // console.log("testeste2", [...formData.entries()]);
        const result = await OrderServiceAdmin.PostSaveCategoryAdmin(formData);
        if (!result.success) {
            return makeResult(false, false, result.error);
        }

        await get().LoadCategoryAdmin();
        return makeResult(true, true);
    },
    PostUpdateCategoryAdmin: async (formData: FormData): Promise<Result<boolean>> => {
        // console.log("testeste2", [...formData.entries()]);
        const result = await OrderServiceAdmin.PostUpdateCategoryAdmin(formData);
        if (!result.success) {
            return makeResult(false, false, result.error);
        }

        await get().LoadCategoryAdmin();
        return makeResult(true, true);
    },
    PostDeleteCategoryAdmin: async (request: { id: number; action: 'move' | 'delete'; replacementCategoryId?: number; reason: string }): Promise<Result<boolean>> => {
        const result = await OrderServiceAdmin.PostDeleteCategoryAdmin(request);
        if (!result.success) {
            return makeResult(false, false, result.error);
        }

        await get().LoadCategoryAdmin();
        return makeResult(true, true);
    },
    UpdateNewStatusOrder: async (Id_Order: number, New_Status: string, WhoReceivedIt?: string): Promise<Result<boolean>> => {
        const result = await OrderServiceAdmin.PostUpdateNewStatus(Id_Order, New_Status, WhoReceivedIt);
        // console.log("resultigi.data", result.data);
        if (!result.success) {
            return makeResult(false, false, result.error);
        }
        await get().LoadOrdersAdmin();
        return makeResult(true, true);
    },
    PostMensegeViaWhatsApp: async (Id_Order: number): Promise<Result<SendMessageViaWhatsAppResponse>> => {
        const result = await OrderServiceAdmin.PostMensegeViaWhatsApp(Id_Order);
        if (!result.success) {
            return makeResult(false, {} as SendMessageViaWhatsAppResponse, result.error);
        }
        await get().LoadOrdersAdmin();
        return makeResult(true, result.data || {} as SendMessageViaWhatsAppResponse);
    },
}));
