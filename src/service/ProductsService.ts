import { api } from "../config/api";
import { CartItensProduct } from "../models/CartItensProduct";
import { Product } from "../models/Product";
import { makeResult, Result } from "../utils/Result";

export const ProductsService = {
    getListProducts: async (): Promise<Result<Product[]>> => {
        try {
            const response = await api.get("/v1/product/list");
            const { success, data, error } = response.data;
            console.log(data)
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
    }, PostCartProduct: async (Cart_Itens: CartItensProduct): Promise<Result<CartItensProduct>> => {
        try {
            console.log("Cart_Itens", Cart_Itens)
            const response = await api.post("/v1/product/postCartSave", Cart_Itens);
            const { success, data, error } = response.data;

            if (!data) {
                return makeResult(false, {} as CartItensProduct, error);
            }

            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, {} as CartItensProduct, err.response?.data);
        }
    }, PostCartProductExistent: async (Cart_Itens: CartItensProduct, Operador: string): Promise<Result<CartItensProduct>> => {
        try {
            const response = await api.post("/v1/product/postCartUpdate", { ...Cart_Itens, operador: Operador });
            const { success, data, error } = response.data;

            if (!data) {
                return makeResult(false, {} as CartItensProduct, error);
            }

            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, {} as CartItensProduct, err.response?.data);
        }
    }, PostUpdateQuantity: async (Cart_Itens_Id: number, Quantity: number, Operador: string): Promise<Result<{ success?: boolean; error?: string }>> => {
        try {
            const response = await api.post("/v1/product/PostUpdateQuantity", { Cart_Itens_Id, Quantity, Operador });
            const { success, data, error } = response.data;

            if (!data) {
                return makeResult(false, { success: false, error: "Itens do carrinho não Adicionados" }, error);
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