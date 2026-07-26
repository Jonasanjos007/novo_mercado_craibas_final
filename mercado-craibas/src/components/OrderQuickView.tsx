import { useEffect } from 'react';
import { X, MapPin, CreditCard, Package, Calendar, Truck, ShoppingBag, Star } from 'lucide-react';
import { formatPrice, orderStatusLabels, orderStatusColors, badgeLabels } from '../utils';
import { useStore } from '../context/store';
import { Order } from '../models/OrderSave';

interface OrderQuickViewProps {
    order: Order | null;
    onClose: () => void;
}

export const OrderQuickView = ({ order, onClose }: OrderQuickViewProps) => {
    const { darkMode } = useStore();

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    if (!order) return null;

    // ── tema ──
    const dk = darkMode;
    const card = dk ? 'bg-[#0d0d14] border-white/[0.06]' : 'bg-white border-surface-200';
    const txt = dk ? 'text-white' : 'text-surface-900';
    const txt2 = dk ? 'text-white/60' : 'text-surface-500';
    const sub = dk ? 'text-white/35' : 'text-surface-400';
    const surf = dk ? 'bg-white/[0.04]' : 'bg-surface-50';
    const bord = dk ? 'border-white/[0.08]' : 'border-surface-200';
    const btnGhost = dk ? 'bg-white/[0.06] text-white/70 hover:bg-white/[0.10]' : 'bg-white text-surface-400 shadow-medium';
    const rowDivide = dk ? 'divide-white/[0.06]' : 'divide-surface-100';

    const discountValue = order.origin_Price ? order.origin_Price - order.total_Value_Order : order.discont;
    const hasDiscount = !!discountValue && discountValue > 0;

    const infoBlocks = [
        {
            icon: <CreditCard className="w-4 h-4 text-brand-400" />,
            label: 'Pagamento',
            value: order.payment_terms,
        },
        {
            icon: <Package className="w-4 h-4 text-brand-400" />,
            label: 'Status do Pagamento',
            value: order.status_Pay,
        },
        {
            icon: <Calendar className="w-4 h-4 text-brand-400" />,
            label: 'Data do Pedido',
            value: new Date(order.insertDate).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
            }),
        },
        {
            icon: <Truck className="w-4 h-4 text-brand-400" />,
            label: 'Previsão de Entrega',
            value: order.estimated_Delivery_Date
                ? new Date(order.estimated_Delivery_Date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : '—',
        },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className={`relative w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl border ${card}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* alça de arrastar — só mobile */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                    <div className={`w-10 h-1.5 rounded-full ${dk ? 'bg-white/15' : 'bg-surface-200'}`} />
                </div>

                {/* Header */}
                <div
                    className={`sticky top-0 z-10 flex items-start justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b backdrop-blur-xl ${bord} ${dk ? "bg-[#0d0d14]/90" : "bg-white/90"
                        }`}
                >
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                                <ShoppingBag className="w-4 h-4 text-brand-400" />
                            </div>

                            <div className="min-w-0">
                                <h2 className={`font-display font-black text-base sm:text-lg truncate ${txt}`}>
                                    Pedido #{order.number_Order}
                                </h2>

                                <div className="mt-1 flex items-center gap-2 flex-wrap">
                                    <p className={`text-xs ${sub}`}>
                                        {order.quantity} itens · {formatPrice(order.total_Value_Order)}
                                    </p>

                                    <span
                                        className={`inline-flex text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full border whitespace-nowrap ${orderStatusColors[order.order_Status]}`}
                                    >
                                        {orderStatusLabels[order.order_Status]}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0 ${btnGhost}`}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 p-4 sm:p-6">
                    {/* Produtos */}
                    <div className="lg:col-span-2 space-y-3">
                        <h3 className={`font-display font-bold text-sm uppercase tracking-wide ${sub}`}>
                            Produtos ({order.products.length})
                        </h3>
                        <div className={`rounded-2xl border divide-y ${bord} ${rowDivide}`}>
                            {order.products.map((item, i) => {
                                const hasPromo = item.origin_Price && item.origin_Price > item.price_Unic;
                                return (
                                    <div key={i} className="flex items-start gap-3 p-3 sm:p-4">
                                        <img
                                            src={`/Imagens/Produtos/${item.imagens?.[0]?.url_Imagem}`}
                                            alt={item.name}
                                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-white/10 flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className={`font-bold text-sm truncate ${txt}`}>{item.name}</p>
                                                    <p className={`text-xs mt-0.5 capitalize ${sub}`}>{item.category || 'Sem categoria'}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-brand-400 font-bold text-sm whitespace-nowrap">{formatPrice(item.price_Unic)}</p>
                                                    {hasPromo && (
                                                        <p className={`text-[10px] line-through ${sub}`}>{formatPrice(item.origin_Price!)}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${dk ? 'bg-white/[0.06] text-white/60' : 'bg-surface-100 text-surface-500'}`}>
                                                    Qtd: {item.quantity}
                                                </span>
                                                {item.freeShipping && (
                                                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        Frete grátis
                                                    </span>
                                                )}
                                                {item.badge && (
                                                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                                                        {badgeLabels[item.badge] || item.badge}
                                                    </span>
                                                )}
                                                {item.Count_Rating !== undefined && (
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${dk ? 'bg-white/[0.06] text-white/60' : 'bg-surface-100 text-surface-500'}`}>
                                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {item.Count_Rating}
                                                    </span>
                                                )}
                                                {item.variations && (
                                                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                        {item.variations.name}: {item.variations.value}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Endereço */}
                        <h3 className={`font-display font-bold text-sm uppercase tracking-wide pt-2 ${sub}`}>Endereço de Entrega</h3>
                        <div className={`rounded-2xl border p-4 flex items-start gap-3 ${bord} ${surf}`}>
                            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-4 h-4 text-brand-400" />
                            </div>
                            <div className="min-w-0">
                                <p className={`text-sm font-semibold ${txt}`}>
                                    {order.address?.road}, {order.address?.number}
                                    {order.address?.supplement && ` — ${order.address.supplement}`}
                                </p>
                                <p className={`text-xs mt-1 ${sub}`}>
                                    {order.address?.neighborhood} · {order.address?.city}
                                    {order.address?.state && ` - ${order.address.state}`}
                                    {order.address?.referencePoint && ` · CEP ${order.address.referencePoint}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Resumo */}
                    <div className="space-y-3">
                        <h3 className={`font-display font-bold text-sm uppercase tracking-wide ${sub}`}>Resumo</h3>
                        <div className={`rounded-2xl border p-4 space-y-3 ${bord} ${surf}`}>
                            <div className="flex items-center justify-between">
                                <span className={`text-xs ${txt2}`}>Subtotal</span>
                                <span className={`text-sm font-semibold ${txt}`}>
                                    {formatPrice(order.origin_Price ?? order.total_Value_Order)}
                                </span>
                            </div>
                            {hasDiscount && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-rose-400">Desconto</span>
                                    <span className="text-sm font-semibold text-rose-400">-{formatPrice(discountValue)}</span>
                                </div>
                            )}
                            <div className={`flex items-center justify-between pt-3 border-t ${bord}`}>
                                <span className={`text-sm font-bold ${txt}`}>Total</span>
                                <span className="text-lg font-black text-brand-400">{formatPrice(order.total_Value_Order)}</span>
                            </div>
                        </div>

                        <div className={`rounded-2xl border divide-y ${bord} ${rowDivide}`}>
                            {infoBlocks.map((b, i) => (
                                <div key={i} className="flex items-start gap-3 p-4">
                                    <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                                        {b.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-[10px] font-bold uppercase tracking-wider ${sub}`}>{b.label}</p>
                                        <p className={`text-sm font-semibold mt-0.5 ${txt}`}>{b.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderQuickView;
