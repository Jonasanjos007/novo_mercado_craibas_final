import { api } from "../config/api";
import { CartItensProduct } from "../models/CartItensProduct";
import { Cupom } from "../models/Cupom";
import { OrderSave, Order } from "../models/OrderSave";
import { Product } from "../models/Product";
import { makeResult, Result } from "../utils/Result";

export const OrderService = {
    GetCupomSearch: async (): Promise<Result<Cupom[]>> => {
        try {
            const response = await api.get("/v1/cupom/GetAllCupom");
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
    GetOrderAllList: async (): Promise<Result<Order[]>> => {
        try {
            const response = await api.get("/v1/order/GetAllOrderResponse");
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
    PostOrder: async (Order: OrderSave): Promise<Result<Order | null>> => {
        try {
            const response = await api.post("/v1/order/PostSaveOrder", Order);
            console.log("response.data teste", response.data)
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, null, error);
            }

            return makeResult(true, data || null, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, null, err.response?.data);
        }
    }
};