import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProductsService } from "../service/ProductsService";
import { makeResult, Result } from "../utils/Result";
import { CartService } from "../service/CartService";
import { User } from '../models/User';
import { Product } from "../models/Product";
import { UseCartStore } from "./UseCartStore";


interface ProductState {
    loadProducts: (User: User | null) => Promise<Result<boolean>>;
    products: Product[];


}
export const UseProductStore = create<ProductState>()(persist((set, get) => ({
    products: [],

    loadProducts: async (User: User | null): Promise<Result<boolean>> => {
        const result = await ProductsService.getListProducts();
        if (User) {
            const Cart = await CartService.getCartProducts(User?.id || 0);
            UseCartStore.getState().setCart(Cart?.data || []);
        }
        if (result.success) {
            set({ products: result.data || [] });
        } else {
            set({ products: [] });
        }
        if (!result.success) {
            return makeResult(false, false, "Erro ao carregar produtos");
        }
        return makeResult(true, true);

    },
}), {
    name: '@Product-storage',
    partialize: (state) => ({
        products: state.products,

    }),
}
));