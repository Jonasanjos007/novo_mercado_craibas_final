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
                return makeResult(false, [], error);
            }

            return makeResult(true, data || [], error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, [], err.response?.data);
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
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, [], err.response?.data);
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
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, [], err.response?.data);
        }
    },
    PostUpdateNewStatus: async (Id_Order: number, New_Order: string): Promise<Result<boolean>> => {
        try {
            const response = await api.post(`/admin/orders/PostUpdateOrderNewStatus?Id_Order=${Id_Order}&NewStatus=${New_Order}`);
            console.log("response.datalist", response);
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, false, error || "Erro ao atualizar status!");
            }

            return makeResult(true, success, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    },

};