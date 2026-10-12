import { create } from "zustand";
import { DeliveryService } from "../service/DeliveryService";
import { DeliveryEarnings, DeliveryOrder, DeliveryProfile } from "../models/Delivery";
import { makeResult, Result } from "../utils/Result";

/** Estado do portal do entregador. */
interface DeliveryState {
    orders: DeliveryOrder[];
    history: DeliveryOrder[];
    earnings: DeliveryEarnings | null;
    profile: DeliveryProfile | null;

    LoadOrders: () => Promise<Result<boolean>>;
    LoadHistory: () => Promise<Result<boolean>>;
    LoadEarnings: () => Promise<Result<boolean>>;
    LoadProfile: () => Promise<Result<boolean>>;

    DispatchOrder: (orderId: number) => Promise<Result<boolean>>;
    DeliverOrder: (orderId: number, whoReceivedIt: string) => Promise<Result<boolean>>;

    Reset: () => void;
}

export const UseDeliveryStore = create<DeliveryState>((set, get) => ({
    orders: [],
    history: [],
    earnings: null,
    profile: null,

    LoadOrders: async () => {
        const result = await DeliveryService.GetMyOrders();
        if (!result.success) return makeResult(false, false, result.error);

        set({ orders: result.data ?? [] });
        return makeResult(true, true);
    },

    LoadHistory: async () => {
        const result = await DeliveryService.GetHistory();
        if (!result.success) return makeResult(false, false, result.error);

        set({ history: result.data ?? [] });
        return makeResult(true, true);
    },

    LoadEarnings: async () => {
        const result = await DeliveryService.GetEarnings();
        if (!result.success) return makeResult(false, false, result.error);

        set({ earnings: result.data ?? null });
        return makeResult(true, true);
    },

    LoadProfile: async () => {
        const result = await DeliveryService.GetProfile();
        if (!result.success) return makeResult(false, false, result.error);

        set({ profile: result.data ?? null });
        return makeResult(true, true);
    },

    DispatchOrder: async (orderId: number) => {
        const result = await DeliveryService.Dispatch(orderId);

        // Atualiza a lista mesmo com erro (o pedido pode ter mudado)
        await get().LoadOrders();

        if (!result.success) return makeResult(false, false, result.error);
        return makeResult(true, true);
    },

    DeliverOrder: async (orderId: number, whoReceivedIt: string) => {
        const result = await DeliveryService.Deliver(orderId, whoReceivedIt);

        if (!result.success) {
            await get().LoadOrders();
            return makeResult(false, false, result.error);
        }

        await Promise.all([get().LoadOrders(), get().LoadHistory(), get().LoadEarnings(), get().LoadProfile()]);
        return makeResult(true, true);
    },

    Reset: () => set({ orders: [], history: [], earnings: null, profile: null }),
}));
