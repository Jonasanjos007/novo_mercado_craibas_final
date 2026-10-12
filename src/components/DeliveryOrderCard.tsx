import { useState } from 'react';
import {
    Banknote,
    CheckCircle2,
    ChevronDown,
    Clock,
    Hand,
    Loader2,
    MapPin,
    MessageCircle,
    Navigation,
    Package,
    Phone,
    ShieldCheck,
    Truck,
    UserRound,
    Undo2,
} from 'lucide-react';
import { DeliveryOrder } from '../models/Delivery';
import { formatPrice } from '../utils';
import {
    DeliveryTheme,
    addressLine,
    cityLine,
    formatRelative,
    isPaymentPending,
    mapsUrl,
    statusMeta,
    telUrl,
    whatsappUrl,
} from '../utils/delivery';

interface DeliveryOrderCardProps {
    order: DeliveryOrder;
    theme: DeliveryTheme;

    /** Mostra quem está com o pedido (tela do admin). */
    showAssignee?: boolean;
    /** Mostra o ganho do entregador. */
    showEarning?: boolean;
    /** Card do histórico (sem ações). */
    readOnly?: boolean;

    busy?: boolean;

    onDispatch?: (order: DeliveryOrder) => void;
    onDeliver?: (order: DeliveryOrder) => void;
    /** Admin: pegar o pedido para ele. */
    onTake?: (order: DeliveryOrder) => void;
    /** Admin: soltar o pedido. */
    onRelease?: (order: DeliveryOrder) => void;
}

/**
 * Card de pedido do portal de entregas.
 * Usado pelo entregador (/delivery) e pelo admin ("Minhas entregas").
 */
