import { AlertTriangle, ArrowLeft, X } from 'lucide-react';

interface ConfirmEditEmailModalProps {
    open: boolean;
    loading?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function ConfirmEditEmailModal({
    open,
    loading = false,
    onCancel,
    onConfirm
}: ConfirmEditEmailModalProps) {

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-strong overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6">

                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="w-8 h-8 rounded-lg flex items-center justify-center
                       text-surface-400 hover:text-surface-600
                       hover:bg-surface-100 transition-colors
                       disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>

                </div>

                {/* Conteúdo */}
                <div className="px-6 pt-5">

                    <h2 className="font-display font-bold text-surface-900 text-xl">
                        Editar e-mail?
                    </h2>

                    <p className="font-body text-sm text-surface-500 mt-2 leading-relaxed">
                        Você será direcionado para a etapa anterior do cadastro
                        para poder alterar seu e-mail.
                    </p>

                    <div className="mt-4 p-4 bg-surface-50 border border-surface-100 rounded-xl">

                        <p className="font-body text-xs text-surface-500 leading-relaxed">
                            <strong className="text-surface-700">
                                Atenção:
                            </strong>{' '}
                            o código de confirmação atual não será mais válido.
                            Depois de informar o novo e-mail, será necessário
                            solicitar uma nova confirmação.
                        </p>

                    </div>

                </div>

                {/* Botões */}
                <div className="flex gap-3 px-6 py-6">

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-3 border-2 border-surface-200
                       rounded-xl text-surface-600
                       font-display font-semibold text-sm
                       hover:bg-surface-50 transition-colors
                       disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-3 bg-brand-500  hover:bg-brand-600  text-white rounded-xl  font-display font-bold text-sm  transition-all shadow-brand  flex items-center justify-center gap-2  disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Editar e-mail
                                <ArrowLeft className="w-4 h-4" />
                            </>
                        )}
                    </button>

                </div>

            </div>

        </div>
    );
}