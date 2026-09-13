import { ReactNode } from "react";
import { UserCheck } from "lucide-react";

interface PendingRegistrationPopupProps {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onContinue: () => void | Promise<void>;
    onCancel?: () => void | Promise<void>;
    icon?: ReactNode;
}

export default function PendingRegistrationPopup({
    open,
    title = "Encontramos um cadastro em andamento!",
    description = "Parece que você já começou seu cadastro antes. Vamos continuar de onde você parou, sem precisar preencher tudo de novo.",
    confirmText = "Continuar cadastro",
    cancelText,
    onContinue,
    onCancel,
    icon
}: PendingRegistrationPopupProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-3xl bg-[#09090b] border border-white/10 shadow-2xl overflow-hidden animate-fade-in">
                <div className="p-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5">
                        {icon ?? (
                            <UserCheck className="w-7 h-7 text-emerald-500" />
                        )}
                    </div>

                    <h2 className="text-white font-bold text-xl mb-2">
                        {title}
                    </h2>
                    <p className="text-surface-400 text-sm leading-relaxed">
                        {description}
                    </p>

                    <div className="flex gap-3 mt-7">
                        {cancelText && onCancel && (
                            <button
                                onClick={onCancel}
                                className="flex-1 py-3 rounded-2xl bg-white/5 text-white hover:bg-white/10 transition"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={onContinue}
                            className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
