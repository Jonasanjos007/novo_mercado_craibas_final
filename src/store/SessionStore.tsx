import { create } from "zustand";

interface SessionState {
    accessToken: string | null;
    open: () => void;
    close: () => void;
    setAccessToken: (token: string | null) => void;
    expired: boolean;
}

export const useSessionStore = create<SessionState>((set) => ({
    accessToken: null,
    expired: false,

    setAccessToken: (token) =>
        set({
            accessToken: token
        }),
        open: () =>
        set({
            expired: true,
        }),

    close: () =>
        set({
            expired: false,
        }),
}));