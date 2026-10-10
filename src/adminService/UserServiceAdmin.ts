import { api } from "../config/api";
import { BaseSiteInterface, UserAdminAll } from "../models/User";
import { TaxasBases } from "../models/SiteBases";

import { makeResult, Result } from "../utils/Result";
import { Address } from "../models/Address";
import { GeneralOrderInformation } from "../models/Order";

export const UserServiceAdmin = {
    PostUpdateUserAdmin: async (formData: FormData): Promise<Result<boolean>> => {
        try {
            const response = await api.post("/admin/User/UpdateUserAdmin", formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            const { success, error } = response.data;
            return success
                ? makeResult(true, true)
                : makeResult(false, false, error || "Erro ao atualizar perfil");
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    },
    PostUpdateTemaAdmin: async (tema: boolean): Promise<Result<boolean>> => {
        try {
            const response = await api.post("/admin/User/UpdateTemaAdmin", tema);

            const { success, error } = response.data;
            return success
                ? makeResult(true, true)
                : makeResult(false, false, error || "Erro ao atualizar perfil");
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    },
    PostUpdateInfoSite: async (infoSite: FormData): Promise<Result<boolean>> => {
        try {

            for (const [key, value] of infoSite.entries()) {
                console.log('PostUpdateInfoSite', key, value);
            }
            const response = await api.post("/admin/User/UpdateInfor", infoSite,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            const { success, error } = response.data;
            return success ? makeResult(true, true) : makeResult(false, false, error || "Erro ao atualizar perfil");

        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    },
    PostUpdateTaxasBases: async (TaxasBases: TaxasBases): Promise<Result<boolean>> => {
        try {
            const response = await api.post("/admin/User/UpdaTaxasBasesAdmin", TaxasBases);

            const { success, error } = response.data;
            return success
                ? makeResult(true, true)
                : makeResult(false, false, error || "Erro ao atualizar perfil");
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    },
    getBaseSiteAdmin: async (): Promise<Result<BaseSiteInterface>> => {
        try {
            const response = await api.get("/v1/users/GetBaseSite");
            const { success, data, error } = response.data;
            if (!data) {
                return makeResult(false, {} as BaseSiteInterface, error);
            }

            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, {} as BaseSiteInterface, err.response?.data);
        }
    },
    getUserTipo: async (): Promise<Result<UserAdminAll[]>> => {
        try {
            const response = await api.get(`/admin/User/GetUsersAll`);
            const { success, data, error } = response.data;

            if (!data) {
                return makeResult(false, [], error);
            }

            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, [], err.response?.data);
        }
    },
    postDasativUser: async (IdUser: number, role: string): Promise<Result<string>> => {
        try {
            const response = await api.post(`/admin/User/PostDesactivUser?UserIdCostumer=${IdUser}&role=${role}`);
            const { success, data, error } = response.data;

            if (!data) {
                return makeResult(false, '', error);
            }

            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, '', err.response?.data);
        }
    },
    GetAnddressUserAll: async (IdUser: number): Promise<Result<Address[]>> => {
        try {
            const response = await api.get(`/admin/User/GetAddress/${IdUser}`);
            const { success, data, error } = response.data;

            if (!data) {
                return makeResult(false, data, error);
            }

            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, [], err.response?.data);
        }
    },
    GetInforGeneralUserAll: async (IdUser: number): Promise<Result<GeneralOrderInformation>> => {
        try {
            const response = await api.get(`/admin/User/GeneralOrderInformation/${IdUser}`);
            const { success, data, error } = response.data;

            if (!data) {
                return makeResult(false, data, error);
            }

            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, {}, err.response?.data);
        }
    },
    DeleteUserSelected: async (IdUser: number, role: string, reason: string): Promise<Result<Boolean>> => {
        try {
            const response = await api.delete(`/admin/User/DeleteUserSelected`, {
                params: { UserIdCostumer: IdUser, role, reason }
            });
            const { success, data, error } = response.data;

            if (!data) {
                return makeResult(false, false, error);
            }

            return makeResult(success, true, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    },
};
