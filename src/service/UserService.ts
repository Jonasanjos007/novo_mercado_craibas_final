import { api } from "../config/api";
import { User, RegisterStart, RegisterStartResponse, RegisterEmail, SavePasswordResponse, RegisterResponse } from "../models/User";
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
    },
    RegisterStartAsync: async (RegisterStart: RegisterStart): Promise<Result<RegisterStartResponse>> => {
        try {
            const response = await api.post("/v1/users/SaveUSerInitialData", RegisterStart);
            const { success, data, error } = response.data;

            if (!success) {
                return makeResult(false, {} as RegisterStartResponse, error);
            }
            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, {} as RegisterStartResponse, err.response?.data);
        }
    },
    RegisterEmailConfirm: async (RegisterEmail: RegisterEmail, IdUser: number): Promise<Result<RegisterResponse>> => {
        try {
            const response = await api.post("/v1/users/SaveEmailConfirm", { ...RegisterEmail, userId: IdUser });
            const { success, data, error } = response.data;

            if (!success) {
                return makeResult(false, {} as RegisterResponse, error);
            }
            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, {} as RegisterResponse, err.response?.data);
        }
    },
    RegisterEmailConfirmCode: async (IdUser: number, ConfirmCode: string): Promise<Result<RegisterResponse>> => {
        try {
            const response = await api.post("/v1/users/SaveEmailConfirmCode", { userId: IdUser, code: ConfirmCode });

            const { success, data, error } = response.data;

            if (!success) {
                return makeResult(false, {} as RegisterResponse, error);
            }

            return makeResult(
                true,
                data,
                error
            );

        } catch (err: any) {
            console.log('Axios error:', err);
            console.log('Response:', err.response);
            console.log('Response data:', err.response?.data);

            return makeResult(
                false,
                {} as RegisterResponse,
                err.response?.data ?? {
                    success: false,
                    error: {
                        code: 'HTTP_ERROR',
                        message: 'Erro ao comunicar com o servidor'
                    }
                }
            );
        }
    },
    SaveRegisterPassword: async (userId: number, password: string, confirmPassword: string): Promise<Result<SavePasswordResponse>> => {
        try {
            const response = await api.post(
                "/v1/users/SaveRegisterPassword",
                {
                    userId: userId,
                    password: password,
                    confirmPassword: confirmPassword
                }
            );

            const { success, data, error } = response.data;

            if (!success) {
                return makeResult(false, {} as SavePasswordResponse, error);
            }

            return makeResult(
                true,
                data,
                error
            );

        } catch (err: any) {
            console.log('Axios error:', err);
            console.log('Response:', err.response);
            console.log('Response data:', err.response?.data);

            return makeResult(false, {} as SavePasswordResponse, err.response?.data ?? { success: false, error: { code: 'HTTP_ERROR', message: 'Erro ao comunicar com o servidor' } });
        }
    },
    ResendCodigo: async (userId: number, Email: string, Phone: string): Promise<Result<RegisterResponse>> => {
        try {
            const response = await api.post(
                "/v1/users/ResendCode",
                {
                    UserId: userId,
                    Email: Email,
                    Phone: Phone
                }
            );

            const { success, data, error } = response.data;

            if (!success) {
                return makeResult(false, {} as RegisterResponse, error);
            }
            console.log('ResendCodigo response data:', data);
            return makeResult(true, data);

        } catch (err: any) {
            console.log('Axios error:', err);
            console.log('Response:', err.response);
            console.log('Response data:', err.response?.data);

            return makeResult(false, {} as RegisterResponse, err.response?.data ?? { success: false, error: { code: 'HTTP_ERROR', message: 'Erro ao comunicar com o servidor' } });
        }
    },

    EditEmailEndEtap: async (userId: number, Email: string): Promise<Result<RegisterResponse>> => {
        try {
            const response = await api.post("/v1/users/EditEmailEndEtap", { UserId: userId, Email: Email, });

            const { success, data, error } = response.data;

            if (!success) {
                return makeResult(false, {} as RegisterResponse, error);
            }
            console.log('ResendCodigo response data:', data);
            return makeResult(true, data);

        } catch (err: any) {
            console.log('Axios error:', err);
            console.log('Response:', err.response);
            console.log('Response data:', err.response?.data);

            return makeResult(false, {} as RegisterResponse, err.response?.data ?? { success: false, error: { code: 'HTTP_ERROR', message: 'Erro ao comunicar com o servidor' } });
        }
    },
}
