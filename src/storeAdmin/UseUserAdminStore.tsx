import { create } from "zustand";
import { makeResult, Result } from "../utils/Result";
import { Product, ProductAdmin } from "../models/Product";
import { ProductsService } from "../service/ProductsService";
import { ProductServiceAdmin } from "../adminService/ProductServiceAdmin";
import { UserServiceAdmin } from "../adminService/UserServiceAdmin";
import { UseUserStore } from "../store/UseUserStore";
import { UserService } from "../service/UserService";
import { BaseSiteInterface, UserAdminAll } from "../models/User";
import { TaxasBases } from "../models/SiteBases";
import { Address } from "../models/Address";
import { GeneralOrderInformation } from "../models/Order";




interface UsertState {
    PostEditeUserAdmin: (formData: FormData) => Promise<Result<boolean>>;
    PostEditeTemaAdmin: () => Promise<Result<boolean>>;
    getBaseSiteAdmin: () => Promise<Result<BaseSiteInterface>>;
    PostUpdateInfoSiteStore: (infoSite: FormData) => Promise<Result<boolean>>;
    PostUpdateTaxasBasesStore: (Taxas: TaxasBases) => Promise<Result<boolean>>;
    PostUpdateDesactiv: (IdUser: number, role: string) => Promise<Result<string>>;
    GetUserAnddresAll: (IdUser: number) => Promise<Result<Address[]>>;
    GetUserInfoOrdersAll: (IdUser: number) => Promise<Result<GeneralOrderInformation>>;
    DeleteUserSelected: (IdUser: number, role: string, reason: string) => Promise<Result<boolean>>;
    getUser: () => Promise<Result<boolean>>;
    BaseSiteInterface: BaseSiteInterface;
    UserAllAdmin: UserAdminAll[];
}
export const UseUserAdminStore = create<UsertState>((set, get) => ({
    BaseSiteInterface: {},
    UserAllAdmin: [],

    PostEditeUserAdmin: async (formData: FormData): Promise<Result<boolean>> => {
        const result = await UserServiceAdmin.PostUpdateUserAdmin(formData);

        if (result.success) {
            const getUser = await UserService.getUser("ADMIN");

            if (getUser.success && getUser.data) {
                UseUserStore.getState().setUser(getUser.data);
            }

            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    PostEditeTemaAdmin: async (): Promise<Result<boolean>> => {
        const temaAtual = UseUserStore.getState().user?.customize?.tema ?? false;
        const novoTema = !temaAtual;
        const result = await UserServiceAdmin.PostUpdateTemaAdmin(novoTema);

        if (result.success) {
            const getUser = await UserService.getUser("ADMIN");

            if (getUser.success && getUser.data) {
                UseUserStore.getState().setUser(getUser.data);
            }

            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    PostUpdateInfoSiteStore: async (infoSite: FormData): Promise<Result<boolean>> => {
        const result = await UserServiceAdmin.PostUpdateInfoSite(infoSite);

        if (result.success) {
            get().getBaseSiteAdmin();
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    PostUpdateTaxasBasesStore: async (Taxas: TaxasBases): Promise<Result<boolean>> => {
        const result = await UserServiceAdmin.PostUpdateTaxasBases(Taxas);

        if (result.success) {
            get().getBaseSiteAdmin();
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    getBaseSiteAdmin: async (): Promise<Result<BaseSiteInterface>> => {
        const result = await UserServiceAdmin.getBaseSiteAdmin();

        if (result.success) {
            set({ BaseSiteInterface: result.data });
            return makeResult(true, {} as BaseSiteInterface);
        }
        return makeResult(false, {} as BaseSiteInterface, result.error);
    },
    getUser: async (): Promise<Result<boolean>> => {
        const result = await UserServiceAdmin.getUserTipo();

        if (result.success) {
            set({ UserAllAdmin: result.data });
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    PostUpdateDesactiv: async (IdUser: number, role: string): Promise<Result<string>> => {
        const result = await UserServiceAdmin.postDasativUser(IdUser, role);

        if (result.success) {
            get().getUser();
            return makeResult(true, result.data);
        }
        return makeResult(false, '', result.error);
    },
    GetUserAnddresAll: async (IdUser: number): Promise<Result<Address[]>> => {
        const result = await UserServiceAdmin.GetAnddressUserAll(IdUser);
        // console.log('resultresult', result)
        if (result.success) {
            get().getUser();
            return makeResult(true, result.data);
        }
        return makeResult(false, [], result.error);
    },
    GetUserInfoOrdersAll: async (IdUser: number): Promise<Result<GeneralOrderInformation>> => {
        const result = await UserServiceAdmin.GetInforGeneralUserAll(IdUser);
        if (result.success) {
            get().getUser();
            return makeResult(true, result.data);
        }
        return makeResult(false, {}, result.error);
    },
    DeleteUserSelected: async (IdUser: number, role: string, reason: string): Promise<Result<boolean>> => {
        const result = await UserServiceAdmin.DeleteUserSelected(IdUser, role, reason);
        if (result.success) {
            get().getUser();
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },

}));
