import { api } from "../config/api";
import { CartItensProduct } from "../models/CartItensProduct";
import { Cupom } from "../models/Cupom";
import { OrderSave, Order } from "../models/OrderSave";
import { Product } from "../models/Product";
import { makeResult, Result } from "../utils/Result";

export const OrderService = {
    GetCupomSearch: async (): Promise<Result<Cupom[]>> => {
        try {
            const response = await api.get("/cupom/GetAllCupom");
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, [], error || "Erro ao buscar cupons");
            }

            return makeResult(true, data || [], error);
        } catch {
            return makeResult(false, [], "Falha na comunicação");
        }
    },
    GetOrderAllList: async (): Promise<Result<Order[]>> => {
        try {
            const response = await api.get("/order/GetAllOrderResponse");
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, [], error || "Erro ao buscar pedidos");
            }

            return makeResult(true, data || [], error);
        } catch {
            return makeResult(false, [], "Falha na comunicação");
        }
    },
    PostOrder: async (Order: OrderSave): Promise<Result<Order | null>> => {
        try {
            const response = await api.post("/order/PostSaveOrder", Order);
            console.log("response.data teste", response.data)
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, null, error || "Erro ao criar pedido");
            }

            return makeResult(true, data || null, error);
        } catch {
            return makeResult(false, null, "Falha na comunicação");
        }
    }
};