import { create } from "zustand";
import { makeResult, Result } from "../utils/Result";
import { OrderServiceAdmin } from "../adminService/OrderServiceAdmin";
import { Order } from "../models/OrderSave";
import { Logs } from "../models/Logs";
import { Category } from "../models/Product";


interface OrderState {
    ordersAdmin: Order[];
    Category: Category[];
    logs: Logs[];

    LoadOrdersAdmin: () => Promise<Result<boolean>>;
    LoadLogsAdmin: () => Promise<Result<boolean>>;
    LoadCategoryAdmin: () => Promise<Result<boolean>>;
}

export const UseOrderAdminStore = create<OrderState>((set, get) => ({
    ordersAdmin: [],
    logs: [] as Logs[],
    Category: [] as Category[],
    LoadOrdersAdmin: async (): Promise<Result<boolean>> => {
        const result = await OrderServiceAdmin.GetOrderAllListAdmin();
        console.log("resultigi.data", result.data);
        if (!result.success) {
            set({ ordersAdmin: [] });
            return makeResult(false, false, "Erro ao carregar pedidos");
        }
        set({ ordersAdmin: result.data || [] });
        return makeResult(true, true);

    },
    LoadLogsAdmin: async (): Promise<Result<boolean>> => {
        const result = await OrderServiceAdmin.GetLogsAllListAdmin();
        console.log("resultigi.data", result.data);
        if (!result.success) {
            set({ logs: [] as Logs[] });
            return makeResult(false, false, "Erro ao carregar logs");
        }
        set({ logs: result.data || [] as Logs[] });
        return makeResult(true, true);
    },
    LoadCategoryAdmin: async (): Promise<Result<boolean>> => {
        const result = await OrderServiceAdmin.GetCategoryAllListAdmin();
        console.log("resultigi.data", result.data);
        if (!result.success) {
            set({ Category: [] as Category[] });
            return makeResult(false, false, "Erro ao carregar logs");
        }
        set({ Category: result.data || [] as Category[] });
        return makeResult(true, true);
    },
}));