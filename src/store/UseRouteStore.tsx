import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppPage } from "../types";



interface RouteState {
    currentPage: AppPage;
    Pages: string;
    selectedProductId: number | null;
    selectedCategory: string | null;
    searchQuery: string;
    navigateTo: (page: AppPage, productId?: number, category?: string) => void;
    navigatePages: (page: string, productId: number | null, category: string | null) => void;
    ShowProduct: (selectedProductId: number | null) => void;
    setPages: (selectedCategory: string) => void;

}

export const UseRouteStore = create<RouteState>()(persist((set, get) => ({
    currentPage: 'home',
    Pages: 'home',
    selectedProductId: null,
    selectedCategory: null,
    searchQuery: '',
    navigateTo: (page, productId, category) => {
        set({ currentPage: page, selectedProductId: productId || null, selectedCategory: category || null });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    navigatePages: (page, productId, category) => {
        set({ Pages: page, selectedProductId: productId || null, selectedCategory: category || null });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    ShowProduct: (selectedProductId: number | null) => {
        set({ selectedProductId });
    },
    setPages: (Page) => set({ Pages: Page }),
}),
    {
        name: '@Route-storage',
        partialize: (state) => ({
            Pages: state.Pages,
            selectedProductId: state.selectedProductId,
            selectedCategory: state.selectedCategory,
            currentPage: state.currentPage
        }),
    }
));