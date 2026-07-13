import { api } from "../config/api";
import { TokenResponse } from "../models/TokenResponse";
import { makeResult, Result } from "../utils/Result";

export const AuthService = {
    loginUser: async (
        email: string,
        password: string
    ): Promise<Result<TokenResponse>> => {
        try {
            const { data } = await api.post<Result<TokenResponse>>(
                "/v1/auth/login", { email, password }
            );
            console.log("jonass", data);
            if (!data.success) {
                return makeResult(false, {} as TokenResponse, data.error);
            }

            // Salva os tokens
            localStorage.setItem(
                "@app:tokens",
                JSON.stringify({
                    accessToken: data.data?.accessToken,
                    refreshToken: data.data?.refreshToken,
                })
            );

            return makeResult(data.success, data.data, data.error);
        } catch {
            return makeResult(
                false,
                {} as TokenResponse,
                "Credenciais inválidas"
            );
        }
    },
};