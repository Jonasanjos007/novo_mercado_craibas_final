import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useSessionStore } from "../store/SessionStore";
import { UseUserStore } from "../store/UseUserStore";
import {
    clearBrowserUserData,
    getStoredAccessToken,
    setStoredAccessToken,
} from "./authStorage";

const baseURL = "http://192.168.0.100:5022/api";

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
 * Isso evita que o interceptor principal interfira
 * na própria requisição de refresh.
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

interface QueueItem {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (
    error: unknown,
    token: string | null = null
) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

const logout = () => {
    delete api.defaults.headers.common.Authorization;
    useSessionStore.getState().setAccessToken(null);

    UseUserStore.getState().logout();
    clearBrowserUserData();

    useSessionStore.getState().open();
};

export const refreshAccessToken = async (): Promise<string> => {
    const response = await refreshApi.post(
        "/v1/auth/refresh",
        {}
    );

    const accessToken = response.data?.data?.accessToken;

    if (!accessToken) {
        throw new Error("Access token não retornado.");
    }

    setStoredAccessToken(accessToken);
    useSessionStore.getState().setAccessToken(accessToken);

    api.defaults.headers.common.Authorization =
        `Bearer ${accessToken}`;

    return accessToken;
};

/**
 * REQUEST
 */
api.interceptors.request.use(
    (config) => {
        const accessToken = getStoredAccessToken();

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
 * RESPONSE
 */
api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {

        const originalRequest =
            error.config as CustomAxiosRequestConfig;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const isRefreshRequest =
            originalRequest.url?.includes("/v1/auth/refresh");

        /**
         * Só tenta refresh quando realmente for 401
         */
        if (
            error.response?.status !== 401 ||
            originalRequest._retry ||
            isRefreshRequest
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        /**
         * Se já existe um refresh acontecendo,
         * espera ele terminar.
         */
        if (isRefreshing) {

            return new Promise<string>((resolve, reject) => {

                failedQueue.push({
                    resolve,
                    reject,
                });

            }).then((newAccessToken) => {

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return api(originalRequest);
            });
        }

        isRefreshing = true;

        try {

            const newAccessToken = await refreshAccessToken();

            /**
             * Libera todas as requisições
             * que estavam esperando.
             */
            processQueue(
                null,
                newAccessToken
            );

            /**
             * Atualiza requisição que causou
             * originalmente o 401.
             */
            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            /**
             * Refaz a requisição.
             */
            return api(originalRequest);

        } catch (refreshError) {

            console.error(
                "Erro ao atualizar token:",
                refreshError
            );

            processQueue(
                refreshError,
                null
            );

            logout();

            return Promise.reject(refreshError);

        } finally {

            isRefreshing = false;

        }
    }
);
