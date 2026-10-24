import { AlertCircle, Check, Clock, CreditCard, Home, Receipt, RefreshCw, ShieldAlert, X, Zap } from 'lucide-react';
import { formatPrice } from '../../utils';
import { OrderPayment, PaymentTransaction } from '../../models/Payment';

export type PaymentResultKind = 'approved' | 'rejected' | 'analysis' | 'closed' | 'unavailable';

type Props = {
    kind: PaymentResultKind;
    accentHex: string;
    order: OrderPayment | null;
    current: PaymentTransaction | null;
    firstName?: string;
    message?: string | null;
    onOrders: () => void;
    onHome: () => void;
    onRetryCard?: () => void;
    onPayWithPix?: () => void;
    onRefresh?: () => void;
};

function methodLabel(tx: PaymentTransaction | null) {
    if (!tx) return 'Não informado';
    if (tx.method === 'PIX') return 'PIX';
    const base = tx.method === 'DEBIT_CARD' ? 'Cartão de débito' : 'Cartão de crédito';
    const installments = tx.method === 'CREDIT_CARD' && (tx.installments ?? 1) > 1 ? ` em ${tx.installments}x` : '';
    const last = tx.card_Last_Four ? ` •••• ${tx.card_Last_Four}` : '';
    return `${base}${installments}${last}`;
}

const tone = {
    approved: { ring: '#16a34a', icon: Check, badge: 'Pagamento aprovado' },
    rejected: { ring: '#dc2626', icon: X, badge: 'Pagamento não aprovado' },
    analysis: { ring: '#d97706', icon: Clock, badge: 'Pagamento em análise' },
    closed: { ring: '#71717a', icon: ShieldAlert, badge: 'Pagamento indisponível' },
    unavailable: { ring: '#71717a', icon: AlertCircle, badge: 'Pagamento indisponível' },
} as const;

