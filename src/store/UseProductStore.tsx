import { create } from "zustand";
import { ProductsService } from "../service/ProductsService";
import { makeResult, Result } from "../utils/Result";
import { User } from "../models/User";
import { Category, Product, RantingAllProduct } from "../models/Product";

interface ProductState {
    loadProducts: () => Promise<Result<boolean>>;
    GetRantingAllProduct: (Id_Product: number) => Promise<Result<RantingAllProduct[]>>;
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
        return makeResult(false, false, result.error);
    },
    GetRantingAllProduct: async (Id_Product: number): Promise<Result<RantingAllProduct[]>> => {
        const result = await ProductsService.GetAssessmentAllProduct(Id_Product);
        if (result.success) {
            return makeResult(true, result.data);
        }
        return makeResult(false, [], result.error);
    },
}));