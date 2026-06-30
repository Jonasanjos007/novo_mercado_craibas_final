import { api } from "../config/api";
import { CartItensProduct } from "../models/CartItensProduct";
import { Cupom } from "../models/Cupom";
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
}