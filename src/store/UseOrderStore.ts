import { create } from "zustand";
import { ProductsService } from "../service/ProductsService";
import { makeResult, Result } from "../utils/Result";
import { User } from "../models/User";
import { Category, Product } from "../models/Product";
import { OrderService } from "../service/OrderService";
import { Cupom } from "../models/Cupom";
import { Order, OrderSave, RatingResponse } from "../models/OrderSave";
import { UseUserStore } from "./UseUserStore";
import { CartItensProduct } from "../models/CartItensProduct";
import { UseCartStore } from "./UseCartStore";
import { OrderServiceAdmin } from "../adminService/OrderServiceAdmin";
import { UseProductStore } from "./UseProductStore";

interface OrderState {
    LoadCupons: () => Promise<Result<boolean>>;
    Cupons: Cupom[];
    orders: Order[];
    Category: Category[];
    SaveOrderUser: (Order: OrderSave) => Promise<Result<CartItensProduct | null>>;
    LoadOrders: () => Promise<Result<boolean>>;
    LoadCategory: () => Promise<Result<boolean>>;
    PostRating: (formData: FormData) => Promise<Result<boolean>>;
    GetRating: (IdProduct: number, IdOrder: number) => Promise<Result<RatingResponse>>;


}

export const UseOrderStore = create<OrderState>((set, get) => ({
    Cupons: [],
    orders: [],
    Category: [],
    LoadCupons: async (): Promise<Result<boolean>> => {
        const result = await OrderService.GetCupomSearch();
        if (!result.success) {
            set({ Cupons: [] });
            return makeResult(false, false, result.error);
        }
        set({ Cupons: result.data });
        return makeResult(true, true);

    },
    LoadOrders: async (): Promise<Result<boolean>> => {
        const result = await OrderService.GetOrderAllList();
        console.log("resultigi.data", result.data);
        if (!result.success) {
            set({ orders: [] });
            return makeResult(false, false, result.error);
        }
        set({ orders: result.data || [] });
        return makeResult(true, true);

    },
    SaveOrderUser: async (orderData: OrderSave) => {
        const { user } = UseUserStore.getState();
        if (!user) {
            return makeResult(false, null);
        }
        const result = await OrderService.PostOrder(orderData);

        if (!result.success) {
            return makeResult(false, null, result.error);
        } console.log("result.data teste", result.data)
        // const total = get().cartTotal();
        // const order: Order = {
        //     id: `ORD-${String(Date.now()).slice(-6)}`,
        //     userId: user.id, items: [...cart], total,
        //     status: 'confirmado', createdAt: new Date(), updatedAt: new Date(),
        //     address: user.address || { street: 'Rua das Flores', number: '123', neighborhood: 'Centro', city: 'Craibas', state: 'AL', zipCode: '57465-000' },
        //     paymentMethod, trackingCode: `MC${String(Date.now()).slice(-9)}BR`,
        //     deliveryCommission: +(total * 0.05).toFixed(2),
        // };
        // set({ orders: [order, ...get().orders] });
        // get().clearCart();
        // return order;
        return makeResult(true, result.data);
    },
    LoadCategory: async (): Promise<Result<boolean>> => {
        const result = await OrderServiceAdmin.GetCategoryAllListAdmin();
        if (!result.success) {
            set({ Category: [] as Category[] });
            return makeResult(false, false, result.error);
        }
        set({ Category: result.data || [] as Category[] });
        return makeResult(true, true);
    },
    PostRating: async (formData: FormData): Promise<Result<boolean>> => {
        const result = await OrderService.PostSaveAssessment(formData);
        if (!result.success) {
            return makeResult(false, false, result.error);
        }
        get().LoadOrders();
        UseProductStore.getState().loadProducts();
        return makeResult(true, true);
    },
    GetRating: async (IdProduct: number, IdOrder: number): Promise<Result<RatingResponse>> => {
        const result = await OrderService.GetAssessment(IdProduct, IdOrder);
        if (!result.success) {
            return makeResult(false, {} as RatingResponse, result.error);
        }
        get().LoadOrders();

        return makeResult(true, result.data);
    },

}));