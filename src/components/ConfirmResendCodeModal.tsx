import { MailCheck, X, ShieldCheck } from 'lucide-react';

interface ConfirmResendCodeModalProps {
    open: boolean;
    email: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmResendCodeModal({
    open,
    email,
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmResendCodeModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-in">

                {/* Fechar */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Ícone */}
                <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
                        <MailCheck className="h-8 w-8 text-brand-500" />
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="mt-5 text-center">
                    <h2 className="font-display text-xl font-bold text-surface-900">
                        Confirmar e-mail
                    </h2>

                    <p className="mt-2 font-body text-sm leading-relaxed text-surface-400">
                        Vamos enviar um novo código de confirmação para:
                    </p>

                    <div className="mt-3 rounded-xl border border-surface-100 bg-surface-50 px-4 py-3">
                        <p className="break-all font-display text-sm font-bold text-surface-800">
                            {email}
                        </p>
                    </div>

                    <p className="mt-4 font-body text-sm text-surface-500">
                        Este e-mail está correto?
                    </p>
                </div>

                {/* Aviso de segurança */}
                <div className="mt-5 flex gap-3 rounded-xl border border-brand-100 bg-brand-50 p-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />

                    <p className="text-left font-body text-xs leading-relaxed text-surface-500">
                        Por segurança, ao solicitar um novo código, o código anterior
                        será invalidado.
                    </p>
                </div>

                {/* Botões */}
                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 rounded-xl border-2 border-surface-200 py-3 text-sm font-display font-bold text-surface-600 transition-colors hover:bg-surface-50 disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 rounded-xl bg-brand-500 py-3 text-sm font-display font-bold text-white shadow-brand transition-all hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Enviando...' : 'Sim, enviar código'}
                    </button>
                </div>
            </div>
        </div>
    );
}