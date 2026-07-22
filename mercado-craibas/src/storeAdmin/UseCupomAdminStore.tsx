import { create } from "zustand";
import { makeResult, Result } from "../utils/Result";
import { Product, ProductAdmin } from "../models/Product";
import { ProductsService } from "../service/ProductsService";
import { Cupom, CupomAdmin, UpdateCouponRequest } from "../models/Cupom";
import { CupomServiceAdmin } from "../adminService/CupomServiceAdmin";



interface CupomState {
    cupom: CupomAdmin[];
    PostSaveCupomStore: (CupomSave: CupomAdmin) => Promise<Result<boolean>>;
    DeleteCupomStore: (IdCupom: number) => Promise<Result<boolean>>;
    PostUpdateActiveCupomStore: (IdCupom: number) => Promise<Result<boolean>>;
    PostUpdateCupomStore: (CupomUpdate: UpdateCouponRequest) => Promise<Result<boolean>>;
    LoadcuponsAdmin: () => Promise<Result<CupomAdmin[]>>;
}

export const UseCupomAdminStore = create<CupomState>((set, get) => ({
    cupom: [],
    PostSaveCupomStore: async (CupomSave: CupomAdmin): Promise<Result<boolean>> => {
        const result = await CupomServiceAdmin.PostSaveCupom(CupomSave);
        console.log("fdfdf", result)
        if (result.success) {
            await get().LoadcuponsAdmin();
            // set({ cupom: result.data || [] });
            return makeResult(true, true);
        }

        return makeResult(false, false, result.error);
    },
    LoadcuponsAdmin: async (): Promise<Result<CupomAdmin[]>> => {
        const result = await CupomServiceAdmin.GetCuponsAllListAdmin();
        console.log("resultigi.data", result);
        if (!result.success) {
            set({ cupom: [] });
            return makeResult(false, [], result.error);
        }
        set({ cupom: result.data || [] });
        return makeResult(true, []);
    },
    PostUpdateCupomStore: async (CupomUpdate: UpdateCouponRequest): Promise<Result<boolean>> => {
        const result = await CupomServiceAdmin.PostUpdateCupom(CupomUpdate);
        console.log("fdfdf", result)
        if (result.success) {
            await get().LoadcuponsAdmin();
            // set({ cupom: result.data || [] });
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    DeleteCupomStore: async (IdCupom: number): Promise<Result<boolean>> => {
        const result = await CupomServiceAdmin.DeleteCupom(IdCupom);
        if (result.success) {
            await get().LoadcuponsAdmin();
            // set({ cupom: result.data || [] });
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    PostUpdateActiveCupomStore: async (IdCupom: number): Promise<Result<boolean>> => {
        const result = await CupomServiceAdmin.PostActiveCupom(IdCupom);
        console.log("fdfdf", result)
        if (result.success) {
            await get().LoadcuponsAdmin();
            // set({ cupom: result.data || [] });
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
}));