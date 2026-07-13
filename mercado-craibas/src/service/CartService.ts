import { api } from "../config/api";
import { CartItensProduct } from "../models/CartItensProduct";
import { makeResult, Result } from "../utils/Result";

export const CartService = {

    getCartProducts: async (): Promise<Result<CartItensProduct[]>> => {
        try {

            const response = await api.get("/v1/product/GetProductCart");
            const { success, data, error } = response.data;
            if (!data) {
                return makeResult(false, [] as CartItensProduct[], "Itens do carrinho não encontrados");
            }

            return makeResult(success, data, error);
        } catch (error) {
            return makeResult(false, [] as CartItensProduct[], "Falha na comunicação");
        }
    }, DeleteCartProduct: async (Cart_Itens_Id: number): Promise<Result<{ success?: boolean; error?: string }>> => {
        try {
            const response = await api.delete("/v1/product/DeleteProductCart/" + Cart_Itens_Id);
            const { success, data, error } = response.data;

            if (!data) {
                return makeResult(false, { success: false, error: "Itens do carrinho não removidos" }, "Erro ao remover item do carrinho");
            }

            return makeResult(success, { success: true, error: "" }, error);
        } catch (error) {
            return makeResult(false, { success: false, error: "Falha na comunicação" }, "Erro ao remover item do carrinho");
        }
    },
}