import { ReactNode, useEffect, useState } from "react";
import { AlertTriangle, Eye, EyeOff, Loader2, Lock } from "lucide-react";

interface ConfirmPopupProps {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;

    onConfirm: (password?: string) => void | Promise<void>;
    onCancel: () => void;

    icon?: ReactNode;

    /** Pede a senha antes de confirmar (ações sensíveis). */
    requirePassword?: boolean;
    /** Erro vindo do servidor (ex: senha incorreta). */
    passwordError?: string;
    loading?: boolean;
}

export default function ConfirmPopup({
    open,
    title = "Tem certeza?",
    description = "Essa ação não poderá ser desfeita.",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    onConfirm,
    onCancel,
    icon,
    requirePassword = false,
    passwordError = "",
    loading = false,
}: ConfirmPopupProps) {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Limpa a senha sempre que o popup abre/fecha
    useEffect(() => {
        setPassword("");
        setShowPassword(false);
    }, [open]);

    if (!open) return null;

    const canConfirm = !loading && (!requirePassword || password.trim().length > 0);

    const handleConfirm = () => {
        if (!canConfirm) return;
        onConfirm(requirePassword ? password : undefined);
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 ">
            <div className="w-full max-w-md rounded-3xl bg-[#09090b] border border-white/10 shadow-2xl overflow-hidden animate-fade-in ">
                <div className="p-6">
                    <div className=" w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-5 ">
                        {icon ?? (
                            <AlertTriangle className=" w-7 h-7 text-[#f97316]" />
                        )}
                    </div>
                    <h2 className="text-white font-bold text-xl mb-2">
                        {title}
                    </h2>

                    <p className=" text-surface-400 text-sm leading-relaxed ">
                        {description}
                    </p>

                    {requirePassword && (
                        <form
                            className="mt-6"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleConfirm();
                            }}
                        >
                            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                                Confirme sua senha
                            </label>

                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    autoFocus
                                    autoComplete="current-password"
                                    disabled={loading}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Sua senha"
                                    className={`w-full rounded-2xl border bg-white/[0.04] pl-11 pr-11 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:bg-white/[0.06] disabled:opacity-60 ${passwordError
                                        ? "border-red-500/60 focus:border-red-500"
                                        : "border-white/10 focus:border-[#f97316]/60"
                                        }`}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white/70 transition"
                                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {passwordError ? (
                                <p className="mt-2 text-xs text-red-400">{passwordError}</p>
                            ) : (
                                <p className="mt-2 text-xs text-white/35">
                                    Por segurança, confirmamos que é você. Não pediremos de novo pelos próximos 10 minutos.
                                </p>
                            )}
                        </form>
                    )}

                    <div className=" flex gap-3 mt-7">
                        <button onClick={onCancel} disabled={loading} className="flex-1 py-3 rounded-2xl bg-white/5 text-white hover:bg-white/10 transition disabled:opacity-50">
                            {cancelText}
                        </button>

                        <button
                            onClick={handleConfirm}
                            disabled={!canConfirm}
                            className=" flex-1 py-3 rounded-2xl bg-[#f97316] hover:bg-orange-600 text-white font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}