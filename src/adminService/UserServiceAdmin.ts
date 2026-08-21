import { api } from "../config/api";
import { makeResult, Result } from "../utils/Result";

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
};
