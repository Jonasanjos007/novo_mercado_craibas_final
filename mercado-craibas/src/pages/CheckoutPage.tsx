import { useState } from 'react';
import { CreditCard, Smartphone, FileText, ChevronRight, Check, MapPin, ShoppingBag, Zap, ArrowLeft, Lock } from 'lucide-react';
import { useStore } from '../context/store';
import { formatPrice } from '../utils';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

type PaymentMethod = 'pix' | 'credit' | 'boleto';
type Step = 'address' | 'payment' | 'review' | 'success';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, placeOrder, navigateTo, setCartOpen, user } = useStore();
  const [step, setStep] = useState<Step>('address');
  const [payment, setPayment] = useState<PaymentMethod>('pix');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [address, setAddress] = useState({
    zipCode: user?.address?.zipCode || '57465-000',
    street: user?.address?.street || 'Rua das Flores',
    number: user?.address?.number || '123',
    complement: user?.address?.complement || '',
    neighborhood: user?.address?.neighborhood || 'Centro',
    city: user?.address?.city || 'Craibas',
    state: user?.address?.state || 'AL',
  });
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);

  const total = cartTotal();
  const shipping = total >= 299 ? 0 : 19.99;
  const paymentDiscount = payment === 'pix' ? total * 0.05 : 0;
  const finalTotal = total + shipping - paymentDiscount - discount;

  const STEPS = ['address', 'payment', 'review'];
  const stepLabels = { address: 'Endereço', payment: 'Pagamento', review: 'Revisão' };
  const currentStepIdx = STEPS.indexOf(step);

  const handlePlaceOrder = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const payLabel = payment === 'pix' ? 'PIX' : payment === 'credit' ? `Cartão •••• ${cardData.number.slice(-4) || '4242'}` : 'Boleto Bancário';
    const placed = placeOrder(payLabel);
    setOrder(placed);
    setStep('success');
    setLoading(false);
  };

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'TECH15') setDiscount(total * 0.15);
    else if (coupon.toUpperCase() === 'STANLEY10') setDiscount(total * 0.10);
    else if (coupon.toUpperCase() === 'BEMVINDO20') setDiscount(total * 0.20);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    if (cart.length === 0) {
      navigate('/');
      setCartOpen(false);
    }
  }, [user, navigate, cart]);

  if (step === 'success' && order) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg text-center animate-slide-up">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <Check className="w-12 h-12 text-green-500" />
            <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-30" />
          </div>
          <h1 className="font-display font-bold text-surface-900 text-3xl mb-2">Pedido Confirmado! 🎉</h1>
          <p className="text-surface-500 font-body mb-1">Pedido <strong className="text-surface-800">#{order.id}</strong> realizado com sucesso</p>
          <p className="text-surface-400 font-body text-sm mb-8">Você receberá atualizações por email sobre sua entrega</p>

          <div className="bg-white rounded-3xl p-6 shadow-soft mb-6 text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-surface-500 font-body text-sm">Total pago</span>
              <span className="font-display font-bold text-surface-900">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500 font-body text-sm">Pagamento</span>
              <span className="font-body text-surface-700 text-sm">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500 font-body text-sm">Rastreio</span>
              <span className="font-display font-semibold text-brand-600 text-sm">{order.trackingCode}</span>
            </div>
            <div className="pt-3 border-t border-surface-100">
              <p className="text-surface-500 font-body text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {order.address.street}, {order.address.number} · {order.address.city}/{order.address.state}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate('/orders')} className="flex-1 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-display font-bold rounded-xl transition-all shadow-brand">
              Ver Pedidos
            </button>
            <button onClick={() => navigate('/')} className="flex-1 py-3.5 bg-surface-100 hover:bg-surface-200 text-surface-700 font-display font-bold rounded-xl transition-all">
              Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 pb-10">
      <div className="bg-white border-b border-surface-100 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigateTo('home')} className="text-surface-400 hover:text-surface-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display font-bold text-surface-900 text-xl">Checkout</h1>
            <Lock className="w-4 h-4 text-green-500 ml-auto" />
            <span className="text-xs text-green-600 font-body">Compra Segura</span>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className={`flex items-center gap-2 ${i <= currentStepIdx ? 'text-brand-600' : 'text-surface-300'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold transition-all ${i < currentStepIdx ? 'bg-brand-500 text-white' : i === currentStepIdx ? 'bg-brand-500 text-white ring-4 ring-brand-100' : 'bg-surface-200 text-surface-400'}`}>
                    {i < currentStepIdx ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-xs font-body font-medium hidden sm:block ${i === currentStepIdx ? 'text-brand-600' : i < currentStepIdx ? 'text-surface-500' : 'text-surface-300'}`}>
                    {stepLabels[s as keyof typeof stepLabels]}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full mx-2 ${i < currentStepIdx ? 'bg-brand-400' : 'bg-surface-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Address Step */}
          {step === 'address' && (
            <div className="bg-white rounded-3xl p-6 shadow-soft animate-fade-in">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-brand-500" />
                </div>
                <h2 className="font-display font-bold text-surface-900 text-lg">Endereço de Entrega</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">CEP</label>
                  <input value={address.zipCode} onChange={e => setAddress({ ...address, zipCode: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 border-surface-200 rounded-xl font-body text-sm focus:outline-none focus:border-brand-400 transition-colors" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">Rua</label>
                  <input value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 border-surface-200 rounded-xl font-body text-sm focus:outline-none focus:border-brand-400 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">Número</label>
                  <input value={address.number} onChange={e => setAddress({ ...address, number: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 border-surface-200 rounded-xl font-body text-sm focus:outline-none focus:border-brand-400 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">Complemento</label>
                  <input value={address.complement} onChange={e => setAddress({ ...address, complement: e.target.value })}
                    placeholder="Apto, sala..." className="w-full px-3 py-2.5 border-2 border-surface-200 rounded-xl font-body text-sm focus:outline-none focus:border-brand-400 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">Bairro</label>
                  <input value={address.neighborhood} onChange={e => setAddress({ ...address, neighborhood: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 border-surface-200 rounded-xl font-body text-sm focus:outline-none focus:border-brand-400 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">Cidade</label>
                  <input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 border-surface-200 rounded-xl font-body text-sm focus:outline-none focus:border-brand-400 transition-colors" />
                </div>
              </div>
              <button onClick={() => setStep('payment')} className="w-full mt-5 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-display font-bold rounded-xl transition-all shadow-brand flex items-center justify-center gap-2">
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <div className="bg-white rounded-3xl p-6 shadow-soft animate-fade-in">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-brand-500" />
                </div>
                <h2 className="font-display font-bold text-surface-900 text-lg">Forma de Pagamento</h2>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {([
                  { id: 'pix', icon: <Zap className="w-5 h-5" />, label: 'PIX', sub: '5% OFF', accent: 'green' },
                  { id: 'credit', icon: <CreditCard className="w-5 h-5" />, label: 'Cartão', sub: 'Parcelado', accent: 'blue' },
                  { id: 'boleto', icon: <FileText className="w-5 h-5" />, label: 'Boleto', sub: 'À vista', accent: 'gray' },
                ] as const).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setPayment(opt.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${payment === opt.id ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:border-surface-300'}`}
                  >
                    <div className={`${payment === opt.id ? 'text-brand-600' : 'text-surface-400'}`}>{opt.icon}</div>
                    <span className={`font-display font-bold text-sm ${payment === opt.id ? 'text-brand-700' : 'text-surface-600'}`}>{opt.label}</span>
                    <span className={`text-[10px] font-body ${opt.id === 'pix' ? 'text-green-600 font-semibold' : 'text-surface-400'}`}>{opt.sub}</span>
                  </button>
                ))}
              </div>

              {payment === 'pix' && (
                <div className="p-5 bg-green-50 rounded-2xl border border-green-200 text-center animate-fade-in">
                  <div className="w-32 h-32 bg-white rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-soft">
                    <div className="grid grid-cols-5 gap-0.5">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className={`w-4 h-4 rounded-sm ${Math.random() > 0.5 ? 'bg-surface-900' : 'bg-white'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="font-display font-bold text-green-700 text-lg">{formatPrice(finalTotal)}</p>
                  <p className="text-green-600 font-body text-sm mt-1">Escaneie o QR Code ou copie a chave PIX</p>
                  <div className="mt-3 flex items-center gap-2 bg-white rounded-xl p-2 border border-green-200">
                    <span className="flex-1 text-xs text-surface-500 font-body truncate">00020126580014br.gov.bcb.pix0136...</span>
                    <button className="px-3 py-1 bg-green-500 text-white text-xs font-display font-bold rounded-lg">Copiar</button>
                  </div>
                </div>
              )}

              {payment === 'credit' && (
                <div className="space-y-3 animate-fade-in">
                  <div>
                    <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">Número do cartão</label>
                    <input value={cardData.number} onChange={e => setCardData({ ...cardData, number: e.target.value })}
                      placeholder="0000 0000 0000 0000" maxLength={19}
                      className="w-full px-3 py-2.5 border-2 border-surface-200 rounded-xl font-body text-sm focus:outline-none focus:border-brand-400 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">Nome no cartão</label>
                    <input value={cardData.name} onChange={e => setCardData({ ...cardData, name: e.target.value })}
                      placeholder="JOÃO SILVA"
                      className="w-full px-3 py-2.5 border-2 border-surface-200 rounded-xl font-body text-sm focus:outline-none focus:border-brand-400 transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">Validade</label>
                      <input value={cardData.expiry} onChange={e => setCardData({ ...cardData, expiry: e.target.value })}
                        placeholder="MM/AA" maxLength={5}
                        className="w-full px-3 py-2.5 border-2 border-surface-200 rounded-xl font-body text-sm focus:outline-none focus:border-brand-400 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">CVV</label>
                      <input value={cardData.cvv} onChange={e => setCardData({ ...cardData, cvv: e.target.value })}
                        placeholder="123" maxLength={3}
                        className="w-full px-3 py-2.5 border-2 border-surface-200 rounded-xl font-body text-sm focus:outline-none focus:border-brand-400 transition-colors" />
                    </div>
                  </div>
                </div>
              )}

              {payment === 'boleto' && (
                <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 animate-fade-in">
                  <p className="text-sm font-body text-surface-600">O boleto será gerado após confirmar o pedido. Vencimento em 3 dias úteis.</p>
                </div>
              )}

              {/* Coupon */}
              <div className="mt-4">
                <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">Cupom de desconto</label>
                <div className="flex gap-2">
                  <input value={coupon} onChange={e => setCoupon(e.target.value)}
                    placeholder="BEMVINDO20"
                    className="flex-1 px-3 py-2.5 border-2 border-surface-200 rounded-xl font-body text-sm focus:outline-none focus:border-brand-400 transition-colors uppercase" />
                  <button onClick={applyCoupon} className="px-4 py-2.5 bg-surface-900 text-white font-display font-bold rounded-xl text-sm hover:bg-surface-800 transition-colors">
                    Aplicar
                  </button>
                </div>
                {discount > 0 && <p className="text-xs text-green-600 font-body mt-1.5 font-semibold">✓ Cupom aplicado! Desconto de {formatPrice(discount)}</p>}
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setStep('address')} className="px-4 py-3 bg-surface-100 text-surface-600 font-display font-bold rounded-xl hover:bg-surface-200 transition-all text-sm">
                  ← Voltar
                </button>
                <button onClick={() => setStep('review')} className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-display font-bold rounded-xl transition-all shadow-brand flex items-center justify-center gap-2">
                  Revisar Pedido <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <div className="bg-white rounded-3xl p-6 shadow-soft animate-fade-in">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-brand-500" />
                </div>
                <h2 className="font-display font-bold text-surface-900 text-lg">Revisão do Pedido</h2>
              </div>

              <div className="space-y-3 mb-5">
                {cart.map(item => (
                  <div key={item.product.id} className="flex gap-3 p-3 bg-surface-50 rounded-xl">
                    <img src={item.product.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-surface-800 font-medium line-clamp-1">{item.product.name}</p>
                      {item.selectedVariation && <p className="text-xs text-surface-400 font-body">{item.selectedVariation.value}</p>}
                      <p className="text-xs text-surface-500 font-body mt-0.5">Qtd: {item.quantity}</p>
                    </div>
                    <p className="font-display font-bold text-surface-900 text-sm shrink-0">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-surface-50 rounded-xl mb-5">
                <p className="text-xs font-display font-semibold text-surface-500 mb-1">ENTREGA EM</p>
                <p className="text-sm font-body text-surface-800">{address.street}, {address.number} · {address.neighborhood}</p>
                <p className="text-sm font-body text-surface-500">{address.city}/{address.state} · {address.zipCode}</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('payment')} className="px-4 py-3 bg-surface-100 text-surface-600 font-display font-bold rounded-xl hover:bg-surface-200 transition-all text-sm">
                  ← Voltar
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="flex-1 py-3.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-display font-bold rounded-xl transition-all shadow-brand flex items-center justify-center gap-2"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Confirmar Pedido</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-soft">
            <h3 className="font-display font-bold text-surface-900 text-base mb-4">Resumo</h3>
            <div className="space-y-2 text-sm font-body">
              <div className="flex justify-between text-surface-500">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} itens)</span>
                <span className="font-semibold text-surface-800">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-surface-500">
                <span>Frete</span>
                <span className={shipping === 0 ? 'text-green-600 font-semibold' : 'font-semibold text-surface-800'}>
                  {shipping === 0 ? 'Grátis' : formatPrice(shipping)}
                </span>
              </div>
              {paymentDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto PIX (5%)</span>
                  <span className="font-semibold">-{formatPrice(paymentDiscount)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Cupom</span>
                  <span className="font-semibold">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="border-t border-surface-100 pt-2 mt-2 flex justify-between items-center">
                <span className="font-display font-bold text-surface-900">Total</span>
                <span className="font-display font-bold text-surface-900 text-xl">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
            <div className="flex items-center gap-2 text-green-700">
              <Lock className="w-4 h-4 shrink-0" />
              <p className="text-xs font-body">Seus dados estão protegidos com criptografia SSL de 256 bits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
