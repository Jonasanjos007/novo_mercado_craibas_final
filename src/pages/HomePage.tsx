import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Flame, Star, Zap, Shield, Truck,
  RefreshCw, Heart, TrendingUp, Award, ArrowRight,
  Sparkles, ShoppingBag, Percent, Package,
  User, Ticket, Copy, Check, LayoutGrid
} from 'lucide-react';
import { useStore } from '../context/store';
import { PROMOTIONS } from '../data/products';
import ProductCard from '../components/ProductCard';
import { formatPrice } from '../utils';
import { useNavigate } from 'react-router-dom';
import { useHomeController } from '../controller/useHomeController';
import Loading from '../components/Loading';
import { UseProductStore } from '../store/UseProductStore';
import { UseRouteStore } from '../store/UseRouteStore';
import { UseUserStore } from '../store/UseUserStore';
import { getColorConfig } from '../types/Colors';
import { UseOrderStore } from '../store/UseOrderStore';
import { UseCupomAdminStore } from '../storeAdmin/UseCupomAdminStore';

function useCountdown(endDate?: string | null) {
  const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' });
  useEffect(() => {
    const tick = () => {
      const target = endDate ? new Date(endDate).getTime() : Number.NaN;
      const diff = target - Date.now();
      if (!Number.isFinite(target) || diff <= 0) {
        setTimeLeft({ h: '00', m: '00', s: '00' });
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);
  return timeLeft;
}

// utilitário para esconder a scrollbar nas faixas de rolagem horizontal
const noScrollbar = '[&::-webkit-scrollbar]:hidden';
const noScrollbarStyle: React.CSSProperties = { scrollbarWidth: 'none' };
const PAGE_SIZE = 15;

export default function HomePage() {
  const Controller = useHomeController();
  const { LoadCupons, Cupons } = UseOrderStore();

  const { toggleWishlist, isWishlisted, setListProducts } = useStore();
  const { navigatePages, navigateTo } = UseRouteStore();
  const { Category } = UseOrderStore();
  const { products } = UseProductStore();

  const navigate = useNavigate();
  const [bannerIndex, setBannerIndex] = useState(0);
  const [valorIDProduct, setValorIDProduct] = useState('');
  const [autoPlay, setAutoPlay] = useState(true);
  const [activeTab, setActiveTab] = useState<'featured' | 'new' | 'bestsellers'>('featured');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { NameColorGlobal, ColorGlobalTema, ColorGlobalHover, ColorGlobalText, ColorGlobalHoverText } = UseUserStore();
  const colorConfig = getColorConfig(NameColorGlobal);
  const scrollRef = useRef<HTMLDivElement>(null);

  const featured = products.filter(p => p.featured);
  const viral = products.filter(p => p.badge === 'viral');
  const Show_Flash_Offer = Cupons.filter(p => p.show_Flash_Offer === true);
  console.log("Show_Flash_Offer", Show_Flash_Offer)
  const offers = products.filter(p => p.badge === 'oferta' || (p.origin_Price && p.origin_Price > p.price_Unic));
  const newProducts = products.filter(p => p.badge === 'novo');
  const bestsellers = [...products].sort((a, b) => b.count_Sold - a.count_Sold).slice(0, 8);
  const BANNER_SLIDE = products.filter(p => p.showBanner === true);

  const viralCarouselRef = useRef<HTMLDivElement | null>(null);
  const offersCarouselRef = useRef<HTMLDivElement | null>(null);

  const scrollViral = (direction: 'left' | 'right') => {
    viralCarouselRef.current?.scrollBy({
      left: direction === 'left' ? -312 : 312,
      behavior: 'smooth',
    });
  };

  const scrollOffers = (direction: 'left' | 'right') => {
    offersCarouselRef.current?.scrollBy({
      left: direction === 'left' ? -312 : 312,
      behavior: 'smooth',
    });
  };

  const tabProducts = {
    featured: featured.slice(0, 8),
    new: newProducts.slice(0, 8),
    bestsellers: bestsellers.slice(0, 8),
  };

  const mixedProducts = useMemo(() => {
    const groups = Category.map(category => products.filter(product => Number(product.id_category) === Number(category.id))).filter(group => group.length);
    const result = [] as typeof products;
    let position = 0;
    while (groups.some(group => position < group.length)) {
      groups.forEach(group => group[position] && result.push(group[position]));
      position += 1;
    }
    products.forEach(product => {
      if (!result.some(item => item.id === product.id)) result.push(product);
    });
    return result;
  }, [Category, products]);

  const visibleProducts = mixedProducts.slice(0, visibleCount);
  const hasMore = visibleCount < mixedProducts.length;

  useEffect(() => {
    if (!autoPlay || BANNER_SLIDE.length === 0) return;

    const timer = setInterval(() => {
      setBannerIndex(i => (i + 1) % BANNER_SLIDE.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [autoPlay, BANNER_SLIDE.length]);

  const handleCopyCoupon = async (code?: string) => {
    if (!code) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback para HTTP ou navegadores antigos
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        document.execCommand("copy");

        document.body.removeChild(textArea);
      }

      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode(prev => (prev === code ? null : prev));
      }, 2000);

    } catch (err) {
      console.error("Erro ao copiar cupom:", err);
    }
  };
  const flashOffer = Show_Flash_Offer[0];
  const countdown = useCountdown(flashOffer?.date_end ?? flashOffer?.date_End);
  return (

    <div className="min-h-screen bg-[#f5f5f7]">
      {Show_Flash_Offer.length > 0 && (
        <div
          className={`bg-gradient-to-r ${ColorGlobalTema} px-3 py-2 overflow-hidden relative`}
        >
          <div
            className="flex flex-wrap md:flex-nowrap items-center justify-center gap-x-2 gap-y-1 text-[10px] sm:text-xs text-center text-white font-body font-semibold tracking-wide animate-pulse-soft"
          >
            <span className="w-full md:w-auto">
              🔥 {Show_Flash_Offer[0]?.description || 'OFERTA RELÂMPAGO'} — USE:{' '}
              <strong>{Show_Flash_Offer[0]?.cod_Cupom}</strong>
            </span>

            <span className="hidden md:block">·</span>

            <span className="whitespace-nowrap">
              Pode usar acima de R${' '}
              {Number(
                Show_Flash_Offer[0]?.minimum_Value ?? 0
              ).toFixed(2)}
            </span>

            <span className="hidden md:block">·</span>

            <span className="whitespace-nowrap">
              {(Show_Flash_Offer[0]?.quantity_Uses ?? 0) -
                (Show_Flash_Offer[0]?.quantity_Used ?? 0)}{' '}
              cupons disponíveis
            </span>
          </div>
        </div>
      )}
      <section className="relative h-[380px] md:h-[480px] bg-[#09090b] overflow-hidden">
        {BANNER_SLIDE.map((slide, i) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === bannerIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={`/Imagens/Produtos/${slide.imagens[0].url_Imagem}`}
              alt={slide.name}
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-5 md:px-12 w-full">
                <div className={`max-w-xl transition-all duration-700 ${i === bannerIndex ? 'animate-slide-up' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-bold border border-white/20 backdrop-blur-sm"
                      style={{ background: `${colorConfig.hex}`, color: '#fff' }}
                    >
                      {slide.badge}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/90 text-white border border-red-400/30">
                      {slide.origin_Price && slide.origin_Price > 0 ? `${Math.round(((slide.origin_Price - slide.price_Unic) / slide.origin_Price) * 100)}%` : ''} OFF
                    </span>
                  </div>
                  <h1 className="font-display font-bold text-white text-2xl md:text-4xl leading-[1.05] mb-2.5 tracking-tight">
                    {slide.name}
                  </h1>
                  <p className="text-white/70 font-body text-sm md:text-base mb-5 leading-relaxed line-clamp-2">
                    {slide.description}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => navigate(`/product/${BANNER_SLIDE[bannerIndex].id}`)}
                      className="px-6 py-3 bg-white text-[#09090b] font-display font-bold rounded-2xl hover:bg-brand-50 hover:text-brand-600 transition-all shadow-strong text-sm flex items-center gap-2 group"
                    >
                      Ver Produto <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => navigate(`/flash-sale`)}
                      className="px-6 py-3 bg-white/10 text-white font-display font-semibold rounded-2xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20 text-sm"
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
          onClick={() => { setBannerIndex(i => (i - 1 + BANNER_SLIDE.length) % BANNER_SLIDE.length); setAutoPlay(false); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-all border border-white/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => { setBannerIndex(i => (i + 1) % BANNER_SLIDE.length); setAutoPlay(false); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-all border border-white/10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots + contador, agrupados na mesma linha inferior para não competir por espaço */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-5">
          <div className="flex gap-2">
            {BANNER_SLIDE.map((_, i) => (
              <button
                key={i}
                onClick={() => { setBannerIndex(i); setAutoPlay(false); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === bannerIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>
          <span className="text-white/40 text-xs font-body">
            {bannerIndex + 1} / {BANNER_SLIDE.length}
          </span>
        </div>
      </section>

      {/* ── FLASH SALE BANNER ── */}

      <section className="bg-gradient-to-r from-[#09090b] to-[#18181b] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4 flex-wrap justify-between">
          <div className="flex items-center gap-3">
            <div style={{ background: `${colorConfig.hex}22` }} className={`w-10 h-10 rounded-xl ${ColorGlobalTema}/20 flex items-center justify-center`}>
              <Zap style={{ fill: `${colorConfig.hex}` }} className={`w-5 h-5 ${ColorGlobalText}`} />
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
                <span className={`${ColorGlobalTema} text-white font-display font-bold text-sm px-2.5 py-1.5 rounded-xl min-w-[36px] text-center`}>
                  {v}
                </span>
                {i < 2 && <span className={`${ColorGlobalText} font-bold`}>:</span>}
              </span>
            ))}
          </div>
          <button onClick={() => navigate('/flash-sale')} className={`flex items-center gap-2 px-5 py-2 ${ColorGlobalTema} ${ColorGlobalHover} text-white font-display font-bold text-sm rounded-xl transition-all `} style={{ boxShadow: `0 4px 12px  ${colorConfig.hex}` }}>
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

        {/* ══════════════════════════════════════════════
            CATEGORIAS — círculos clicáveis com a imagem
            real da categoria, rolagem horizontal em mobile
        ══════════════════════════════════════════════ */}
        <section className="pt-8 pb-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-surface-900 text-xl md:text-2xl tracking-tight">Explorar por Categoria</h2>
              <p className="text-surface-400 text-xs md:text-sm font-body mt-0.5">Encontre o que você procura</p>
            </div>
          </div>

          <div className={`flex gap-4 overflow-x-auto pb-2 -mx-4  px-4 snap-x snap-mandatory md:grid md:grid-cols-8 md:gap-3 md:overflow-visible md:mx-0 md:px-0 ${noScrollbar}`} style={noScrollbarStyle}>
            {Category.filter(category => category.ativo ?? true).map(category => {
              // tenta usar a imagem real da categoria vinda do backend; se não existir, cai no emoji como fallback visual
              const categoryImageUrl = category.imagem
                ? category.imagem.startsWith('/') || category.imagem.startsWith('http') || category.imagem.startsWith('data:')
                  ? category.imagem
                  : `/Imagens/Categorias/${category.imagem}`
                : '';

              return (
                <button
                  key={category.id}
                  onClick={() => { navigatePages('category', null, category.category); navigate(`/category/${category.category}`); }}
                  className="flex shrink-0 mt-2 snap-start flex-col items-center gap-2 w-[74px] md:w-full group"
                >
                  <div
                    className="relative w-16 h-16 md:w-[72px] md:h-[72px] rounded-full overflow-hidden ring-2 ring-offset-2 ring-offset-[#f5f5f7] shadow-soft group-hover:scale-105 group-active:scale-95 transition-all duration-300"
                    style={{ ['--tw-ring-color' as string]: category.color || colorConfig.hex, background: category.color || colorConfig.hex }}
                  >
                    {categoryImageUrl ? (
                      <img src={categoryImageUrl} alt={category.category} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-white"><ShoppingBag className="h-6 w-6" /></span>
                    )}
                  </div>
                  <span className="text-[11px] font-display font-bold text-surface-700 text-center leading-tight line-clamp-2 group-hover:text-brand-600 transition-colors">
                    {category.category}
                  </span>
                </button>
              );
            })}


          </div>
        </section>

        {/* ══════════════════════════════════════════════
            CUPONS — em formato de ticket, com cópia
            de código com um toque e feedback visual
        ══════════════════════════════════════════════ */}
        {Show_Flash_Offer.length > 0 && (
          <section className="py-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Ticket className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <h2 className="font-display font-bold text-surface-900 text-lg tracking-tight">Cupom Ralâmpago Para Você</h2>
                <p className="text-surface-400 text-[11px] font-body">Toque para copiar o código</p>
              </div>
            </div>

            {flashOffer && (
              <div className="w-full">
                <button
                  onClick={() => handleCopyCoupon(flashOffer.cod_Cupom ?? '')}
                  className="relative flex w-full overflow-hidden rounded-2xl text-left group hover:-translate-y-0.5 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #1e1e2e, #2d1b69)',
                  }}
                >
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/5" />

                  <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-1.5 border-r border-dashed border-white/15 px-2 py-4">
                    <Ticket className="w-5 h-5 text-brand-400" />

                    <span className="text-brand-400 text-[9px] font-black uppercase tracking-widest text-center leading-tight">
                      {flashOffer.name_Cupom}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 p-4">
                    <h4 className="font-display font-bold text-white text-sm leading-tight line-clamp-2">
                      {flashOffer.description}
                    </h4>

                    <p className="text-white/40 text-[10px] font-body mt-1.5">
                      {flashOffer.minimum_Value
                        ? `Mín. ${formatPrice(flashOffer.minimum_Value)}`
                        : 'Sem valor mínimo'}
                    </p>

                    <div
                      className={`mt-3 flex items-center justify-between rounded-xl border px-3 py-2 transition-all ${copiedCode === flashOffer.cod_Cupom
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : 'border-brand-500/30 bg-brand-500/10 group-hover:bg-brand-500/20'
                        }`}
                    >
                      <span
                        className={`font-display font-bold text-xs tracking-widest ${copiedCode === flashOffer.cod_Cupom
                          ? 'text-emerald-400'
                          : 'text-brand-400'
                          }`}
                      >
                        {flashOffer.cod_Cupom}
                      </span>

                      {copiedCode === flashOffer.cod_Cupom ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                          <Check className="w-3.5 h-3.5" />
                          Copiado
                        </span>
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-brand-400" />
                      )}
                    </div>
                  </div>
                </button>
              </div>
            )}
          </section>
        )}


        {/* ══════════════════════════════════════════════
            PRODUTOS — feed principal com abas, seguido
            das faixas de virais e ofertas em scroll
            horizontal para navegação rápida em mobile
        ══════════════════════════════════════════════ */}
        <section className="py-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="font-display font-bold text-surface-900 text-xl tracking-tight">
              <Sparkles className={`w-5 h-5 ${ColorGlobalText} inline mr-2 -mt-0.5`} />
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
                  className={`px-4 py-2 rounded-lg text-xs font-display font-bold transition-all ${activeTab === tab.key ? 'bg-white text-surface-900 shadow-soft' : 'text-surface-400 hover:text-surface-600'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 animate-fade-in" key={activeTab}>
            {tabProducts[activeTab].map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* ── VIRAL PRODUCTS ── */}
        <section className="mb-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center"
                style={{ background: colorConfig.hex + '22' }}
              >
                <Flame className={`w-5 h-5 ${ColorGlobalText}`} />
              </div>

              <div>
                <h2 className="font-display font-bold text-surface-900 text-xl tracking-tight">
                  Virais da Semana
                </h2>

                <p className="text-surface-400 text-xs font-body">
                  Os mais buscados agora
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollViral('left')}
                className="w-9 h-9 rounded-full border border-surface-200 flex items-center justify-center hover:bg-surface-100 transition-colors"
                aria-label="Voltar produtos"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollViral('right')}
                className="w-9 h-9 rounded-full border border-surface-200 flex items-center justify-center hover:bg-surface-100 transition-colors"
                aria-label="Avançar produtos"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  navigatePages('category', null, 'virais');
                  navigate('/category/virais');
                }}
                className={`flex items-center gap-1 shrink-0 ${ColorGlobalText} ${ColorGlobalHoverText} text-sm font-display font-semibold transition-colors`}
              >
                Ver todos
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={viralCarouselRef}
            className={`flex gap-3 overflow-x-auto scroll-smooth pb-2 -mx-4 px-4 snap-x snap-mandatory ${noScrollbar}`}
            style={noScrollbarStyle}
          >
            {viral.slice(0, 8).map(p => (
              <div
                key={p.id}
                className="shrink-0 snap-start"
                style={{
                  width: '250px',
                  minWidth: '250px',
                  flexBasis: '250px',
                }}
              >
                <ProductCard product={p} compact />
              </div>
            ))}
          </div>
        </section>

        {/* ── BIG BANNER (marcas/flash-sale) ── */}
        <section className="my-10">
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

        {/* ── OFFERS ── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center"
                style={{ background: colorConfig.hex + '22' }}
              >
                <Percent className={`w-5 h-5 ${ColorGlobalText}`} />
              </div>

              <div>
                <h2 className="font-display font-bold text-surface-900 text-xl tracking-tight">
                  Ofertas Imperdíveis
                </h2>

                <p className="text-surface-400 text-xs font-body">
                  Preços que não duram muito
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollOffers('left')}
                className="w-9 h-9 rounded-full border border-surface-200 flex items-center justify-center hover:bg-surface-100 transition-colors"
                aria-label="Voltar ofertas"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollOffers('right')}
                className="w-9 h-9 rounded-full border border-surface-200 flex items-center justify-center hover:bg-surface-100 transition-colors"
                aria-label="Avançar ofertas"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/search/search')}
                className="flex items-center gap-1 shrink-0 text-brand-500 hover:text-brand-600 text-sm font-display font-semibold transition-colors"
              >
                Ver todos
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={offersCarouselRef}
            className={`flex gap-3 overflow-x-auto scroll-smooth pb-2 -mx-4 px-4 snap-x snap-mandatory ${noScrollbar}`}
            style={noScrollbarStyle}
          >
            {offers.slice(0, 8).map(p => (
              <div
                key={p.id}
                className="shrink-0 snap-start"
                style={{
                  width: '250px',
                  minWidth: '250px',
                  flexBasis: '250px',
                }}
              >
                <ProductCard product={p} compact />
              </div>
            ))}
          </div>
        </section>

        {/* Catálogo completo adicional */}
        <section className="mb-10 py-2">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10" style={{ background: colorConfig.hex + '22' }}>
              <LayoutGrid className={`h-5 w-5 ${ColorGlobalText}`} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-surface-900">Todos os Produtos</h2>
              <p className="text-xs text-surface-400">Encontre de tudo em um só lugar</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
            {visibleProducts.map(product => <div key={product.id} className="min-w-0"><ProductCard product={product} /></div>)}
          </div>

          {visibleProducts.length === 0 && <div className="rounded-2xl border border-dashed border-surface-200 bg-white py-14 text-center"><Package className="mx-auto h-8 w-8 text-surface-300" /><p className="mt-3 text-sm font-bold text-surface-700">Nenhum produto encontrado</p><p className="mt-1 text-xs text-surface-400">Experimente outro filtro.</p></div>}

          {hasMore && <div className="mt-6 flex justify-center"><button onClick={() => setVisibleCount(value => value + PAGE_SIZE)} className={`rounded-2xl border border-surface-200 bg-white px-8 py-3 text-sm font-bold text-surface-700 transition-all hover:border-brand-300 hover:shadow-medium ${ColorGlobalHoverText}`}>Carregar Mais Produtos</button></div>}
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
                <span className={`${ColorGlobalText} text-xs font-bold uppercase tracking-widest mb-3 block`}>Por que escolher</span>
                <h2 className="font-display font-bold text-white text-3xl mb-4 tracking-tight leading-tight">
                  O Melhor Marketplace<br />de Craibas-AL
                </h2>
                <p className="text-white/50 font-body text-sm leading-relaxed mb-6">
                  Somos o marketplace local com os melhores preços, entrega rápida e atendimento humanizado. Produtos originais, garantia total e compra 100% segura.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => navigate('/about')} className={`px-5 py-2.5 ${ColorGlobalTema} ${ColorGlobalHover} text-white font-display font-bold text-sm rounded-xl transition-all `} style={{ boxShadow: `0 4px 12px  ${colorConfig.hex}` }}>
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
                  { icon: <Star className="w-5 h-5 fill-amber-400" />, title: '4.9', sub: 'Avaliação', color: 'text-amber-400', bg: 'bg-amber-500/10' },
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
                <div className={`w-9 h-9 rounded-xl ${ColorGlobalTema} flex items-center justify-center shadow-brand`} style={{ boxShadow: `0 4px 12px  ${colorConfig.hex}` }}>
                  <span className="text-white font-display font-bold text-xs">MC</span>
                </div>
                <div>
                  <span className="font-display font-bold text-white text-base block leading-none">Mercado Craibas</span>
                  <span className={`${ColorGlobalText} text-[10px] font-medium`}>Sua loja de confiança</span>
                </div>
              </div>
              <p className="text-surface-500 font-body text-xs leading-relaxed mb-4 max-w-[220px]">
                O marketplace local com os melhores preços, produtos originais e entrega rápida para toda a região.
              </p>
              <div className="flex gap-2">
                {['📱', '💬', '📸'].map((emoji, i) => (
                  <button key={i} className={`w-8 h-8 rounded-xl bg-surface-800 ${ColorGlobalHover} flex items-center justify-center text-sm transition-all`}>
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
                      <button
                        onClick={link.action}
                        className="text-surface-500 font-body text-xs transition-colors text-left hover:text-[var(--hover-color)]"
                        style={{
                          '--hover-color': colorConfig.hex,
                        } as React.CSSProperties}
                      >
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
