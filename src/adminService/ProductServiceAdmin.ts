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
            console.log(
                "Categoria enviada:",
                [...formData.entries()]
            );
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
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, [], err.response?.data);
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
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, [], err.response?.data);
        }
    },
    getListProductsAdmin: async (): Promise<Result<ProductAdmin[]>> => {
        try {
            const response = await api.get("/admin/Product/listProductAdmin");
            const { success, data, error } = response.data;
            console.log(data)
            if (!data) {
                return makeResult(false, [] as ProductAdmin[], error);
            }

            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, [] as ProductAdmin[], err.response?.data);
        }
    },

    DeleteProductsAdmin: async (id_Product: number): Promise<Result<ProductAdmin[]>> => {
        try {
            const response = await api.delete(`/admin/Product/DeleteProductId/${id_Product}`);
            const { success, data, error } = response.data;
            console.log(data)
            if (!data) {
                return makeResult(false, [] as ProductAdmin[], error);
            }

            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, [] as ProductAdmin[], err.response?.data);
        }
    },


};