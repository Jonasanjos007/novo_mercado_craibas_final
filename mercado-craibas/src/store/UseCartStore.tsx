import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItensProduct } from "../models/CartItensProduct";
import { ProductsService } from "../service/ProductsService";
import { CartService } from "../service/CartService";

interface CartState {
    cart: CartItensProduct[];
    cartOpen: boolean;
    addToCart: (item: CartItensProduct) => Promise<boolean>;
    removeFromCart: (productId: number) => Promise<{ success?: boolean; error?: string }>;
    updateQuantity: (CartId: number, productId: number, quantity: number, operador: string) => Promise<{ success?: boolean; error?: string }>;
    setCart: (Cart: CartItensProduct[] | []) => void;
    setCartOpen: (open: boolean) => void;
    clearCart: () => void;
    cartCount: () => number;
    cartTotal: () => number;

}
export const UseCartStore = create<CartState>()(persist((set, get) => ({
    cart: [],
    addToCart: async (item) => {
        const cart = get().cart ?? [];
        const existing = cart.find(c => c.product?.id === item.product?.id && c.selectedVariation?.id === item.selectedVariation?.id);
        if (existing) {
            const result = await ProductsService.PostCartProductExistent(existing, "Soma");
            if (!result.success) {
                return false;
            }
            set({ cart: cart.map(c => c.product?.id === item.product?.id && c.selectedVariation?.id === item.selectedVariation?.id ? { ...c, quantity: c.quantity + item.quantity } : c) });
            return true;
        } else {
            const result = await ProductsService.PostCartProduct(item);
            if (!result.success) {
                return false;
            }
            const NewCart = await CartService.getCartProducts(item.user?.id || 0); // Certifique-se de que o ID retornado pela API seja usado
            set({ cart: NewCart?.data || [] });
            return true;
        }

    },
    removeFromCart: async (CartId) => {
        const deleteItem = await CartService.DeleteCartProduct(CartId);
        if (!deleteItem.success) {
            return deleteItem;
        }
        set({ cart: get().cart.filter(c => c.id !== CartId) })
        return deleteItem;
    },
    updateQuantity: async (CartId, productId, quantity, operador) => {
        if (quantity === 1 && operador === "Subtrair") {
            const deleteItemcart = await get().removeFromCart(CartId);
            if (!deleteItemcart.success) {
                return { success: false, error: deleteItemcart.error || "Erro ao remover produto do carrinho" };
            }
            return { success: true, error: "" };
        }
        const result = await ProductsService.PostUpdateQuantity(CartId, quantity, operador);
        if (operador === "Subtrair") {
            quantity = quantity - 1;
        }
        else if (operador === "Soma") {
            quantity = quantity + 1;
        }
        if (!result.success) {
            return { success: false, error: result.error || "Erro ao atualizar quantidade" };
        }

        set({ cart: get().cart.map(c => c.product?.id === productId ? { ...c, quantity } : c) });
        return { success: true, error: "" };
    },
    setCart: (Cart) => set({ cart: Cart }),
    clearCart: () => set({ cart: [] }),
    cartCount: () => {
        const cart = get().cart || [];

        return cart.reduce((acc, item) => {
            return acc + item.quantity;
        }, 0);
    },
    cartTotal: () => {
        const cart = get().cart || [];

        return cart.reduce((acc, item) => {
            return acc + (item.product?.price_Unic || 0) * item.quantity;
        }, 0);
    },
    cartOpen: false,
    setCartOpen: (open) => set({ cartOpen: open }),



}), {
    name: '@Cart-storage',
    partialize: (state) => ({
        cart: state.cart,

    }),
}
));