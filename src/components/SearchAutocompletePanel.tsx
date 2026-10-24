import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Loader2, Search, ShoppingBag, Sparkles, Tag } from 'lucide-react';
import { formatPrice } from '../utils';
import { ProductSuggestion, ProductSuggestResult } from '../models/Search';
import { AutocompleteOption, AutocompleteStatus } from '../controller/useSearchAutocompleteController';

export const SEARCH_LISTBOX_ID = 'search-suggestions';

type Props = {
    term: string;
    status: AutocompleteStatus;
    data: ProductSuggestResult | null;
    options: AutocompleteOption[];
    activeIndex: number;
    accentHex: string;
    onSelect: (option: AutocompleteOption) => void;
    onHover: (index: number) => void;
    onRetry: () => void;
};

/** Painel de sugestões do campo de busca do cabeçalho. */
export default function SearchAutocompletePanel({ term, status, data, options, activeIndex, accentHex, onSelect, onHover, onRetry }: Props) {
    const loadingFirst = status === 'loading' && !data;
    const refreshing = status === 'loading' && !!data;

    const indexOf = (id: string) => options.findIndex(o => o.id === id);
    const correction = options.find(o => o.kind === 'correction');
    const products = options.filter((o): o is Extract<AutocompleteOption, { kind: 'product' }> => o.kind === 'product');
    const categories = options.filter((o): o is Extract<AutocompleteOption, { kind: 'category' }> => o.kind === 'category');
    const all = options.find(o => o.kind === 'all');
    const highlightTerm = `${term} ${data?.correctedQuery ?? ''}`;

    const activeId = activeIndex >= 0 ? options[activeIndex]?.id : undefined;
    useEffect(() => {
        if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
    }, [activeId]);

    return (
        <div
            className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-strong border border-surface-100 overflow-hidden animate-scale-in origin-top text-left"
            onMouseDown={e => e.preventDefault() /* mantém o foco no campo ao clicar no painel */}
        >
            <div
                id={SEARCH_LISTBOX_ID}
                role="listbox"
                aria-label="Sugestões de busca"
                className="max-h-[min(70vh,560px)] overflow-y-auto overscroll-contain"
            >
                {loadingFirst && <LoadingRows />}

                {status === 'error' && (
                    <div className="flex flex-col items-center text-center px-6 py-8">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="font-display font-semibold text-surface-800 text-sm">Não foi possível buscar agora</p>
                        <p className="font-body text-xs text-surface-400 mt-1">Verifique sua conexão e tente de novo.</p>
                        <button
                            type="button"
                            onClick={onRetry}
                            className="mt-4 px-4 py-2 rounded-xl border border-surface-200 text-xs font-display font-semibold text-surface-700 hover:bg-surface-50 transition-colors"
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                {status !== 'error' && data && data.totalCount === 0 && !refreshing && (
                    <div className="flex flex-col items-center text-center px-6 py-8">
                        <div className="w-12 h-12 rounded-2xl bg-surface-100 flex items-center justify-center mb-3">
                            <Search className="w-5 h-5 text-surface-400" />
                        </div>
                        <p className="font-display font-semibold text-surface-800 text-sm">
                            Nenhum produto encontrado para “{term.trim()}”
                        </p>
                        <p className="font-body text-xs text-surface-400 mt-1">Confira a ortografia ou use termos mais gerais.</p>
                    </div>
                )}

                {status !== 'error' && data && data.totalCount > 0 && (
                    <>
                        <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
                            <span className="text-[10px] font-display font-bold uppercase tracking-wider text-surface-400">
                                {data.isPartialMatch ? 'Produtos parecidos' : 'Produtos'}
                            </span>
                            <span className="flex items-center gap-1.5 text-[11px] font-body text-surface-400">
                                {refreshing && <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />}
                                {data.totalCount} {data.totalCount === 1 ? 'resultado' : 'resultados'}
                            </span>
                        </div>

                        {correction && correction.kind === 'correction' && (
                            <Option id={correction.id} active={activeIndex === indexOf(correction.id)} onHover={() => onHover(indexOf(correction.id))} onSelect={() => onSelect(correction)}
                                className="mx-2 mb-1 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-body text-surface-600">
                                <Sparkles className="w-4 h-4 shrink-0" style={{ color: accentHex }} aria-hidden="true" />
                                <span>Você quis dizer <strong className="font-semibold text-surface-900">{correction.text}</strong>?</span>
                            </Option>
                        )}

                        <div className="px-2 pb-2">
                            {products.map(option => (
                                <Option key={option.id} id={option.id} active={activeIndex === indexOf(option.id)} onHover={() => onHover(indexOf(option.id))} onSelect={() => onSelect(option)}
                                    className="flex items-center gap-3 p-2 rounded-xl">
                                    <ProductRow product={option.product} term={highlightTerm} />
                                </Option>
                            ))}
                        </div>

                        {categories.length > 0 && (
                            <div className="border-t border-surface-100 px-4 py-3">
                                <p className="text-[10px] font-display font-bold uppercase tracking-wider text-surface-400 mb-2">Categorias</p>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(option => (
                                        <Option key={option.id} id={option.id} active={activeIndex === indexOf(option.id)} onHover={() => onHover(indexOf(option.id))} onSelect={() => onSelect(option)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-surface-200 text-xs font-body font-medium text-surface-600">
                                            <Tag className="w-3 h-3 text-surface-400" aria-hidden="true" />
                                            <span className="capitalize">{option.suggestion.text}</span>
                                            <span className="text-surface-400">{option.suggestion.count}</span>
                                        </Option>
                                    ))}
                                </div>
                            </div>
                        )}

                        {all && (
                            <Option id={all.id} active={activeIndex === indexOf(all.id)} onHover={() => onHover(indexOf(all.id))} onSelect={() => onSelect(all)}
                                className="w-full flex items-center justify-between gap-3 border-t border-surface-100 px-4 py-3">
                                <span className="font-display font-semibold text-sm truncate" style={{ color: accentHex }}>
                                    Ver todos os resultados para “{term.trim()}”
                                </span>
                                <span className="flex items-center gap-1 shrink-0 text-xs font-body text-surface-400">
                                    {data.totalCount}
                                    <ArrowRight className="w-4 h-4" style={{ color: accentHex }} aria-hidden="true" />
                                </span>
                            </Option>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function Option({ id, active, onSelect, onHover, className, children }: {
    id: string;
    active: boolean;
    onSelect: () => void;
    onHover: () => void;
    className: string;
    children: React.ReactNode;
}) {
    return (
        <div
            id={id}
            role="option"
            aria-selected={active}
            onClick={onSelect}
            onMouseMove={onHover}
            className={`${className} cursor-pointer transition-colors ${active ? 'bg-surface-100' : 'hover:bg-surface-50'}`}
        >
            {children}
        </div>
    );
}

function ProductRow({ product, term }: { product: ProductSuggestion; term: string }) {
    const [imageFailed, setImageFailed] = useState(false);
    const hasDiscount = product.originPrice > product.price;

    return (
        <>
            <div className="w-14 h-14 shrink-0 rounded-xl bg-surface-50 border border-surface-100 overflow-hidden flex items-center justify-center">
                {product.image && !imageFailed ? (
                    <img
                        src={`/Imagens/Produtos/${product.image}`}
                        alt=""
                        loading="lazy"
                        onError={() => setImageFailed(true)}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <ShoppingBag className="w-5 h-5 text-surface-300" aria-hidden="true" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="font-body text-sm text-surface-700 leading-snug line-clamp-2">
                    <Highlight text={product.name} term={term} />
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[11px] font-body text-surface-400 capitalize">{product.categoryName}</span>
                    {product.freeShipping && (
                        <span className="text-[10px] font-body font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">Frete grátis</span>
                    )}
                    {!product.inStock && (
                        <span className="text-[10px] font-body font-semibold text-surface-500 bg-surface-100 px-1.5 py-0.5 rounded-full">Esgotado</span>
                    )}
                </div>
            </div>

            <div className="shrink-0 text-right">
                <p className="font-display font-bold text-surface-900 text-sm">{formatPrice(product.price)}</p>
                {hasDiscount && (
                    <p className="text-[11px] font-body text-surface-400 line-through">{formatPrice(product.originPrice)}</p>
                )}
            </div>
        </>
    );
}

/** Negrito nas partes do nome que batem com o que foi digitado (ignora acentos e maiúsculas). */
function Highlight({ text, term }: { text: string; term: string }) {
    const fold = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const tokens = fold(term).split(/[^\p{L}\p{N}]+/u).filter(t => t.length >= 2);
    if (tokens.length === 0) return <>{text}</>;

    // Cada caractere do nome vira um caractere comparável, mantendo as posições originais.
    const chars = Array.from(text);
    const folded = chars.map(ch => fold(ch).charAt(0) || ch).join('');
    const marks: boolean[] = new Array(chars.length).fill(false);
    for (const token of tokens) {
        let from = 0;
        let at: number;
        while ((at = folded.indexOf(token, from)) !== -1) {
            for (let i = at; i < at + token.length && i < marks.length; i++) marks[i] = true;
            from = at + token.length;
        }
    }

    const parts: { text: string; bold: boolean }[] = [];
    chars.forEach((ch, i) => {
        const last = parts[parts.length - 1];
        if (last && last.bold === marks[i]) last.text += ch;
        else parts.push({ text: ch, bold: marks[i] });
    });

    return (
        <>
            {parts.map((part, i) =>
                part.bold
                    ? <strong key={i} className="font-semibold text-surface-900">{part.text}</strong>
                    : <span key={i}>{part.text}</span>
            )}
        </>
    );
}

function LoadingRows() {
    return (
        <div className="p-2" aria-hidden="true">
            {[0, 1, 2].map(i => (
                <div key={i} className="flex items-center gap-3 p-2">
                    <div className="w-14 h-14 rounded-xl bg-surface-100 animate-pulse-soft" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 rounded-full bg-surface-100 animate-pulse-soft w-3/4" />
                        <div className="h-2.5 rounded-full bg-surface-100 animate-pulse-soft w-1/3" />
                    </div>
                    <div className="h-3 w-14 rounded-full bg-surface-100 animate-pulse-soft" />
                </div>
            ))}
        </div>
    );
}
