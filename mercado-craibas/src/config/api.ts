
import axios from "axios";
import { Tokens } from "../models/Tokens";
import { makeResult, Result } from "../utils/Result";
import { TokenResponse } from "../models/TokenResponse";
import { UsuarioResponse } from "../models/UsuarioResponse";
import { User } from "../models/User";
import { Product } from "../models/Product";

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

api.interceptors.request.use((config) => {
    const stored = localStorage.getItem("@app:tokens");
    if (stored) {
        const tokens: Tokens = JSON.parse(stored);
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
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
    //   getDashboardData: async (
    //     pageNumber: number,
    //     pageSize: number,
    //     filters: DashboardFilters
    //   ): Promise<Result<PagedResult<SurveyEntry>>> => {
    //     try {
    //       const payload = {
    //         periodStatus: filters.PeriodStatus ?? null,
    //         entryStatus: filters.EntryStatus ?? null,
    //         vertical: filters.vertical ?? null,
    //         period: filters.Period ?? null,
    //         search: filters.Search ?? null,
    //         pageSize,
    //         pageNumber
    //       };

    //       const { data } = await api.post("/dashboard", payload);

    //       if (data.success && data.data) {
    //         const mappedItems = data.data.items.map(
    //           (item: any) => new SurveyEntry(item)
    //         );

    //         const pagedResult: PagedResult<SurveyEntry> = {
    //           items: mappedItems,
    //           totalCount: data.data.totalCount,
    //           pageNumber: data.data.pageNumber,
    //           pageSize: data.data.pageSize
    //         };

    //         return makeResult(true, pagedResult);
    //       }

    //       return makeResult(false, undefined, data.error || "Erro ao carregar dashboard");

    //     } catch {
    //       return makeResult(false, undefined, "Erro de conexão");
    //     }
    //   },


    //   saveCollection: async (data: Partial<SurveyEntry>) => {
    //     if (data.id) {
    //       const res = await api.put(`/collections/${data.id}`, data);
    //       return res.data;
    //     }

    //     const res = await api.post("/collections", data);
    //     return res.data;
    //   },

    //   getCollectionByAssignmentId: async (assignmentId: string) => {
    //     const { data } = await api.get("/collections", {
    //       params: { assignmentId },
    //     });

    //     return data[0] || null;
    //   },

    //   getAssignmentById: async (id: string) => {
    //     const { data } = await api.get(`/collections/${id}`);
    //     return data;
    //   },

    loginUser: async (email: string, password: string): Promise<Result<TokenResponse>> => {
        try {
            const { data } = await api.post<Result<TokenResponse>>("/auth/login", { email, password });

            if (!data.data) {
                return makeResult(false, {} as TokenResponse, "Resposta inválida do servidor");
            }

            return makeResult(data.success, data.data, data.error);
        } catch (err) {
            return makeResult(false, {} as TokenResponse, "Falha na comunicação");
        }
    },

    getUser: async (Role: string): Promise<Result<User>> => {
        try {
            console.log("Role recebida:", Role);
            const response = await api.get("/users/me/" + Role);
            console.log("Resposta da API:", response.data);
            const { success, data, error } = response.data;

            if (!data) {
                return makeResult(false, {} as User, "Usuário não encontrado");
            }

            return makeResult(success, data, error);
        } catch (error) {
            return makeResult(false, {} as User, "Falha na comunicação");
        }
    },
    getListProducts: async (): Promise<Result<Product[]>> => {
        try {
            const response = await api.get("/product/list");
            const { success, data, error } = response.data;
            console.log("Resposta da API de produtos:", response.data);
            if (!data) {
                return makeResult(false, [] as Product[], "Produtos não encontrados");
            }

            return makeResult(success, data, error);
        } catch (error) {
            return makeResult(false, [] as Product[], "Falha na comunicação");
        }
    },

    //   refreshToken: async (refreshToken: string) => {
    //     const { data } = await api.post("/auth/refresh", { refreshToken });
    //     return data;
    //   },
};
