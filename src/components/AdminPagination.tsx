import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { PAGE_SIZE_OPTIONS } from '../models/Paged';

/* Paginação das telas do admin (mesmo visual da Lixeira). */

interface PageSizeSelectProps {
    darkMode: boolean;
    pageSize: number;
    onChange: (size: number) => void;
}

/** "Mostrar [10] por página" */
export function PageSizeSelect({ darkMode, pageSize, onChange }: PageSizeSelectProps) {
    const muted = darkMode ? 'text-surface-400' : 'text-[#8a919e]';

    return (
        <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold ${muted}`}>Mostrar</span>
            <select
                value={pageSize}
                onChange={(e) => onChange(Number(e.target.value))}
                className={`px-3 py-2 rounded-lg border text-xs font-bold outline-none cursor-pointer ${darkMode
                    ? 'bg-surface-950 border-surface-700 text-white'
                    : 'bg-white border-[#dfe3e8] text-[#4b5563]'
                    }`}
                aria-label="Quantidade de registros por página"
            >
                {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>{size}</option>
                ))}
            </select>
            <span className={`text-[11px] font-semibold ${muted}`}>por página</span>
        </div>
    );
}

interface PaginationFooterProps {
    darkMode: boolean;
    page: number;
    pageSize: number;
    total: number;
    loading?: boolean;
    onPageChange: (page: number) => void;
    /** Mostra o seletor de quantidade junto. */
    onPageSizeChange?: (size: number) => void;
    className?: string;
}

/** "Mostrando 1–10 de 250 registros · Página 1 de 25  ‹ ›" */
export function PaginationFooter({
    darkMode,
    page,
    pageSize,
    total,
    loading = false,
    onPageChange,
    onPageSizeChange,
    className = '',
}: PaginationFooterProps) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);

    const primary = darkMode ? 'text-white' : 'text-[#17191f]';
    const muted = darkMode ? 'text-surface-400' : 'text-[#8a919e]';
    const btn = darkMode ? 'bg-surface-800 text-surface-200' : 'bg-[#f3f4f6] text-[#4b5563]';

    return (
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${className}`}>
            <div className="flex flex-wrap items-center gap-3">
                <p className={`text-xs ${muted}`}>
                    Mostrando <span className={`font-bold ${primary}`}>{from}–{to}</span> de{' '}
                    <span className={`font-bold ${primary}`}>{total}</span> registros
                </p>
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {onPageSizeChange && <PageSizeSelect darkMode={darkMode} pageSize={pageSize} onChange={onPageSizeChange} />}

                <span className={`text-xs ${muted}`}>
                    Página <span className={`font-bold ${primary}`}>{page}</span> de{' '}
                    <span className={`font-bold ${primary}`}>{totalPages}</span>
                </span>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={page <= 1 || loading}
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 ${btn}`}
                        aria-label="Página anterior"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        disabled={page >= totalPages || loading}
                        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 ${btn}`}
                        aria-label="Próxima página"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
