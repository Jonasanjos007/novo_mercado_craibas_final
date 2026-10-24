import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CreditCard, Loader2, Lock, Receipt, ShieldCheck, Zap } from 'lucide-react';
import Headerpages from '../components/Headerpages';
import CardPaymentBrick from '../components/payment/CardPaymentBrick';
import PixPaymentPanel from '../components/payment/PixPaymentPanel';
import PaymentResultView from '../components/payment/PaymentResultView';
import { usePaymentController } from '../controller/usePaymentController';
import { PaymentMethodChoice } from '../models/Payment';
import { UseUserStore } from '../store/UseUserStore';
import { getColorConfig } from '../types/Colors';
import { formatPrice } from '../utils';

/** Pagamento de um pedido: PIX ou cartão (Mercado Pago), com as telas de resultado. */
export default function PaymentPage() {
    const { orderId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, NameColorGlobal } = UseUserStore();
    const accentHex = getColorConfig(NameColorGlobal).hex;

    const methodParam = searchParams.get('method');
    const initialMethod: PaymentMethodChoice | null = methodParam === 'pix' || methodParam === 'credit' ? methodParam : null;

    const Controller = usePaymentController({
        orderId: Number(orderId) || 0,
        initialMethod,
        autoStartPix: searchParams.get('auto') === '1',
    });
    const { screen, orderPayment, current, method, config } = Controller.result;
    const firstName = (user?.name ?? '').trim().split(' ')[0];

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    const pixDiscount = (config?.pixDiscountPercent ?? 0) > 0 && orderPayment && orderPayment.pix_Amount < orderPayment.card_Amount;

    return (
        <div className="min-h-screen bg-surface-50 pb-12">
            <Headerpages title="Pagamento" showSecure={false} onBack={() => navigate('/orders')} />

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">
                {screen === 'loading' && (
                    <div className="rounded-3xl bg-white border border-surface-100 shadow-soft py-20 flex flex-col items-center gap-3 text-surface-400">
                        <Loader2 className="w-7 h-7 animate-spin" style={{ color: accentHex }} />
                        <p className="text-sm font-body">Carregando o pagamento…</p>
                    </div>
                )}

                {(screen === 'approved' || screen === 'rejected' || screen === 'analysis' || screen === 'closed' || screen === 'unavailable') && (
                    <PaymentResultView
                        kind={screen}
                        accentHex={accentHex}
                        order={orderPayment}
                        current={current}
                        firstName={firstName}
                        message={screen === 'unavailable' ? Controller.result.loadError : current?.message}
                        onOrders={Controller.action.goToOrders}
                        onHome={Controller.action.goHome}
                        onRetryCard={Controller.action.retryAfterRejection}
                        onPayWithPix={Controller.action.payWithPixInstead}
                        onRefresh={Controller.action.refreshNow}
                    />
                )}

                {screen === 'choose' && orderPayment && config && (
                    <>
                        {/* ── Resumo ── */}
                        <div className="rounded-3xl bg-white border border-surface-100 shadow-soft p-5 sm:p-6 flex flex-wrap items-center gap-4 animate-fade-in">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ color: accentHex, backgroundColor: `${accentHex}14` }}>
                                <Receipt className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-surface-400">Pedido</p>
                                <p className="font-display font-bold text-surface-900 truncate">#{orderPayment.number_Order}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-surface-400">Total</p>
                                <p className="font-display font-bold text-surface-900 text-2xl">{formatPrice(Controller.result.amount)}</p>
                                {method === 'pix' && pixDiscount && (
                                    <p className="text-[11px] text-green-600 font-semibold">
                                        <span className="line-through text-surface-400 font-normal mr-1">{formatPrice(orderPayment.card_Amount)}</span>
                                        {config.pixDiscountPercent}% OFF no PIX
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ── Pagamento ── */}
                        <div className="rounded-3xl bg-white border border-surface-100 shadow-soft p-5 sm:p-6 animate-fade-in">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ color: accentHex, backgroundColor: `${accentHex}14` }}>
                                    <Lock className="w-4 h-4" />
                                </div>
                                <h2 className="font-display font-bold text-surface-900 text-lg">Como você quer pagar?</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6" role="tablist" aria-label="Forma de pagamento">
                                {([
                                    { id: 'pix', icon: <Zap className="w-5 h-5" />, label: 'PIX', sub: pixDiscount ? `${config.pixDiscountPercent}% OFF · aprovação na hora` : 'Aprovação na hora' },
                                    { id: 'credit', icon: <CreditCard className="w-5 h-5" />, label: 'Cartão', sub: config.maxInstallments > 1 ? `Crédito em até ${config.maxInstallments}x ou débito` : 'Crédito ou débito' },
                                ] as const).map(opt => {
                                    const active = method === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            role="tab"
                                            aria-selected={active}
                                            disabled={Controller.result.submittingCard}
                                            onClick={() => Controller.action.setMethod(opt.id)}
                                            className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all ${active ? '' : 'border-surface-200 hover:border-surface-300'}`}
                                            style={active ? { borderColor: accentHex, backgroundColor: `${accentHex}0D` } : undefined}
                                        >
                                            <span style={{ color: active ? accentHex : undefined }} className={active ? '' : 'text-surface-400'}>{opt.icon}</span>
                                            <span className={`font-display font-bold text-sm ${active ? 'text-surface-900' : 'text-surface-600'}`}>{opt.label}</span>
                                            <span className="text-[10px] font-body text-surface-400 text-center">{opt.sub}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {method === 'pix' ? (
                                <PixPaymentPanel
                                    accentHex={accentHex}
                                    amount={orderPayment.pix_Amount}
                                    expirationHours={config.pixExpirationHours}
                                    current={current}
                                    pixOpen={Controller.result.pixOpen}
                                    secondsLeft={Controller.result.pixSecondsLeft}
                                    creating={Controller.result.creatingPix}
                                    copied={Controller.result.copied}
                                    onGenerate={Controller.action.generatePix}
                                    onCopy={Controller.action.copyPixCode}
                                    onRefresh={Controller.action.refreshNow}
                                />
                            ) : (
                                <div className="animate-fade-in">
                                    {Controller.result.pixOpen && (
                                        <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                                            Você tem um PIX aberto para este pedido. Se pagar com cartão, o PIX é cancelado automaticamente.
                                        </p>
                                    )}
                                    <CardPaymentBrick
                                        publicKey={config.publicKey}
                                        amount={orderPayment.card_Amount}
                                        maxInstallments={config.maxInstallments}
                                        payerEmail={user?.email}
                                        accentHex={accentHex}
                                        onSubmit={Controller.action.submitCard}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-center gap-2 text-surface-400 pt-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <p className="text-xs">Pagamento processado com segurança pelo Mercado Pago · seus dados de cartão não ficam no site</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
