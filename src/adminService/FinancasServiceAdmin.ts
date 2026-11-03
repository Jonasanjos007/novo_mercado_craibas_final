import { api } from "../config/api";
import { Despesa, DespesaForm, FinancasMes, FinancasResumo, TopProdutoLucro } from "../models/Financas";
import { makeResult, Result } from "../utils/Result";

export const FinancasServiceAdmin = {
    GetResumoMensal: async (ano: number, mes: number): Promise<Result<FinancasResumo | null>> => {
        try {
            const response = await api.get("/admin/financas/GetResumoMensal", { params: { ano, mes } });
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, null, error);
            }
            return makeResult(true, data ?? null, error);
        } catch (err: any) {
            return makeResult(false, null, err.response?.data);
        }
    },
    GetSerieMensal: async (ano: number): Promise<Result<FinancasMes[]>> => {
        try {
            const response = await api.get("/admin/financas/GetSerieMensal", { params: { ano } });
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, [], error);
            }
            return makeResult(true, data || [], error);
        } catch (err: any) {
            return makeResult(false, [], err.response?.data);
        }
    },
    GetTopProdutosLucro: async (ano: number, mes: number): Promise<Result<TopProdutoLucro[]>> => {
        try {
            const response = await api.get("/admin/financas/GetTopProdutosLucro", { params: { ano, mes } });
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, [], error);
            }
            return makeResult(true, data || [], error);
        } catch (err: any) {
            return makeResult(false, [], err.response?.data);
        }
    },
    GetListAllDespesas: async (ano: number, mes: number): Promise<Result<Despesa[]>> => {
        try {
            const response = await api.get("/admin/financas/GetListAllDespesas", { params: { ano, mes } });
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, [], error);
            }
            return makeResult(true, data || [], error);
        } catch (err: any) {
            return makeResult(false, [], err.response?.data);
        }
    },
    GetCategoriasDespesa: async (): Promise<Result<string[]>> => {
        try {
            const response = await api.get("/admin/financas/GetCategoriasDespesa");
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, [], error);
            }
            return makeResult(true, data || [], error);
        } catch (err: any) {
            return makeResult(false, [], err.response?.data);
        }
    },
    PostSaveDespesa: async (request: DespesaForm): Promise<Result<boolean>> => {
        try {
            await api.post("/admin/financas/PostSaveDespesa", request);
            return makeResult(true, true);
        } catch (err: any) {
            return makeResult(false, false, err.response?.data);
        }
    },
    PostUpdateDespesa: async (request: DespesaForm): Promise<Result<boolean>> => {
        try {
            await api.post("/admin/financas/PostUpdateDespesa", request);
            return makeResult(true, true);
        } catch (err: any) {
            return makeResult(false, false, err.response?.data);
        }
    },
    DeleteDespesa: async (IdDespesa: number, reason: string): Promise<Result<boolean>> => {
        try {
            await api.delete("/admin/financas/DeleteDespesa/" + IdDespesa, { params: { reason } });
            return makeResult(true, true);
        } catch (err: any) {
            return makeResult(false, false, err.response?.data);
        }
    },
};
