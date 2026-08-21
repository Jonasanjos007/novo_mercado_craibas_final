import { create } from "zustand";
import { makeResult, Result } from "../utils/Result";
import { OrderServiceAdmin } from "../adminService/OrderServiceAdmin";
import { Order, SendMessageViaWhatsAppResponse } from "../models/OrderSave";
import { Logs } from "../models/Logs";
import { Category } from "../models/Product";


interface OrderState {
    ordersAdmin: Order[];
    Category: Category[];
    logs: Logs[];

    LoadOrdersAdmin: () => Promise<Result<boolean>>;
    LoadLogsAdmin: () => Promise<Result<boolean>>;
    LoadCategoryAdmin: () => Promise<Result<boolean>>;
    PostSaveCategoryAdmin: (formData: FormData) => Promise<Result<boolean>>;
    PostUpdateCategoryAdmin: (formData: FormData) => Promise<Result<boolean>>;
    PostDeleteCategoryAdmin: (request: { id: number; action: 'move' | 'delete'; replacementCategoryId?: number; }) => Promise<Result<boolean>>;
    UpdateNewStatusOrder: (Id_Order: number, New_Status: string) => Promise<Result<boolean>>;
    PostMensegeViaWhatsApp: (Id_Order: number) => Promise<Result<SendMessageViaWhatsAppResponse>>;
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
            return makeResult(false, false, result.error);
        }
        set({ ordersAdmin: result.data || [] });
        return makeResult(true, true);

    },
    LoadLogsAdmin: async (): Promise<Result<boolean>> => {
        const result = await OrderServiceAdmin.GetLogsAllListAdmin();
        console.log("resultigi.data", result.data);
        if (!result.success) {
            set({ logs: [] as Logs[] });
            return makeResult(false, false, result.error);
        }
        set({ logs: result.data || [] as Logs[] });
        return makeResult(true, true);
    },
    LoadCategoryAdmin: async (): Promise<Result<boolean>> => {
        const result = await OrderServiceAdmin.GetCategoryAllListAdmin();
        console.log("resultigi.data", result.data);
        if (!result.success) {
            set({ Category: [] as Category[] });
            return makeResult(false, false, result.error);
        }
        set({ Category: result.data || [] as Category[] });
        return makeResult(true, true);
    },
    PostSaveCategoryAdmin: async (formData: FormData): Promise<Result<boolean>> => {
        console.log("testeste2", [...formData.entries()]);
        const result = await OrderServiceAdmin.PostSaveCategoryAdmin(formData);
        if (!result.success) {
            return makeResult(false, false, result.error);
        }

        await get().LoadCategoryAdmin();
        return makeResult(true, true);
    },
    PostUpdateCategoryAdmin: async (formData: FormData): Promise<Result<boolean>> => {
        console.log("testeste2", [...formData.entries()]);
        const result = await OrderServiceAdmin.PostUpdateCategoryAdmin(formData);
        if (!result.success) {
            return makeResult(false, false, result.error);
        }

        await get().LoadCategoryAdmin();
        return makeResult(true, true);
    },
    PostDeleteCategoryAdmin: async (request: { id: number; action: 'move' | 'delete'; replacementCategoryId?: number }): Promise<Result<boolean>> => {
        const result = await OrderServiceAdmin.PostDeleteCategoryAdmin(request);
        if (!result.success) {
            return makeResult(false, false, result.error);
        }

        await get().LoadCategoryAdmin();
        return makeResult(true, true);
    },
    UpdateNewStatusOrder: async (Id_Order: number, New_Status: string): Promise<Result<boolean>> => {
        const result = await OrderServiceAdmin.PostUpdateNewStatus(Id_Order, New_Status);
        console.log("resultigi.data", result.data);
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
