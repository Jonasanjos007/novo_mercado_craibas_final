import { api } from "../config/api";
import { Banner } from "../models/Banner";
import { makeResult, Result } from "../utils/Result";

export const BannerService = {
    GetBannersAtivos: async (): Promise<Result<Banner[]>> => {
        try {
            const response = await api.get("/v1/banner/GetBannersAtivos");
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, [], error || "Erro ao buscar banners");
            }
            return makeResult(true, data || [], error);
        } catch (err: any) {
            return makeResult(false, [], err.response?.data);
        }
    },
};
