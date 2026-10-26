import axios, {
    AxiosError,
    InternalAxiosRequestConfig
} from "axios";

import { useSessionStore } from "../store/SessionStore";
import { UseUserStore } from "../store/UseUserStore";

import {
    clearBrowserUserData,
    getStoredAccessToken,
    hasStoredSession,
    setStoredAccessToken,
    setStoredSession,
} from "./authStorage";

// Endereço da API. Em produção defina VITE_API_URL (ex.: https://api.seusite.com.br/api) no .env;
// sem ele continua usando o endereço da rede local.
const baseURL = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_API_URL || "http://192.168.15.11:5022/api";

export const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Axios separado exclusivamente para refresh.
 *
 * Isso evita que o interceptor principal
 * intercepte a própria requisição de refresh.
 */
const refreshApi = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

/**
 * Promise do refresh em andamento (voo único).
 *
 * Se várias partes da aplicação pedirem refresh ao mesmo tempo
 * (StrictMode executando o init duas vezes, init + interceptor,
 * várias requisições com 401), todas recebem a MESMA promise.
 *
 * Isso é obrigatório porque o backend rotaciona o Refresh Token:
 * uma segunda chamada com o cookie antigo seria recusada
 * (Auth.InvalidRefreshToken) e derrubaria a sessão.
 */
let refreshPromise: Promise<string> | null = null;

/**
 * Faz logout local.
 *
 * O backend já determinou que a sessão não é mais válida.
 */
const logout = () => {
    delete api.defaults.headers.common.Authorization;
    useSessionStore.getState().setAccessToken(null);
    UseUserStore.getState().logout();
    clearBrowserUserData();
    localStorage.removeItem('pending_registration');

};

/**
 * Extrai o código do erro retornado pelo backend.
 *
 * Esperado:
 *
 * {
 *   success: false,
 *   error: {
 *      code: "Auth.UserDeleted",
 *      message: "Usuário excluído"
 *   }
 * }
 */
const getAuthErrorCode = (
    error: unknown
): string | null => {

    const axiosError = error as AxiosError<any>;

    return (
        axiosError.response?.data?.error?.code ??
        null
    );
};

/**
 * Converte o código retornado pelo backend
 * para o tipo de modal que o frontend conhece.
 */
export const getSessionModalType = (error: unknown) => {
    const code = getAuthErrorCode(error);
    switch (code) {

        case "Auth.UserDeleted":
            return "USER_DELETED";

        case "Auth.UserInactive":
            return "USER_INACTIVE";

        case "Auth.SessionInvalidated":
            return "SESSION_INVALIDATED";

        case "Auth.PasswordChanged":
            return "PASSWORD_CHANGED";

        case "Auth.TokenExpired":
            return "TOKEN_EXPIRED";

        case "Auth.InvalidRefreshToken":
            return "TOKEN_EXPIRED";

        default:
            return "TOKEN_EXPIRED";
    }
};

/**
 * Indica se o erro significa que o BACKEND recusou a sessão.
 *
 * - Sem resposta (servidor fora do ar, timeout, rede) → false
 * - Erro 5xx do servidor → false
 * - Qualquer outra resposta (401, 403, Auth.*, falha de negócio) → true
 *
 * Só quando for true a sessão local deve ser encerrada.
 */
export const isSessionRejected = (error: unknown): boolean => {
    const response = (error as AxiosError)?.response;

    if (!response) {
        return false;
    }

    if (response.status >= 500) {
        return false;
    }

    return true;
};

/**
 * Abre o modal correto e encerra a sessão local.
 */
const handleSessionInvalid = (error: unknown) => {
    const modalType = getSessionModalType(error);

    // O próprio usuário acabou de trocar a senha: o aviso dele
    // ("Senha alterada com sucesso") já está aberto, não substituir.
    if (useSessionStore.getState().modalType === "PASSWORD_CHANGED_SELF") {
        logout();
        setStoredSession(false);
        return;
    }

    logout();
    setStoredSession(false);
    useSessionStore.getState().open(modalType);
};

/**
 * Atualiza o Access Token (voo único).
 *
 * Nunca dispara duas chamadas de /refresh em paralelo:
 * se já existe uma em andamento, devolve a mesma promise.
 */
