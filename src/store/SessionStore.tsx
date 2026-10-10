import { create } from "zustand";

export type SessionModalType =
    | "TOKEN_EXPIRED"
    | "SESSION_INVALIDATED"
    | "USER_INACTIVE"
    | "USER_DELETED"
    | "PASSWORD_CHANGED"       // senha alterada em OUTRO dispositivo
    | "PASSWORD_CHANGED_SELF"  // o próprio usuário acabou de alterar a senha
    | null;

interface SessionState {
    accessToken: string | null;

    expired: boolean;

    modalType: SessionModalType;

    open: (type: SessionModalType) => void;
    close: () => void;

    setAccessToken: (token: string | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    accessToken: null,

    expired: false,

    modalType: null,

    setAccessToken: (token) =>
        set({
            accessToken: token,
        }),

    open: (type) =>
        set({
            expired: true,
            modalType: type,
        }),

    close: () =>
        set({
            expired: false,
            modalType: null,
        }),
}));