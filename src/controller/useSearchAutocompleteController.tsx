import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProductSuggestion, ProductSuggestResult, SearchTermSuggestion, SEARCH_DEBOUNCE_MS, SEARCH_MAX_LENGTH, SEARCH_MIN_LENGTH, buildSearchUrl } from "../models/Search";
import { UseRouteStore } from "../store/UseRouteStore";
import { UseSearchStore } from "../store/UseSearchStore";
import { isCanceledRequest } from "../service/SearchService";

/** Quantos produtos o painel mostra. */
const SUGGEST_LIMIT = 6;

export type AutocompleteOption =
    | { kind: 'correction'; id: string; text: string }
    | { kind: 'product'; id: string; product: ProductSuggestion }
    | { kind: 'category'; id: string; suggestion: SearchTermSuggestion }
    | { kind: 'all'; id: string };

export type AutocompleteStatus = 'idle' | 'loading' | 'success' | 'error';

/** Letras e números digitados (o servidor ignora espaços e pontuação). */
export const searchableLength = (term: string) => term.replace(/[^\p{L}\p{N}]/gu, '').length;

type Params = {
    term: string;
    setTerm: (value: string) => void;
};

export const useSearchAutocompleteController = ({ term, setTerm }: Params) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { SuggestProducts } = UseSearchStore();

    const [engaged, setEngaged] = useState(false);
    const [status, setStatus] = useState<AutocompleteStatus>('idle');
    const [data, setData] = useState<ProductSuggestResult | null>(null);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [retryKey, setRetryKey] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    const sequenceRef = useRef(0);

    const trimmed = term.trim();
    const eligible = searchableLength(trimmed) >= SEARCH_MIN_LENGTH;
    const open = engaged && eligible;

    // Busca de sugestões: espera parar de digitar, cancela a anterior e ignora respostas atrasadas.
    useEffect(() => {
        if (!engaged || !eligible) {
            abortRef.current?.abort();
            sequenceRef.current++;
            setStatus('idle');
            setData(null);
            return;
        }

        setStatus('loading');
        const sequence = ++sequenceRef.current;

        const timer = window.setTimeout(async () => {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            try {
                const result = await SuggestProducts(trimmed.slice(0, SEARCH_MAX_LENGTH), SUGGEST_LIMIT, controller.signal);
                if (sequence !== sequenceRef.current) return;

                if (!result.success || !result.data) {
                    setStatus('error');
                    return;
                }

                setData(result.data);
                setStatus('success');
                setActiveIndex(-1);
            } catch (err) {
                if (!isCanceledRequest(err) && sequence === sequenceRef.current) setStatus('error');
            }
        }, SEARCH_DEBOUNCE_MS);

        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trimmed, engaged, eligible, retryKey]);

    // Cancela tudo ao desmontar.
    useEffect(() => () => abortRef.current?.abort(), []);

    const close = useCallback(() => {
        setEngaged(false);
        setActiveIndex(-1);
    }, []);

    // Fecha ao trocar de página.
    useEffect(() => { close(); }, [location.pathname, location.search, close]);

    // Fecha ao clicar fora do campo/painel.
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) close();
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('touchstart', onPointerDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('touchstart', onPointerDown);
        };
    }, [open, close]);

    // Opções navegáveis pelo teclado, na ordem em que aparecem no painel.
    const options = useMemo<AutocompleteOption[]>(() => {
        if (!data || status === 'error') return [];
        const list: AutocompleteOption[] = [];
        const correction = data.suggestions.find(s => s.type === 'correction');
        if (correction) list.push({ kind: 'correction', id: 'search-option-correction', text: correction.text });
        data.products.forEach(product => list.push({ kind: 'product', id: `search-option-product-${product.id}`, product }));
        data.suggestions
            .filter(s => s.type === 'category')
            .forEach(suggestion => list.push({ kind: 'category', id: `search-option-category-${suggestion.categoryId}`, suggestion }));
        if (data.totalCount > 0) list.push({ kind: 'all', id: 'search-option-all' });
        return list;
    }, [data, status]);

    const submit = useCallback((value?: string) => {
        const text = (value ?? term).trim().slice(0, SEARCH_MAX_LENGTH);
        if (!text) return;
        if (value !== undefined) setTerm(text);
        close();
        inputRef.current?.blur();
        navigate(buildSearchUrl(text));
    }, [term, setTerm, close, navigate]);

    const selectOption = useCallback((option: AutocompleteOption) => {
        switch (option.kind) {
            case 'product':
                close();
                inputRef.current?.blur();
                navigate(`/product/${option.product.id}`);
                break;
            case 'category':
                close();
                inputRef.current?.blur();
                UseRouteStore.getState().navigatePages('category', null, option.suggestion.text);
                navigate(`/category/${option.suggestion.text}`);
                break;
            case 'correction':
                submit(option.text);
                break;
            case 'all':
                submit();
                break;
        }
    }, [close, navigate, submit]);

    const onInputChange = (value: string) => {
        setTerm(value.slice(0, SEARCH_MAX_LENGTH));
        setEngaged(true);
        setActiveIndex(-1);
    };

    const onFocus = () => {
        if (eligible) setEngaged(true);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') {
            if (open) {
                event.preventDefault();
                close();
            }
            return;
        }

        if (event.key === 'Tab') {
            close();
            return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            if (!open) {
                if (eligible) setEngaged(true);
                return;
            }
            if (options.length === 0) return;
            event.preventDefault();
            const step = event.key === 'ArrowDown' ? 1 : -1;
            setActiveIndex(current => {
                const next = current + step;
                if (next < -1) return options.length - 1;
                if (next >= options.length) return -1;
                return next;
            });
            return;
        }

        if (event.key === 'Enter' && open && activeIndex >= 0 && options[activeIndex]) {
            event.preventDefault();
            selectOption(options[activeIndex]);
        }
    };

    const activeOption = activeIndex >= 0 ? options[activeIndex] : undefined;

    const liveMessage = !open
        ? ''
        : status === 'loading'
            ? 'Buscando produtos…'
            : status === 'error'
                ? 'Não foi possível buscar sugestões.'
                : data && data.totalCount > 0
                    ? `${data.totalCount} ${data.totalCount === 1 ? 'produto encontrado' : 'produtos encontrados'}.`
                    : data ? 'Nenhum produto encontrado.' : '';

    return {
        result: {
            open,
            status,
            data,
            options,
            activeIndex,
            activeOption,
            liveMessage,
            containerRef,
            inputRef,
        },
        action: {
            onInputChange,
            onFocus,
            onKeyDown,
            submit,
            selectOption,
            setActiveIndex,
            close,
            retry: () => setRetryKey(k => k + 1),
        },
    };
};
