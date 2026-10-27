import { create } from "zustand";
import { ProductsService } from "../service/ProductsService";
import { makeResult, Result } from "../utils/Result";
import { User } from "../models/User";
import { Category, Product } from "../models/Product";
import { OrderService } from "../service/OrderService";
import { Cupom } from "../models/Cupom";
import { Order, OrderSave, RatingResponse } from "../models/Order";
import { UseUserStore } from "./UseUserStore";
import { CartItensProduct } from "../models/CartItensProduct";
import { UseCartStore } from "./UseCartStore";
import { OrderServiceAdmin } from "../adminService/OrderServiceAdmin";
import { UseProductStore } from "./UseProductStore";
import { OrderCreated } from "../models/Payment";

interface OrderState {
    LoadCupons: () => Promise<Result<boolean>>;
    Cupons: Cupom[];
    orders: Order[];
    /** true enquanto a lista de pedidos está sendo buscada. */
    ordersLoading: boolean;
    /** true depois que a lista chegou pelo menos uma vez (antes disso não dá para dizer "nenhum pedido"). */
    ordersLoaded: boolean;
    /** true quando a última busca falhou (a tela mostra "tentar de novo" em vez de "nenhum pedido"). */
    ordersFailed: boolean;
    Category: Category[];
    /** Cria o pedido PENDENTE e devolve o id para seguir ao pagamento. */
    SaveOrderUser: (Order: OrderSave) => Promise<Result<OrderCreated | null>>;
    /** Cancela o pedido e recarrega a lista. */
    CancelOrderUser: (orderId: number, reason: string) => Promise<Result<boolean>>;
    /** Pede devolução e recarrega a lista. */
    RequestReturnUser: (orderId: number, reason: string) => Promise<Result<boolean>>;
    LoadOrders: () => Promise<Result<boolean>>;
    LoadCategory: () => Promise<Result<boolean>>;
    PostRating: (formData: FormData) => Promise<Result<boolean>>;
    PostEditeRating: (formData: FormData) => Promise<Result<boolean>>;
    GetRating: (IdProduct: number, IdOrder: number) => Promise<Result<RatingResponse>>;


}

// Várias telas pedem a lista ao mesmo tempo (cabeçalho, Meus Pedidos, Perfil):
// só a resposta do pedido mais recente vale, para uma resposta antiga não apagar a lista.
let ordersRequest = 0;

export const UseOrderStore = create<OrderState>((set, get) => ({
    Cupons: [],
    orders: [],
    ordersLoading: false,
    ordersLoaded: false,
    ordersFailed: false,
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
        const request = ++ordersRequest;
        set({ ordersLoading: true });
        const result = await OrderService.GetOrderAllList();
        // Chegou depois de uma busca mais nova: ignora (a mais nova decide a lista).
        if (request !== ordersRequest) {
            return result.success ? makeResult(true, true) : makeResult(false, false, result.error);
        }
        if (!result.success) {
            set({ orders: [], ordersLoading: false, ordersLoaded: true, ordersFailed: true });
            return makeResult(false, false, result.error);
        }
        set({ orders: result.data || [], ordersLoading: false, ordersLoaded: true, ordersFailed: false });
        return makeResult(true, true);

    },
    CancelOrderUser: async (orderId, reason) => {
        const result = await OrderService.CancelOrder(orderId, reason);
        if (result.success) await get().LoadOrders();
        return result;
    },
    RequestReturnUser: async (orderId, reason) => {
        const result = await OrderService.RequestReturn(orderId, reason);
        if (result.success) await get().LoadOrders();
        return result;
    },
    SaveOrderUser: async (orderData: OrderSave) => {
        const { user } = UseUserStore.getState();
        if (!user) {
            return makeResult(false, null);
        }
        const result = await OrderService.PostOrder(orderData);

        if (!result.success) {
            return makeResult(false, null, result.error);
        }
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
    PostEditeRating: async (formData: FormData): Promise<Result<boolean>> => {
        const result = await OrderService.PostEditeAssessment(formData);
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