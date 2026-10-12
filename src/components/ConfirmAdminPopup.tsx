import { ReactNode, useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmAdminPopupProps {
    open: boolean;

    title?: string;
    description?: string;

    confirmText?: string;
    cancelText?: string;

    loading?: boolean;

    onConfirm: (reason?: string) => void | Promise<void>;
    onCancel: () => void;

    /** Exige o motivo antes de confirmar (exclusões do admin). */
    requireReason?: boolean;
    reasonLabel?: string;
    reasonPlaceholder?: string;
    /** Mínimo de caracteres do campo (padrão 5). */
    minReasonLength?: number;
    /** Máximo de caracteres do campo (padrão 500). */
    maxReasonLength?: number;
    /** Linhas do campo (padrão 3). */
    reasonRows?: number;
    /** Mensagem quando o campo está inválido. */
    reasonErrorText?: string;

    icon?: ReactNode;

    confirmColor?: "brand" | "red" | "green";
}

export default function ConfirmAdminPopup({
    open,
    title = "Confirmar ação",
    description = "Deseja realmente continuar? Esta ação poderá alterar dados do sistema.",

    confirmText = "Confirmar",
    cancelText = "Cancelar",

    loading = false,

    onConfirm,
    onCancel,

    icon,

    confirmColor = "brand",

    requireReason = false,
    reasonLabel = "Motivo da exclusão",
    reasonPlaceholder = "Explique por que este item está sendo excluído. Ficará registrado na Lixeira.",
    minReasonLength = 5,
    maxReasonLength = 500,
    reasonRows = 3,
    reasonErrorText,
}: ConfirmAdminPopupProps) {
    const [reason, setReason] = useState("");
    const [touched, setTouched] = useState(false);

    // Limpa o motivo sempre que o popup abre/fecha
    useEffect(() => {
        setReason("");
        setTouched(false);
    }, [open]);

    if (!open) return null;

    const MIN_REASON = minReasonLength;
    const reasonValid = !requireReason || reason.trim().length >= MIN_REASON;

    const handleConfirm = () => {
        if (!reasonValid) {
            setTouched(true);
            return;
        }

        onConfirm(requireReason ? reason.trim() : undefined);
    };

    const confirmClass = {
        brand:
            "bg-brand-500 hover:bg-brand-600 shadow-brand",
        red:
            "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30",
        green:
            "bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30",
    };

    return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">

            <div className="relative w-full max-w-lg overflow-hidden rounded-[30px] border border-white/10 bg-[#0b0b0d] shadow-2xl">

                {/* Glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-brand-500/10 blur-3xl" />

                <div className="relative p-7">

                    {/* Ícone */}
                    <div className="w-16 h-16 rounded-3xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6">
                        {icon ?? (
                            <AlertTriangle className="w-8 h-8 text-brand-400" />
                        )}
                    </div>

                    {/* Texto */}
                    <h2 className="text-2xl font-black text-white">
                        {title}
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-white/60">
                        {description}
                    </p>

                    {/* Motivo */}
                    {requireReason && (
                        <div className="mt-6">
                            <label className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-white/50">
                                    {reasonLabel} <span className="text-red-400">*</span>
                                </span>
                                <span className={`text-[11px] ${reason.length > maxReasonLength ? "text-red-400" : "text-white/30"}`}>
                                    {reason.length}/{maxReasonLength}
                                </span>
                            </label>

                            <textarea
                                value={reason}
                                maxLength={maxReasonLength}
                                rows={reasonRows}
                                disabled={loading}
                                autoFocus
                                onChange={(e) => setReason(e.target.value)}
                                onBlur={() => setTouched(true)}
                                placeholder={reasonPlaceholder}
                                className={`w-full resize-none rounded-2xl border bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:bg-white/[0.06] disabled:opacity-60 ${touched && !reasonValid
                                    ? "border-red-500/60 focus:border-red-500"
                                    : "border-white/10 focus:border-brand-500/60"
                                    }`}
                            />

                            {touched && !reasonValid && (
                                <p className="mt-2 text-xs text-red-400">
                                    {reasonErrorText ?? `Informe o motivo (mínimo de ${MIN_REASON} caracteres).`}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Botões */}
                    <div className="mt-8 flex gap-3">

                        <button
                            disabled={loading}
                            onClick={onCancel}
                            className="flex-1 h-12 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold transition-all disabled:opacity-50"
                        >
                            {cancelText}
                        </button>

                        <button
                            disabled={loading}
                            onClick={handleConfirm}
                            className={`flex-1 h-12 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 ${confirmClass[confirmColor]}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                confirmText
                            )}
                        </button>

                    </div>

                </div>
            </div>
        </div>
    );
}