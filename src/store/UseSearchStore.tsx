import { create } from "zustand";
import { Product } from "../models/Product";
import { ProductSearchQuery, ProductSuggestResult } from "../models/Search";
import { isCanceledRequest, SearchService } from "../service/SearchService";
import { makeResult, Result } from "../utils/Result";

type SearchStatus = 'idle' | 'loading' | 'loadingMore' | 'success' | 'error';

interface SearchState {
    /** Produtos já carregados da busca atual (páginas somadas ao "Carregar mais"). */
    results: Product[];
    totalCount: number;
    correctedQuery: string | null;
    isPartialMatch: boolean;
    /** Consulta que gerou {@link results}. */
    lastQuery: ProductSearchQuery | null;
    status: SearchStatus;
    errorMessage: string;

    /** Busca no servidor. append = próxima página somada às anteriores. */
    SearchProducts: (query: ProductSearchQuery, append?: boolean) => Promise<Result<boolean>>;
    /** Autocomplete (não guarda estado: o painel do cabeçalho cuida da exibição). */
    SuggestProducts: (q: string, limit: number, signal?: AbortSignal) => Promise<Result<ProductSuggestResult>>;
    ResetSearch: () => void;
}

// Só a resposta da busca mais recente vale; as anteriores são canceladas.
let searchSequence = 0;
let searchAbort: AbortController | null = null;

export const UseSearchStore = create<SearchState>((set, get) => ({
    results: [],
    totalCount: 0,
    correctedQuery: null,
    isPartialMatch: false,
    lastQuery: null,
    status: 'idle',
    errorMessage: '',

    SearchProducts: async (query, append = false) => {
        searchAbort?.abort();
        const controller = new AbortController();
        searchAbort = controller;
        const sequence = ++searchSequence;

        set({ status: append ? 'loadingMore' : 'loading', errorMessage: '' });

        try {
            const result = await SearchService.SearchProducts(query, controller.signal);
            if (sequence !== searchSequence) return makeResult(true, true);

            if (!result.success || !result.data) {
                set({
                    status: 'error',
                    errorMessage: result.error?.error?.message || 'Não foi possível buscar os produtos agora.',
                    ...(append ? {} : { results: [], totalCount: 0, correctedQuery: null, isPartialMatch: false, lastQuery: query }),
                });
                return makeResult(false, false, result.error);
            }

            const data = result.data;
            const previous = append ? get().results : [];
            const seen = new Set(previous.map(p => p.id));
            const merged = append ? [...previous, ...data.items.filter(p => !seen.has(p.id))] : data.items;

            set({
                results: merged,
                totalCount: data.totalCount,
                correctedQuery: data.correctedQuery ?? null,
                isPartialMatch: data.isPartialMatch,
                lastQuery: query,
                status: 'success',
            });
            return makeResult(true, true);
        } catch (err) {
            if (isCanceledRequest(err)) return makeResult(true, true);
            throw err;
        }
    },

    SuggestProducts: (q, limit, signal) => SearchService.SuggestProducts(q, limit, signal),

    ResetSearch: () => {
        searchAbort?.abort();
        searchSequence++;
        set({ results: [], totalCount: 0, correctedQuery: null, isPartialMatch: false, lastQuery: null, status: 'idle', errorMessage: '' });
    },
}));