export const refreshAccessToken = (): Promise<string> => {

    if (!refreshPromise) {
        refreshPromise = executeRefresh().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
};

/**
 * Executa de fato a chamada de refresh.
 * Use sempre refreshAccessToken() — nunca chame esta diretamente.
 */
const executeRefresh = async (): Promise<string> => {
    const response = await refreshApi.post(
        "/v1/auth/refresh",
        {}
    );

    const result = response.data;

    // Trata falha de negócio mesmo se o backend retornar HTTP 200.
    if (
        result?.success === false ||
        result?.isSuccess === false
    ) {
        const error = new Error(
            result?.error?.message ?? "Não foi possível renovar a sessão."
        ) as Error & {
            response?: {
                status: number;
                data: unknown;
            };
        };

        error.response = {
            status: response.status,
            data: result,
        };

        throw error;
    }

    const accessToken = result?.data?.accessToken;

    if (!accessToken) {
        throw new Error("Access Token não retornado pelo servidor.");
    }

    setStoredAccessToken(accessToken);

    useSessionStore
        .getState()
        .setAccessToken(accessToken);

    api.defaults.headers.common.Authorization =
        `Bearer ${accessToken}`;

    return accessToken;
};

/**
 * REQUEST INTERCEPTOR
 */
api.interceptors.request.use(
    (config) => {

        const accessToken =
            getStoredAccessToken();

        if (!accessToken) {

            delete config.headers.Authorization;

            return config;
        }

        config.headers.Authorization =
            `Bearer ${accessToken}`;

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

/**
 * RESPONSE INTERCEPTOR
 */
api.interceptors.response.use(

    (response) => response,

    async (error: AxiosError) => {

        const originalRequest =
            error.config as CustomAxiosRequestConfig;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const status =
            error.response?.status;

        /**
         * ------------------------------------------------
         * 1. NÃO É 401
         * ------------------------------------------------
         *
         * Não tem relação com sessão (400, 404, 409, 422, 500...).
         */
        if (status !== 401) {
            return Promise.reject(error);
        }

        /**
         * ------------------------------------------------
         * 2. NÃO EXISTE SESSÃO
         * ------------------------------------------------
         *
         * Sem Access Token em memória E sem sessão registrada
         * (ex: visitante, login com senha errada).
         *
         * Se houver sessão registrada (ex: página recarregada),
         * seguimos para o refresh mesmo sem token em memória.
         */
        if (!getStoredAccessToken() && !hasStoredSession()) {
            return Promise.reject(error);
        }

        /**
         * ------------------------------------------------
         * 3. ERRO NO PRÓPRIO REFRESH
         * ------------------------------------------------
         *
         * O refreshApi não passa por aqui, mas por segurança
         * nunca tentamos refresh de um refresh.
         */
        const isRefreshRequest =
            originalRequest.url?.includes(
                "/v1/auth/refresh"
            );

        if (isRefreshRequest) {
            return Promise.reject(error);
        }

        /**
         * ------------------------------------------------
         * 4. REQUISIÇÃO JÁ TENTOU REFRESH
         * ------------------------------------------------
         *
         * Evita loop infinito.
         */
        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        /**
         * ------------------------------------------------
         * 4.1 SESSÃO DERRUBADA PELO SERVIDOR
         * ------------------------------------------------
         *
         * Usuário excluído, inativo, senha alterada ou dispositivo
         * removido (Perfil > Dispositivos conectados).
         *
         * Não adianta tentar refresh: encerra e mostra o motivo certo.
         */
        const authErrorCode = getAuthErrorCode(error);

        if (
            authErrorCode === "Auth.UserDeleted" ||
            authErrorCode === "Auth.UserInactive" ||
            authErrorCode === "Auth.SessionInvalidated" ||
            authErrorCode === "Auth.PasswordChanged"
        ) {
            handleSessionInvalid(error);
            return Promise.reject(error);
        }

        /**
         * ------------------------------------------------
         * 5. REFRESH (voo único) E NOVA TENTATIVA
         * ------------------------------------------------
         *
         * Se várias requisições derem 401 juntas, todas
         * aguardam o mesmo refresh.
         */
        try {

            const newAccessToken =
                await refreshAccessToken();

            originalRequest
                .headers
                .Authorization =
                `Bearer ${newAccessToken}`;

            return api(originalRequest);

        } catch (refreshError) {

            console.log("========== REFRESH FALHOU ==========");
            console.log("STATUS:", (refreshError as AxiosError).response?.status);
            console.log("DATA:", (refreshError as AxiosError).response?.data);
            console.log("CODE:", (refreshError as AxiosError<any>).response?.data?.error?.code);
            console.log("=====================================");

            /**
             * Só encerra a sessão se o backend recusou.
             * Erro de rede / servidor fora do ar mantém a sessão.
             */
            if (isSessionRejected(refreshError)) {
                handleSessionInvalid(refreshError);
            }

            return Promise.reject(refreshError);
        }
    }
);
