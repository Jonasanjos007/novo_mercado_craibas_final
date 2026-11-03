import { create } from "zustand";
import { makeResult, Result } from "../utils/Result";
import { Despesa, DespesaForm, FinancasMes, FinancasResumo, TopProdutoLucro } from "../models/Financas";
import { FinancasServiceAdmin } from "../adminService/FinancasServiceAdmin";

interface FinancasState {
    resumo: FinancasResumo | null;
    serie: FinancasMes[];
    topProdutos: TopProdutoLucro[];
    despesas: Despesa[];
    categorias: string[];
    LoadResumo: (ano: number, mes: number) => Promise<Result<FinancasResumo | null>>;
    LoadSerie: (ano: number) => Promise<Result<FinancasMes[]>>;
    LoadTopProdutos: (ano: number, mes: number) => Promise<Result<TopProdutoLucro[]>>;
    LoadDespesas: (ano: number, mes: number) => Promise<Result<Despesa[]>>;
    LoadCategorias: () => Promise<Result<string[]>>;
    PostSaveDespesaStore: (request: DespesaForm) => Promise<Result<boolean>>;
    PostUpdateDespesaStore: (request: DespesaForm) => Promise<Result<boolean>>;
    DeleteDespesaStore: (IdDespesa: number, reason: string) => Promise<Result<boolean>>;
}

export const UseFinancasAdminStore = create<FinancasState>((set) => ({
    resumo: null,
    serie: [],
    topProdutos: [],
    despesas: [],
    categorias: [],
    LoadResumo: async (ano: number, mes: number): Promise<Result<FinancasResumo | null>> => {
        const result = await FinancasServiceAdmin.GetResumoMensal(ano, mes);
        if (!result.success) {
            set({ resumo: null });
            return makeResult(false, null, result.error);
        }
        set({ resumo: result.data ?? null });
        return makeResult(true, null);
    },
    LoadSerie: async (ano: number): Promise<Result<FinancasMes[]>> => {
        const result = await FinancasServiceAdmin.GetSerieMensal(ano);
        if (!result.success) {
            set({ serie: [] });
            return makeResult(false, [], result.error);
        }
        set({ serie: result.data || [] });
        return makeResult(true, []);
    },
    LoadTopProdutos: async (ano: number, mes: number): Promise<Result<TopProdutoLucro[]>> => {
        const result = await FinancasServiceAdmin.GetTopProdutosLucro(ano, mes);
        if (!result.success) {
            set({ topProdutos: [] });
            return makeResult(false, [], result.error);
        }
        set({ topProdutos: result.data || [] });
        return makeResult(true, []);
    },
    LoadDespesas: async (ano: number, mes: number): Promise<Result<Despesa[]>> => {
        const result = await FinancasServiceAdmin.GetListAllDespesas(ano, mes);
        if (!result.success) {
            set({ despesas: [] });
            return makeResult(false, [], result.error);
        }
        set({ despesas: result.data || [] });
        return makeResult(true, []);
    },
    LoadCategorias: async (): Promise<Result<string[]>> => {
        const result = await FinancasServiceAdmin.GetCategoriasDespesa();
        if (!result.success) {
            return makeResult(false, [], result.error);
        }
        set({ categorias: result.data || [] });
        return makeResult(true, []);
    },
    PostSaveDespesaStore: async (request: DespesaForm): Promise<Result<boolean>> => {
        const result = await FinancasServiceAdmin.PostSaveDespesa(request);
        if (!result.success) {
            return makeResult(false, false, result.error);
        }
        return makeResult(true, true);
    },
    PostUpdateDespesaStore: async (request: DespesaForm): Promise<Result<boolean>> => {
        const result = await FinancasServiceAdmin.PostUpdateDespesa(request);
        if (!result.success) {
            return makeResult(false, false, result.error);
        }
        return makeResult(true, true);
    },
    DeleteDespesaStore: async (IdDespesa: number, reason: string): Promise<Result<boolean>> => {
        const result = await FinancasServiceAdmin.DeleteDespesa(IdDespesa, reason);
        if (!result.success) {
            return makeResult(false, false, result.error);
        }
        return makeResult(true, true);
    },
}));
