import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItensProduct, CartUserResponse } from "../models/CartItensProduct";
import { ProductsService } from "../service/ProductsService";
import { CartService } from "../service/CartService";
import { Address } from "../models/Address";
import { User } from "../models/User";
import { makeResult, Result } from "../utils/Result";

interface CartState {
    cart: CartUserResponse;
    cartOpen: boolean;
    addToCart: (item: CartItensProduct) => Promise<Result<boolean>>;
    removeFromCart: (productId: number) => Promise<Result<boolean>>;
    updateQuantity: (CartId: number, productId: number, quantity: number, operador: string) => Promise<Result<boolean>>;
    setCart: (Cart: CartUserResponse) => void;
    setCartOpen: (open: boolean) => void;
    clearCart: () => void;
    cartCount: () => number;
    cartTotal: () => number;
    // LoadCartUser: (User: User | null) => Promise<{ success?: boolean; error?: string }>;
    LoadCartUser: (User: User | null) => Promise<Result<boolean>>;

}
export const CartVazio: CartUserResponse = {
    cartItensProduct: [],
    subTotal: 0,
    discount: 0,
    total: 0,
    cupom: "",
    id_Cupom: 0,
    erroCupom: false,
    menssege: "",
    couponApplied: false
};
export const UseCartStore = create<CartState>((set, get) => ({
    cart: CartVazio,
    LoadCartUser: async (user) => {
        if (!user) {
            set({ cart: CartVazio });
            return makeResult(false, false);
        }

        const cart = await CartService.getCartProducts();
        console.log("cart1234", cart)
        if (!cart.success) {
            set({ cart: CartVazio });
            return makeResult(false, false, cart.error);
        }

        set({ cart: cart.data });
        return makeResult(true);
    },
    addToCart: async (item) => {
        const cart = get().cart ?? [];
        const existing = cart.cartItensProduct.find(c => c.product?.id === item.product?.id && c.selectedVariation?.id === item.selectedVariation?.id);
        if (existing) {
            const result = await ProductsService.PostCartProductExistent(existing, "Soma");
            if (!result.success) {
                return makeResult(false, false, result.error);

            }
            set({
                cart: {
                    ...cart,
                    cartItensProduct: cart.cartItensProduct?.map(c =>
                        c.product?.id === item.product?.id &&
                            c.selectedVariation?.id === item.selectedVariation?.id
                            ? { ...c, quantity: c.quantity + item.quantity }
                            : c
                    ) ?? []
                }
            });
            return makeResult(true, true);

        } else {
            const result = await ProductsService.PostCartProduct(item);
            if (!result.success) {
                return makeResult(false, false, result.error);

            }
            const NewCart = await CartService.getCartProducts(); // Certifique-se de que o ID retornado pela API seja usado
            set({ cart: NewCart?.data });
            return makeResult(true, true);

        }

    },
    removeFromCart: async (CartId) => {
        const deleteItem = await CartService.DeleteCartProduct(CartId);
        if (!deleteItem.success) {
            return makeResult(false, false, deleteItem.error);
        }
        set({
            cart: {
                ...get().cart,
                cartItensProduct: (get().cart.cartItensProduct ?? []).filter(
                    c => c.id !== CartId
                )
            }
        });
        get().setCartOpen(true);
        return makeResult(true, true);
    },
    updateQuantity: async (CartId, productId, quantity, operador) => {
        if (quantity === 1 && operador === "Subtrair") {
            const deleteItemcart = await get().removeFromCart(CartId);
            if (!deleteItemcart.success) {
                return makeResult(false, false, deleteItemcart.error);
            }
            return makeResult(true, true);

        }
        const result = await ProductsService.PostUpdateQuantity(CartId, quantity, operador);
        if (operador === "Subtrair") {
            quantity = quantity - 1;
        }
        else if (operador === "Soma") {
            quantity = quantity + 1;
        }
        if (!result.success) {
            return makeResult(false, false, result.error);

        }

        set({
            cart: {
                ...get().cart,
                cartItensProduct: get().cart.cartItensProduct.map(c => c.product?.id === productId ? { ...c, quantity } : c)
            }
        });
        return makeResult(true, true);

    },
    setCart: (Cart) => set({ cart: Cart }),
    clearCart: () => set({ cart: CartVazio }),
    cartCount: () => {
        const cart = get().cart || [];
        console.log("joanscart", cart)
        return cart.cartItensProduct.reduce((acc, item) => {
            return acc + item.quantity;
        }, 0);
    },
    cartTotal: () => {
        const cart = get().cart || [];

        return cart.cartItensProduct.reduce((acc, item) => {
            return acc + (item.product?.price_Unic || 0) * item.quantity;
        }, 0);
    },
    cartOpen: false,
    setCartOpen: (open) => set({ cartOpen: open }),

}));