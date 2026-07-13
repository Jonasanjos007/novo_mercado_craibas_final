import { create } from "zustand";
import { makeResult, Result } from "../utils/Result";
import { Product, ProductAdmin } from "../models/Product";
import { ProductsService } from "../service/ProductsService";
import { ProductServiceAdmin } from "../adminService/ProductServiceAdmin";



interface ProductState {
    loadProductsAdmin: () => Promise<Result<boolean>>;
    products: ProductAdmin[];
    PostSaveProductAdmin: (formData: FormData) => Promise<Result<boolean>>;
    PostEditeProductAdmin: (formData: FormData) => Promise<Result<boolean>>;
}

export const UseProductAdminStore = create<ProductState>((set) => ({
    products: [],

    loadProductsAdmin: async (): Promise<Result<boolean>> => {
        const result = await ProductServiceAdmin.getListProductsAdmin();
        if (result.success) {
            set({ products: result.data || [] });
            return makeResult(true, true);
        }

        set({ products: [] });
        return makeResult(false, false, "Erro ao carregar produtos");
    },
    PostSaveProductAdmin: async (formData: FormData): Promise<Result<boolean>> => {
        const result = await ProductServiceAdmin.PostSaveProductAdmin(formData);
        if (result.success) {
            const GetAllProducts = await ProductServiceAdmin.getListProductsAdmin();
            set({ products: GetAllProducts.data || [] });
            return makeResult(true, true);
        }

        set({ products: [] });
        return makeResult(false, false, "Erro ao Salvar produtos");
    },
    PostEditeProductAdmin: async (formData: FormData): Promise<Result<boolean>> => {
        const result = await ProductServiceAdmin.PostEditeProductAdmin(formData);
        console.log("result2", result)
        if (result.success) {
            const GetAllProducts = await ProductServiceAdmin.getListProductsAdmin();
            set({ products: GetAllProducts.data || [] });
            return makeResult(true, true);
        }

        return makeResult(false, false, "Erro ao Editar produtos");
    },

}));