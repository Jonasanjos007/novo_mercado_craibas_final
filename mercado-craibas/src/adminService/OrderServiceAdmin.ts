import { api } from "../config/api";
import { CartItensProduct } from "../models/CartItensProduct";
import { Cupom } from "../models/Cupom";
import { Logs } from "../models/Logs";
import { OrderSave, Order } from "../models/OrderSave";
import { Category, Product } from "../models/Product";
import { makeResult, Result } from "../utils/Result";

export const OrderServiceAdmin = {
    GetOrderAllListAdmin: async (): Promise<Result<Order[]>> => {
        try {
            const response = await api.get("/admin/orders/GetAllOrderAdmin");
            console.log("response.datalist", response)
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, [], error || "Erro ao buscar pedidos");
            }

            return makeResult(true, data || [], error);
        } catch {
            return makeResult(false, [], "Falha na comunicação");
        }
    },
    GetLogsAllListAdmin: async (): Promise<Result<Logs[]>> => {
        try {
            const response = await api.get("/admin/orders/GetAllLogsAdmin");
            console.log("response.datalist", response)
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, [], error || "Erro ao buscar logs");
            }

            return makeResult(true, data || [], error);
        } catch {
            return makeResult(false, [], "Falha na comunicação");
        }
    },
    GetCategoryAllListAdmin: async (): Promise<Result<Category[]>> => {
        try {
            const response = await api.get("/admin/orders/GetCategoryAllListAdmin");
            console.log("response.datalist", response);
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, [], error || "Erro ao buscar logs");
            }

            return makeResult(true, data || [], error);
        } catch {
            return makeResult(false, [], "Falha na comunicação");
        }
    },

};