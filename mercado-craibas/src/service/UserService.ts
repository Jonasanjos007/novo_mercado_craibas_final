import { api } from "../config/api";
import { User } from "../models/User";
import { makeResult, Result } from "../utils/Result";

export const UserService = {
    getUser: async (Role: string): Promise<Result<User>> => {
        try {
            const response = await api.get("/v1/users/me/" + Role);
            const { success, data, error } = response.data;

            if (!data) {
                return makeResult(false, {} as User, "Usuário não encontrado");
            }
            return makeResult(success, data, error);
        } catch (error) {
            return makeResult(false, {} as User, "Falha na comunicação");
        }
    },
    saveColorGlobalService: async (NameColor: string, userId: number): Promise<Result<boolean>> => {
        try {
            if (userId === 0) {
                return makeResult(false, false, "ID de usuário inválido");
            }
            const response = await api.post("/v1/users/SaveColorGlobalInsert", { global_Site_Color: NameColor, id: userId });
            const { success, data, error } = response.data;

            if (!success) {
                return makeResult(false, false, "Erro ao Salvar Cor Em api!");
            }
            return makeResult(success, data, error);
        } catch (error) {
            return makeResult(false, false, "Falha na comunicação");
        }
    }
}