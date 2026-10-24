import { create } from "zustand";
import { CardPaymentRequest, OrderPayment, PaymentConfig } from "../models/Payment";
import { PaymentService } from "../service/PaymentService";
import { makeResult, Result } from "../utils/Result";

interface PaymentState {
    /** Chave pública e regras (carregadas uma vez). */
    config: PaymentConfig | null;
    /** Situação do pagamento do pedido aberto na tela. */
    orderPayment: OrderPayment | null;

    LoadConfig: () => Promise<Result<PaymentConfig | null>>;
    LoadOrderPayment: (orderId: number) => Promise<Result<OrderPayment | null>>;
    CreatePix: (orderId: number) => Promise<Result<OrderPayment | null>>;
    CreateCard: (request: CardPaymentRequest) => Promise<Result<OrderPayment | null>>;
    ResetPayment: () => void;
}

export const UsePaymentStore = create<PaymentState>((set, get) => ({
    config: null,
    orderPayment: null,

    LoadConfig: async () => {
        const cached = get().config;
        if (cached) return makeResult(true, cached);

        const result = await PaymentService.GetConfig();
        if (result.success && result.data) set({ config: result.data });
        return result;
    },

    LoadOrderPayment: async (orderId) => {
        const result = await PaymentService.GetOrderPayment(orderId);
        if (result.success && result.data) set({ orderPayment: result.data });
        return result;
    },

    CreatePix: async (orderId) => {
        const result = await PaymentService.CreatePix(orderId);
        if (result.success && result.data) set({ orderPayment: result.data });
        return result;
    },

    CreateCard: async (request) => {
        const result = await PaymentService.CreateCard(request);
        if (result.success && result.data) set({ orderPayment: result.data });
        return result;
    },

    ResetPayment: () => set({ orderPayment: null }),
}));
