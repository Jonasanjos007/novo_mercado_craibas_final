import { api } from "../config/api";
import { User } from "../models/User";
import { makeResult, Result } from "../utils/Result";

export const UserService = {
    updateProfile: async (profile: FormData): Promise<Result<boolean>> => {
        try {
            const response = await api.post("/v1/users/profile/PostUpdatePerfil", profile, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            const { success, data, error } = response.data;
            return makeResult(success, data, error);
        } catch (err: any) {
            return makeResult(false, false, err.response?.data || 'Falha ao atualizar o perfil.');
        }
    },
    getUser: async (Role: string): Promise<Result<User>> => {
        try {
            const response = await api.get("/v1/users/me/" + Role);
            const { success, data, error } = response.data;

            if (!data) {
                return makeResult(false, {} as User, error);
            }
            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, {} as User, err.response?.data);
        }
    },
    saveColorGlobalService: async (NameColor: string, userId: number): Promise<Result<boolean>> => {
        try {

            const response = await api.post("/v1/users/SaveColorGlobalInsert", { global_Site_Color: NameColor, id: userId });
            const { success, data, error } = response.data;

            if (!success) {
                return makeResult(false, false, error);
            }
            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    }
}
