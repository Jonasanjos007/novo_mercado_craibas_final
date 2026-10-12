import { api } from "../config/api";
import { CartItensProduct } from "../models/CartItensProduct";
import { Cupom } from "../models/Cupom";
import { Logs } from "../models/Logs";
import { OrderSave, Order } from "../models/Order";
import { Category, Product, ProductAdmin } from "../models/Product";
import { makeResult, Result } from "../utils/Result";
import { emptyPaged, ProductsPage } from "../models/Paged";

export interface ProductsPageQuery { page: number; pageSize: number; search?: string; categoryId?: number; }

export const ProductServiceAdmin = {
    GetProductsPaged: async (q: ProductsPageQuery): Promise<Result<ProductsPage<ProductAdmin>>> => {
        const fallback: ProductsPage<ProductAdmin> = { ...emptyPaged<ProductAdmin>(), searchTotal: 0, countsByCategory: {} };
        try {
            const response = await api.get("/admin/Product/paged", { params: { ...q } });
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, fallback, error);
            }

            return makeResult(true, (data ?? fallback) as ProductsPage<ProductAdmin>, error);
        } catch (err: any) {
            console.log(err.response?.data);
            return makeResult(false, fallback, err.response?.data);
        }
    },
    PostSaveProductAdmin: async (formData: FormData): Promise<Result<ProductAdmin[]>> => {
        try {
            const response = await api.post("/admin/Product/PostSaveProduct", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
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
            const response = await api.post("/admin/Product/PostEditeProduct", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
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

    DeleteProductsAdmin: async (id_Product: number, reason: string): Promise<Result<ProductAdmin[]>> => {
        try {
            const response = await api.delete(`/admin/Product/DeleteProductId/${id_Product}`, {
                params: { reason }
            });
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