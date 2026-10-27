import { create } from "zustand";
import { OrderCancelsAdmin } from "../models/Order";
import { CancellationsFilter, CancellationsServiceAdmin } from "../adminService/CancellationsServiceAdmin";
import { makeResult, Result } from "../utils/Result";

interface CancellationsAdminState {
    Cancellations: OrderCancelsAdmin;
    CancellationsFilter: CancellationsFilter;
    LoadingCancellations: boolean;
    LoadCancellations: (filter?: CancellationsFilter) => Promise<Result<boolean>>;
    DecideCancellation: (orderId: number, approve: boolean, note?: string) => Promise<Result<boolean>>;
}

export const UseCancellationsAdminStore = create<CancellationsAdminState>((set, get) => ({
    Cancellations: { items: [], byStatus: {}, open: 0 },
    CancellationsFilter: 'open',
    LoadingCancellations: false,

    LoadCancellations: async (filter?: CancellationsFilter): Promise<Result<boolean>> => {
        const f = filter ?? get().CancellationsFilter;
        set({ LoadingCancellations: true, CancellationsFilter: f });
        const result = await CancellationsServiceAdmin.GetCancellations(f);
        set({ LoadingCancellations: false });
        if (!result.success) return makeResult(false, false, result.error);
        set({ Cancellations: result.data });
        return makeResult(true, true);
    },

    DecideCancellation: async (orderId, approve, note): Promise<Result<boolean>> => {
        const result = await CancellationsServiceAdmin.PostDecision(orderId, approve, note);
        if (!result.success) return makeResult(false, false, result.error);
        await get().LoadCancellations();
        return makeResult(true, true);
    },
}));
