import { Check, Clock, PackageCheck, RotateCcw, ShieldX, Truck, XCircle } from 'lucide-react';
import { Order } from '../models/Order';
import {
    cancelStatusColors, cancelStatusLabels, returnStatusColors, returnStatusLabels, returnStatusSteps, returnStepLabels,
} from '../utils';
import { canCancelOrder, canRequestReturn, isPaidOrder, returnDeadline, useOrderAfterSaleController } from '../controller/useOrderAfterSaleController';
import ConfirmAdminPopup from './ConfirmAdminPopup';

type Props = {
    order: Order;
    accentHex: string;
    onCancel: (order: Order) => void;
    onReturn: (order: Order) => void;
    /** compact = cartão da lista; full = detalhes do pedido. */
    variant?: 'compact' | 'full';
};

const formatDay = (date: Date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

/** Texto de cada etapa da devolução para o cliente. */
const returnHint: Record<string, string> = {
    EM_ANALISE: 'Recebemos seu pedido de devolução. Vamos falar com você pelo WhatsApp para combinar a coleta.',
    AGUARDANDO_COLETA: 'Devolução aprovada. Em breve vamos buscar o produto no endereço de entrega.',
    EM_COLETA: 'Estamos a caminho para buscar o produto. Deixe-o separado, por favor.',
    COLETADO: 'Buscamos o produto. Assim que a loja conferir, a devolução é concluída e o valor estornado.',
    DEVOLVIDO: 'Devolução concluída. O valor pago foi estornado na mesma forma de pagamento.',
};

/** Linha de progresso da devolução (substitui as etapas da entrega quando há devolução). */
export function ReturnProgress({ status, accentHex }: { status: string; accentHex: string }) {
    const index = returnStatusSteps.indexOf(status as typeof returnStatusSteps[number]);
    if (index < 0) return null;
    return (
        <div className="px-1 py-3">
            <div className="relative flex items-start justify-between">
                <div className="absolute left-4 right-4 top-3.5 h-0.5 bg-surface-200" />
                <div
                    className="absolute left-4 top-3.5 h-0.5 transition-all duration-500"
                    style={{ width: `calc((100% - 2rem) * ${index / (returnStatusSteps.length - 1)})`, backgroundColor: accentHex }}
                />
                {returnStatusSteps.map((step, i) => {
                    const done = i <= index;
                    return (
                        <div key={step} className="relative z-10 flex w-16 flex-col items-center gap-1.5">
                            <span
                                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-white transition-colors ${done ? '' : 'border-surface-200 bg-white'}`}
                                style={done ? { backgroundColor: accentHex, borderColor: accentHex } : undefined}
                            >
                                {done ? <Check className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-surface-300" />}
                            </span>
                            <span className={`text-center text-[9px] font-semibold leading-tight sm:text-[10px] ${done ? 'text-surface-800' : 'text-surface-400'}`}>
                                {returnStepLabels[step]}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Ações de pós-venda do cliente:
 *  - "Cancelar pedido" enquanto o pedido está PENDENTE ou CONFIRMADO (some a partir de PREPARANDO);
 *    pedido pago vira "Cancelamento em andamento" até a loja responder;
 *  - "Solicitar devolução" até 7 dias depois da entrega;
 *  - andamento da devolução (em análise, coleta aprovada, saiu para coleta, coletado, devolvido).
 */
export default function OrderAfterSaleActions({ order, accentHex, onCancel, onReturn, variant = 'compact' }: Props) {
    const showCancel = canCancelOrder(order);
    const showReturn = canRequestReturn(order);
    const deadline = returnDeadline(order);
    const returnStatus = order.return_Status ?? null;
    const cancelStatus = order.cancel_Status ?? null;
    // Aprovado já aparece como "Cancelado" no status do pedido.
    const showCancelBox = cancelStatus === 'SOLICITADO' || cancelStatus === 'RECUSADO';

    if (!showCancel && !showReturn && !returnStatus && !showCancelBox) return null;

    const full = variant === 'full';
    const ReturnIcon = returnStatus === 'EM_COLETA' ? Truck : returnStatus === 'COLETADO' || returnStatus === 'DEVOLVIDO' ? PackageCheck : RotateCcw;

    return (
        <div className={full ? 'space-y-3' : 'mt-3 space-y-2'}>
            {showCancelBox && (
                <div className={`rounded-2xl px-3 py-2.5 ${cancelStatusColors[cancelStatus!]}`}>
                    <div className="flex items-center gap-2">
                        {cancelStatus === 'SOLICITADO' ? <Clock className="w-3.5 h-3.5 shrink-0" /> : <ShieldX className="w-3.5 h-3.5 shrink-0" />}
                        <span className="text-[11px] sm:text-xs font-bold">{cancelStatusLabels[cancelStatus!]}</span>
                    </div>
                    <p className="mt-1 text-[10px] sm:text-[11px] leading-relaxed opacity-80">
                        {cancelStatus === 'SOLICITADO'
                            ? 'A loja está analisando seu pedido de cancelamento. Se aprovado, o valor é estornado na mesma forma de pagamento.'
                            : `O pedido segue normalmente.${order.cancel_Admin_Note ? ` Resposta da loja: ${order.cancel_Admin_Note}` : ''}`}
                    </p>
                </div>
            )}

            {returnStatus && (
                <div className={`rounded-2xl px-3 py-2.5 ${returnStatusColors[returnStatus] ?? 'bg-surface-50 text-surface-700 border border-surface-200'}`}>
                    <div className="flex items-center gap-2">
                        <ReturnIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] sm:text-xs font-bold">{returnStatusLabels[returnStatus] ?? returnStatus}</span>
                    </div>
                    {returnHint[returnStatus] && (
                        <p className="mt-1 text-[10px] sm:text-[11px] leading-relaxed opacity-80">{returnHint[returnStatus]}</p>
                    )}
                    {order.return_Admin_Note && (
                        <p className="mt-1 text-[10px] sm:text-[11px] leading-relaxed opacity-80">Loja: {order.return_Admin_Note}</p>
                    )}
                </div>
            )}

            {(showCancel || showReturn) && (
                <div className={`flex flex-wrap items-center gap-2 ${full ? '' : 'justify-end'}`}>
                    {showReturn && deadline && (
                        <button
                            type="button"
                            onClick={() => onReturn(order)}
                            className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] sm:text-xs font-display font-bold transition-all hover:brightness-95 active:scale-[0.98] ${full ? 'w-full py-3 text-sm' : ''}`}
                            style={{ color: accentHex, borderColor: `${accentHex}55`, backgroundColor: `${accentHex}0D` }}
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Solicitar devolução
                            <span className="font-body font-medium opacity-70">até {formatDay(deadline)}</span>
                        </button>
                    )}

                    {showCancel && (
                        <button
                            type="button"
                            onClick={() => onCancel(order)}
                            className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] sm:text-xs font-display font-bold text-red-600 transition-all hover:bg-red-100 active:scale-[0.98] ${full ? 'w-full py-3 text-sm' : ''}`}
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            {isPaidOrder(order) ? 'Pedir cancelamento' : 'Cancelar pedido'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

/** Popups de confirmação (cancelar e devolver), no padrão do ConfirmAdminPopup. */
export function OrderAfterSalePopups({ controller }: { controller: ReturnType<typeof useOrderAfterSaleController> }) {
    const { cancelTarget, returnTarget, loading } = controller.result;
    const paid = cancelTarget ? isPaidOrder(cancelTarget) : false;

    return (
        <>
            <ConfirmAdminPopup
                open={!!cancelTarget}
                title={paid ? 'Pedir cancelamento?' : 'Cancelar pedido?'}
                description={paid
                    ? `O pedido #${cancelTarget?.number_Order ?? ''} já foi pago. Seu pedido de cancelamento vai para a análise da loja; se aprovado, o valor é estornado na mesma forma de pagamento (PIX ou cartão).`
                    : `O pedido #${cancelTarget?.number_Order ?? ''} será cancelado e o pagamento pendente encerrado.`}
                confirmText={paid ? 'Pedir cancelamento' : 'Cancelar pedido'}
                cancelText="Voltar"
                confirmColor="red"
                loading={loading}
                requireReason
                minReasonLength={3}
                reasonLabel="Motivo do cancelamento"
                reasonPlaceholder="Conte rapidamente por que está cancelando (ajuda a loja a melhorar)."
                icon={<XCircle className="w-8 h-8 text-red-400" />}
                onConfirm={controller.action.confirmCancel}
                onCancel={controller.action.closeCancel}
            />
            <ConfirmAdminPopup
                open={!!returnTarget}
                title="Solicitar devolução"
                description={`Você tem até 7 dias após a entrega para devolver. Depois do pedido, a loja fala com você pelo WhatsApp e busca o produto do pedido #${returnTarget?.number_Order ?? ''}. Enquanto a devolução estiver aberta, os produtos não podem ser avaliados.`}
                confirmText="Solicitar devolução"
                cancelText="Voltar"
                confirmColor="brand"
                loading={loading}
                requireReason
                minReasonLength={5}
                reasonLabel="Motivo da devolução"
                reasonPlaceholder="Ex.: produto com defeito, tamanho errado, não era o esperado..."
                icon={<RotateCcw className="w-8 h-8 text-brand-400" />}
                onConfirm={controller.action.confirmReturn}
                onCancel={controller.action.closeReturn}
            />
        </>
    );
}
