import { create } from "zustand";
import { makeResult, Result } from "../utils/Result";
import { UseCartStore } from "./UseCartStore";
import { UseUserStore } from "./UseUserStore";
import { CupomService } from "../service/CupomService";

interface CupomtState {
    ApllyqueCupom: (CodCupom: string) => Promise<Result<boolean>>;
    RemoveApllyqueCupom: () => Promise<Result<boolean>>;

}

export const UseCupomStore = create<CupomtState>((set) => ({
    ApllyqueCupom: async (CodCupom: string): Promise<Result<boolean>> => {
        const result = await CupomService.ApplyCupom(CodCupom);
        if (result.success) {
            UseCartStore.getState().LoadCartUser(UseUserStore.getState().user)
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    RemoveApllyqueCupom: async (): Promise<Result<boolean>> => {
        const result = await CupomService.RemoveApllyCupom();
        if (result.success) {
            UseCartStore.getState().LoadCartUser(UseUserStore.getState().user)
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
}));