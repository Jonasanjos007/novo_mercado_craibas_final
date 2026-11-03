import { api } from "../config/api";
import { Banner } from "../models/Banner";
import { makeResult, Result } from "../utils/Result";

export const BannerServiceAdmin = {
    PostSaveBanner: async (formData: FormData): Promise<Result<boolean>> => {
        try {
            await api.post("/admin/banner/PostSaveBanner", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return makeResult(true, true);
        } catch (err: any) {
            return makeResult(false, false, err.response?.data);
        }
    },
    GetListAllBanners: async (): Promise<Result<Banner[]>> => {
        try {
            const response = await api.get("/admin/banner/GetListAllBanners");
            const { success, data, error } = response.data;
            if (!success) {
                return makeResult(false, [], error || "Erro ao buscar banners");
            }
            return makeResult(true, data || [], error);
        } catch (err: any) {
            return makeResult(false, [], err.response?.data);
        }
    },
    PostUpdateBanner: async (formData: FormData): Promise<Result<boolean>> => {
        try {
            await api.post("/admin/banner/PostUpdateBanner", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return makeResult(true, true);
        } catch (err: any) {
            return makeResult(false, false, err.response?.data);
        }
    },
    DeleteBanner: async (IdBanner: number, reason: string): Promise<Result<boolean>> => {
        try {
            await api.delete("/admin/banner/DeleteBanner/" + IdBanner, {
                params: { reason }
            });
            return makeResult(true, true);
        } catch (err: any) {
            return makeResult(false, false, err.response?.data);
        }
    },
    PostUpdateActive: async (IdBanner: number): Promise<Result<boolean>> => {
        try {
            await api.post("/admin/banner/PostUpdateActive", IdBanner);
            return makeResult(true, true);
        } catch (err: any) {
            return makeResult(false, false, err.response?.data);
        }
    },
};
