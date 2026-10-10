import { useState } from 'react';
import { CreditCard, Smartphone, FileText, ChevronRight, Check, MapPin, ShoppingBag, Zap, ArrowLeft, Lock, Pencil, Ticket, X, BadgeCheck, Package, Truck, Mail, TicketPercent, AlertTriangle, Info, Clock, Bell, Receipt, Home } from 'lucide-react';
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
import { Cupom, DiscountType } from '../models/Cupom';
import AlertPopup from '../components/AlertPopup';
import { UseCupomStore } from '../store/UseCupomStore';
import CouponProductsModal from '../components/CouponProductsModal';
import ConfirmPopup from '../components/ConfirmPopup';


export default function CheckoutPage() {
  const Controller = useCheckoutController();
  const navigate = useNavigate();
  const { setCartOpen } = UseCartStore();
  const { navigateTo } = UseRouteStore();
  const { cart } = UseCartStore();
  const { address } = UseAddressStore();
  const { Cupons } = UseOrderStore();
  const cupomSelecionado = Cupons.find(c => c.id === cart.id_Cupom) ?? null;
  const { user, ColorGlobalTema, ColorGlobalText, ColorGlobalHoverText, NameColorGlobal } = UseUserStore();
  const [selectedAddress, setSelectedAddress] = useState(true);
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [coupon, setCoupon] = useState(String);
  const colorConfig = getColorConfig(NameColorGlobal);
  const [openCouponModal, setOpenCouponModal] = useState(false);
  const [OpenAlert, setOpenAlert] = useState(false);
  const [selectedCouponTed, setSelectedCouponTed] = useState<Cupom | null>(null);
  const [showCoupon, setShowCoupon] = useState(false);
  const [openCouponDetails, setOpenCouponDetails] = useState(false);
  const [openCouponConfirm, setopenCouponConfirm] = useState(false);
  const [loadingRemove, setloadingRemove] = useState(false);
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
      navigate("/login");
    }

    const timer = setTimeout(() => {
      if (cart.cartItensProduct.length === 0) {
        setOpenAlert(true);
      }
    }, 5000);

    if (cart.couponApplied) {
      setShowCoupon(true);
    }

    if (cupomSelecionado) {
      setCoupon(cupomSelecionado.cod_Cupom || "");
    } else {
      setCoupon("");
    }

    if (Controller?.result.step === "Pagamento" && cart.erroCupom) {
      Controller.action.setStep("Checkout");
    }

    return () => clearTimeout(timer);
  }, [user, navigate, cart, cupomSelecionado]);
  if (Controller?.result.step === "success") {
    const order = Controller?.result.order;
    const items = order?.products ?? [];
    const itemsCount = items.reduce((total, item) => total + (item.quantity || 0), 0);
    const firstName = (user?.name ?? '').trim().split(' ')[0];
    const brand = colorConfig.hex;

    const paymentInfo: Record<string, { label: string; icon: React.ReactNode; hint: string }> = {
      pix: {
        label: 'PIX',
        icon: <Zap className="w-5 h-5" />,
        hint: 'Assim que o PIX for compensado, o pedido é confirmado.',
      },
      credit: {
        label: 'Cartão de crédito',
        icon: <CreditCard className="w-5 h-5" />,
        hint: 'A operadora do cartão confirma o pagamento em instantes.',
      },
      boleto: {
        label: 'Boleto bancário',
        icon: <FileText className="w-5 h-5" />,
        hint: 'O boleto pode levar até 3 dias úteis para compensar.',
      },
    };
    const payment = paymentInfo[order?.payment_terms ?? ''] ?? {
      label: order?.payment_terms || 'Não informado',
      icon: <CreditCard className="w-5 h-5" />,
      hint: 'Você será avisado assim que o pagamento for confirmado.',
    };

    const timeline = [
      { label: 'Pedido realizado', icon: Receipt, state: 'done' as const },
      { label: 'Confirmação do pagamento', icon: Clock, state: 'current' as const },
      { label: 'Separação', icon: Package, state: 'next' as const },
      { label: 'Entrega', icon: Truck, state: 'next' as const },
    ];

    return (
      <div className="min-h-screen bg-surface-50 pb-12">
        <Headerpages title="Pedido realizado" showSecure={false} />

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-5 animate-fade-in">

          {/* ── HERO ── */}
          <div className="relative overflow-hidden rounded-3xl bg-white border border-surface-100 shadow-soft">
            <div
              className="absolute -top-28 -right-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: brand }}
            />
            <div
              className="absolute -bottom-32 -left-24 w-72 h-72 rounded-full blur-3xl opacity-10 pointer-events-none"
              style={{ backgroundColor: brand }}
            />

            <div className="relative px-6 py-10 sm:px-10 sm:py-12 text-center">
              <div className="relative mx-auto w-20 h-20">
                <span
                  className="absolute inset-0 rounded-3xl animate-ping opacity-20"
                  style={{ backgroundColor: brand }}
                />
                <div
                  className="relative w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${brand}, ${brand}B3)`,
                    boxShadow: `0 16px 40px ${brand}55`,
                  }}
                >
                  <Check className="w-10 h-10 text-white" strokeWidth={3} />
                </div>
              </div>

              <span
                className="inline-flex items-center gap-1.5 mt-6 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
                style={{ color: brand, backgroundColor: `${brand}14` }}
              >
                <BadgeCheck className="w-3.5 h-3.5" />
                Pedido realizado
              </span>

              <h1 className="mt-4 font-display font-bold text-surface-900 text-2xl sm:text-3xl">
                {firstName ? `Obrigado pela compra, ${firstName}!` : 'Obrigado pela sua compra!'}
              </h1>

              <p className="mt-2 text-surface-500 text-sm sm:text-base max-w-lg mx-auto">
                Recebemos o seu pedido e ele já está registrado. Agora é só aguardar a confirmação do pagamento.
              </p>

              {/* Números do pedido */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="rounded-2xl border border-surface-100 bg-surface-50/70 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-surface-400">Total</p>
                  <p className="mt-1 font-display font-bold text-surface-900 text-2xl">
                    {formatPrice(order?.total_Value_Order || 0)}
                  </p>
                  <p className="mt-0.5 text-xs text-surface-400">
                    {itemsCount} {itemsCount === 1 ? 'item' : 'itens'}
                    {(order?.shippingCost ?? 0) > 0 ? ` · frete ${formatPrice(order?.shippingCost || 0)}` : ' · frete grátis'}
                  </p>
                </div>

                <div className="rounded-2xl border border-surface-100 bg-surface-50/70 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-surface-400">Pagamento</p>
                  <div className="mt-1.5 flex items-center gap-2 text-surface-900">
                    <span
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ color: brand, backgroundColor: `${brand}14` }}
                    >
                      {payment.icon}
                    </span>
                    <span className="font-display font-bold">{payment.label}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600">Status</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="relative flex w-2.5 h-2.5">
                      <span className="absolute inline-flex w-full h-full rounded-full bg-amber-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-amber-500" />
                    </span>
                    <span className="font-display font-bold text-amber-800 text-sm">
                      Aguardando pagamento
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-amber-700 leading-relaxed">{payment.hint}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── ACOMPANHAMENTO ── */}
          <div className="rounded-3xl bg-white border border-surface-100 shadow-soft p-6">
            <h2 className="font-display font-bold text-surface-900 text-lg">Acompanhamento</h2>
            <p className="text-sm text-surface-400 mt-0.5">Você recebe uma notificação a cada nova etapa.</p>

            <div className="mt-6 grid grid-cols-4 gap-2">
              {timeline.map((step, index) => {
                const Icon = step.icon;
                const isDone = step.state === 'done';
                const isCurrent = step.state === 'current';

                return (
                  <div key={step.label} className="relative flex flex-col items-center text-center">
                    {index < timeline.length - 1 && (
                      <div
                        className="absolute top-5 left-1/2 w-full h-0.5"
                        style={{ backgroundColor: isDone ? brand : '#e5e7eb' }}
                      />
                    )}

                    <div
                      className={`relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isDone || isCurrent ? 'text-white shadow-lg' : 'bg-surface-100 text-surface-400'}`}
                      style={
                        isDone
                          ? { backgroundColor: brand, boxShadow: `0 8px 20px ${brand}40` }
                          : isCurrent
                            ? { backgroundColor: brand, boxShadow: `0 0 0 5px ${brand}26` }
                            : {}
                      }
                    >
                      {isDone ? <Check className="w-5 h-5" strokeWidth={3} /> : <Icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />}
                    </div>

                    <span
                      className={`mt-2.5 text-[11px] sm:text-xs leading-tight font-semibold ${isDone || isCurrent ? 'text-surface-800' : 'text-surface-400'}`}
                    >
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span className="mt-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: brand }}>
                        Agora
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* ── ITENS ── */}
            <div className="lg:col-span-3 rounded-3xl bg-white border border-surface-100 shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ color: brand, backgroundColor: `${brand}14` }}>
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <h2 className="font-display font-bold text-surface-900 text-lg">Itens do pedido</h2>
                </div>
                <span className="text-xs font-semibold text-surface-400">
                  {itemsCount} {itemsCount === 1 ? 'item' : 'itens'}
                </span>
              </div>

              <div className="divide-y divide-surface-100">
                {items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex items-center gap-3 py-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={
                          item?.imagens?.[0]?.url_Imagem
                            ? `/Imagens/Produtos/${item.imagens[0].url_Imagem}`
                            : "/images/produto-placeholder.png"
                        }
                        alt={item?.name || "Produto"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/produto-placeholder.png";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-surface-900 truncate">{item.name}</p>
                      <p className="text-xs text-surface-400">
                        {item.quantity}x {formatPrice(item.price_Unic || 0)}
                        {item.variations?.name ? ` · ${item.variations.name}: ${item.variations.value}` : ''}
                      </p>
                    </div>
                    <span className="text-sm font-display font-bold text-surface-900 shrink-0">
                      {formatPrice((item.price_Unic || 0) * (item.quantity || 0))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-surface-100 space-y-1.5 text-sm">
                <div className="flex justify-between text-surface-500">
                  <span>Frete</span>
                  <span className={(order?.shippingCost ?? 0) > 0 ? 'font-semibold text-surface-800' : 'font-semibold text-green-600'}>
                    {(order?.shippingCost ?? 0) > 0 ? formatPrice(order?.shippingCost || 0) : 'Grátis'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-surface-900">Total</span>
                  <span className="font-display font-bold text-surface-900 text-lg">
                    {formatPrice(order?.total_Value_Order || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── ENTREGA ── */}
            <div className="lg:col-span-2 space-y-5">
              <div className="rounded-3xl bg-white border border-surface-100 shadow-soft p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ color: brand, backgroundColor: `${brand}14` }}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h2 className="font-display font-bold text-surface-900 text-lg">Entrega</h2>
                </div>

                <div className="rounded-2xl bg-surface-50 border border-surface-100 p-4 space-y-1">
                  <p className="text-sm font-semibold text-surface-900">{order?.address?.name}</p>
                  <p className="text-sm text-surface-600">
                    {order?.address?.road}, {order?.address?.number}
                    {order?.address?.supplement ? `, ${order.address.supplement}` : ''}
                  </p>
                  <p className="text-sm text-surface-600">
                    {order?.address?.neighborhood}
                    {order?.address?.city ? ` · ${order.address.city}` : ''}
                    {order?.address?.state ? ` - ${order.address.state}` : ''}
                  </p>
                  {order?.address?.referencePoint && (
                    <p className="text-xs text-surface-400 pt-1">Referência: {order.address.referencePoint}</p>
                  )}
                  {order?.address?.phone && (
                    <p className="text-xs text-surface-400">Contato: {formatPhone(order.address.phone)}</p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-white border border-surface-100 shadow-soft p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-surface-50 flex items-center justify-center shrink-0">
                    <Bell className={`w-4 h-4 ${ColorGlobalText}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-900">Fique de olho</p>
                    <p className="text-xs text-surface-500 mt-0.5 leading-relaxed">
                      Avisamos cada atualização em <span className="font-semibold text-surface-700">Notificações</span> e por e-mail. O número do pedido fica em <span className="font-semibold text-surface-700">Minhas compras</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── AÇÕES ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => navigate('/orders')}
              className={`py-4 rounded-2xl ${ColorGlobalTema} text-white font-display font-bold flex items-center justify-center gap-2 shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-110`}
              style={{ boxShadow: `0 10px 24px ${brand}40` }}
            >
              <Receipt className="w-4 h-4" />
              Acompanhar meus pedidos
            </button>

            <button
              onClick={() => navigate('/')}
              className="py-4 rounded-2xl border border-surface-200 bg-white text-surface-700 font-display font-bold flex items-center justify-center gap-2 transition-all hover:bg-surface-50 hover:border-surface-300"
            >
              <Home className="w-4 h-4" />
              Continuar comprando
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-surface-400 pt-1">
            <Lock className="w-3.5 h-3.5" />
            <p className="text-xs">Compra protegida · Mercado Craibas</p>
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
                        {cart?.shippingCost ? formatPrice(cart?.shippingCost || 0) : `Frete Grátis`}
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
                    {/* <span className={`text-[10px] font-body ${opt.id === 'pix' ? 'text-green-600 font-semibold' : 'text-surface-400'}`}>{opt.sub}</span> */}
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
                  <p className="font-display font-bold text-green-700 text-lg">{formatPrice(cart.subTotal ?? 0)}</p>
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
            <div className="bg-white rounded-3xl p-4 shadow-soft animate-fade-in">
              <div className="flex items-center gap-2 mb-5">
                <div className={`w-8 h-8 rounded-xl bg-${ColorGlobalTema.slice(3, -4)}-50 flex items-center justify-center`}>
                  <ShoppingBag className={`w-4 h-4 ${ColorGlobalText}`} />
                </div>
                <h2 className="font-display font-bold text-surface-900 text-lg">Revisão do Pedido</h2>
              </div>

              <div className="space-y-3 mb-5">
                {cart.cartItensProduct.map(item => (
                  <div key={item.product?.id} className="flex gap-3 p-3 bg-surface-50 rounded-xl">
                    <img src={`/Imagens/Produtos/${item.product?.imagens[0]?.url_Imagem}`} alt="" className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-surface-800 font-medium line-clamp-1">{item.product?.name}</p>
                      {item.selectedVariation && <p className="text-xs text-surface-400 font-body">{item.selectedVariation.value}</p>}
                      <p className="text-xs text-surface-500 font-body mt-0.5">Qtd: {item.quantity}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="font-display font-bold text-surface-900 text-sm">
                        {formatPrice((item.product?.price_Unic || 0) * item.quantity)}
                      </p>

                      <p className="text-xs text-surface-500">
                        {item.quantity}x {formatPrice(item.product?.price_Unic || 0)}
                      </p>

                      {cart.couponApplied && (item.product?.valorDicont ?? 0) > 0 && (
                        <div className="mt-1 px-2 py-1 rounded-lg bg-green-50 border border-green-200">
                          <p className="text-[11px] font-semibold text-green-700">
                            Cupom aplicado  -{formatPrice(item.product?.valorDicont || 0)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-surface-50 rounded-2xl mb-5">
                <p className="text-xs font-display font-semibold text-surface-500 uppercase tracking-wide mb-3">
                  Entrega em
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-900 truncate">
                      {Controller?.result.AddressStandard?.road},{" "}
                      {Controller?.result.AddressStandard?.number}
                    </p>

                    {Controller?.result.AddressStandard?.referencePoint && (
                      <p className="text-xs text-surface-600 truncate">
                        {Controller?.result.AddressStandard?.referencePoint}
                      </p>
                    )}

                    {Controller?.result.AddressStandard?.supplement && (
                      <p className="text-xs text-surface-600 truncate">
                        {Controller?.result.AddressStandard?.supplement}
                      </p>
                    )}

                    <p className="text-xs text-surface-500 truncate">
                      {Controller?.result.AddressStandard?.city}/
                      {Controller?.result.AddressStandard?.state} •{" "}
                      {Controller?.result.AddressStandard?.neighborhood}
                    </p>
                  </div>

                  <div className="space-y-2 min-w-0">
                    <div>
                      <p className="text-[11px] text-surface-500">Recebedor</p>
                      <p className="text-sm font-semibold text-surface-900 truncate">
                        {Controller?.result.AddressStandard?.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-surface-500">Telefone</p>
                      <p className="text-sm font-medium text-surface-800">
                        {formatPhone(Controller?.result.AddressStandard?.phone)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowCoupon(!showCoupon)}
                    className={`px-4 py-2.5 ${ColorGlobalTema} text-white font-display font-bold rounded-xl text-sm hover:bg-surface-800 transition-colors flex items-center gap-2`}
                  >

                    {showCoupon ? "" : <TicketPercent className="w-4 h-4" />}

                    {showCoupon ? "Ocultar cupom" : "Tenho um cupom"}
                  </button>
                </div>

                <div className={` overflow-hidden transition-all duration-300 ${showCoupon ? "max-h-40 mt-3" : "max-h-0"}`} >
                  <div className={` transform transition-all duration-300 ${showCoupon ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"} `}
                  >
                    <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">
                      Cupom de desconto
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        placeholder="BEMVINDO20"
                        className="flex-1 px-3 py-2.5 border-2 border-surface-200 rounded-xl font-body text-sm focus:outline-none focus:border-brand-400 transition-colors uppercase"
                      />
                      {cart.couponApplied ? (
                        <button
                          onClick={() => {
                            setopenCouponConfirm(true);
                            setloadingRemove(true);
                          }}
                          className="px-4 py-2 text-sm font-display font-semibold text-red-500 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white active:scale-95 transition-all duration-200"
                        >
                          {loadingRemove ? <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" /> : <>Remover</>}
                        </button>
                      ) : (
                        <button
                          className="px-4 py-2.5 bg-surface-900 text-white font-display font-bold rounded-xl text-sm hover:bg-surface-800 transition-colors"
                          onClick={() => Controller.action.handleApllyCupom(coupon)}
                        >
                          {Controller?.result.loading ?
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Aplicar</>}
                        </button>)}

                    </div>

                    {cart.discount > 0 && (
                      <p className="text-xs text-green-600 font-body mt-1.5 font-semibold">
                        ✓ Cupom aplicado! Desconto de{" "}
                        {
                          cart.discount_Type === "FixedValue" ? formatPrice(cart.discount) : cart.discount_Type === "Percentage" ? `${cart.discount}%` : "Frete Grátis"
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => Controller?.action.setStep('Endereço')} className="px-4 py-3 bg-surface-100 text-surface-600 font-display font-bold rounded-xl hover:bg-surface-200 transition-all text-sm">
                  ← Voltar
                </button>
                <div className="relative flex-1 group">
                  <button
                    disabled={cart.erroCupom}
                    onClick={() => Controller?.action.setStep("Pagamento")}
                    className={`flex-1 w-full py-3 rounded-xl font-display font-bold transition-all flex items-center justify-center gap-2
                  ${cart.erroCupom ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300" : `${ColorGlobalTema} text-white hover:bg-green-600`}`}>
                    Forma de pagamento
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {cart.erroCupom && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 w-72" >
                      <div className="relative rounded-lg bg-gray-800 text-white text-xs p-3 shadow-lg">
                        <span className="font-semibold block mb-1">
                          ⚠️ Cupom indisponível
                        </span>
                        Este cupom está indisponível ou sua vigência expirou.
                        Remova o cupom para continuar para a etapa de pagamento.
                        <div className="absolute left-1/2 -translate-x-1/2 top-full border-8 border-transparent border-t-gray-800" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Order summary sidebar */}

        {Controller.result.step != 'Endereço' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-4 shadow-soft">
              <h3 className="font-display font-bold text-surface-900 text-base mb-4">Resumo</h3>
              <div className="space-y-2 text-sm font-body">

                {cart.couponApplied && cart.shippingCost != 0 && !cart.erroCupom && (<div className="flex justify-between text-red-500">
                  <span>Subtotal  ({cart.cartItensProduct.reduce((s, i) => s + i.quantity, 0)} itens)</span>
                  <span className="font-semibold text-red-500">{formatPrice(cart.total ?? 0)}</span>
                </div>)}

                {cart.couponApplied && !cart.erroCupom && (
                  <div className={`flex justify-between ${cart.couponApplied ? `text-green-500` : `text-surface-500`}`}>
                    <span>Disconto Cupom</span>
                    <span className={`font-semibold  ${cart.couponApplied ? `text-green-500` : `text-surface-800`}`}>  {cart.discount_Type === "Percentage"
                      ? `-${cart.discount}%`
                      : cart.discount_Type === "FixedValue"
                        ? `-${formatPrice(cart.discount)}`
                        : "Frete Grátis"}</span>
                  </div>
                )}
                <div className={`flex justify-between ${cart.couponApplied && cart.shippingCost != 0 && !cart.erroCupom ? `text-green-500` : `text-surface-500`}`}>
                  <span>{`Subtotal ${cart.couponApplied && cart.shippingCost != 0 && !cart.erroCupom ? ("Cupom aplicado") : ""} `}({cart.cartItensProduct.reduce((s, i) => s + i.quantity, 0)} itens)</span>
                  <span className={`font-semibold  ${cart.couponApplied && cart.shippingCost != 0 && !cart.erroCupom ? `text-green-500` : `text-surface-800`}`}>{(formatPrice((cart.subTotal ?? 0) - (cart.shippingCost ?? 0)))}</span>
                </div>
                <div className="flex justify-between text-surface-500">
                  <span>Frete</span>
                  <span className={cart.shippingCost === 0 ? 'text-green-600 font-semibold' : 'font-semibold text-surface-800'}>
                    {cart.shippingCost === 0 && !cart.erroCupom ? 'Grátis' : formatPrice(cart.shippingCost || 0)}
                  </span>
                </div>
                {/* {Controller?.result.paymentDiscount > 0 && Controller?.result.step === 'Pagamento' && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto PIX (5%)</span>
                    <span className="font-semibold">-{formatPrice(Controller?.result.paymentDiscount)}</span>
                  </div>
                )} */}

                <div className="border-t border-surface-100 pt-2 mt-2 flex justify-between items-center">
                  <span className="font-display font-bold text-surface-900">Total</span>
                  <span className="font-display font-bold text-surface-900 text-xl">{formatPrice(cart.subTotal ?? 0)}</span>
                </div>
              </div>
            </div>
            {cart.erroCupom && (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-5 shadow-soft">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-display font-bold text-red-700">
                      Cupom indisponível
                    </h3>

                    <p className="text-sm text-red-600 mt-1">
                      {cart.menssege}
                    </p>

                    <p className="text-xs text-red-500 mt-3">
                      Este cupom não pode mais ser utilizado. Remova-o para continuar sua compra.
                    </p>

                    <button
                      onClick={() => setopenCouponConfirm(true)}
                      className="mt-4 h-11 px-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all"
                    >
                      Remover cupom
                    </button>
                  </div>
                </div>
              </div>
            )}
            {cart.couponApplied && !cart.erroCupom && (
              <div className="bg-white rounded-3xl p-4 shadow-soft border border-green-100 animate-fade-in">
                <div className="flex flex-row justify-between items-start gap-3 md:flex-col">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <Ticket className="w-5 h-5 text-green-600" />
                    </div>

                    <div>
                      <p className="text-xs font-body text-surface-500">
                        Cupom aplicado
                      </p>

                      <h3 className="font-display font-bold text-green-700 text-lg leading-tight">
                        {cupomSelecionado?.cod_Cupom}
                      </h3>
                    </div>
                  </div>

                  <div className="md:w-full md:flex md:justify-end">
                    <button
                      type="button"
                      onClick={() => setopenCouponConfirm(true)}
                      disabled={loadingRemove}
                      className="h-8 min-w-[100px] flex items-center justify-center rounded-xl border border-red-500 px-5 text-sm font-display font-semibold text-red-500 transition-all duration-200 hover:bg-red-500 hover:text-white active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loadingRemove ? (
                        <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                      ) : (
                        "Remover"
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-surface-100 space-y-1.5 text-sm font-body">
                  <div className="flex items-center justify-between">
                    <span className="text-surface-500">Tipo</span>
                    <span className="font-semibold text-surface-800">
                      {cart.discount_Type === "Percentage"
                        ? "Desconto Percentual"
                        : cart.discount_Type === "FixedValue"
                          ? "Desconto Fixo"
                          : "Frete Grátis"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-surface-500">Economia</span>
                    <span className="font-display font-bold text-green-600">
                      {cart.discount_Type === "Percentage"
                        ? `-${cart.discount}%`
                        : cart.discount_Type === "FixedValue"
                          ? `-${formatPrice(cart.discount)}`
                          : "Frete Grátis"}
                    </span>
                  </div>
                  {((cart.shippingCost ?? 0) > 0 && cart.discount_Type === "Percentage") && (<div
                    onClick={() => setOpenCouponDetails(true)}
                    className="mt-4 cursor-pointer rounded-2xl border border-green-200 bg-green-50 p-4 hover:bg-green-100 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-green-600" />

                        <div>
                          <p className="text-sm font-semibold text-green-700">
                            {cart.cartItensProduct.filter(p => (p.product?.valorDicont ?? 0) > 0).length} produtos com desconto
                          </p>

                          <p className="text-xs text-green-600">
                            Clique para visualizar
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-green-600" />
                    </div>
                  </div>)}
                  {cart.discount_Type === "FixedValue" && (<div
                    onClick={() => setOpenCouponDetails(true)}
                    className="mt-4 cursor-pointer rounded-2xl border border-green-200 bg-green-50 p-4 hover:bg-green-100 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-green-600" />

                        <div>
                          {cart.discount_Type === "FixedValue" ? (
                            <>
                              <p className="text-sm font-semibold text-green-700">
                                Desconto aplicado ao pedido
                              </p>

                              <p className="text-xs text-green-600">
                                Clique para visualizar o resumo do desconto.
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-semibold text-green-700">
                                {cart.cartItensProduct.filter(p => (p.product?.valorDicont ?? 0) > 0).length}
                                {" "}produtos com desconto
                              </p>

                              <p className="text-xs text-green-600">
                                Clique para visualizar
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-green-600" />
                    </div>
                  </div>)}

                </div>


                {/* Aviso */}
                {cart.discount_Type != 'FreeShipping' && (<div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />

                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        Atenção
                      </p>
                      {cart.discount_Type === "Percentage" ? (
                        <p className="text-xs text-amber-700 leading-relaxed mt-1">
                          Este cupom é válido apenas para os produtos vinculados à promoção.
                          Os demais itens do carrinho permanecerão com o preço original.
                        </p>
                      ) : cart.discount_Type === "FixedValue" ? (
                        <p className="text-xs text-amber-700 leading-relaxed mt-1">
                          Este cupom concede um desconto de {formatPrice(cart.discount)} no valor total do pedido.
                          O desconto é aplicado sobre a soma de todos os produtos do carrinho, e não em itens específicos.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>)}


              </div>
            )}
            {openCouponDetails && (
              <CouponProductsModal
                open={openCouponDetails}
                onClose={() => setOpenCouponDetails(false)}
                type={cart.discount_Type}
                discount={cart.discount}
                products={
                  cart.discount_Type === "FixedValue"
                    ? cart.cartItensProduct
                    : cart.cartItensProduct.filter(
                      p => (p.product?.valorDicont ?? 0) > 0
                    )
                }
              />
            )}
            <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
              <div className="flex items-center gap-2 text-green-700">
                <Lock className="w-4 h-4 shrink-0" />
                <p className="text-xs font-body">Seus dados estão protegidos com criptografia SSL de 256 bits</p>
              </div>
            </div>

          </div>)}


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
      <ConfirmPopup
        open={openCouponConfirm || false}
        title="Tem Certeza?"
        description="Deseja realmente remover Cupom do seu carrinho?"
        confirmText="Remover"
        onCancel={() => {
          setopenCouponConfirm(false);
          setloadingRemove(false);
        }}
        onConfirm={async () => {
          setopenCouponConfirm(false);
          await Controller?.action.RemoveApllyqueCupomController();
          setloadingRemove(false);
        }}
      />
    </div>
  );
}
