import { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface AlertPopupProps {
    open: boolean;
    title?: string;
    description?: string;
    buttonText?: string;
    onClose: () => void;
    icon?: ReactNode;
}

export default function AlertPopup({
    open,
    title = "Aviso",
    description = "",
    buttonText = "Entendi",
    onClose,
    icon
}: AlertPopupProps) {

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-3xl bg-[#09090b] border border-white/10 shadow-2xl overflow-hidden animate-fade-in">
                <div className="p-6">

                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-5">
                        {icon ?? (
                            <AlertTriangle className="w-7 h-7 text-[#f97316]" />
                        )}
                    </div>

                    <h2 className="text-white font-bold text-xl mb-2">
                        {title}
                    </h2>

                    <p className="text-zinc-400 text-sm leading-relaxed">
                        {description}
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full mt-7 py-3 rounded-2xl bg-[#f97316] hover:bg-orange-600 text-white font-semibold transition"
                    >
                        {buttonText}
                    </button>

                </div>
            </div>
        </div>
    );
}