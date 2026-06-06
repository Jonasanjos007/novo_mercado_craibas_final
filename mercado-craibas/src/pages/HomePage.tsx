import { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Flame, Star, Zap, Shield, Truck,
  RefreshCw, Heart, TrendingUp, Award, ArrowRight,
  Sparkles, ShoppingBag, Percent, Package,
  User
} from 'lucide-react';
import { useStore } from '../context/store';
import { BANNER_SLIDES, PROMOTIONS } from '../data/products';
import ProductCard from '../components/ProductCard';
import { formatPrice, categoryLabels, categoryIcons } from '../utils';
import { useNavigate } from 'react-router-dom';
import { useHomeController } from '../controller/useHomeController';
import Loading from '../components/Loading';

const COUNTDOWN_TARGET = new Date(Date.now() + 4 * 60 * 60 * 1000 + 23 * 60 * 1000 + 45 * 1000);

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ h: '04', m: '23', s: '45' });
  useEffect(() => {
    const tick = () => {
      const diff = COUNTDOWN_TARGET.getTime() - Date.now();
      if (diff <= 0) return;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return timeLeft;
}

export default function HomePage() {
  const Controller = useHomeController();

  const { products, navigateTo, toggleWishlist, user, navigatePages, isWishlisted, setListProducts } = useStore();
  const navigate = useNavigate();

  const [bannerIndex, setBannerIndex] = useState(0);
  const [valorIDProduct, setValorIDProduct] = useState('');
  const [autoPlay, setAutoPlay] = useState(true);
  const [activeTab, setActiveTab] = useState<'featured' | 'new' | 'bestsellers'>('featured');
  const countdown = useCountdown();
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => setBannerIndex(i => (i + 1) % BANNER_SLIDES.length), 4500);
    return () => clearInterval(timer);
  }, [autoPlay]);
  const featured = products.filter(p => p.featured);
  const viral = products.filter(p => p.badge === 'viral');
  const offers = products.filter(p => p.badge === 'oferta' || (p.origin_Price && p.origin_Price > p.price_Unic));
  const newProducts = products.filter(p => p.badge === 'novo');
  const bestsellers = [...products].sort((a, b) => b.count_Sold - a.count_Sold).slice(0, 8);

  const tabProducts = {
    featured: featured.slice(0, 8),
    new: newProducts.slice(0, 8),
    bestsellers: bestsellers.slice(0, 8),
  };

  const catColors: Record<string, { from: string; to: string; accent: string }> = {
    eletronicos: { from: '#1e3a8a', to: '#3730a3', accent: '#818cf8' },
    garrafas: { from: '#0e7490', to: '#0f766e', accent: '#34d399' },
    acessorios: { from: '#6d28d9', to: '#7c3aed', accent: '#c084fc' },
    virais: { from: '#9a3412', to: '#c2410c', accent: '#fb923c' },
  };

  return (

    <div className="min-h-screen bg-[#f5f5f7]">

      {/* ── PROMO TOP STRIP ── */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 py-2 overflow-hidden relative">
        <div className="flex items-center justify-center gap-8 text-xs text-white font-body font-semibold tracking-wide animate-pulse-soft">
          <span>🔥 OFERTA RELÂMPAGO — USE: <strong>TECH15</strong></span>
          <span className="hidden md:block">·</span>
          <span className="hidden md:block">🚚 FRETE GRÁTIS acima de R$299</span>
          <span className="hidden md:block">·</span>
          <span className="hidden lg:block">💳 12x SEM JUROS no cartão</span>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <section className="relative h-[420px] md:h-[520px] bg-[#09090b] overflow-hidden">
        {BANNER_SLIDES.map((slide, i) => (

          <div
            key={slide.id}

            className={`absolute inset-0 transition-opacity duration-700 ${i === bannerIndex ? 'opacity-100' : 'opacity-0'}`}
          >

            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
                <div className={`max-w-xl transition-all duration-700 ${i === bannerIndex ? 'animate-slide-up' : ''}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-bold border border-white/20 backdrop-blur-sm"
                      style={{ background: 'rgba(249,115,22,0.85)', color: '#fff' }}
                    >
                      {slide.badge}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/90 text-white border border-red-400/30">
                      {slide.discount}
                    </span>
                  </div>
                  <h1 className="font-display font-bold text-white text-4xl md:text-6xl leading-[1.05] mb-3 tracking-tight">
                    {slide.title}
                  </h1>
                  <p className="text-white/70 font-body text-base md:text-lg mb-6 leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => {

                        navigate(`/product/${BANNER_SLIDES[bannerIndex].productId}`)
                      }}
                      className="px-7 py-3.5 bg-white text-[#09090b] font-display font-bold rounded-2xl hover:bg-brand-50 hover:text-brand-600 transition-all shadow-strong text-sm flex items-center gap-2 group"
                    >
                      Ver Produto <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => navigate(`/flash-sale`)}
                      className="px-7 py-3.5 bg-white/10 text-white font-display font-semibold rounded-2xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20 text-sm"
                    >
                      Ver Ofertas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        ))}

        {/* Controls */}
        <button
          onClick={() => { setBannerIndex(i => (i - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length); setAutoPlay(false); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-all border border-white/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => { setBannerIndex(i => (i + 1) % BANNER_SLIDES.length); setAutoPlay(false); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-all border border-white/10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {BANNER_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setBannerIndex(i); setAutoPlay(false); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === bannerIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-5 right-6 flex items-center gap-2 text-white/40 text-xs font-body">
          {bannerIndex + 1} / {BANNER_SLIDES.length}
        </div>
      </section>

      {/* ── FLASH SALE BANNER ── */}
      <section className="bg-gradient-to-r from-[#09090b] to-[#18181b] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4 flex-wrap justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-brand-400 fill-brand-400" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm">Oferta Relâmpago</p>
              <p className="text-white/40 text-xs">Preços por tempo limitado</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs font-body">Termina em:</span>
            {[countdown.h, countdown.m, countdown.s].map((v, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="bg-brand-500 text-white font-display font-bold text-sm px-2.5 py-1.5 rounded-xl min-w-[36px] text-center">
                  {v}
                </span>
                {i < 2 && <span className="text-brand-400 font-bold">:</span>}
              </span>
            ))}
          </div>
          <button onClick={() => navigate('/flash-sale')} className="flex items-center gap-2 px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-display font-bold text-sm rounded-xl transition-all shadow-brand">
            Ver Todas <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="bg-white border-b border-surface-100 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4">
          {[
            { icon: <Truck className="w-5 h-5 text-blue-500" />, title: 'Frete Grátis', sub: 'Acima de R$299', bg: 'bg-blue-50' },
            { icon: <Shield className="w-5 h-5 text-green-500" />, title: 'Compra Segura', sub: 'Pagamento protegido', bg: 'bg-green-50' },
            { icon: <RefreshCw className="w-5 h-5 text-purple-500" />, title: 'Troca Fácil', sub: 'Até 30 dias', bg: 'bg-purple-50' },
            { icon: <Award className="w-5 h-5 text-amber-500" />, title: 'Originais', sub: '100% garantidos', bg: 'bg-amber-50' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-3 py-4 px-4 border-r border-surface-100 last:border-0">
              <div className={`w-10 h-10 rounded-xl ${b.bg} flex items-center justify-center flex-shrink-0`}>
                {b.icon}
              </div>
              <div>
                <p className="font-display font-bold text-surface-800 text-sm">{b.title}</p>
                <p className="text-surface-400 text-xs font-body">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">

        {/* ── CATEGORIES ── */}
        <section className="py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-surface-900 text-2xl tracking-tight">Explorar por Categoria</h2>
              <p className="text-surface-400 text-sm font-body mt-1">Encontre o que você procura</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(categoryLabels).map(([key, label]) => {
              const cat = key as keyof typeof catColors;
              const c = catColors[cat];
              const count = products.filter(p => p.category === key).length;
              return (
                <button
                  key={key}
                  onClick={() => { navigatePages('category', null, key); navigate(`/category/${key}`); }}
                  className="relative overflow-hidden rounded-3xl p-5 text-left group hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300"
                  style={{ background: `linear-gradient(145deg, ${c.from}, ${c.to})` }}
                >
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-20" style={{ background: c.accent }} />
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full opacity-10" style={{ background: c.accent }} />
                  <span className="text-3xl block mb-3">{categoryIcons[key]}</span>
                  <h3 className="font-display font-bold text-white text-base leading-tight">{label}</h3>
                  <p className="text-white/60 text-xs font-body mt-1">{count} produtos</p>
                  <div className="mt-3 flex items-center gap-1 text-white/70 text-xs font-medium group-hover:text-white transition-colors">
                    Ver tudo <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── COUPON STRIP ── */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PROMOTIONS.filter(p => p.active).map(promo => (
              <div
                key={promo.id}
                className="relative overflow-hidden rounded-2xl p-4 cursor-pointer group hover:scale-[1.01] transition-all"
                style={{ background: 'linear-gradient(135deg, #1e1e2e, #2d1b69)' }}
              >
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/5" />
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-brand-400 text-[10px] font-bold uppercase tracking-widest">{promo.title}</span>
                    <h4 className="font-display font-bold text-white text-base mt-0.5">{promo.description}</h4>
                  </div>
                  <div className="bg-brand-500/20 border border-brand-500/30 rounded-xl px-3 py-1.5 flex-shrink-0">
                    <span className="font-display font-bold text-brand-400 text-sm tracking-widest">{promo.code}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-white/40 text-xs font-body">
                    {promo.minValue ? `Mín. ${formatPrice(promo.minValue)}` : 'Sem valor mínimo'}
                  </span>
                  <span className="text-white/50 text-xs font-body group-hover:text-brand-400 transition-colors">
                    Copiar →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── VIRAL PRODUCTS ── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <h2 className="font-display font-bold text-surface-900 text-xl tracking-tight">Virais da Semana</h2>
                <p className="text-surface-400 text-xs font-body">Os mais buscados agora</p>
              </div>
            </div>
            <button onClick={() => { navigatePages('category', null, 'virais'); navigate('/category/virais') }} className="flex items-center gap-1 text-brand-500 hover:text-brand-600 text-sm font-display font-semibold transition-colors">
              Ver todos <ChevronLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {viral.slice(0, 5).map(p => <ProductCard key={p.id} product={p} compact />)}
          </div>
        </section>

        {/* ── BIG BANNER (marcas/flash-sale) ── */}
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Flash Sale */}
            <div
              onClick={() => navigate('/flash-sale')}
              className="relative overflow-hidden rounded-3xl p-7 cursor-pointer group hover:scale-[1.01] transition-all"
              style={{ background: 'linear-gradient(135deg, #09090b 0%, #18181b 60%)' }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 opacity-10"
                style={{ background: 'radial-gradient(circle, #f97316, transparent)' }} />
              <Zap className="w-10 h-10 text-brand-400 fill-brand-400 mb-4 animate-float" />
              <h3 className="font-display font-bold text-white text-2xl mb-2">Oferta Relâmpago</h3>
              <p className="text-white/50 text-sm font-body mb-4">Descontos de até 50% por tempo limitado</p>
              <div className="flex items-center gap-2 text-brand-400 font-display font-bold text-sm group-hover:gap-3 transition-all">
                Aproveitar agora <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            {/* Brands */}
            <div
              onClick={() => navigate('/brands')}
              className="relative overflow-hidden rounded-3xl p-7 cursor-pointer group hover:scale-[1.01] transition-all"
              style={{ background: 'linear-gradient(135deg, #0c1a4e 0%, #1e3a8a 100%)' }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 opacity-10"
                style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
              <Star className="w-10 h-10 text-indigo-300 fill-indigo-300/30 mb-4" />
              <h3 className="font-display font-bold text-white text-2xl mb-2">Marcas Premium</h3>
              <p className="text-white/50 text-sm font-body mb-4">Apple, Samsung, Stanley e muito mais</p>
              <div className="flex items-center gap-2 text-indigo-300 font-display font-bold text-sm group-hover:gap-3 transition-all">
                Explorar marcas <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>

        {/* ── TABBED PRODUCTS ── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="font-display font-bold text-surface-900 text-xl tracking-tight">
              <Sparkles className="w-5 h-5 text-brand-500 inline mr-2 -mt-0.5" />
              Selecionados para Você
            </h2>
            <div className="flex gap-1 bg-surface-100 rounded-xl p-1">
              {([
                { key: 'featured', label: 'Destaques' },
                { key: 'new', label: 'Novidades' },
                { key: 'bestsellers', label: 'Mais Vendidos' },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-xs font-display font-bold transition-all ${activeTab === tab.key
                    ? 'bg-white text-surface-900 shadow-soft'
                    : 'text-surface-400 hover:text-surface-600'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-fade-in" key={activeTab}>
            {tabProducts[activeTab].map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* ── OFFERS ── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Percent className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="font-display font-bold text-surface-900 text-xl tracking-tight">Ofertas Imperdíveis</h2>
                <p className="text-surface-400 text-xs font-body">Preços que não duram muito</p>
              </div>
            </div>
            <button onClick={() => navigate('/search/search')} className="flex items-center gap-1 text-brand-500 hover:text-brand-600 text-sm font-display font-semibold transition-colors">
              Ver todos <ChevronLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {offers.slice(0, 5).map(p => <ProductCard key={p.id} product={p} compact />)}
          </div>
        </section>

        {/* ── BRANDS SHOWCASE ── */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-surface-900 text-xl tracking-tight mb-5 text-center">
            Marcas que Você Ama
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { name: 'Apple', emoji: '🍎', bg: 'bg-gray-50', border: 'border-gray-200' },
              { name: 'Samsung', emoji: '📱', bg: 'bg-blue-50', border: 'border-blue-100' },
              { name: 'Stanley', emoji: '🧊', bg: 'bg-green-50', border: 'border-green-100' },
              { name: 'JBL', emoji: '🎧', bg: 'bg-orange-50', border: 'border-orange-100' },
              { name: 'Sony', emoji: '🎮', bg: 'bg-purple-50', border: 'border-purple-100' },
              { name: 'Outros', emoji: '✨', bg: 'bg-brand-50', border: 'border-brand-100' },
            ].map((brand, i) => (
              <button
                key={i}
                onClick={() => navigate('/brands')}
                className={`${brand.bg} border ${brand.border} rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-medium hover:-translate-y-0.5 transition-all`}
              >
                <span className="text-2xl">{brand.emoji}</span>
                <span className="font-display font-bold text-surface-700 text-xs">{brand.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── WHY US ── */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-[#09090b] to-[#18181b] rounded-3xl p-8 md:p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 opacity-5 rounded-full"
              style={{ background: 'radial-gradient(circle, #f97316, transparent)', transform: 'translate(30%, -30%)' }} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-brand-400 text-xs font-bold uppercase tracking-widest mb-3 block">Por que escolher</span>
                <h2 className="font-display font-bold text-white text-3xl mb-4 tracking-tight leading-tight">
                  O Melhor Marketplace<br />de Craibas-AL
                </h2>
                <p className="text-white/50 font-body text-sm leading-relaxed mb-6">
                  Somos o marketplace local com os melhores preços, entrega rápida e atendimento humanizado. Produtos originais, garantia total e compra 100% segura.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => navigate('/about')} className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-display font-bold text-sm rounded-xl transition-all shadow-brand">
                    Conheça Nossa História
                  </button>
                  <button onClick={() => navigate('/products')} className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-display font-semibold text-sm rounded-xl transition-all border border-white/10">
                    Ver Produtos
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <Package className="w-5 h-5" />, title: '500+', sub: 'Produtos', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { icon: <ShoppingBag className="w-5 h-5" />, title: '10K+', sub: 'Pedidos', color: 'text-green-400', bg: 'bg-green-500/10' },
                  { icon: <Star className="w-5 h-5 fill-amber-400" />, title: "4.9", sub: "Avaliação", color: "text-amber-400", bg: "bg-amber-500/10" },
                  { icon: <Heart className="w-5 h-5 fill-red-400/30" />, title: '3K+', sub: 'Clientes', color: 'text-red-400', bg: 'bg-red-500/10' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4">
                    <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center ${s.color} mb-3`}>
                      {s.icon}
                    </div>
                    <p className={`font-display font-bold text-2xl ${s.color}`}>{s.title}</p>
                    <p className="text-white/30 text-xs mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-[#09090b] text-white mt-4">
        <div className="max-w-7xl mx-auto px-4 pt-12 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-brand">
                  <span className="text-white font-display font-bold text-xs">MC</span>
                </div>
                <div>
                  <span className="font-display font-bold text-white text-base block leading-none">Mercado Craibas</span>
                  <span className="text-brand-400 text-[10px] font-medium">Sua loja de confiança</span>
                </div>
              </div>
              <p className="text-surface-500 font-body text-xs leading-relaxed mb-4 max-w-[220px]">
                O marketplace local com os melhores preços, produtos originais e entrega rápida para toda a região.
              </p>
              <div className="flex gap-2">
                {['📱', '💬', '📸'].map((emoji, i) => (
                  <button key={i} className="w-8 h-8 rounded-xl bg-surface-800 hover:bg-brand-500 flex items-center justify-center text-sm transition-all">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {[
              {
                title: 'Categorias', links: [
                  { label: 'Eletrônicos', action: () => navigateTo('category', undefined, 'eletronicos') },
                  { label: 'Garrafas Stanley', action: () => navigateTo('category', undefined, 'garrafas') },
                  { label: 'Acessórios', action: () => navigateTo('category', undefined, 'acessorios') },
                  { label: 'Virais 🔥', action: () => navigateTo('category', undefined, 'virais') },
                ]
              },
              {
                title: 'Navegação', links: [
                  { label: 'Ofertas Relâmpago', action: () => navigateTo('flash-sale') },
                  { label: 'Marcas Premium', action: () => navigateTo('brands') },
                  { label: 'Lista de Desejos', action: () => navigateTo('wishlist') },
                  { label: 'Meus Pedidos', action: () => navigateTo('orders') },
                ]
              },
              {
                title: 'Empresa', links: [
                  { label: 'Sobre Nós', action: () => navigateTo('about') },
                  { label: 'Contato', action: () => { } },
                  { label: 'Política de Privacidade', action: () => { } },
                  { label: 'Termos de Uso', action: () => { } },
                ]
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-display font-bold text-white text-sm mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <button onClick={link.action} className="text-surface-500 hover:text-brand-400 font-body text-xs transition-colors text-left">
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-surface-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-surface-600 font-body text-xs">
              © 2026 Mercado Craibas · CNPJ 00.000.000/0001-00 · Craibas, AL
            </p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {['PIX', 'Visa', 'Mastercard', 'Elo', 'Boleto', 'Amex'].map(m => (
                <span key={m} className="px-2.5 py-1 bg-surface-800 rounded-lg text-surface-400 font-body text-[10px] font-semibold">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
      <Loading
        loading={Controller.result.Loading}
        message="Carregando Produtos"
        subMessage="Carregando os melhores produtos para você"
      />
    </div>
  );
}

// need Package in scope
