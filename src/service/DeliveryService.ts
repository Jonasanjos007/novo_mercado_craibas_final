import { api } from "../config/api";
import { DeliveryEarnings, DeliveryOrder, DeliveryProfile } from "../models/Delivery";
import { makeResult, Result } from "../utils/Result";

/** Portal do entregador (/api/v1/delivery). */

const emptyEarnings: DeliveryEarnings = { enabled: false, pendingTotal: 0, paidTotal: 0, entries: [] };

async function call<T>(request: () => Promise<any>, fallback: T): Promise<Result<T>> {
    try {
        const response = await request();
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

export const DeliveryService = {
    GetMyOrders: (): Promise<Result<DeliveryOrder[]>> =>
        call(() => api.get("/v1/delivery/orders"), [] as DeliveryOrder[]),

    Dispatch: (orderId: number): Promise<Result<boolean>> =>
        call(() => api.post(`/v1/delivery/orders/${orderId}/dispatch`, {}), false),

    Deliver: (orderId: number, whoReceivedIt: string): Promise<Result<boolean>> =>
        call(() => api.post(`/v1/delivery/orders/${orderId}/deliver`, { whoReceivedIt }), false),

    GetHistory: (): Promise<Result<DeliveryOrder[]>> =>
        call(() => api.get("/v1/delivery/history"), [] as DeliveryOrder[]),

    GetEarnings: (): Promise<Result<DeliveryEarnings>> =>
        call(() => api.get("/v1/delivery/earnings"), emptyEarnings),

    GetProfile: (): Promise<Result<DeliveryProfile | null>> =>
        call<DeliveryProfile | null>(() => api.get("/v1/delivery/profile"), null),
};
