import { RotateCcw, XCircle } from 'lucide-react';
import { Order } from '../models/Order';
import { returnStatusColors, returnStatusLabels } from '../utils';
import { canCancelOrder, canRequestReturn, returnDeadline, useOrderAfterSaleController } from '../controller/useOrderAfterSaleController';
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

/**
 * Ações de pós-venda do cliente:
 *  - "Cancelar pedido" enquanto o pedido está PENDENTE ou CONFIRMADO (some a partir de PREPARANDO);
 *  - "Solicitar devolução" até 7 dias depois da entrega;
 *  - andamento da devolução (em análise, buscar produto, devolvido, cancelada).
 */
export default function OrderAfterSaleActions({ order, accentHex, onCancel, onReturn, variant = 'compact' }: Props) {
    const showCancel = canCancelOrder(order);
    const showReturn = canRequestReturn(order);
    const deadline = returnDeadline(order);
    const returnStatus = order.return_Status ?? null;

    if (!showCancel && !showReturn && !returnStatus) return null;

    const full = variant === 'full';

    return (
        <div className={full ? 'space-y-3' : 'mt-3 space-y-2'}>
            {returnStatus && (
                <div className={`rounded-2xl px-3 py-2.5 ${returnStatusColors[returnStatus] ?? 'bg-surface-50 text-surface-700 border border-surface-200'}`}>
                    <div className="flex items-center gap-2">
                        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] sm:text-xs font-bold">{returnStatusLabels[returnStatus] ?? returnStatus}</span>
                    </div>
                    {returnStatus === 'EM_ANALISE' && (
                        <p className="mt-1 text-[10px] sm:text-[11px] leading-relaxed opacity-80">
                            Recebemos seu pedido de devolução. Vamos falar com você pelo WhatsApp para combinar a coleta.
                        </p>
                    )}
                    {returnStatus === 'AGUARDANDO_COLETA' && (
                        <p className="mt-1 text-[10px] sm:text-[11px] leading-relaxed opacity-80">
                            Devolução aprovada. Vamos buscar o produto no endereço de entrega.
                        </p>
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
                            Cancelar pedido
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
    const paid = (cancelTarget?.order_Status ?? '').toUpperCase() === 'CONFIRMADO';

    return (
        <>
            <ConfirmAdminPopup
                open={!!cancelTarget}
                title="Cancelar pedido?"
                description={paid
                    ? `O pedido #${cancelTarget?.number_Order ?? ''} já foi pago. Ao cancelar, o valor é estornado na mesma forma de pagamento (PIX ou cartão).`
                    : `O pedido #${cancelTarget?.number_Order ?? ''} será cancelado e o pagamento pendente encerrado.`}
                confirmText="Cancelar pedido"
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
                description={`Você tem até 7 dias após a entrega para devolver. Depois do pedido, a loja fala com você pelo WhatsApp para combinar a coleta do pedido #${returnTarget?.number_Order ?? ''}.`}
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
