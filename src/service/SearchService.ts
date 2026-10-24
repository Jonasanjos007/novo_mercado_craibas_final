import axios from "axios";
import { api } from "../config/api";
import { ProductSearchQuery, ProductSearchResult, ProductSuggestResult } from "../models/Search";
import { makeResult, Result } from "../utils/Result";

const emptySearch = (query: ProductSearchQuery): ProductSearchResult => ({
    items: [],
    totalCount: 0,
    pageNumber: query.page,
    pageSize: query.pageSize,
    query: query.q,
    correctedQuery: null,
    isPartialMatch: false,
});

const emptySuggest = (q: string): ProductSuggestResult => ({
    query: q,
    correctedQuery: null,
    isPartialMatch: false,
    totalCount: 0,
    products: [],
    suggestions: [],
});

/** Erro de requisição cancelada (nova busca começou): quem chamou deve ignorar. */
export const isCanceledRequest = (err: unknown) => axios.isCancel(err);

export const SearchService = {
    /** Busca completa com ranking, filtros, ordenação e paginação (feita no servidor). */
    SearchProducts: async (query: ProductSearchQuery, signal?: AbortSignal): Promise<Result<ProductSearchResult>> => {
        try {
            const params: Record<string, unknown> = {
                q: query.q,
                page: query.page,
                pageSize: query.pageSize,
                sort: query.sort,
            };
            if (query.minPrice !== undefined) params.minPrice = query.minPrice;
            if (query.maxPrice !== undefined) params.maxPrice = query.maxPrice;
            if (query.minRating) params.minRating = query.minRating;
            if (query.freeShipping) params.freeShipping = true;
            if (query.badge) params.badge = query.badge;

            const response = await api.get("/v1/product/search", { params, signal });
            const { success, data, error } = response.data;

            if (!success || !data) {
                return makeResult(false, emptySearch(query), error);
            }

            return makeResult(true, data as ProductSearchResult, error);
        } catch (err: any) {
            if (isCanceledRequest(err)) throw err;
            console.log(err.response?.data);
            return makeResult(false, emptySearch(query), err.response?.data);
        }
    },

    /** Autocomplete: poucos produtos + sugestões de termo e categoria. */
    SuggestProducts: async (q: string, limit: number, signal?: AbortSignal): Promise<Result<ProductSuggestResult>> => {
        try {
            const response = await api.get("/v1/product/suggest", { params: { q, limit }, signal });
            const { success, data, error } = response.data;

            if (!success || !data) {
                return makeResult(false, emptySuggest(q), error);
            }

            return makeResult(true, data as ProductSuggestResult, error);
        } catch (err: any) {
            if (isCanceledRequest(err)) throw err;
            console.log(err.response?.data);
            return makeResult(false, emptySuggest(q), err.response?.data);
        }
    },
};