/** As telas de resultado do pagamento: aprovado, recusado, em análise e indisponível. */
export default function PaymentResultView({ kind, accentHex, order, current, firstName, message, onOrders, onHome, onRetryCard, onPayWithPix, onRefresh }: Props) {
    const config = tone[kind];
    const Icon = config.icon;
    const color = kind === 'approved' ? accentHex : config.ring;

    const title = {
        approved: firstName ? `Tudo certo, ${firstName}!` : 'Pagamento aprovado!',
        rejected: 'Não conseguimos aprovar o pagamento',
        analysis: 'Seu pagamento está em análise',
        closed: 'Este pedido não aceita pagamento',
        unavailable: 'Pagamento indisponível',
    }[kind];

    const description = {
        approved: 'Recebemos o seu pagamento e o pedido foi confirmado. Agora vamos separar os seus produtos.',
        rejected: message || 'O pagamento não foi aprovado. Tente outro cartão ou pague com PIX.',
        analysis: 'A operadora do cartão está conferindo o pagamento. Isso costuma levar poucos minutos, e você recebe uma notificação com a resposta.',
        closed: 'Este pedido foi cancelado ou já não está aguardando pagamento. Veja os detalhes em Meus pedidos.',
        unavailable: message || 'O pagamento online está indisponível no momento. Tente novamente em alguns minutos.',
    }[kind];

    return (
        <div className="relative overflow-hidden rounded-3xl bg-white border border-surface-100 shadow-soft animate-fade-in">
            <div className="absolute -top-28 -right-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: color }} />
            <div className="absolute -bottom-32 -left-24 w-72 h-72 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ backgroundColor: color }} />

            <div className="relative px-6 py-10 sm:px-10 sm:py-12 text-center">
                <div className="relative mx-auto w-20 h-20">
                    {kind !== 'closed' && kind !== 'unavailable' && (
                        <span className={`absolute inset-0 rounded-3xl opacity-20 ${kind === 'rejected' ? '' : 'animate-ping'}`} style={{ backgroundColor: color }} />
                    )}
                    <div
                        className="relative w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl"
                        style={{ background: `linear-gradient(135deg, ${color}, ${color}B3)`, boxShadow: `0 16px 40px ${color}55` }}
                    >
                        <Icon className="w-10 h-10 text-white" strokeWidth={3} />
                    </div>
                </div>

                <span
                    className="inline-flex items-center gap-1.5 mt-6 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
                    style={{ color, backgroundColor: `${color}14` }}
                >
                    {config.badge}
                </span>

                <h1 className="mt-4 font-display font-bold text-surface-900 text-2xl sm:text-3xl">{title}</h1>
                <p className="mt-2 text-surface-500 text-sm sm:text-base max-w-lg mx-auto">{description}</p>

                {order && (
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                        <div className="rounded-2xl border border-surface-100 bg-surface-50/70 p-4">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-surface-400">Pedido</p>
                            <p className="mt-1 font-display font-bold text-surface-900 truncate">#{order.number_Order}</p>
                        </div>
                        <div className="rounded-2xl border border-surface-100 bg-surface-50/70 p-4">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-surface-400">Valor</p>
                            <p className="mt-1 font-display font-bold text-surface-900 text-xl">
                                {formatPrice(current?.amount ?? order.total_Value_Order)}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-surface-100 bg-surface-50/70 p-4">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-surface-400">Forma</p>
                            <div className="mt-1.5 flex items-center gap-2 text-surface-900">
                                <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: accentHex, backgroundColor: `${accentHex}14` }}>
                                    {current?.method === 'PIX' ? <Zap className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                                </span>
                                <span className="font-display font-semibold text-sm leading-snug">{methodLabel(current)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {kind === 'rejected' && (
                    <p className="mt-5 text-xs text-surface-400">
                        Nenhum valor foi cobrado. Seu pedido continua reservado como <strong className="text-surface-600">pendente</strong>.
                    </p>
                )}

                {/* Ações */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {kind === 'rejected' ? (
                        <>
                            <button
                                type="button"
                                onClick={onRetryCard}
                                className="py-4 rounded-2xl text-white font-display font-bold flex items-center justify-center gap-2 shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-110"
                                style={{ backgroundColor: accentHex, boxShadow: `0 10px 24px ${accentHex}40` }}
                            >
                                <CreditCard className="w-4 h-4" />
                                Tentar com outro cartão
                            </button>
                            <button
                                type="button"
                                onClick={onPayWithPix}
                                className="py-4 rounded-2xl border border-surface-200 bg-white text-surface-700 font-display font-bold flex items-center justify-center gap-2 transition-all hover:bg-surface-50 hover:border-surface-300"
                            >
                                <Zap className="w-4 h-4" />
                                Pagar com PIX
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={onOrders}
                                className="py-4 rounded-2xl text-white font-display font-bold flex items-center justify-center gap-2 shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-110"
                                style={{ backgroundColor: accentHex, boxShadow: `0 10px 24px ${accentHex}40` }}
                            >
                                <Receipt className="w-4 h-4" />
                                Acompanhar meus pedidos
                            </button>
                            {kind === 'analysis' && onRefresh ? (
                                <button
                                    type="button"
                                    onClick={onRefresh}
                                    className="py-4 rounded-2xl border border-surface-200 bg-white text-surface-700 font-display font-bold flex items-center justify-center gap-2 transition-all hover:bg-surface-50 hover:border-surface-300"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Verificar agora
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={onHome}
                                    className="py-4 rounded-2xl border border-surface-200 bg-white text-surface-700 font-display font-bold flex items-center justify-center gap-2 transition-all hover:bg-surface-50 hover:border-surface-300"
                                >
                                    <Home className="w-4 h-4" />
                                    Continuar comprando
                                </button>
                            )}
                        </>
                    )}
                </div>

                {kind === 'rejected' && (
                    <button type="button" onClick={onOrders} className="mt-4 text-xs font-semibold text-surface-400 hover:text-surface-700 transition-colors">
                        Pagar depois em Meus pedidos
                    </button>
                )}
            </div>
        </div>
    );
}
