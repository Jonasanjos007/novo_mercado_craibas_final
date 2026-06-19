import { api } from "../config/api";
import { TokenResponse } from "../models/TokenResponse";
import { makeResult, Result } from "../utils/Result";

export const AuthService = {
    loginUser: async (email: string, password: string): Promise<Result<TokenResponse>> => {
        try {
            const { data } = await api.post<Result<TokenResponse>>("/auth/login", { email, password });

            if (!data.data) {
                return makeResult(false, {} as TokenResponse, "Resposta inválida do servidor");
            }

            return makeResult(data.success, data.data, data.error);
        } catch (err) {
            return makeResult(false, {} as TokenResponse, "Falha na comunicação");
        }
    },
}