export default function DeliveryOrderCard({
    order,
    theme: t,
    showAssignee = false,
    showEarning = false,
    readOnly = false,
    busy = false,
    onDispatch,
    onDeliver,
    onTake,
    onRelease,
}: DeliveryOrderCardProps) {
    const [open, setOpen] = useState(false);

    const status = statusMeta(order.order_Status);
    const isPreparing = order.order_Status === 'PREPARANDO';
    const isEnRoute = order.order_Status === 'SAIU_PARA_ENTREGA';
    const payPending = isPaymentPending(order);

    const tel = telUrl(order.customerPhone);
    const whats = whatsappUrl(order.customerPhone, `Olá, ${order.customerName ?? ''}! Sou o entregador do pedido #${order.number_Order}.`);

    const lockedByOther = showAssignee && order.assigneeType !== 'NONE' && !order.isMine;

    const timeLabel = readOnly
        ? formatRelative(order.deliveredAt)
        : isEnRoute
            ? `saiu ${formatRelative(order.dispatchedAt)}`
            : `pedido ${formatRelative(order.insertDate)}`;

    return (
        <article
            className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 ${t.card} ${isEnRoute && !readOnly ? 'ring-1 ring-brand-500/25' : ''} hover:-translate-y-0.5 hover:shadow-medium`}
        >
            {/* faixa lateral com a cor do status */}
            <span className={`absolute left-0 top-0 h-full w-1 ${status.dot}`} />

            <div className="p-4 sm:p-5 pl-5 sm:pl-6">
                {/* ── topo ── */}
                <div className="flex items-start gap-3">
                    <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${readOnly
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : isEnRoute
                                ? 'bg-brand-500/15 text-brand-500'
                                : 'bg-sky-500/10 text-sky-500'
                            }`}
                    >
                        {readOnly ? <CheckCircle2 className="w-5 h-5" /> : isEnRoute ? <Truck className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-display font-bold text-base leading-none ${t.txt}`}>#{order.number_Order}</span>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${status.chip}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${isEnRoute && !readOnly ? 'animate-pulse' : ''}`} />
                                {status.label}
                            </span>
                        </div>
                        <p className={`mt-1 flex items-center gap-1 text-[11px] ${t.sub}`}>
                            <Clock className="w-3 h-3" /> {timeLabel}
                            <span className="mx-1">·</span>
                            {order.quantity} {order.quantity === 1 ? 'item' : 'itens'}
                        </p>
                    </div>

                    {showEarning && order.earning != null && (
                        <div className="text-right flex-shrink-0">
                            <p className="font-display font-bold text-sm text-emerald-500">+{formatPrice(order.earning)}</p>
                            <p className={`text-[10px] ${t.sub}`}>seu ganho</p>
                        </div>
                    )}
                </div>

                {/* ── responsável (admin) ── */}
                {showAssignee && (
                    <div className="mt-3">
                        {order.assigneeType === 'NONE' && (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold ${t.soft} ${t.txt2}`}>
                                <Hand className="w-3.5 h-3.5" /> Livre — ninguém pegou ainda
                            </span>
                        )}
                        {order.isMine && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-brand-500/10 text-brand-500">
                                <ShieldCheck className="w-3.5 h-3.5" /> Com você
                            </span>
                        )}
                        {lockedByOther && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-violet-500/10 text-violet-500">
                                <UserRound className="w-3.5 h-3.5" />
                                {isEnRoute ? 'Sendo entregue por ' : 'Com '}
                                {order.assigneeName ?? 'outro entregador'}
                            </span>
                        )}
                    </div>
                )}

                {/* ── cliente e endereço ── */}
                <div className={`mt-4 rounded-2xl p-3.5 ${t.soft}`}>
                    <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                            <p className={`text-sm font-semibold leading-snug ${t.txt}`}>{addressLine(order.address)}</p>
                            <p className={`text-xs mt-0.5 ${t.txt2}`}>
                                {cityLine(order.address)}
                                {order.address?.supplement ? ` · ${order.address.supplement}` : ''}
                            </p>
                            {order.address?.referencePoint && (
                                <p className="text-[11px] mt-1.5 text-amber-500">
                                    Referência: {order.address.referencePoint}
                                </p>
                            )}
                            <p className={`text-xs mt-2 flex items-center gap-1.5 ${t.txt2}`}>
                                <UserRound className="w-3.5 h-3.5" />
                                <span className="truncate">{order.customerName ?? 'Cliente'}</span>
                                {order.customerPhone && <span className={t.sub}>· {order.customerPhone}</span>}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── pagamento ── */}
                {!readOnly && (
                    <div
                        className={`mt-3 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-semibold border ${payPending
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                            }`}
                    >
                        <Banknote className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1">
                            {payPending ? 'Cobrar na entrega' : 'Pagamento confirmado'}
                            {order.payment_terms ? ` · ${order.payment_terms}` : ''}
                        </span>
                        <span className="font-display font-bold text-sm">{formatPrice(order.total_Value_Order)}</span>
                    </div>
                )}

                {readOnly && order.whoReceivedIt && (
                    <p className={`mt-3 text-xs flex items-center gap-1.5 ${t.txt2}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Recebido por <strong className={t.txt}>{order.whoReceivedIt}</strong>
                    </p>
                )}

                {/* ── itens ── */}
                {order.items?.length > 0 && (
                    <div className="mt-3">
                        <button
                            type="button"
                            onClick={() => setOpen((v) => !v)}
                            className={`w-full flex items-center justify-between text-xs font-semibold ${t.txt2}`}
                        >
                            <span>Conferir itens ({order.items.length})</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                        </button>

                        {open && (
                            <ul className={`mt-2 rounded-2xl border divide-y overflow-hidden animate-fade-in ${t.bord} ${t.divide}`}>
                                {order.items.map((item, index) => (
                                    <li key={index} className="flex items-center gap-3 px-3.5 py-2.5">
                                        <span className="w-7 h-7 rounded-lg bg-brand-500/10 text-brand-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                            {item.quantity}x
                                        </span>
                                        <div className="min-w-0">
                                            <p className={`text-xs font-semibold truncate ${t.txt}`}>{item.name}</p>
                                            {item.variation && <p className={`text-[11px] ${t.sub}`}>{item.variation}</p>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* ── ações ── */}
                {!readOnly && (
                    <div className="mt-4 space-y-2">
                        {!lockedByOther && (order.isMine || !showAssignee) && (
                            <div className="grid grid-cols-3 gap-2">
                                <a
                                    href={tel ?? undefined}
                                    aria-disabled={!tel}
                                    className={`flex items-center justify-center gap-1.5 h-10 rounded-xl border text-xs font-bold transition ${t.ghostBtn} ${!tel ? 'opacity-40 pointer-events-none' : ''}`}
                                >
                                    <Phone className="w-3.5 h-3.5" /> Ligar
                                </a>
                                <a
                                    href={whats ?? undefined}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-disabled={!whats}
                                    className={`flex items-center justify-center gap-1.5 h-10 rounded-xl border text-xs font-bold transition ${t.ghostBtn} ${!whats ? 'opacity-40 pointer-events-none' : ''}`}
                                >
                                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                </a>
                                <a
                                    href={mapsUrl(order.address)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 transition"
                                >
                                    <Navigation className="w-3.5 h-3.5" /> Rota
                                </a>
                            </div>
                        )}

                        {/* Admin: pedido livre ou com outra pessoa */}
                        {showAssignee && !order.isMine && onTake && (
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => onTake(order)}
                                className={`w-full h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-60 ${lockedByOther
                                    ? `border ${t.ghostBtn}`
                                    : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand'
                                    }`}
                            >
                                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hand className="w-4 h-4" />}
                                {lockedByOther ? 'Assumir este pedido' : 'Eu vou entregar'}
                            </button>
                        )}

                        {(order.isMine || !showAssignee) && isPreparing && onDispatch && (
                            <div className="flex gap-2">
                                {showAssignee && onRelease && (
                                    <button
                                        type="button"
                                        disabled={busy}
                                        onClick={() => onRelease(order)}
                                        title="Soltar pedido"
                                        className={`h-12 w-12 flex-shrink-0 rounded-2xl border flex items-center justify-center transition disabled:opacity-60 ${t.ghostBtn}`}
                                    >
                                        <Undo2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => onDispatch(order)}
                                    className="flex-1 h-12 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-brand transition active:scale-[0.99] disabled:opacity-60"
                                >
                                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                                    Saiu para entrega
                                </button>
                            </div>
                        )}

                        {(order.isMine || !showAssignee) && isEnRoute && onDeliver && (
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => onDeliver(order)}
                                className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition active:scale-[0.99] disabled:opacity-60"
                            >
                                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Confirmar entrega
                            </button>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}
