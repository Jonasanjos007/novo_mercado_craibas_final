import { create } from "zustand";
import { DeliveryServiceAdmin } from "../adminService/DeliveryServiceAdmin";
import {
    CreateDeliveryPayout,
    DeliveryDriver,
    DeliveryOrder,
    DeliveryPayables,
    DeliveryPayout,
    DeliverySettings,
} from "../models/Delivery";
import { makeResult, Result } from "../utils/Result";

/** Estado das abas "Minhas entregas" e "Deliverys" do admin. */
interface DeliveryAdminState {
    board: DeliveryOrder[];
    myHistory: DeliveryOrder[];
    deliverers: DeliveryDriver[];
    settings: DeliverySettings | null;
    payouts: DeliveryPayout[];

    LoadBoard: () => Promise<Result<boolean>>;
    LoadMyHistory: () => Promise<Result<boolean>>;
    LoadDeliverers: () => Promise<Result<boolean>>;
    LoadSettings: () => Promise<Result<boolean>>;
    LoadPayouts: (deliveryId?: number) => Promise<Result<boolean>>;

    TakeOrder: (orderId: number, force: boolean) => Promise<Result<boolean>>;
    ReleaseOrder: (orderId: number) => Promise<Result<boolean>>;
    DispatchOrder: (orderId: number) => Promise<Result<boolean>>;
    DeliverOrder: (orderId: number, whoReceivedIt: string) => Promise<Result<boolean>>;

    AssignOrder: (orderId: number, deliveryId: number) => Promise<Result<boolean>>;
    UnassignOrder: (orderId: number) => Promise<Result<boolean>>;
    SetOrderTip: (orderId: number, amount: number | null) => Promise<Result<boolean>>;

    SaveSettings: (settings: DeliverySettings) => Promise<Result<boolean>>;
    SaveRates: (deliveryId: number, commission: number | null, daily: number | null) => Promise<Result<boolean>>;

    GetPayables: (deliveryId: number) => Promise<Result<DeliveryPayables | null>>;
    CreatePayout: (payout: CreateDeliveryPayout) => Promise<Result<DeliveryPayout | null>>;
    ReversePayout: (payoutId: number, reason: string) => Promise<Result<boolean>>;
}

const ok = () => makeResult(true, true);

export const UseDeliveryAdminStore = create<DeliveryAdminState>((set, get) => ({
    board: [],
    myHistory: [],
    deliverers: [],
    settings: null,
    payouts: [],

    LoadBoard: async () => {
        const result = await DeliveryServiceAdmin.GetBoard();
        if (!result.success) return makeResult(false, false, result.error);
        set({ board: result.data ?? [] });
        return ok();
    },

    LoadMyHistory: async () => {
        const result = await DeliveryServiceAdmin.GetMyHistory();
        if (!result.success) return makeResult(false, false, result.error);
        set({ myHistory: result.data ?? [] });
        return ok();
    },

    LoadDeliverers: async () => {
        const result = await DeliveryServiceAdmin.GetDeliverers();
        if (!result.success) return makeResult(false, false, result.error);
        set({ deliverers: result.data ?? [] });
        return ok();
    },

    LoadSettings: async () => {
        const result = await DeliveryServiceAdmin.GetSettings();
        if (!result.success) return makeResult(false, false, result.error);
        set({ settings: result.data ?? null });
        return ok();
    },

    LoadPayouts: async (deliveryId?: number) => {
        const result = await DeliveryServiceAdmin.GetPayouts(deliveryId);
        if (!result.success) return makeResult(false, false, result.error);
        set({ payouts: result.data ?? [] });
        return ok();
    },

    TakeOrder: async (orderId, force) => {
        const result = await DeliveryServiceAdmin.Take(orderId, force);
        await get().LoadBoard();
        return result.success ? ok() : makeResult(false, false, result.error);
    },

    ReleaseOrder: async (orderId) => {
        const result = await DeliveryServiceAdmin.Release(orderId);
        await get().LoadBoard();
        return result.success ? ok() : makeResult(false, false, result.error);
    },

    DispatchOrder: async (orderId) => {
        const result = await DeliveryServiceAdmin.Dispatch(orderId);
        await get().LoadBoard();
        return result.success ? ok() : makeResult(false, false, result.error);
    },

    DeliverOrder: async (orderId, whoReceivedIt) => {
        const result = await DeliveryServiceAdmin.Deliver(orderId, whoReceivedIt);
        await Promise.all([get().LoadBoard(), get().LoadMyHistory()]);
        return result.success ? ok() : makeResult(false, false, result.error);
    },

    AssignOrder: async (orderId, deliveryId) => {
        const result = await DeliveryServiceAdmin.Assign(orderId, deliveryId);
        await Promise.all([get().LoadBoard(), get().LoadDeliverers()]);
        return result.success ? ok() : makeResult(false, false, result.error);
    },

    UnassignOrder: async (orderId) => {
        const result = await DeliveryServiceAdmin.Unassign(orderId);
        await Promise.all([get().LoadBoard(), get().LoadDeliverers()]);
        return result.success ? ok() : makeResult(false, false, result.error);
    },

    SetOrderTip: async (orderId, amount) => {
        const result = await DeliveryServiceAdmin.SetTip(orderId, amount);
        await get().LoadDeliverers();
        return result.success ? ok() : makeResult(false, false, result.error);
    },

    SaveSettings: async (settings) => {
        const result = await DeliveryServiceAdmin.SaveSettings(settings);
        if (!result.success) return makeResult(false, false, result.error);
        set({ settings: result.data ?? settings });
        await get().LoadDeliverers();
        return ok();
    },

    SaveRates: async (deliveryId, commission, daily) => {
        const result = await DeliveryServiceAdmin.SaveRates(deliveryId, commission, daily);
        await get().LoadDeliverers();
        return result.success ? ok() : makeResult(false, false, result.error);
    },

    GetPayables: (deliveryId) => DeliveryServiceAdmin.GetPayables(deliveryId),

    CreatePayout: async (payout) => {
        const result = await DeliveryServiceAdmin.CreatePayout(payout);
        await Promise.all([get().LoadDeliverers(), get().LoadPayouts()]);
        return result;
    },

    ReversePayout: async (payoutId, reason) => {
        const result = await DeliveryServiceAdmin.ReversePayout(payoutId, reason);
        await Promise.all([get().LoadDeliverers(), get().LoadPayouts()]);
        return result.success ? ok() : makeResult(false, false, result.error);
    },
}));
