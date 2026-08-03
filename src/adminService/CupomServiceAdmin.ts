import { api } from "../config/api";
import { CartItensProduct } from "../models/CartItensProduct";
import { Cupom, CupomAdmin, UpdateCouponRequest } from "../models/Cupom";
import { Logs } from "../models/Logs";
import { OrderSave, Order } from "../models/OrderSave";
import { Category, Product } from "../models/Product";
import { makeResult, Result } from "../utils/Result";

export const CupomServiceAdmin = {
    PostSaveCupom: async (Cupom: CupomAdmin): Promise<Result<boolean>> => {
        try {
            await api.post("/admin/cupom/PostSaveCupom", Cupom);
            return makeResult(true, true);
        } catch (err: any) {
            console.log(err);
            console.log(err.response);
            console.log(err.response?.data);

            return makeResult(false, false, err.response?.data);
        }
    },
    GetCuponsAllListAdmin: async (): Promise<Result<CupomAdmin[]>> => {
        try {
            const response = await api.get("/admin/cupom/GetListCupons");
            console.log("responsecupom", response)
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, [], error || "Erro ao buscar pedidos");
            }

            return makeResult(true, data || [], error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, [], err.response?.data);
        }
    },
    PostUpdateCupom: async (Cupom: UpdateCouponRequest): Promise<Result<boolean>> => {
        try {
            await api.post("/admin/cupom/PostUpdateCupom", Cupom);
            return makeResult(true, true);
        } catch (err: any) {
            console.log(err);
            console.log(err.response);
            console.log(err.response?.data);

            return makeResult(false, false, err.response?.data);
        }
    },
    DeleteCupom: async (IdCupom: number): Promise<Result<boolean>> => {
        try {
            await api.delete("/admin/cupom/DeleteCupom/" + IdCupom);
            return makeResult(true, true);
        } catch (err: any) {
            console.log(err);
            console.log(err.response);
            console.log(err.response?.data);

            return makeResult(false, false, err.response?.data);
        }
    },
    PostActiveCupom: async (IdCupom: number): Promise<Result<boolean>> => {
        try {
            await api.post("/admin/cupom/PostUpdateActive", IdCupom);
            return makeResult(true, true);
        } catch (err: any) {
            console.log(err);
            console.log(err.response);
            console.log(err.response?.data);

            return makeResult(false, false, err.response?.data);
        }
    },

};