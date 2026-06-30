import { create } from "zustand";
import { ProductsService } from "../service/ProductsService";
import { makeResult, Result } from "../utils/Result";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { OrderService } from "../service/OrderService";
import { Cupom } from "../models/Cupom";

interface OrderState {
    LoadCupons: () => Promise<Result<boolean>>;
    Cupons: Cupom[] | undefined;
}

export const UseOrderStore = create<OrderState>((set) => ({
    Cupons: [],

    LoadCupons: async (): Promise<Result<boolean>> => {
        const result = await OrderService.GetCupomSearch();
        if (result.success) {
            set({ Cupons: result.data });
            return makeResult(true, true);
        }

        set({ Cupons: [] });
        return makeResult(false, false, "Erro ao carregar Cupom");
    },
}));