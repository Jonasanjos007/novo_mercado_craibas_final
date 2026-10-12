import { api } from "../config/api";
import { CartItensProduct } from "../models/CartItensProduct";
import { Cupom } from "../models/Cupom";
import { Logs } from "../models/Logs";
import { OrderSave, Order, SendMessageViaWhatsAppResponse } from "../models/Order";
import { Category, Product } from "../models/Product";
import { makeResult, Result } from "../utils/Result";
import { AdminDashboard, LogsSummary, OrderStatusSummary, PagedResult, emptyPaged } from "../models/Paged";

/** Chamada GET simples no padrão { success, data, error }. */
async function getData<T>(url: string, fallback: T, params?: Record<string, unknown>): Promise<Result<T>> {
    try {
        const response = await api.get(url, { params });
        const { success, data, error } = response.data;

        if (!success) {
            return makeResult(false, fallback, error);
        }

        return makeResult(true, (data ?? fallback) as T, error);
    } catch (err: any) {
        console.log(err.response?.data);
        return makeResult(false, fallback, err.response?.data);
    }
}

export interface OrdersPageQuery { page: number; pageSize: number; search?: string; status?: string; }
export interface LogsPageQuery { page: number; pageSize: number; search?: string; type?: string; level?: string; period?: string; }

export const OrderServiceAdmin = {
    // ── Paginação (filtros aplicados no banco antes de paginar) ──
    GetOrdersPaged: (q: OrdersPageQuery): Promise<Result<PagedResult<Order>>> =>
        getData("/admin/orders/paged", emptyPaged<Order>(), { ...q }),

    GetOrdersSummary: (): Promise<Result<OrderStatusSummary>> =>
        getData("/admin/orders/summary", { total: 0, byStatus: {} }),

    GetDashboard: (): Promise<Result<AdminDashboard | null>> =>
        getData<AdminDashboard | null>("/admin/orders/dashboard", null),

    GetLogsPaged: (q: LogsPageQuery): Promise<Result<PagedResult<Logs>>> =>
        getData("/admin/orders/logs/paged", emptyPaged<Logs>(), { ...q }),

    GetLogsSummary: (): Promise<Result<LogsSummary>> =>
        getData("/admin/orders/logs/summary", { total: 0, acessos: 0, administrativas: 0, today: 0, types: [], levels: [] }),

    GetLogsByUser: (userId: number): Promise<Result<Logs[]>> =>
        getData(`/admin/orders/logs/user/${userId}`, [] as Logs[]),

    GetOrderAllListAdmin: async (): Promise<Result<Order[]>> => {
        try {
            const response = await api.get("/admin/orders/GetAllOrderAdmin");
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, [], error);
            }

            return makeResult(true, data || [], error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, [], err.response?.data);
        }
    },
    GetLogsAllListAdmin: async (): Promise<Result<Logs[]>> => {
        try {
            const response = await api.get("/admin/orders/GetAllLogsAdmin");
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, [], error || "Erro ao buscar logs");
            }

            return makeResult(true, data || [], error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, [], err.response?.data);
        }
    },
    GetCategoryAllListAdmin: async (): Promise<Result<Category[]>> => {
        try {
            const response = await api.get("/admin/orders/GetCategoryAllListAdmin");
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, [], error || "Erro ao buscar logs");
            }

            const categories = (data || []).map((category: Category) => {
                let banners: string[] = [];
                if (Array.isArray(category.banners)) {
                    banners = category.banners;
                } else if (category.banners) {
                    try {
                        const parsed = JSON.parse(category.banners);
                        banners = Array.isArray(parsed)
                            ? parsed
                            : category.banners.split(';');
                    } catch {
                        banners = category.banners.split(';');
                    }
                }

                banners = banners
                    .map(banner => banner.trim())
                    .filter(Boolean);

                const resolveImage = (value: string) =>
                    value.startsWith("data:") || value.startsWith("http") || value.startsWith("/")
                        ? value
                        : `/Imagens/Categorias/${value}`;

                return {
                    ...category,
                    imagem: category.imagem ? resolveImage(category.imagem) : "",
                    banners: banners.map(resolveImage),
                };
            });

            return makeResult(true, categories, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, [], err.response?.data);
        }
    },
    PostSaveCategoryAdmin: async (formData: FormData): Promise<Result<boolean>> => {
        try {
            const response = await api.post("/admin/category/PostSaveCategory", formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            const { success, data, error } = response.data;
            return success ? makeResult(true, true) : makeResult(false, false, error || "Erro ao salvar categoria");
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    },
    PostUpdateCategoryAdmin: async (formData: FormData): Promise<Result<boolean>> => {
        try {
            const response = await api.post("/admin/category/UpdateCategory", formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            const { success, data, error } = response.data;
            return success ? makeResult(true, true) : makeResult(false, false, error || "Erro ao salvar categoria");
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    },
    PostDeleteCategoryAdmin: async (request: {
        id: number; action: 'move' | 'delete'; replacementCategoryId?: number; reason: string;
    }): Promise<Result<boolean>> => {
        try {
            const response = await api.post("/admin/category/DeleteCategory", request);
            const { success, error } = response.data;
            return success
                ? makeResult(true, true)
                : makeResult(false, false, error || "Erro ao excluir categoria");
        } catch (err: any) {
            return makeResult(false, false, err.response?.data);
        }
    },
    PostUpdateNewStatus: async (Id_Order: number, New_Order: string, WhoReceivedIt?: string): Promise<Result<boolean>> => {
        try {
            const response = await api.post(`/admin/orders/PostUpdateOrderNewStatus?Id_Order=${Id_Order}&NewStatus=${New_Order}&WhoReceivedIt=${WhoReceivedIt}`);
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, false, error || "Erro ao atualizar status!");
            }

            return makeResult(true, success, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    },
    PostMensegeViaWhatsApp: async (Id_Order: number): Promise<Result<SendMessageViaWhatsAppResponse>> => {
        try {
            const response = await api.post(`/admin/orders/PostUpdateNotifyViaWhatsApp?Id_Order=${Id_Order}`);
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, {} as SendMessageViaWhatsAppResponse, error || "Erro ao atualizar status!");
            }

            return makeResult(true, data || {} as SendMessageViaWhatsAppResponse, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, {} as SendMessageViaWhatsAppResponse, err.response?.data);
        }
    },

};
