import { api } from "../config/api";
import { CardPaymentRequest, OrderPayment, PaymentConfig } from "../models/Payment";
import { makeResult, Result } from "../utils/Result";

/** Pagamento dos pedidos (Mercado Pago). O Access Token fica só no servidor. */
export const PaymentService = {
    GetConfig: async (): Promise<Result<PaymentConfig | null>> => {
        try {
            const response = await api.get("/v1/payment/config");
            const { success, data, error } = response.data;
            return makeResult(success, data ?? null, error);
        } catch (err: any) {
            return makeResult(false, null, err.response?.data);
        }
    },

    GetOrderPayment: async (orderId: number): Promise<Result<OrderPayment | null>> => {
        try {
            const response = await api.get(`/v1/payment/order/${orderId}`);
            const { success, data, error } = response.data;
            return makeResult(success, data ?? null, error);
        } catch (err: any) {
            return makeResult(false, null, err.response?.data);
        }
    },

    CreatePix: async (orderId: number): Promise<Result<OrderPayment | null>> => {
        try {
            const response = await api.post("/v1/payment/pix", { id_Order: orderId });
            const { success, data, error } = response.data;
            return makeResult(success, data ?? null, error);
        } catch (err: any) {
            return makeResult(false, null, err.response?.data);
        }
    },

    CreateCard: async (request: CardPaymentRequest): Promise<Result<OrderPayment | null>> => {
        try {
            const response = await api.post("/v1/payment/card", request);
            const { success, data, error } = response.data;
            return makeResult(success, data ?? null, error);
        } catch (err: any) {
            return makeResult(false, null, err.response?.data);
        }
    },
};
