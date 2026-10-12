import { api } from "../config/api";
import {
    CreateDeliveryPayout,
    DeliveryDriver,
    DeliveryOrder,
    DeliveryPayables,
    DeliveryPayout,
    DeliverySettings,
} from "../models/Delivery";
import { makeResult, Result } from "../utils/Result";

/** Entregas no painel do admin (/api/admin/delivery). */

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

export const DeliveryServiceAdmin = {
    // ── Pedidos ──
    GetBoard: (): Promise<Result<DeliveryOrder[]>> =>
        call(() => api.get("/admin/delivery/board"), [] as DeliveryOrder[]),

    GetMyHistory: (): Promise<Result<DeliveryOrder[]>> =>
        call(() => api.get("/admin/delivery/my-history"), [] as DeliveryOrder[]),

    Take: (orderId: number, force: boolean): Promise<Result<boolean>> =>
        call(() => api.post(`/admin/delivery/orders/${orderId}/take`, { force }), false),

    Release: (orderId: number): Promise<Result<boolean>> =>
        call(() => api.post(`/admin/delivery/orders/${orderId}/release`, {}), false),

    Dispatch: (orderId: number): Promise<Result<boolean>> =>
        call(() => api.post(`/admin/delivery/orders/${orderId}/dispatch`, {}), false),

    Deliver: (orderId: number, whoReceivedIt: string): Promise<Result<boolean>> =>
        call(() => api.post(`/admin/delivery/orders/${orderId}/deliver`, { whoReceivedIt }), false),

    Assign: (orderId: number, deliveryId: number): Promise<Result<boolean>> =>
        call(() => api.post(`/admin/delivery/orders/${orderId}/assign`, { deliveryId }), false),

    Unassign: (orderId: number): Promise<Result<boolean>> =>
        call(() => api.post(`/admin/delivery/orders/${orderId}/unassign`, {}), false),

    SetTip: (orderId: number, amount: number | null): Promise<Result<boolean>> =>
        call(() => api.put(`/admin/delivery/orders/${orderId}/tip`, { amount }), false),

    // ── Entregadores ──
    GetDeliverers: (): Promise<Result<DeliveryDriver[]>> =>
        call(() => api.get("/admin/delivery/deliverers"), [] as DeliveryDriver[]),

    SaveRates: (deliveryId: number, commissionDelivers: number | null, dailyRate: number | null): Promise<Result<boolean>> =>
        call(() => api.put(`/admin/delivery/deliverers/${deliveryId}/rates`, { commissionDelivers, dailyRate }), false),

    GetPayables: (deliveryId: number): Promise<Result<DeliveryPayables | null>> =>
        call<DeliveryPayables | null>(() => api.get(`/admin/delivery/deliverers/${deliveryId}/payables`), null),

    // ── Configuração ──
    GetSettings: (): Promise<Result<DeliverySettings | null>> =>
        call<DeliverySettings | null>(() => api.get("/admin/delivery/settings"), null),

    SaveSettings: (settings: DeliverySettings): Promise<Result<DeliverySettings | null>> =>
        call<DeliverySettings | null>(() => api.put("/admin/delivery/settings", settings), null),

    // ── Baixas ──
    GetPayouts: (deliveryId?: number): Promise<Result<DeliveryPayout[]>> =>
        call(() => api.get("/admin/delivery/payouts", { params: deliveryId ? { deliveryId } : {} }), [] as DeliveryPayout[]),

    CreatePayout: (payout: CreateDeliveryPayout): Promise<Result<DeliveryPayout | null>> =>
        call<DeliveryPayout | null>(() => api.post("/admin/delivery/payouts", payout), null),

    ReversePayout: (payoutId: number, reason: string): Promise<Result<boolean>> =>
        call(() => api.post(`/admin/delivery/payouts/${payoutId}/reverse`, { reason }), false),
};
