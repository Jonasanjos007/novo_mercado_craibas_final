import { create } from "zustand";
import { ProductsService } from "../service/ProductsService";
import { makeResult, Result } from "../utils/Result";
import { User } from "../models/User";
import { Category, Product, RantingAllProduct } from "../models/Product";
import { Favorites } from "../models/Favorites";

interface ProductState {
    loadProducts: () => Promise<Result<boolean>>;
    PostfavoriteSave: (Id_Product: number) => Promise<Result<boolean>>;
    DeleteOneFavorite: (IdProduct: number) => Promise<Result<boolean>>;
    GetRantingAllProduct: (Id_Product: number) => Promise<Result<RantingAllProduct[]>>;
    GetfavoriteAll: () => Promise<Result<boolean>>;
    products: Product[];
    favorites: Favorites[];
}

export const UseProductStore = create<ProductState>((set, get) => ({
    products: [],
    favorites: [],
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
    PostfavoriteSave: async (Id_Product: number): Promise<Result<boolean>> => {
        const result = await ProductsService.PostSaveFavorites(Id_Product);
        if (result.success) {
            await get().GetfavoriteAll();
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    GetfavoriteAll: async (): Promise<Result<boolean>> => {
        const result = await ProductsService.GetAllFavorites();
        if (result.success) {
            set({ favorites: result.data || [] });
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    DeleteOneFavorite: async (IdProduct: number): Promise<Result<boolean>> => {
        const result = await ProductsService.DeleteProductsFavorite(IdProduct);
        console.log('response', result)

        if (!result.success) {
            return makeResult(false, false, result.error);
        }

        await get().GetfavoriteAll();
        return makeResult(true, true);
    },
}));