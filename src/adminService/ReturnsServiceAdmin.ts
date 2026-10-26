import { api } from "../config/api";
import { OrderReturnsAdmin, ReturnStatus } from "../models/Order";
import { makeResult, Result } from "../utils/Result";

/** Filtro da aba Devoluções: open = em análise + buscar produto. */
export type ReturnsFilter = 'open' | 'all' | ReturnStatus;

const emptyReturns: OrderReturnsAdmin = { items: [], byStatus: {}, open: 0 };

export const ReturnsServiceAdmin = {
    GetReturns: async (filter: ReturnsFilter = 'open'): Promise<Result<OrderReturnsAdmin>> => {
        try {
            const response = await api.get("/admin/orders/returns", { params: { filter } });
            const { success, data, error } = response.data;
            if (!success) return makeResult(false, emptyReturns, error);
            return makeResult(true, (data ?? emptyReturns) as OrderReturnsAdmin);
        } catch (err: any) {
            console.log(err.response?.data);
            return makeResult(false, emptyReturns, err.response?.data);
        }
    },

    PostUpdateReturnStatus: async (orderId: number, status: ReturnStatus, note?: string): Promise<Result<boolean>> => {
        try {
            const response = await api.post(`/admin/orders/returns/${orderId}/status`, { status, note: note ?? null });
            const { success, error } = response.data;
            return success ? makeResult(true, true) : makeResult(false, false, error);
        } catch (err: any) {
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    },
};
