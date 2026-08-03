import { ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmAdminPopupProps {
    open: boolean;

    title?: string;
    description?: string;

    confirmText?: string;
    cancelText?: string;

    loading?: boolean;

    onConfirm: () => void | Promise<void>;
    onCancel: () => void;

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
}: ConfirmAdminPopupProps) {
    if (!open) return null;

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
                            onClick={onConfirm}
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