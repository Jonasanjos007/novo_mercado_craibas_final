import { api } from "../config/api";
import { CartItensProduct } from "../models/CartItensProduct";
import { Product } from "../models/Product";
import { makeResult, Result } from "../utils/Result";

export const ProductsService = {
    getListProducts: async (): Promise<Result<Product[]>> => {
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
    }, PostCartProduct: async (Cart_Itens: CartItensProduct): Promise<Result<CartItensProduct>> => {
        try {
            const response = await api.post("/product/postCartSave", Cart_Itens);
            const { success, data, error } = response.data;

            if (!data) {
                return makeResult(false, {} as CartItensProduct, "Itens do carrinho não Adicionados");
            }

            return makeResult(success, data, error);
        } catch (error) {
            return makeResult(false, {} as CartItensProduct, "Falha na comunicação");
        }
    }, PostCartProductExistent: async (Cart_Itens: CartItensProduct, Operador: string): Promise<Result<CartItensProduct>> => {
        try {
            const response = await api.post("/product/postCartUpdate", { ...Cart_Itens, operador: Operador });
            const { success, data, error } = response.data;

            if (!data) {
                return makeResult(false, {} as CartItensProduct, "Itens do carrinho não Adicionados");
            }

            return makeResult(success, data, error);
        } catch (error) {
            return makeResult(false, {} as CartItensProduct, "Falha na comunicação");
        }
    }, PostUpdateQuantity: async (Cart_Itens_Id: number, Quantity: number, Operador: string): Promise<Result<{ success?: boolean; error?: string }>> => {
        try {
            const response = await api.post("/product/PostUpdateQuantity", { Cart_Itens_Id, Quantity, Operador });
            const { success, data, error } = response.data;

            if (!data) {
                return makeResult(false, { success: false, error: "Itens do carrinho não Adicionados" }, "Erro ao atualizar quantidade");
            }

            return makeResult(success, { success: true, error: "" }, error);
        } catch (error) {
            return makeResult(false, { success: false, error: "Falha na comunicação" }, "Erro ao atualizar quantidade");
        }
    },
}