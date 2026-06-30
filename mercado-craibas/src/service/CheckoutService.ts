import { api } from "../config/api";
import { CartItensProduct } from "../models/CartItensProduct";
import { Product } from "../models/Product";
import { makeResult, Result } from "../utils/Result";

export const CheckoutService = {
    getCupom: async (): Promise<Result<Product[]>> => {
        try {
            const response = await api.get("/product/list");
            const { success, data, error } = response.data;
            if (!data) {
                return makeResult(false, [] as Product[], "Produtos não encontrados");
            }

            return makeResult(success, data, error);
        } catch (error) {
            return makeResult(false, [] as Product[], "Falha na comunicação");
        }
    },
}