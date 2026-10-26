import { create } from "zustand";
import { OrderReturnsAdmin, ReturnStatus } from "../models/Order";
import { ReturnsFilter, ReturnsServiceAdmin } from "../adminService/ReturnsServiceAdmin";
import { makeResult, Result } from "../utils/Result";

interface ReturnsAdminState {
    Returns: OrderReturnsAdmin;
    ReturnsFilter: ReturnsFilter;
    LoadingReturns: boolean;
    LoadReturns: (filter?: ReturnsFilter) => Promise<Result<boolean>>;
    UpdateReturnStatus: (orderId: number, status: ReturnStatus, note?: string) => Promise<Result<boolean>>;
}

export const UseReturnsAdminStore = create<ReturnsAdminState>((set, get) => ({
    Returns: { items: [], byStatus: {}, open: 0 },
    ReturnsFilter: 'open',
    LoadingReturns: false,

    LoadReturns: async (filter?: ReturnsFilter): Promise<Result<boolean>> => {
        const f = filter ?? get().ReturnsFilter;
        set({ LoadingReturns: true, ReturnsFilter: f });
        const result = await ReturnsServiceAdmin.GetReturns(f);
        set({ LoadingReturns: false });
        if (!result.success) return makeResult(false, false, result.error);
        set({ Returns: result.data });
        return makeResult(true, true);
    },

    UpdateReturnStatus: async (orderId, status, note): Promise<Result<boolean>> => {
        const result = await ReturnsServiceAdmin.PostUpdateReturnStatus(orderId, status, note);
        if (!result.success) return makeResult(false, false, result.error);
        await get().LoadReturns();
        return makeResult(true, true);
    },
}));
