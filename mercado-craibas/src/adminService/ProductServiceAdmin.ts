import { api } from "../config/api";
import { CartItensProduct } from "../models/CartItensProduct";
import { Cupom } from "../models/Cupom";
import { Logs } from "../models/Logs";
import { OrderSave, Order } from "../models/OrderSave";
import { Category, Product, ProductAdmin } from "../models/Product";
import { makeResult, Result } from "../utils/Result";

export const ProductServiceAdmin = {
    PostSaveProductAdmin: async (formData: FormData): Promise<Result<ProductAdmin[]>> => {
        try {
            const response = await api.post("/admin/Product/PostSaveProduct", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            console.log("response.datalist", response)
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, [], error || "Erro ao Salvar Produto");
            }

            return makeResult(true, data || [], error);
        } catch {
            return makeResult(false, [], "Falha na comunicação");
        }
    },
    PostEditeProductAdmin: async (formData: FormData): Promise<Result<ProductAdmin[]>> => {
        try {
            console.log("looog", formData instanceof FormData);
            const response = await api.post("/admin/Product/PostEditeProduct", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            console.log("response.datalist", response)
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, [], error || "Erro ao Salvar Produto");
            }

            return makeResult(true, data || [], error);
        } catch (error: any) {
            console.log(error.response);
            console.log(error.response?.data);
            console.log(error.response?.data?.errors);

            return makeResult(
                false,
                [],
                error.response?.data?.title || "Falha na comunicação"
            );
        }
    },
    getListProductsAdmin: async (): Promise<Result<ProductAdmin[]>> => {
        try {
            const response = await api.get("/v1/product/list");
            const { success, data, error } = response.data;
            console.log(data)
            if (!data) {
                return makeResult(false, [] as ProductAdmin[], "Produtos não encontrados");
            }

            return makeResult(success, data, error);
        } catch (error) {
            return makeResult(false, [] as ProductAdmin[], "Falha na comunicação");
        }
    },


};