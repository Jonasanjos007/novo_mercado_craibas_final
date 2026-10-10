import { create } from "zustand";
import { DeviceSession } from "../models/DeviceSession";
import { DeviceSessionService } from "../service/DeviceSessionService";
import { makeResult, Result } from "../utils/Result";

interface DeviceSessionState {
    sessions: DeviceSession[];
    LoadSessions: () => Promise<Result<boolean>>;
    RevokeSession: (sessionId: number, password?: string) => Promise<Result<boolean>>;
    RevokeOtherSessions: (password?: string) => Promise<Result<number>>;
    clearSessions: () => void;
}

export const UseDeviceSessionStore = create<DeviceSessionState>((set, get) => ({
    sessions: [],

    LoadSessions: async (): Promise<Result<boolean>> => {
        const result = await DeviceSessionService.GetSessions();

        if (result.success) {
            set({ sessions: result.data || [] });
            return makeResult(true, true);
        }

        return makeResult(false, false, result.error);
    },

    RevokeSession: async (sessionId: number, password?: string): Promise<Result<boolean>> => {
        const result = await DeviceSessionService.RevokeSession(sessionId, password);

        if (!result.success) {
            return makeResult(false, false, result.error);
        }

        // Remove da lista sem esperar a recarga
        set({ sessions: get().sessions.filter((s) => s.id !== sessionId) });

        await get().LoadSessions();
        return makeResult(true, true);
    },

    RevokeOtherSessions: async (password?: string): Promise<Result<number>> => {
        const result = await DeviceSessionService.RevokeOtherSessions(password);

        if (!result.success) {
            return makeResult(false, 0, result.error);
        }

        set({ sessions: get().sessions.filter((s) => s.isCurrent) });

        await get().LoadSessions();
        return makeResult(true, result.data ?? 0);
    },

    clearSessions: () => set({ sessions: [] }),
}));
