import { api } from "../config/api";
import { CancelStatus, OrderCancelsAdmin } from "../models/Order";
import { makeResult, Result } from "../utils/Result";

/** Filtro da aba Cancelamentos: open = aguardando decisão. */
export type CancellationsFilter = 'open' | 'all' | CancelStatus;

const emptyCancels: OrderCancelsAdmin = { items: [], byStatus: {}, open: 0 };

export const CancellationsServiceAdmin = {
    GetCancellations: async (filter: CancellationsFilter = 'open'): Promise<Result<OrderCancelsAdmin>> => {
        try {
            const response = await api.get("/admin/orders/cancellations", { params: { filter } });
            const { success, data, error } = response.data;
            if (!success) return makeResult(false, emptyCancels, error);
            return makeResult(true, (data ?? emptyCancels) as OrderCancelsAdmin);
        } catch (err: any) {
            console.log(err.response?.data);
            return makeResult(false, emptyCancels, err.response?.data);
        }
    },

    PostDecision: async (orderId: number, approve: boolean, note?: string): Promise<Result<boolean>> => {
        try {
            const response = await api.post(`/admin/orders/cancellations/${orderId}/decision`, { approve, note: note ?? null });
            const { success, error } = response.data;
            return success ? makeResult(true, true) : makeResult(false, false, error);
        } catch (err: any) {
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    },
};
