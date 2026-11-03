import { create } from "zustand";
import { makeResult, Result } from "../utils/Result";
import { Banner } from "../models/Banner";
import { BannerServiceAdmin } from "../adminService/BannerServiceAdmin";

interface BannerState {
    banners: Banner[];
    LoadBannersAdmin: () => Promise<Result<Banner[]>>;
    PostSaveBannerStore: (formData: FormData) => Promise<Result<boolean>>;
    PostUpdateBannerStore: (formData: FormData) => Promise<Result<boolean>>;
    DeleteBannerStore: (IdBanner: number, reason: string) => Promise<Result<boolean>>;
    PostUpdateActiveBannerStore: (IdBanner: number) => Promise<Result<boolean>>;
}

export const UseBannerAdminStore = create<BannerState>((set, get) => ({
    banners: [],
    LoadBannersAdmin: async (): Promise<Result<Banner[]>> => {
        const result = await BannerServiceAdmin.GetListAllBanners();
        if (!result.success) {
            set({ banners: [] });
            return makeResult(false, [], result.error);
        }
        set({ banners: result.data || [] });
        return makeResult(true, []);
    },
    PostSaveBannerStore: async (formData: FormData): Promise<Result<boolean>> => {
        const result = await BannerServiceAdmin.PostSaveBanner(formData);
        if (result.success) {
            await get().LoadBannersAdmin();
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    PostUpdateBannerStore: async (formData: FormData): Promise<Result<boolean>> => {
        const result = await BannerServiceAdmin.PostUpdateBanner(formData);
        if (result.success) {
            await get().LoadBannersAdmin();
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    DeleteBannerStore: async (IdBanner: number, reason: string): Promise<Result<boolean>> => {
        const result = await BannerServiceAdmin.DeleteBanner(IdBanner, reason);
        if (result.success) {
            await get().LoadBannersAdmin();
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    PostUpdateActiveBannerStore: async (IdBanner: number): Promise<Result<boolean>> => {
        const result = await BannerServiceAdmin.PostUpdateActive(IdBanner);
        if (result.success) {
            await get().LoadBannersAdmin();
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
}));
