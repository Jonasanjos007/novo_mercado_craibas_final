import { Product } from "./Product";

/** Ordenações aceitas pela busca (mesmas da página de resultados). */
export type SearchSort = 'relevancia' | 'menor-preco' | 'maior-preco' | 'avaliacao' | 'mais-vendidos';

/** Parâmetros do GET /v1/product/search. */
export interface ProductSearchQuery {
    q: string;
    page: number;
    pageSize: number;
    sort: SearchSort;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    freeShipping?: boolean;
    badge?: string;
}

/** Resultado paginado da busca completa (itens no mesmo formato da lista da loja). */
export interface ProductSearchResult {
    items: Product[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    query: string;
    correctedQuery?: string | null;
    isPartialMatch: boolean;
}

/** Produto resumido do autocomplete. */
export interface ProductSuggestion {
    id: number;
    name: string;
    price: number;
    originPrice: number;
    image?: string | null;
    categoryId: number;
    categoryName: string;
    badge?: string | null;
    freeShipping: boolean;
    inStock: boolean;
    rating: number;
    reviewCount: number;
}

/** Sugestão de termo: correção de digitação ou categoria com resultados. */
export interface SearchTermSuggestion {
    type: 'correction' | 'category';
    text: string;
    categoryId?: number | null;
    count: number;
}

export interface ProductSuggestResult {
    query: string;
    correctedQuery?: string | null;
    isPartialMatch: boolean;
    totalCount: number;
    products: ProductSuggestion[];
    suggestions: SearchTermSuggestion[];
}

/** Tamanho mínimo (sem espaços) para o autocomplete buscar. Igual ao do servidor. */
export const SEARCH_MIN_LENGTH = 2;
/** Tamanho máximo do termo. Igual ao do servidor. */
export const SEARCH_MAX_LENGTH = 100;
/** Espera depois da última tecla antes de buscar sugestões. */
export const SEARCH_DEBOUNCE_MS = 300;
/** Produtos por página na busca completa. */
export const SEARCH_PAGE_SIZE = 24;

/** URL da página de resultados com o termo codificado (/search?q=iphone%2017). */
export const buildSearchUrl = (term: string) => `/search?q=${encodeURIComponent(term.trim())}`;
