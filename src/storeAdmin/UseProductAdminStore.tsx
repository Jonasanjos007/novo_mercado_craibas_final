import { create } from "zustand";
import { makeResult, Result } from "../utils/Result";
import { Product, ProductAdmin } from "../models/Product";
import { ProductsService } from "../service/ProductsService";
import { ProductServiceAdmin, ProductsPageQuery } from "../adminService/ProductServiceAdmin";
import { DEFAULT_PAGE_SIZE } from "../models/Paged";

let productsRequest = 0;



interface ProductState {
    loadProductsAdmin: () => Promise<Result<boolean>>;
    products: ProductAdmin[];
    PostSaveProductAdmin: (formData: FormData) => Promise<Result<boolean>>;
    PostEditeProductAdmin: (formData: FormData) => Promise<Result<boolean>>;
    DeleteProductId: (id_Product: number, reason: string) => Promise<Result<boolean>>;

    // Paginação no servidor (aba Produtos)
    productsPage: ProductAdmin[];
    productsTotal: number;
    productsSearchTotal: number;
    productsCountsByCategory: Record<string, number>;
    productsLoading: boolean;
    productsQuery: ProductsPageQuery;
    SetProductsQuery: (query: Partial<ProductsPageQuery>) => Promise<Result<boolean>>;
    LoadProductsPage: () => Promise<Result<boolean>>;

}

export const UseProductAdminStore = create<ProductState>((set, get) => ({
    products: [],
    productsPage: [],
    productsTotal: 0,
    productsSearchTotal: 0,
    productsCountsByCategory: {},
    productsLoading: false,
    productsQuery: { page: 1, pageSize: DEFAULT_PAGE_SIZE, search: '', categoryId: undefined },

    SetProductsQuery: async (query) => {
        set({ productsQuery: { ...get().productsQuery, ...query } });
        return get().LoadProductsPage();
    },

    LoadProductsPage: async () => {
        const request = ++productsRequest;
        set({ productsLoading: true });

        const result = await ProductServiceAdmin.GetProductsPaged(get().productsQuery);
        if (request !== productsRequest) return makeResult(true, true);

        set({ productsLoading: false });

        if (!result.success || !result.data) {
            set({ productsPage: [], productsTotal: 0, productsSearchTotal: 0, productsCountsByCategory: {} });
            return makeResult(false, false, result.error);
        }

        // Página além do fim (ex.: depois de excluir): volta para a última que existe
        const lastPage = Math.max(1, Math.ceil(result.data.totalCount / get().productsQuery.pageSize));
        if (result.data.items.length === 0 && get().productsQuery.page > lastPage) {
            set({ productsQuery: { ...get().productsQuery, page: lastPage } });
            return get().LoadProductsPage();
        }

        set({
            productsPage: result.data.items,
            productsTotal: result.data.totalCount,
            productsSearchTotal: result.data.searchTotal,
            productsCountsByCategory: result.data.countsByCategory || {},
        });
        return makeResult(true, true);
    },

    loadProductsAdmin: async (): Promise<Result<boolean>> => {
        const [result] = await Promise.all([ProductServiceAdmin.getListProductsAdmin(), get().LoadProductsPage()]);
        if (result.success) {
            set({ products: result.data || [] });
            return makeResult(true, true);
        }

        set({ products: [] });
        return makeResult(false, false, result.error);
    },
    PostSaveProductAdmin: async (formData: FormData): Promise<Result<boolean>> => {
        const result = await ProductServiceAdmin.PostSaveProductAdmin(formData);
        if (result.success) {
            const GetAllProducts = await ProductServiceAdmin.getListProductsAdmin();
            set({ products: GetAllProducts.data || [] });
            await get().LoadProductsPage();
            return makeResult(true, true);
        }

        set({ products: [] });
        return makeResult(false, false, result.error);
    },
    PostEditeProductAdmin: async (formData: FormData): Promise<Result<boolean>> => {
        const result = await ProductServiceAdmin.PostEditeProductAdmin(formData);
        // console.log("result2", result)
        if (result.success) {
            const GetAllProducts = await ProductServiceAdmin.getListProductsAdmin();
            set({ products: GetAllProducts.data || [] });
            await get().LoadProductsPage();
            return makeResult(true, true);
        }

        return makeResult(false, false, result.error);
    },
    DeleteProductId: async (id_Product: number, reason: string): Promise<Result<boolean>> => {
        if (id_Product === 0) {
            return makeResult(false, false,);
        }
        const result = await ProductServiceAdmin.DeleteProductsAdmin(id_Product, reason);
        // console.log("result", result)
        if (result.success) {
            const GetAllProducts = await ProductServiceAdmin.getListProductsAdmin();
            set({ products: GetAllProducts.data || [] });
            await get().LoadProductsPage();
            return makeResult(true, true);
        }

        return makeResult(false, false, result.error);
    },

}));