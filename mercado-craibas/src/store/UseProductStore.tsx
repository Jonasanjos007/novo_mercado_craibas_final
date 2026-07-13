import { create } from "zustand";
import { ProductsService } from "../service/ProductsService";
import { makeResult, Result } from "../utils/Result";
import { User } from "../models/User";
import { Product } from "../models/Product";

interface ProductState {
    loadProducts: () => Promise<Result<boolean>>;
    products: Product[];
}

export const UseProductStore = create<ProductState>((set) => ({
    products: [],

    loadProducts: async (): Promise<Result<boolean>> => {
        const result = await ProductsService.getListProducts();
        if (result.success) {
            set({ products: result.data || [] });
            return makeResult(true, true);
        }

        set({ products: [] });
        return makeResult(false, false, "Erro ao carregar produtos");
    },
}));