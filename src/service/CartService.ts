import { api } from "../config/api";
import { CartItensProduct, CartUserResponse } from "../models/CartItensProduct";
import { CartVazio } from "../store/UseCartStore";
import { makeResult, Result } from "../utils/Result";

export const CartService = {

    getCartProducts: async (): Promise<Result<CartUserResponse>> => {
        try {

            const response = await api.get("/v1/product/GetProductCart");
            console.log("response", response)
            const { success, data, error } = response.data;
            if (!data) {
                return makeResult(false, CartVazio, error);
            }

            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, CartVazio, err.response?.data);
        }
    }, DeleteCartProduct: async (Cart_Itens_Id: number): Promise<Result<{ success?: boolean; error?: string }>> => {
        try {
            const response = await api.delete("/v1/product/DeleteProductCart/" + Cart_Itens_Id);
            const { success, data, error } = response.data;

            if (!data) {
                return makeResult(false, { success: false, error: "Itens do carrinho não removidos" }, error);
            }

            return makeResult(success, { success: true, error: "" }, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, { success: false, error: "Falha na comunicação" }, err.response?.data);
        }
    },
}
