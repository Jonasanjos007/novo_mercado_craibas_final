import { api } from "../config/api";
import { User } from "../models/User";
import { makeResult, Result } from "../utils/Result";

export const UserService = {
    getUser: async (Role: string): Promise<Result<User>> => {
        try {
            const response = await api.get("/users/me/" + Role);
            const { success, data, error } = response.data;

            if (!data) {
                return makeResult(false, {} as User, "Usuário não encontrado");
            }
            return makeResult(success, data, error);
        } catch (error) {
            return makeResult(false, {} as User, "Falha na comunicação");
        }
    },
}