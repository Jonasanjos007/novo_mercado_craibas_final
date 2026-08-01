import { create } from "zustand";

interface SessionState {
    expired: boolean;
    open: () => void;
    close: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    expired: false,

    open: () =>
        set({
            expired: true,
        }),

    close: () =>
        set({
            expired: false,
        }),
}));