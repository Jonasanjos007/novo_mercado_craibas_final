import { api } from "../config/api";
import { TokenResponse } from "../models/TokenResponse";
import { ChangePassword } from "../models/User";

import { makeResult, Result } from "../utils/Result";

export const AuthService = {
    loginUser: async (email: string, password: string): Promise<Result<TokenResponse>> => {
        try {
            const { data } = await api.post<Result<TokenResponse>>(
                "/v1/auth/login", { email, password }
            );
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
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(
                false, {} as TokenResponse, err.response?.data
            );
        }
    },
    PostChangePassword: async (ChangePassword: ChangePassword): Promise<Result<boolean>> => {
        try {

            const response = await api.post("/v1/auth/ChangePassword", ChangePassword);
            const { success, data, error } = response.data;
            if (!data) {
                return makeResult(false, false, error);
            }

            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    },
};