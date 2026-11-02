import { api } from "../config/api";
import { AtribuirBrinde, Brinde, BrindeCliente, BrindePedido } from "../models/Brinde";
import { makeResult, Result } from "../utils/Result";

export const BrindeServiceAdmin = {
    PostSaveBrinde: async (formData: FormData): Promise<Result<boolean>> => {
        try {
            await api.post("/admin/brinde/PostSaveBrinde", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return makeResult(true, true);
        } catch (err: any) {
            return makeResult(false, false, err.response?.data);
        }
    },
    GetListAllBrindes: async (): Promise<Result<Brinde[]>> => {
        try {
            const response = await api.get("/admin/brinde/GetListAllBrindes");
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, [], error || "Erro ao buscar brindes");
            }
            return makeResult(true, data || [], error);
        } catch (err: any) {
            return makeResult(false, [], err.response?.data);
        }
    },
    PostUpdateBrinde: async (formData: FormData): Promise<Result<boolean>> => {
        try {
            await api.post("/admin/brinde/PostUpdateBrinde", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return makeResult(true, true);
        } catch (err: any) {
            return makeResult(false, false, err.response?.data);
        }
    },
    DeleteBrinde: async (IdBrinde: number, reason: string): Promise<Result<boolean>> => {
        try {
            await api.delete("/admin/brinde/DeleteBrinde/" + IdBrinde, {
                params: { reason }
            });
            return makeResult(true, true);
        } catch (err: any) {
            return makeResult(false, false, err.response?.data);
        }
    },
    PostUpdateActive: async (IdBrinde: number): Promise<Result<boolean>> => {
        try {
            await api.post("/admin/brinde/PostUpdateActive", IdBrinde);
            return makeResult(true, true);
        } catch (err: any) {
            return makeResult(false, false, err.response?.data);
        }
    },
    PostAtribuirBrinde: async (request: AtribuirBrinde): Promise<Result<boolean>> => {
        try {
            await api.post("/admin/brinde/PostAtribuirBrinde", request);
            return makeResult(true, true);
        } catch (err: any) {
            return makeResult(false, false, err.response?.data);
        }
    },
    PostEntregarBrinde: async (IdBrindeCliente: number): Promise<Result<boolean>> => {
        try {
            await api.post("/admin/brinde/PostEntregarBrinde", IdBrindeCliente);
            return makeResult(true, true);
        } catch (err: any) {
            return makeResult(false, false, err.response?.data);
        }
    },
    GetListEntregas: async (status?: string): Promise<Result<BrindeCliente[]>> => {
        try {
            const response = await api.get("/admin/brinde/GetListEntregas", {
                params: status ? { status } : {}
            });
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, [], error || "Erro ao buscar entregas");
            }
            return makeResult(true, data || [], error);
        } catch (err: any) {
            return makeResult(false, [], err.response?.data);
        }
    },
    GetBrindesByOrder: async (IdOrder: number): Promise<Result<BrindePedido | null>> => {
        try {
            const response = await api.get("/admin/brinde/GetBrindesByOrder/" + IdOrder);
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, null, error || "Erro ao buscar brindes do pedido");
            }
            return makeResult(true, data || null, error);
        } catch (err: any) {
            return makeResult(false, null, err.response?.data);
        }
    },
};
