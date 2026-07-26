import { api } from "../config/api";
import { CartItensProduct } from "../models/CartItensProduct";
import { Product } from "../models/Product";
import { makeResult, Result } from "../utils/Result";

export const CheckoutService = {
    getCupom: async (): Promise<Result<Product[]>> => {
        try {
            const response = await api.get("/v1/product/list");
            const { success, data, error } = response.data;
            if (!data) {
                return makeResult(false, [] as Product[], error);
            }

            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, [] as Product[], err.response?.data);
        }
    },
}