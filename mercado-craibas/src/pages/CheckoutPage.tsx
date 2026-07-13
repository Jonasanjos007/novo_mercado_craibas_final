import { useState } from 'react';
import { CreditCard, Smartphone, FileText, ChevronRight, Check, MapPin, ShoppingBag, Zap, ArrowLeft, Lock, Pencil, Ticket, X, BadgeCheck, Package, Truck, Mail } from 'lucide-react';
import { useStore } from '../context/store';
import { formatPrice } from '../utils';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Headerpages from '../components/Headerpages';
import { UseUserStore } from '../store/UseUserStore';
import { UseAddressStore } from '../store/UseAddressStore';
import { UseCartStore } from '../store/UseCartStore';
import { UseRouteStore } from '../store/UseRouteStore';
import { getColorConfig } from '../types/Colors';
import { toast } from 'react-hot-toast';
import Loading from '../components/Loading';
import { useCheckoutController } from '../controller/useCheckoutController';
import { UseOrderStore } from '../store/UseOrderStore';
import { Cupom } from '../models/Cupom';
import AlertPopup from '../components/AlertPopup';


export default function CheckoutPage() {
  const Controller = useCheckoutController();
  const navigate = useNavigate();
  const { placeOrder } = useStore();
  const { setCartOpen } = UseCartStore();
  const { navigateTo } = UseRouteStore();
  const { cart } = UseCartStore();
  const { address } = UseAddressStore();
  const { Cupons } = UseOrderStore();
  const { user, ColorGlobalTema, ColorGlobalText, ColorGlobalHoverText, NameColorGlobal } = UseUserStore();
  const [selectedAddress, setSelectedAddress] = useState(true);
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [coupon, setCoupon] = useState('');
  const colorConfig = getColorConfig(NameColorGlobal);
  const [openCouponModal, setOpenCouponModal] = useState(false);
  const [OpenAlert, setOpenAlert] = useState(false);
  const [selectedCouponTed, setSelectedCouponTed] = useState<Cupom | null>(null);

  const STEPS = ['Endereço', 'Checkout', 'Pagamento'];
  const stepLabels: Record<string, string> = {
    'Endereço': 'Endereço',
    'Checkout': 'Revisão',
    'Pagamento': 'Pagamento',
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return "";

    const numbers = phone.replace(/\D/g, "");

    if (numbers.length === 11) {
      return numbers.replace(/(\d{2}c)(\d{5})(\d{4})/, "($1) $2-$3");
    }
    if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return phone;
  };
  const currentStepIdx = STEPS.indexOf(Controller?.result.step);
  const handlePlaceOrder = async () => {
    // setLoading(true);
    await new Promise(r => setTimeout(r, 1500));


    // const payLabel = Controller?.result.payment === 'pix' ? 'PIX' : Controller?.result.payment === 'credit' ? `Cartão •••• ${cardData.number.slice(-4) || '4242'}` : 'Boleto Bancário';
    // const placed = placeOrder(payLabel);
    // setOrder(placed);
    //setStep('success');
    // setLoading(false);
  };

  // const applyCoupon = () => {

  //   const Cupom =
  //       if(coupon.toUpperCase() === 'TECH15') setDiscount(total * 0.15);
  //   else if (coupon.toUpperCase() === 'STANLEY10') setDiscount(total * 0.10);
  //   else if (coupon.toUpperCase() === 'BEMVINDO20') setDiscount(total * 0.20);
  // };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    if (cart.length === 0) {
      setOpenAlert(true);
    }
    // if (cart.length === 0) {
    //   navigate('/');
    //   setCartOpen(false);
    // }
  }, [user, navigate, cart]);
  console.log(Controller?.result.order, 'Controller?.result.order');
  if (Controller?.result.step === "success") {
    const order = Controller?.result.order;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center px-4 py-8">

        <div className="w-full max-w-3xl">

          <div className="overflow-hidden rounded-[32px] bg-white shadow-2xl border border-slate-200">

            {/* HEADER */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500">

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.25),transparent_45%)]" />
              <div className="absolute -left-20 -bottom-20 w-60 h-60 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -right-20 top-0 w-72 h-72 rounded-full bg-black/10 blur-3xl" />

              <div className="relative px-6 md:px-10 py-12 flex flex-col items-center">

                <div className="relative">

                  <div className="absolute inset-0 rounded-full bg-white/40 animate-ping" />

                  <div className="relative w-24 h-24 rounded-full bg-white shadow-2xl flex items-center justify-center">

                    <Check
                      className="w-12 h-12 text-green-500"
                      strokeWidth={3}
                    />

                  </div>

                </div>

                <h1 className="mt-6 text-white font-display text-3xl md:text-4xl font-bold text-center">
                  Pedido Confirmado 🎉
                </h1>

                <p className="text-green-100 mt-3 text-center max-w-lg">
                  Seu pagamento foi aprovado e seu pedido já entrou em nosso
                  processo de separação.
                </p>

              </div>

            </div>

            {/* BODY */}
            <div className="p-6 md:p-10">

              {/* TOTAL */}
              <div className="text-center">

                <p className="uppercase tracking-[0.25em] text-slate-400 text-xs font-semibold">
                  Total Pago
                </p>

                <h2 className="text-4xl md:text-5xl font-black text-emerald-500 mt-2">
                  {formatPrice(order?.total_Value_Order || 0)}
                </h2>

                <p className="text-slate-500 mt-3">
                  Pedido #
                  <span className="font-bold text-slate-700">
                    {5465465465}
                  </span>
                </p>

              </div>

              {/* CARDS */}
              <div className="grid md:grid-cols-2 gap-5 mt-10">

                <div className="rounded-3xl bg-slate-50 p-6 border border-slate-200">

                  <CreditCard className="w-8 h-8 text-brand-500 mb-4" />

                  <p className="text-slate-400 text-sm">
                    Forma de pagamento
                  </p>

                  <h3 className="font-bold text-lg text-slate-800 mt-1">
                    {order?.payment_terms}
                  </h3>

                </div>

                <div className="rounded-3xl bg-green-50 p-6 border border-green-200">

                  <BadgeCheck className="w-8 h-8 text-green-500 mb-4" />

                  <p className="text-slate-400 text-sm">
                    Status
                  </p>

                  <h3 className="font-bold text-green-700 mt-1">
                    Pagamento Aprovado
                  </h3>

                </div>

              </div>

              {/* ENDEREÇO */}
              <div className="mt-6 rounded-3xl border border-slate-200 p-6">

                <div className="flex items-center gap-3 mb-5">

                  <MapPin className="w-6 h-6 text-brand-500" />

                  <h2 className="font-display font-bold text-xl">
                    Endereço de Entrega
                  </h2>

                </div>

                <div className="space-y-1 text-slate-600">

                  <p>
                    {order?.address?.road}, {order?.address?.number}
                  </p>

                  <p>
                    {order?.address?.neighborhood}
                  </p>

                  <p>
                    {order?.address?.city} - {order?.address?.state}
                  </p>

                  <p>
                    CEP {order?.address?.neighborhood}
                  </p>

                </div>

              </div>

              {/* TIMELINE */}
              <div className="mt-10">

                <h2 className="font-display font-bold text-xl text-center mb-8">
                  Acompanhamento do Pedido
                </h2>

                <div className="flex items-center justify-between">

                  <div className="flex flex-col items-center w-24">

                    <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                      <Check className="text-white w-7 h-7" />
                    </div>

                    <span className="mt-3 text-sm font-semibold text-center">
                      Pagamento
                    </span>

                  </div>

                  <div className="flex-1 h-1 bg-green-300 mx-2 rounded-full" />

                  <div className="flex flex-col items-center w-24">

                    <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center">
                      <Package className="w-6 h-6 text-slate-500" />
                    </div>

                    <span className="mt-3 text-sm text-center">
                      Separação
                    </span>

                  </div>

                  <div className="flex-1 h-1 bg-slate-200 mx-2 rounded-full" />

                  <div className="flex flex-col items-center w-24">

                    <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-slate-500" />
                    </div>

                    <span className="mt-3 text-sm text-center">
                      Envio
                    </span>

                  </div>

                </div>

              </div>

              {/* AVISO */}
              <div className="mt-10 rounded-3xl bg-blue-50 border border-blue-200 p-6">

                <div className="flex gap-4">

                  <Mail className="w-8 h-8 text-blue-500 flex-shrink-0" />

                  <div>

                    <h3 className="font-bold text-slate-800">
                      Confirmação enviada
                    </h3>

                    <p className="text-slate-500 mt-1">
                      Enviamos um e-mail com todas as informações do seu pedido.
                      Você também poderá acompanhar tudo na área de pedidos.
                    </p>

                  </div>

                </div>

              </div>

              {/* BOTÕES */}
              <div className="grid sm:grid-cols-2 gap-4 mt-10">

                <button
                  onClick={() => navigate("/orders")}
                  className="h-14 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-xl transition-all hover:scale-[1.02]"
                >
                  Ver meus pedidos
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="h-14 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 font-semibold text-slate-700 transition-all"
                >
                  Continuar Comprando
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }
  return (

    <div className="min-h-screen bg-surface-50 pb-10">
      <Headerpages title={`${Controller?.result.step}`} showSecure={false} />
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
                <div className={`flex items-center gap-2 ${i <= currentStepIdx ? `${ColorGlobalText}` : 'text-surface-300'}`}>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold transition-all duration-300 ${i < currentStepIdx
                      ? 'bg-green-700 text-white'
                      : i === currentStepIdx
                        ? `${ColorGlobalTema} text-white animate-pulse scale-110`
                        : 'bg-surface-200 text-surface-400'
                      }`}
                    style={
                      i === currentStepIdx
                        ? { boxShadow: `0 0 0 4px ${colorConfig.hex}66` }
                        : {}
                    }
                  >
                    {i < currentStepIdx ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-xs font-body font-medium hidden sm:block ${i === currentStepIdx ? `${ColorGlobalText}` : i < currentStepIdx ? 'text-surface-500' : 'text-surface-300'}`}>
                    {stepLabels[s as keyof typeof stepLabels]}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full mx-2 ${i < currentStepIdx ? `bg-green-700` : 'bg-surface-200'}`} />
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
          {Controller?.result.step === 'Endereço' && (
            <div className="bg-white rounded-3xl p-6 shadow-soft animate-fade-in">
              <div className="flex items-center gap-2 mb-5">
                <div className={`w-8 h-8 rounded-xl ${ColorGlobalTema.slice(0, -3)}50 flex items-center justify-center`}>
                  <MapPin className={`w-4 h-4 ${ColorGlobalText}`} />
                </div>
                <h2 className="font-display font-bold text-surface-900 text-lg">
                  Escolha a forma de entrega
                </h2>
              </div>
              {Controller?.result.AddressStandard ? (
                <div
                  onClick={() => {
                    setSelectedAddress(true);
                  }}
                  className={`cursor-pointer rounded-2xl p-4 mb-3 transition-all border-2 ${selectedAddress
                    ? `border-${ColorGlobalTema.slice(3)} bg-brand-50/30`
                    : 'border-surface-200 hover:border-brand-200'
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Radio */}
                      <div
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddress
                          ? ColorGlobalTema
                          : 'border-surface-300'
                          }`}
                      >
                        {selectedAddress && (
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${ColorGlobalTema}`}
                          />
                        )}
                      </div>

                      <div>
                        <p className="font-display font-semibold text-surface-900 text-sm flex items-center gap-2">
                          Enviar para o endereço

                        </p>

                        <div className="space-y-1">

                          {/* Nome e telefone */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-surface-900">
                              {Controller?.result.AddressStandard?.name}
                            </span>

                            {Controller?.result.AddressStandard?.phone && (
                              <>
                                <span className="text-surface-300">|</span>
                                <span className="text-sm text-surface-600">
                                  {Controller?.result.AddressStandard.phone}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Endereço */}
                          <p className="text-sm text-surface-700">
                            {Controller?.result.AddressStandard?.road}, {Controller?.result.AddressStandard?.number}
                            {Controller?.result.AddressStandard?.supplement && `, ${Controller?.result.AddressStandard.supplement}`}
                          </p>

                          {/* Bairro, Cidade e Estado */}
                          <p className="text-sm text-surface-600">
                            {Controller?.result.AddressStandard?.neighborhood}
                            {Controller?.result.AddressStandard?.city && ` • ${Controller?.result.AddressStandard.city}`}
                            {Controller?.result.AddressStandard?.state && ` - ${Controller?.result.AddressStandard.state}`}
                          </p>

                          {/* Referência */}
                          {Controller?.result.AddressStandard?.referencePoint && (
                            <p className="text-xs text-surface-500">
                              Referência: {Controller?.result.AddressStandard.referencePoint}
                            </p>
                          )}

                        </div>

                        <p className="font-body text-surface-500 text-xs mt-0.5">
                          {Controller?.result.AddressStandard?.city}/{Controller?.result.AddressStandard?.state}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <span className="text-sm font-display font-bold text-green-500">
                        Grátis
                      </span>

                      <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded-full">
                        PADRÃO
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`border-2 border-dashed border-surface-300 rounded-2xl p-8 text-center bg-surface-50 ${!Controller?.result.AddressStandard ? `mb-6` : ``} `}>
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-surface-100 flex items-center justify-center">
                    <MapPin className={`w-7 h-7 ${ColorGlobalText}`} />
                  </div>

                  <h3 className="font-display font-bold text-surface-900 text-lg mb-2">
                    Nenhum endereço cadastrado
                  </h3>

                  <p className="text-surface-500 text-sm font-body mb-5">
                    Adicione um endereço para continuar com sua compra.
                  </p>

                  <button
                    onClick={() => navigate(`/addressPage/${true}`)}
                    className={`${ColorGlobalTema} text-white px-5 py-3 rounded-xl font-display font-bold transition-all hover:scale-105`}
                  >
                    + Adicionar Endereço
                  </button>
                </div>
              )}

              {Controller?.result.AddressStandard && (
                <button onClick={() => navigate(`/addressPage/${true}`)}
                  className={`text-sm font-display font-semibold ${ColorGlobalText} hover:text-green-600 transition-colors px-1 mb-5`}
                >
                  Alterar ou escolher outro endereço
                </button>
              )}

              <button
                disabled={!address}
                onClick={() => {
                  if (!Controller?.result.AddressStandard) {
                    toast.error('Crie ou defina um endereço padrão para prosseguir.');
                    return;
                  }

                  Controller?.action.setStep('Checkout');
                }}
                className={`w-full py-3.5 ${Controller?.result.AddressStandard
                  ? `${ColorGlobalTema} text-white`
                  : 'bg-surface-300 text-surface-500 '
                  } rounded-xl font-display font-bold hover:bg-green-700`}
              >
                Continuar
              </button>
            </div>
          )}
          {/* Payment Step */}
          {Controller?.result.step === 'Pagamento' && (
            <div className="bg-white rounded-3xl p-6 shadow-soft animate-fade-in">
              <div className="flex items-center gap-2 mb-5">
                <div className={`w-8 h-8 rounded-xl bg-${ColorGlobalTema.slice(3, -4)}-50 flex items-center justify-center`}>
                  <CreditCard className={`w-4 h-4 ${ColorGlobalText}`} />
                </div>
                <h2 className="font-display font-bold text-surface-900 text-lg">Forma de Pagamento</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {([
                  { id: 'pix', icon: <Zap className="w-5 h-5" />, label: 'PIX', sub: '5% OFF', accent: 'green' },
                  { id: 'credit', icon: <CreditCard className="w-5 h-5" />, label: 'Cartão', sub: 'Parcelado', accent: 'blue' },
                ] as const).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => Controller?.action.setPayment(opt.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${Controller?.result.payment === opt.id ? `border-${ColorGlobalTema.slice(3)} ${ColorGlobalTema.slice(0, -4)}-50` : 'border-surface-200 hover:border-surface-300'}`}
                  >
                    <div className={`${Controller?.result.payment === opt.id ? `${ColorGlobalText}` : 'text-surface-400'}`}>{opt.icon}</div>
                    <span className={`font-display font-bold text-sm ${Controller?.result.payment === opt.id ? `${ColorGlobalText}` : 'text-surface-600'}`}>{opt.label}</span>
                    <span className={`text-[10px] font-body ${opt.id === 'pix' ? 'text-green-600 font-semibold' : 'text-surface-400'}`}>{opt.sub}</span>
                  </button>
                ))}
              </div>

              {Controller?.result.payment === 'pix' && (
                <div className="p-5 bg-green-50 rounded-2xl border border-green-200 text-center animate-fade-in">
                  <div className="w-32 h-32 bg-white rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-soft">
                    <div className="grid grid-cols-5 gap-0.5">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className={`w-4 h-4 rounded-sm ${Math.random() > 0.5 ? 'bg-surface-900' : 'bg-white'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="font-display font-bold text-green-700 text-lg">{formatPrice(Controller?.result.finalTotal)}</p>
                  <p className="text-green-600 font-body text-sm mt-1">Escaneie o QR Code ou copie a chave PIX</p>
                  <div className="mt-3 flex items-center gap-2 bg-white rounded-xl p-2 border border-green-200">
                    <span className="flex-1 text-xs text-surface-500 font-body truncate">00020126580014br.gov.bcb.pix0136...</span>
                    <button className="px-3 py-1 bg-green-500 text-white text-xs font-display font-bold rounded-lg">Copiar</button>
                  </div>
                </div>
              )}

              {Controller?.result.payment === 'credit' && (
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
              {/* Coupon */}
              <div
                onClick={() => setOpenCouponModal(true)}
                className="group cursor-pointer overflow-hidden mt-5 rounded-3xl bg-white border border-surface-200 hover:border-orange-300 hover:shadow-2xl transition-all duration-300"
              >
                {/* Cabeçalho */}
                <div className={`${ColorGlobalTema} p-5`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/20">
                        <Ticket className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">
                          Cupom de desconto
                        </p>
                        <p className="text-orange-100 text-sm">
                          Economize ainda mais na sua compra
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
                {/* Conteúdo */}
                <div className="p-5">
                  {Controller?.result.selectedCoupon ? (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                              APLICADO
                            </span>
                            <span className="px-2 py-1 rounded-full bg-surface-100 text-surface-500 text-xs font-semibold">
                              {Controller.result.selectedCoupon.cod_Cupom}
                            </span>
                          </div>
                          <h3 className="font-bold text-surface-900 text-lg">
                            {Controller.result.selectedCoupon.name_Cupom}
                          </h3>
                          <p className="text-sm text-surface-500 mt-1">
                            {Controller.result.selectedCoupon.descriotion}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-3xl font-black ${ColorGlobalText}`}>
                            {Controller.result.selectedCoupon.discont}%
                          </p>
                          <p className="text-xs text-surface-500">
                            de desconto
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t pt-4">
                        <div>
                          <p className="text-xs text-surface-400">
                            Código
                          </p>
                          <p className="font-semibold text-surface-700">
                            {Controller.result.selectedCoupon.cod_Cupom}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            Controller?.action.setSelectedCoupon(null);
                            setCoupon("");
                            Controller?.action.setDiscount(0);
                          }}
                          className="text-red-500 text-sm font-semibold hover:text-red-600"
                        >
                          Remover
                        </button>

                      </div>

                    </>

                  ) : (

                    <div className="relative">
                      <div className="absolute top-0 right-0">
                        <div className="rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600 whitespace-nowrap">
                          Ver Cupons
                        </div>
                      </div>

                      <div className="pt-12">
                        <p className="font-semibold text-surface-900">
                          Nenhum cupom selecionado
                        </p>

                        <p className="mt-1 text-sm text-surface-500">
                          Toque aqui para escolher um cupom disponível.
                        </p>
                      </div>
                    </div>

                  )}

                </div>
              </div>
              {openCouponModal && (
                <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
                  <div className="bg-white w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl max-h-[85vh] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col animate-slide-up">

                    {/* HEADER */}
                    <div className={`relative overflow-hidden ${ColorGlobalTema} shrink-0`}>
                      <div className="absolute -top-10 -right-10 h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-white/10" />
                      <div className="absolute -bottom-12 -left-12 h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-white/10" />

                      <div className="relative px-3 sm:px-6 lg:px-8 py-3 sm:py-5">
                        <div className="flex items-start justify-between gap-2 sm:gap-4">
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <div className="h-10 w-10 sm:h-14 sm:w-14 shrink-0 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                              <Ticket className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                            </div>

                            <div className="min-w-0">
                              <h2 className="text-base sm:text-2xl font-bold text-white truncate">
                                Cupons Disponíveis
                              </h2>
                              <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-sm text-orange-100 line-clamp-1">
                                Escolha o melhor desconto para este pedido.
                              </p>
                              <div className="mt-1.5 sm:mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-2.5 sm:px-3 py-0.5 sm:py-1 backdrop-blur">
                                <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 shrink-0 rounded-full bg-green-300 animate-pulse" />
                                <span className="text-[10px] sm:text-xs font-medium text-white whitespace-nowrap">
                                  {(Cupons ?? []).filter(c => c.active).length} cupons disponíveis
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => setOpenCouponModal(false)}
                            className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-all hover:bg-white/25 hover:rotate-90"
                          >
                            <X className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* LISTA */}
                    <div className="flex-1 overflow-y-auto bg-surface-50 p-2.5 sm:p-5 min-h-0">
                      <div className="space-y-2.5 sm:space-y-3">
                        {(Cupons ?? [])
                          .filter(c => c.active)
                          .map(coupon => {
                            const minimumValue = coupon.minimum_Value ?? 0;
                            const valido = Controller?.result.total || 0 >= minimumValue;
                            const selected = selectedCouponTed?.id === coupon.id;

                            return (
                              <button
                                key={coupon.id}
                                type="button"
                                disabled={!valido}
                                onClick={() => setSelectedCouponTed(coupon)}
                                style={
                                  selected
                                    ? {
                                      borderColor: colorConfig.hex,
                                      boxShadow: `0 0 0 4px ${colorConfig.hex}33, 0 10px 15px -3px rgb(0 0 0 / 0.1)`,
                                    }
                                    : {}
                                }
                                className={`relative w-full overflow-hidden rounded-2xl border bg-white text-left transition-all duration-200
                               focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0
                               ${selected
                                    ? "shadow-lg"
                                    : "border-surface-200 hover:shadow-md"
                                  }
                           ${!valido && "opacity-60 cursor-not-allowed"}
                              `}
                              >
                                <div className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${ColorGlobalTema}`} />

                                <div className="p-3 pl-4 sm:p-4 sm:pl-5">
                                  {/* Topo */}
                                  <div className="flex justify-between items-start gap-2 sm:gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                        <span className="rounded-full bg-orange-100 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase text-orange-600">
                                          Cupom
                                        </span>
                                        <span className="rounded-full bg-surface-100 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold text-surface-600 truncate max-w-[120px] sm:max-w-none">
                                          {coupon.cod_Cupom}
                                        </span>
                                        {(coupon.discont ?? 0) >= 20 && (
                                          <span className="rounded-full bg-green-100 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold text-green-700 whitespace-nowrap">
                                            Melhor Oferta
                                          </span>
                                        )}
                                      </div>

                                      <h3 className="mt-2 sm:mt-3 text-sm sm:text-base font-bold text-surface-900 truncate">
                                        {coupon.name_Cupom}
                                      </h3>

                                      <p className="mt-1 line-clamp-2 text-xs sm:text-sm text-surface-500">
                                        {coupon.descriotion}
                                      </p>
                                    </div>

                                    <div style={
                                      selected ? { borderColor: colorConfig.hex, boxShadow: `0 0 0 4px ${colorConfig.hex}33, 0 10px 15px -3px rgb(0 0 0 / 0.1)`, } : {}
                                    }
                                      className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full border-2${selected ? ` ${ColorGlobalTema}` : "border-surface-300"}`}>
                                      {selected && <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />}
                                    </div>
                                  </div>
                                  {/* Rodapé do card */}
                                  <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-t pt-2.5 sm:pt-3">
                                    <div>
                                      <div className="flex items-end gap-1">
                                        <span className={`text-xl sm:text-2xl font-black ${ColorGlobalText}`}>
                                          {coupon.discont}%
                                        </span>
                                        <span className="pb-0.5 text-[11px] sm:text-xs font-semibold text-surface-500">
                                          OFF
                                        </span>
                                      </div>
                                      <p className="mt-1 text-[11px] sm:text-xs text-surface-500">
                                        Pedido mínimo <strong>{formatPrice(minimumValue)}</strong>
                                      </p>
                                    </div>
                                    {valido ? (
                                      <span className="rounded-full bg-green-100 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-green-700 whitespace-nowrap">
                                        ✓ Disponível
                                      </span>
                                    ) : (
                                      <span className="rounded-full bg-red-100 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-red-600 whitespace-nowrap">
                                        Faltam {formatPrice(minimumValue - (Controller?.result.total || 0))}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="bg-white border-t border-surface-200 shrink-0">
                      {selectedCouponTed && (
                        <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[11px] sm:text-xs uppercase tracking-wide text-green-600 font-semibold">
                                Cupom selecionado
                              </p>
                              <p className="font-bold text-surface-900 truncate text-sm sm:text-base">
                                {selectedCouponTed.name_Cupom ?? ""}
                              </p>
                              <p className="text-xs sm:text-sm text-surface-500 truncate">
                                Código: {selectedCouponTed.cod_Cupom}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <p className="text-2xl sm:text-3xl font-black text-green-600">
                                {selectedCouponTed.discont}%
                              </p>
                              <p className="text-[11px] sm:text-xs text-green-700 font-semibold">
                                de desconto
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="p-3 sm:p-5">
                        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                          <button
                            onClick={() => {
                              setOpenCouponModal(false);
                              setSelectedCouponTed(null);
                              Controller?.action.setSelectedCoupon(null);
                              Controller?.action.setDiscount(0);
                              setCoupon('');
                            }
                            }
                            className="h-11 sm:h-12 rounded-xl border border-surface-300 bg-white text-sm sm:text-base font-semibold text-surface-700 transition-all hover:bg-surface-100 hover:border-surface-400"
                          >
                            Cancelar
                          </button>

                          <button
                            disabled={!selectedCouponTed}
                            onClick={() => {
                              if (!selectedCouponTed) return;
                              Controller?.action.setSelectedCoupon(selectedCouponTed);
                              setCoupon(selectedCouponTed.cod_Cupom);
                              Controller?.action.setDiscount((Controller?.result.total || 0) * ((selectedCouponTed.discont ?? 0) / 100));
                              setOpenCouponModal(false);
                            }}
                            className={` h-11 sm:h-12 rounded-xl text-sm sm:text-base font-bold text-white shadow-lg transition-all hover:bg-green-600
                ${selectedCouponTed
                                ? ` ${ColorGlobalTema} hover:shadow-xl hover:scale-[1.02]`
                                : "bg-surface-300 cursor-not-allowed"
                              }
              `}
                          >
                            {selectedCouponTed ? "Aplicar Cupom" : "Selecione um cupom"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-4">
                <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">Cupom de desconto</label>
                <div className="flex gap-2">
                  <input value={coupon} onChange={e => setCoupon(e.target.value)}
                    placeholder="BEMVINDO20"
                    className="flex-1 px-3 py-2.5 border-2 border-surface-200 rounded-xl font-body text-sm focus:outline-none focus:border-brand-400 transition-colors uppercase" />
                  <button className="px-4 py-2.5 bg-surface-900 text-white font-display font-bold rounded-xl text-sm hover:bg-surface-800 transition-colors">
                    Aplicar
                  </button>
                </div>
                {Controller?.result.discount > 0 && <p className="text-xs text-green-600 font-body mt-1.5 font-semibold">✓ Cupom aplicado! Desconto de {formatPrice(Controller?.result.discount)}</p>}
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => Controller?.action.setStep('Checkout')} className="px-4 py-3 bg-surface-100 text-surface-600 font-display font-bold rounded-xl hover:bg-surface-200 transition-all text-sm">
                  ← Voltar
                </button>
                <button
                  onClick={Controller?.action.handlePlaceOrder}
                  disabled={Controller?.result.loading}
                  className={`flex-1 py-3.5 ${ColorGlobalTema} hover:bg-green-700 disabled:bg-green-300 text-white font-display font-bold rounded-xl transition-all  flex items-center justify-center gap-2`}
                >
                  {Controller?.result.loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Confirmar Pedido</>}
                </button>
              </div>



            </div>
          )}

          {/* Review Step */}
          {Controller?.result.step === 'Checkout' && (
            <div className="bg-white rounded-3xl p-6 shadow-soft animate-fade-in">
              <div className="flex items-center gap-2 mb-5">
                <div className={`w-8 h-8 rounded-xl bg-${ColorGlobalTema.slice(3, -4)}-50 flex items-center justify-center`}>
                  <ShoppingBag className={`w-4 h-4 ${ColorGlobalText}`} />
                </div>
                <h2 className="font-display font-bold text-surface-900 text-lg">Revisão do Pedido</h2>
              </div>

              <div className="space-y-3 mb-5">
                {cart.map(item => (
                  <div key={item.product?.id} className="flex gap-3 p-3 bg-surface-50 rounded-xl">
                    <img src={`/Imagens/Produtos/${item.product?.imagens[0]?.url_Imagem}`} alt="" className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-surface-800 font-medium line-clamp-1">{item.product?.name}</p>
                      {item.selectedVariation && <p className="text-xs text-surface-400 font-body">{item.selectedVariation.value}</p>}
                      <p className="text-xs text-surface-500 font-body mt-0.5">Qtd: {item.quantity}</p>
                    </div>
                    <p className="font-display font-bold text-surface-900 text-sm shrink-0">{formatPrice(item.product?.price_Unic || 0 * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-surface-50 rounded-xl mb-5">
                <p className="text-xs font-display font-semibold text-surface-500 mb-1">ENTREGA EM</p>
                <p className="text-sm font-body text-surface-800">{Controller?.result.AddressStandard?.road}, {Controller?.result.AddressStandard?.number} - {Controller?.result.AddressStandard?.referencePoint} - {Controller?.result.AddressStandard?.supplement}</p>
                <p className="text-sm font-body text-surface-500">{Controller?.result.AddressStandard?.city}/{Controller?.result.AddressStandard?.state} · {Controller?.result.AddressStandard?.neighborhood}</p>
                <p className="text-xs font-display font-semibold text-surface-500 mb-1">Para: {Controller?.result.AddressStandard?.name}</p>
                <p className="text-sm font-body text-surface-800">Tel: {formatPhone(Controller?.result.AddressStandard?.phone)}</p>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => Controller?.action.setStep('Endereço')} className="px-4 py-3 bg-surface-100 text-surface-600 font-display font-bold rounded-xl hover:bg-surface-200 transition-all text-sm">
                  ← Voltar
                </button>
                <button onClick={() => Controller?.action.setStep('Pagamento')} className={`flex-1 py-3 ${ColorGlobalTema} hover:bg-green-600 text-white font-display font-bold rounded-xl transition-all  flex items-center justify-center gap-2`}>
                  Forma de pagamento <ChevronRight className="w-4 h-4" />
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
                <span className="font-semibold text-surface-800">{formatPrice(Controller?.result.total)}</span>
              </div>
              <div className="flex justify-between text-surface-500">
                <span>Frete</span>
                <span className={Controller?.result.shipping === 0 ? 'text-green-600 font-semibold' : 'font-semibold text-surface-800'}>
                  {Controller?.result.shipping === 0 ? 'Grátis' : formatPrice(Controller?.result.shipping)}
                </span>
              </div>
              {Controller?.result.paymentDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto PIX (5%)</span>
                  <span className="font-semibold">-{formatPrice(Controller?.result.paymentDiscount)}</span>
                </div>
              )}
              {Controller?.result.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Cupom</span>
                  <span className="font-semibold">-{formatPrice(Controller?.result.discount)}</span>
                </div>
              )}
              <div className="border-t border-surface-100 pt-2 mt-2 flex justify-between items-center">
                <span className="font-display font-bold text-surface-900">Total</span>
                <span className="font-display font-bold text-surface-900 text-xl">{formatPrice(Controller?.result.finalTotal)}</span>
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
      <Loading
        loading={Controller?.result.Loading || false}
        message="Carregando..."
        subMessage=""
      />
      <AlertPopup
        open={OpenAlert}
        title={"Carrinho Vazio"}
        description={"Seu carrinho está vazio. Adicione produtos antes de prosseguir para o checkout."}
        onClose={() => {
          setOpenAlert(false),
            navigate("/");
        }}
      />
    </div>
  );
}
