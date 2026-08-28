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
                "/v1/auth/login",
                {
                    email,
                    password
                },
                {
                    withCredentials: true
                }
            );

            if (!data.success || !data.data?.accessToken) {
                return makeResult(
                    false,
                    {} as TokenResponse,
                    data.error
                );
            }

            return makeResult(
                true,
                data.data,
                data.error
            );

        } catch (err: any) {
            console.error("Erro login:", err);

            return makeResult(
                false,
                {} as TokenResponse,
                err.response?.data
            );
        }
    },
};
