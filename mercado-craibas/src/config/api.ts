import { DashboardFilters } from "@/controllers/useCollectionController";
import { SurveyEntry } from "@/models/SurveyEntry";
import { TokenResponse } from "@/models/TokenResponse";
import { Tokens } from "@/models/Tokens";
import { UsuarioResponse } from "@/models/Usuarioresponse";
import { PagedResult } from "@/utils/PagedResult";
import { makeResult, Result } from "@/utils/Result";
import axios from "axios";

const baseURL = "http://localhost:5022/api/v1";

export const api = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

api.interceptors.request.use((config: any) => {
    const stored = localStorage.getItem("@app:tokens");
    if (stored) {
        const tokens: Tokens = JSON.parse(stored);
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
});

api.interceptors.response.use(
    (response?: any) => response,
    async (error: any) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const stored = localStorage.getItem("@app:tokens");
            if (!stored) return Promise.reject(error);

            const tokens: Tokens = JSON.parse(stored);

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject,
                    });
                });
            }

            isRefreshing = true;

            try {
                const { data } = await api.post("/auth/refresh", {
                    refreshToken: tokens.refreshToken,
                });

                const newTokens: Tokens = {
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                };

                localStorage.setItem("@app:tokens", JSON.stringify(newTokens));

                api.defaults.headers.common.Authorization = `Bearer ${newTokens.accessToken}`;

                processQueue(null, newTokens.accessToken);

                originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                localStorage.removeItem("@app:tokens");
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);

export const ApiService = {
    getDashboardData: async (
        pageNumber: number,
        pageSize: number,
        filters: DashboardFilters
    ): Promise<Result<PagedResult<SurveyEntry>>> => {
        try {
            const payload = {
                periodStatus: filters.PeriodStatus ?? null,
                entryStatus: filters.EntryStatus ?? null,
                vertical: filters.vertical ?? null,
                period: filters.Period ?? null,
                search: filters.Search ?? null,
                pageSize,
                pageNumber
            };

            const { data } = await api.post("/dashboard", payload);

            if (data.success && data.data) {
                const mappedItems = data.data.items.map(
                    (item: any) => new SurveyEntry(item)
                );

                const pagedResult: PagedResult<SurveyEntry> = {
                    items: mappedItems,
                    totalCount: data.data.totalCount,
                    pageNumber: data.data.pageNumber,
                    pageSize: data.data.pageSize
                };

                return makeResult(true, pagedResult);
            }

            return makeResult(false, undefined, data.error || "Erro ao carregar dashboard");

        } catch {
            return makeResult(false, undefined, "Erro de conexão");
        }
    },
    saveCollection: async (data: Partial<SurveyEntry>) => {

        const res = await api.put(`/collections/${data.surveyId}`, data);
        return res;

        // const res = await api.post("/collections", data);
        // return res.data;
    },

    getCollectionByAssignmentId: async (assignmentId: string) => {
        const { data } = await api.get("/collections", {
            params: { assignmentId },
        });
        return data[0] || null;
    },
    getAssignmentById: async (id: string) => {
        try {
            const { data } = await api.get(`/collections/${id}`);
            return makeResult(data.success, data.value, data.error);
        } catch (data: any) {
            return makeResult(false, undefined, data.error.message);
        }
    },
    loginUser: async (email: string, password: string): Promise<Result<TokenResponse>> => {
        try {
            const { data } = await api.post<Result<TokenResponse>>("/auth/login", { email, password });

            return makeResult(data.success, data.data, data.error);
        } catch (err: any) {
            return makeResult(false, undefined, "Falha na comunicação");
        }
    },

    getUser: async (): Promise<Result<UsuarioResponse>> => {
        try {
            const response = await api.get("/users/me");
            const { success, data, error } = response.data;

            return makeResult(success, data, error);
        } catch (error) {
            return makeResult(false, undefined, "Erro ao buscar dados do usuário");
        }
    },

    refreshToken: async (refreshToken: string) => {
        const { data } = await api.post("/auth/refresh", { refreshToken });
        return data;
    },
};
