import { api } from "../config/api";
import { DeviceSession } from "../models/DeviceSession";
import { makeResult, Result } from "../utils/Result";

export const DeviceSessionService = {
    GetSessions: async (): Promise<Result<DeviceSession[]>> => {
        try {
            const response = await api.get("/v1/auth/sessions");
            const { success, data, error } = response.data;

            if (!success) {
                return makeResult(false, [] as DeviceSession[], error);
            }
            return makeResult(success, data ?? [], error);
        } catch (err: any) {
            console.log(err.response?.data);
            return makeResult(false, [] as DeviceSession[], err.response?.data);
        }
    },
    RevokeSession: async (sessionId: number, password?: string): Promise<Result<boolean>> => {
        try {
            const response = await api.post(`/v1/auth/sessions/${sessionId}/revoke`, { password: password ?? null });
            const { success, data, error } = response.data;

            if (!success) {
                return makeResult(false, false, error);
            }
            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    },
    RevokeOtherSessions: async (password?: string): Promise<Result<number>> => {
        try {
            const response = await api.post("/v1/auth/sessions/revoke-others", { password: password ?? null });
            const { success, data, error } = response.data;

            if (!success) {
                return makeResult(false, 0, error);
            }
            return makeResult(success, data ?? 0, error);
        } catch (err: any) {
            console.log(err.response?.data);
            return makeResult(false, 0, err.response?.data);
        }
    },
};
