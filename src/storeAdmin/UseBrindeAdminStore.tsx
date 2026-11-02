import { create } from "zustand";
import { makeResult, Result } from "../utils/Result";
import { AtribuirBrinde, Brinde, BrindeCliente, BrindePedido } from "../models/Brinde";
import { BrindeServiceAdmin } from "../adminService/BrindeServiceAdmin";

interface BrindeState {
    brindes: Brinde[];
    entregas: BrindeCliente[];
    LoadBrindesAdmin: () => Promise<Result<Brinde[]>>;
    LoadEntregasAdmin: (status?: string) => Promise<Result<BrindeCliente[]>>;
    PostSaveBrindeStore: (formData: FormData) => Promise<Result<boolean>>;
    PostUpdateBrindeStore: (formData: FormData) => Promise<Result<boolean>>;
    DeleteBrindeStore: (IdBrinde: number, reason: string) => Promise<Result<boolean>>;
    PostUpdateActiveBrindeStore: (IdBrinde: number) => Promise<Result<boolean>>;
    PostAtribuirBrindeStore: (request: AtribuirBrinde) => Promise<Result<boolean>>;
    PostEntregarBrindeStore: (IdBrindeCliente: number) => Promise<Result<boolean>>;
    GetBrindesByOrderStore: (IdOrder: number) => Promise<Result<BrindePedido | null>>;
}

export const UseBrindeAdminStore = create<BrindeState>((set, get) => ({
    brindes: [],
    entregas: [],
    LoadBrindesAdmin: async (): Promise<Result<Brinde[]>> => {
        const result = await BrindeServiceAdmin.GetListAllBrindes();
        if (!result.success) {
            set({ brindes: [] });
            return makeResult(false, [], result.error);
        }
        set({ brindes: result.data || [] });
        return makeResult(true, []);
    },
    LoadEntregasAdmin: async (status?: string): Promise<Result<BrindeCliente[]>> => {
        const result = await BrindeServiceAdmin.GetListEntregas(status);
        if (!result.success) {
            set({ entregas: [] });
            return makeResult(false, [], result.error);
        }
        set({ entregas: result.data || [] });
        return makeResult(true, []);
    },
    PostSaveBrindeStore: async (formData: FormData): Promise<Result<boolean>> => {
        const result = await BrindeServiceAdmin.PostSaveBrinde(formData);
        if (result.success) {
            await get().LoadBrindesAdmin();
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    PostUpdateBrindeStore: async (formData: FormData): Promise<Result<boolean>> => {
        const result = await BrindeServiceAdmin.PostUpdateBrinde(formData);
        if (result.success) {
            await get().LoadBrindesAdmin();
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    DeleteBrindeStore: async (IdBrinde: number, reason: string): Promise<Result<boolean>> => {
        const result = await BrindeServiceAdmin.DeleteBrinde(IdBrinde, reason);
        if (result.success) {
            await get().LoadBrindesAdmin();
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    PostUpdateActiveBrindeStore: async (IdBrinde: number): Promise<Result<boolean>> => {
        const result = await BrindeServiceAdmin.PostUpdateActive(IdBrinde);
        if (result.success) {
            await get().LoadBrindesAdmin();
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    PostAtribuirBrindeStore: async (request: AtribuirBrinde): Promise<Result<boolean>> => {
        const result = await BrindeServiceAdmin.PostAtribuirBrinde(request);
        if (result.success) {
            await get().LoadBrindesAdmin();
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    PostEntregarBrindeStore: async (IdBrindeCliente: number): Promise<Result<boolean>> => {
        const result = await BrindeServiceAdmin.PostEntregarBrinde(IdBrindeCliente);
        if (result.success) {
            await get().LoadBrindesAdmin();
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    GetBrindesByOrderStore: async (IdOrder: number): Promise<Result<BrindePedido | null>> => {
        return await BrindeServiceAdmin.GetBrindesByOrder(IdOrder);
    },
}));
