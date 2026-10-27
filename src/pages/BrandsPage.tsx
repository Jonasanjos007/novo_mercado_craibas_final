import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, ArrowRight, Sparkles, Flame, Truck, ShieldCheck, Star, Zap, ChevronRight,
  RotateCcw, MapPin, TrendingUp, BadgePercent, PiggyBank, Award,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import { useBrandsController } from '../controller/useBrandsController';
import { UseProductStore } from '../store/UseProductStore';
import { UseUserStore } from '../store/UseUserStore';
import { UseOrderStore } from '../store/UseOrderStore';
import { UseUserAdminStore } from '../storeAdmin/UseUserAdminStore';
import { getColorConfig } from '../types/Colors';
import { Product } from '../models/Product';
import { formatDiscount, formatPrice, RETURN_WINDOW_DAYS } from '../utils';

/* ============================================================================
 * Achadinhos: vitrine montada só com dados reais da loja
 * (vendas, data de cadastro, desconto, avaliação, frete). Nada de número inventado.
 * ========================================================================== */

const SECTION_PAGE_SIZE = 10;
const SECTION_EXPANDED_SIZE = 20;
const SUGGESTIONS_PAGE_SIZE = 12;
const NEW_PRODUCT_DAYS = 30;
const CHEAP_LIMIT = 50;

type SectionId = 'mais-vendidos' | 'ofertas' | 'novidades' | 'bem-avaliados' | 'ate-50' | 'frete-gratis' | 'destaques';

interface ThemeSection {
  id: SectionId;
  icon: typeof Flame;
  title: string;
  subtitle: string;
  items: Product[];
  ranked?: boolean;
}

const FLOAT_POSITIONS = [
  { top: '4%', left: '4%', delay: '0s', duration: '6.5s', rotate: '-6deg' },
  { top: '2%', left: '54%', delay: '0.7s', duration: '7.5s', rotate: '4deg' },
  { top: '48%', left: '0%', delay: '1.2s', duration: '6s', rotate: '5deg' },
  { top: '58%', left: '58%', delay: '0.4s', duration: '8s', rotate: '-4deg' },
  { top: '30%', left: '30%', delay: '1.6s', duration: '7s', rotate: '3deg' },
];

const discountOf = (p: Product) => (p.origin_Price && p.origin_Price > p.price_Unic ? formatDiscount(p.origin_Price, p.price_Unic) : 0);
const insertedAt = (p: Product) => (p.insertDate ? new Date(p.insertDate).getTime() : 0);
const haystack = (p: Product) => `${p.name ?? ''} ${p.description ?? ''} ${p.tags ?? ''}`.toLowerCase();

/* ── Scroll reveal ─────────────────────────────────────────────────────────── */

function ScrollReveal({ children, delayMs = 0 }: { children: React.ReactNode; delayMs?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: isVisible ? `${delayMs}ms` : '0ms' }}
      className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      {children}
    </div>
  );
}

/* ── Subcomponentes ───────────────────────────────────────────────────────── */

function FloatingProductPreview({ product, position }: { product: Product; position: (typeof FLOAT_POSITIONS)[number] }) {
  const image = product.imagens?.[0]?.url_Imagem;
  const discount = discountOf(product);
  return (
    <div
      className="absolute w-28 md:w-32 rounded-2xl bg-white shadow-strong border border-surface-100 overflow-hidden animate-float"
      style={{ top: position.top, left: position.left, animationDelay: position.delay, animationDuration: position.duration, transform: `rotate(${position.rotate})` }}
    >
      <div className="relative h-20 md:h-24 bg-surface-50 flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={`/Imagens/Produtos/${image}`} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">🛍️</span>
        )}
        {discount > 0 && (
          <span className="absolute top-1.5 left-1.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-display font-bold text-white">-{discount}%</span>
        )}
      </div>
      <div className="p-2">
        <p className="text-[10px] font-body text-surface-500 truncate">{product.name}</p>
        <p className="text-xs font-display font-bold text-surface-900">{formatPrice(product.price_Unic)}</p>
      </div>
    </div>
  );
}

interface PromoBanner {
  id: string;
  icon: typeof Zap;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  gradient: string;
  onClick: () => void;
}

function MegaPromoBanner({ banner }: { banner: PromoBanner }) {
  const Icon = banner.icon;
  return (
    <button
      type="button"
      onClick={banner.onClick}
      className={`relative w-full text-left overflow-hidden rounded-3xl p-7 md:p-10 group hover:scale-[1.005] transition-all bg-gradient-to-br ${banner.gradient}`}
    >
      <div className="pointer-events-none absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-10 w-56 h-56 rounded-full bg-black/10 blur-2xl" />
      <div className="relative">
        <Icon className="w-9 h-9 mb-4 text-white drop-shadow" />
        <span className="text-xs font-bold uppercase tracking-widest text-white/80">{banner.eyebrow}</span>
        <h3 className="font-display font-extrabold text-white text-3xl md:text-4xl mt-1 mb-2 drop-shadow-sm">{banner.title}</h3>
        <p className="text-white/90 text-sm font-body mb-5 max-w-md">{banner.subtitle}</p>
        <span className="inline-flex items-center gap-2 bg-white text-surface-900 font-display font-bold text-sm px-5 py-2.5 rounded-xl group-hover:gap-3 transition-all shadow-md">
          {banner.ctaLabel} <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </button>
  );
}

function SectionHeader({ section, accent, canExpand, expanded, onViewAll }: {
  section: ThemeSection; accent: string; canExpand: boolean; expanded: boolean; onViewAll: () => void;
}) {
  const Icon = section.icon;
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${accent}14`, color: accent }}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display font-bold text-surface-900 text-xl md:text-2xl tracking-tight">{section.title}</h2>
          <p className="text-surface-400 text-xs md:text-sm font-body mt-0.5">{section.subtitle}</p>
        </div>
      </div>
      {canExpand && (
        <button
          type="button"
          onClick={onViewAll}
          className="flex-shrink-0 flex items-center gap-1 text-sm font-display font-semibold transition-opacity hover:opacity-80"
          style={{ color: accent }}
        >
          {expanded ? 'Ver menos' : 'Ver mais'} <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function scrollToSection(sectionId: string) {
  document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Página ───────────────────────────────────────────────────────────────── */

export default function AchadinhosPage() {
  const Controller = useBrandsController();
  const navigate = useNavigate();
  const { products } = UseProductStore();
  const { Category } = UseOrderStore();
  const { BaseSiteInterface } = UseUserAdminStore();
  const { NameColorGlobal, ColorGlobalTema, ColorGlobalHover } = UseUserStore();
  const colorConfig = getColorConfig(NameColorGlobal);
  const accent = colorConfig.hex;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [suggestionsCount, setSuggestionsCount] = useState(SUGGESTIONS_PAGE_SIZE);

  const deliveryDays = Number(BaseSiteInterface?.timeframeBusinessDays) || 0;
  const shippingCost = Number(BaseSiteInterface?.shippingCost) || 0;

  const allProducts = useMemo(() => (products ?? []).filter((p) => p.ativo !== false), [products]);

  // Categorias reais que têm produto.
  const categories = useMemo(
    () => Category
      .map((c) => ({ id: Number(c.id), name: c.category || 'Sem categoria', count: allProducts.filter((p) => Number(p.id_category) === Number(c.id)).length }))
      .filter((c) => c.count > 0),
    [Category, allProducts],
  );

  // Busca + categoria. Sem resultado = mostra aviso (não esconde atrás do catálogo todo).
  const pool = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return allProducts.filter((p) =>
      (selectedCategory === null || Number(p.id_category) === selectedCategory) &&
      (!term || haystack(p).includes(term)));
  }, [allProducts, searchTerm, selectedCategory]);

  const maxDiscount = useMemo(() => allProducts.reduce((m, p) => Math.max(m, discountOf(p)), 0), [allProducts]);

  const sections = useMemo<ThemeSection[]>(() => {
    const now = Date.now();
    const list: ThemeSection[] = [
      {
        id: 'mais-vendidos', icon: TrendingUp, ranked: true,
        title: 'Mais vendidos', subtitle: 'Os campeões de venda da loja, na ordem',
        items: pool.filter((p) => (p.count_Sold ?? 0) > 0).sort((a, b) => (b.count_Sold ?? 0) - (a.count_Sold ?? 0)),
      },
      {
        id: 'ofertas', icon: BadgePercent,
        title: 'Em oferta', subtitle: 'Preço abaixo do original, desconto já aplicado',
        items: pool.filter((p) => discountOf(p) > 0).sort((a, b) => discountOf(b) - discountOf(a)),
      },
      {
        id: 'novidades', icon: Sparkles,
        title: 'Novidades', subtitle: `Chegaram nos últimos ${NEW_PRODUCT_DAYS} dias`,
        items: pool.filter((p) => now - insertedAt(p) <= NEW_PRODUCT_DAYS * 86400000).sort((a, b) => insertedAt(b) - insertedAt(a)),
      },
      {
        id: 'bem-avaliados', icon: Star,
        title: 'Mais bem avaliados', subtitle: 'Nota 4 ou mais, dada por quem já comprou',
        items: pool.filter((p) => (p.review_Count ?? 0) > 0 && (p.rating ?? 0) >= 4)
          .sort((a, b) => (b.rating - a.rating) || (b.review_Count - a.review_Count)),
      },
      {
        id: 'ate-50', icon: PiggyBank,
        title: `Achadinhos até ${formatPrice(CHEAP_LIMIT)}`, subtitle: 'Preço bom para comprar sem pensar duas vezes',
        items: pool.filter((p) => p.price_Unic <= CHEAP_LIMIT).sort((a, b) => a.price_Unic - b.price_Unic),
      },
      {
        id: 'frete-gratis', icon: Truck,
        title: 'Com frete grátis', subtitle: 'Você paga só o produto',
        items: pool.filter((p) => p.freeShipping),
      },
      {
        id: 'destaques', icon: Award,
        title: 'Escolhas da loja', subtitle: 'Produtos que a nossa equipe recomenda',
        items: pool.filter((p) => p.featured),
      },
    ];
    return list.filter((s) => s.items.length > 0);
  }, [pool]);

  // Banners só com promessas que a loja cumpre.
  const banners = useMemo<PromoBanner[]>(() => {
    const list: PromoBanner[] = [];
    if (maxDiscount > 0) list.push({
      id: 'ofertas', icon: Zap, eyebrow: 'Oferta relâmpago', title: `Até ${maxDiscount}% OFF`,
      subtitle: 'Produtos selecionados com preço reduzido. O desconto já está no preço e vale enquanto durar o estoque.',
      ctaLabel: 'Ver ofertas', gradient: 'from-red-600 via-orange-500 to-amber-400', onClick: () => navigate('/flash-sale'),
    });
    list.push({
      id: 'entrega', icon: Truck, eyebrow: 'Feito em Craíbas',
      title: deliveryDays > 0 ? `Receba em até ${deliveryDays} ${deliveryDays === 1 ? 'dia útil' : 'dias úteis'}` : 'Entregue na sua porta',
      subtitle: shippingCost > 0
        ? `Frete fixo de ${formatPrice(shippingCost)} e acompanhamento do pedido pelo site, do pagamento à entrega.`
        : 'Acompanhe seu pedido pelo site, do pagamento à entrega.',
      ctaLabel: 'Ver mais vendidos', gradient: 'from-blue-600 via-cyan-500 to-teal-400', onClick: () => scrollToSection('mais-vendidos'),
    });
    list.push({
      id: 'seguranca', icon: ShieldCheck, eyebrow: 'Compra tranquila', title: 'PIX ou cartão, com segurança',
      subtitle: `Pagamento processado pelo Mercado Pago e ${RETURN_WINDOW_DAYS} dias para devolver se não for o que você esperava.`,
      ctaLabel: 'Ver novidades', gradient: 'from-fuchsia-600 via-purple-500 to-indigo-500', onClick: () => scrollToSection('novidades'),
    });
    return list;
  }, [maxDiscount, deliveryDays, shippingCost, navigate]);

  const marquee = useMemo(() => [
    ...(maxDiscount > 0 ? [{ icon: Zap, label: `Até ${maxDiscount}% OFF em produtos selecionados` }] : []),
    { icon: TrendingUp, label: 'Os mais vendidos da loja' },
    { icon: Sparkles, label: 'Novidades toda semana' },
    { icon: ShieldCheck, label: 'PIX ou cartão via Mercado Pago' },
    { icon: Truck, label: deliveryDays > 0 ? `Entrega em até ${deliveryDays} dias úteis` : 'Entrega na sua porta' },
    { icon: RotateCcw, label: `${RETURN_WINDOW_DAYS} dias para devolver` },
  ], [maxDiscount, deliveryDays]);

  const trustSignals = [
    { icon: ShieldCheck, label: 'Pagamento seguro' },
    { icon: Truck, label: deliveryDays > 0 ? `Entrega em até ${deliveryDays} dias úteis` : 'Entrega na sua porta' },
    { icon: RotateCcw, label: `${RETURN_WINDOW_DAYS} dias para devolução` },
    { icon: MapPin, label: 'Atendimento de Craíbas' },
  ];

  // Hero: os mais vendidos (ou os mais novos, se ainda não houver vendas).
  const heroProducts = useMemo(() => {
    const sold = [...allProducts].sort((a, b) => (b.count_Sold ?? 0) - (a.count_Sold ?? 0) || insertedAt(b) - insertedAt(a));
    return sold.slice(0, FLOAT_POSITIONS.length);
  }, [allProducts]);

  // "Você pode gostar": todo o catálogo filtrado, sem repetir produto.
  const suggestions = useMemo(() => [...pool].sort((a, b) => insertedAt(b) - insertedAt(a)), [pool]);
  const visibleSuggestions = suggestions.slice(0, suggestionsCount);

  const handleViewAll = useCallback((id: string) => setExpandedSections((c) => ({ ...c, [id]: !c[id] })), []);
  const clearFilters = () => { setSearchTerm(''); setSelectedCategory(null); };
  const filtering = !!searchTerm.trim() || selectedCategory !== null;

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#09090b]">
        <div className="pointer-events-none absolute top-0 right-0 w-[32rem] h-[32rem] opacity-20" style={{ background: `radial-gradient(circle, ${accent}, transparent)`, transform: 'translate(20%, -20%)' }} />
        <div className="pointer-events-none absolute bottom-0 left-0 w-[28rem] h-[28rem] opacity-10" style={{ background: `radial-gradient(circle, ${accent}, transparent)`, transform: 'translate(-20%, 20%)' }} />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-bold uppercase tracking-widest border border-white/15 backdrop-blur-sm"
              style={{ background: `${accent}1F`, color: accent }}
            >
              <Flame className="w-3.5 h-3.5" /> Achadinhos
            </span>

            <h1 className="mt-5 font-display font-extrabold text-white text-4xl md:text-6xl leading-[1.05] tracking-tight">
              O que Craíbas está <span style={{ color: accent }}>comprando agora</span>
            </h1>

            <p className="mt-5 text-white/60 font-body text-base md:text-lg max-w-md mx-auto lg:mx-0">
              Uma vitrine montada com as vendas reais da loja: os mais vendidos, as melhores ofertas e o que acabou de chegar. Tudo num lugar só.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                type="button"
                onClick={() => scrollToSection(sections[0]?.id ?? 'sugestoes')}
                className={`inline-flex items-center gap-2 px-7 py-3.5 ${ColorGlobalTema} ${ColorGlobalHover} text-white font-display font-bold text-sm md:text-base rounded-2xl transition-all hover:scale-[1.03] active:scale-[0.98]`}
                style={{ boxShadow: `0 8px 24px ${accent}66` }}
              >
                Começar a explorar <ArrowRight className="w-4 h-4" />
              </button>
              {maxDiscount > 0 && (
                <button
                  type="button"
                  onClick={() => navigate('/flash-sale')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-white/15 bg-white/10 text-white font-display font-semibold text-sm backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <Zap className="w-4 h-4" /> Até {maxDiscount}% OFF
                </button>
              )}
            </div>
          </div>

          <div className="relative hidden lg:block h-[24rem]" aria-hidden>
            {heroProducts.map((product, index) => (
              <FloatingProductPreview key={product.id ?? index} product={product} position={FLOAT_POSITIONS[index]} />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
            50% { transform: translateY(-16px) rotate(var(--r, 0deg)); }
          }
          .animate-float { animation-name: float; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
          @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .animate-marquee { animation: marquee 28s linear infinite; }
          @media (prefers-reduced-motion: reduce) { .animate-float, .animate-marquee { animation: none; } }
        `}</style>
      </section>

      {/* ── FAIXA ── */}
      <div className="overflow-hidden py-2.5 whitespace-nowrap" style={{ background: '#111113' }}>
        <div className="flex w-max animate-marquee">
          {[...marquee, ...marquee, ...marquee, ...marquee].map(({ icon: Icon, label }, index) => (
            <span key={index} className="flex items-center gap-2 px-6 text-white/80 font-body text-xs md:text-sm font-semibold">
              <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
              {label}
              <span className="text-white/20 ml-6">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── BUSCA ── */}
      <div className="max-w-2xl mx-auto px-4 mt-8 relative z-10">
        <div className="group flex items-center gap-3 bg-white rounded-2xl px-5 py-4 md:py-5 shadow-medium hover:shadow-strong focus-within:shadow-strong border border-surface-100 transition-shadow duration-300">
          <Search className="w-5 h-5 text-surface-400 flex-shrink-0 group-focus-within:text-surface-700 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setSuggestionsCount(SUGGESTIONS_PAGE_SIZE); }}
            placeholder="Procure um achadinho: fone, garrafa, presente..."
            className="w-full bg-transparent font-body text-surface-900 placeholder:text-surface-400 focus:outline-none text-base md:text-lg"
          />
          {searchTerm.length > 0 && (
            <button type="button" onClick={() => setSearchTerm('')} aria-label="Limpar pesquisa" className="p-1 rounded-full text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── SELOS ── */}
      <div className="max-w-5xl mx-auto px-6 mt-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-surface-500 font-body text-xs md:text-sm">
          {trustSignals.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" style={{ color: accent }} /> {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── CATEGORIAS ── */}
      {categories.length > 0 && (
        <nav className="sticky top-0 z-20 mt-8 bg-[#f5f5f7]/90 backdrop-blur-md border-b border-surface-200/70">
          <div className="max-w-7xl mx-auto px-4 flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-body text-sm transition-colors ${selectedCategory === null ? `${ColorGlobalTema} text-white shadow-sm` : 'bg-white text-surface-600 hover:text-surface-900 border border-surface-200'}`}
            >
              Tudo
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory((cur) => (cur === c.id ? null : c.id))}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-body text-sm transition-colors ${selectedCategory === c.id ? `${ColorGlobalTema} text-white shadow-sm` : 'bg-white text-surface-600 hover:text-surface-900 border border-surface-200'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </nav>
      )}

      <div className="max-w-7xl mx-auto px-4">
        {pool.length === 0 && !Controller?.result.Loading ? (
          <div className="mx-auto my-16 max-w-md rounded-2xl bg-white p-10 text-center shadow-strong">
            <Search className="mx-auto mb-4 w-10 h-10 text-surface-300" />
            <p className="font-display font-bold text-surface-900 text-lg">
              {filtering ? 'Nenhum achadinho encontrado' : 'Ainda não há produtos por aqui'}
            </p>
            <p className="mt-2 text-surface-500 text-sm font-body">
              {filtering ? 'Tente outra palavra ou veja todas as categorias.' : 'Novos produtos entram em breve.'}
            </p>
            {filtering && (
              <button type="button" onClick={clearFilters} className={`mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-display font-bold text-white ${ColorGlobalTema}`}>
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── SEÇÕES + BANNERS ── */}
            {sections.map((section, index) => {
              const expanded = !!expandedSections[section.id];
              const items = section.items.slice(0, expanded ? SECTION_EXPANDED_SIZE : SECTION_PAGE_SIZE);
              // Um banner depois de cada duas seções, sem repetir.
              const banner = index % 2 === 1 ? banners[Math.floor(index / 2)] : undefined;

              return (
                <div key={section.id}>
                  <section id={`section-${section.id}`} className="scroll-mt-24 py-10">
                    <ScrollReveal>
                      <SectionHeader
                        section={section}
                        accent={accent}
                        canExpand={section.items.length > SECTION_PAGE_SIZE}
                        expanded={expanded}
                        onViewAll={() => handleViewAll(section.id)}
                      />
                    </ScrollReveal>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                      {items.map((product, i) => (
                        <ScrollReveal key={product.id ?? i} delayMs={(i % 5) * 50}>
                          <div className="relative">
                            {section.ranked && i < 3 && (
                              <span
                                className="pointer-events-none absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full font-display text-sm font-bold text-white shadow-strong"
                                style={{ background: accent }}
                              >
                                {i + 1}º
                              </span>
                            )}
                            <ProductCard product={product} compact />
                          </div>
                        </ScrollReveal>
                      ))}
                    </div>
                  </section>
                  {banner && (
                    <section className="py-4">
                      <MegaPromoBanner banner={banner} />
                    </section>
                  )}
                </div>
              );
            })}

            {/* ── VOCÊ PODE GOSTAR ── */}
            <section id="section-sugestoes" className="scroll-mt-24 mb-16 pt-6">
              <ScrollReveal>
                <div className="text-center mb-8">
                  <h2 className="font-display font-bold text-surface-900 text-2xl md:text-3xl tracking-tight">
                    {filtering ? 'Resultados' : 'Todos os achadinhos'}
                  </h2>
                  <p className="text-surface-400 text-sm font-body mt-1">
                    {suggestions.length} {suggestions.length === 1 ? 'produto' : 'produtos'}{filtering ? ' encontrados' : ', dos mais novos para os mais antigos'}
                  </p>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {visibleSuggestions.map((product, index) => (
                  <ScrollReveal key={product.id ?? index} delayMs={(index % 6) * 40}>
                    <ProductCard product={product} compact />
                  </ScrollReveal>
                ))}
              </div>

              <div className="flex justify-center mt-8">
                {suggestionsCount < suggestions.length ? (
                  <button
                    type="button"
                    onClick={() => setSuggestionsCount((c) => c + SUGGESTIONS_PAGE_SIZE)}
                    className="inline-flex items-center gap-2 px-7 py-3 border-2 border-current font-display font-bold text-sm rounded-2xl hover:scale-[1.03] active:scale-[0.98] transition-all"
                    style={{ color: accent }}
                  >
                    Carregar mais produtos <TrendingUp className="w-4 h-4" />
                  </button>
                ) : (
                  suggestions.length > SUGGESTIONS_PAGE_SIZE && (
                    <p className="text-surface-400 font-body text-sm">Você viu todos os achadinhos. Volte em breve: sempre chega novidade.</p>
                  )
                )}
              </div>
            </section>
          </>
        )}
      </div>

      <Loading loading={Controller?.result.Loading ?? false} message="Carregando achadinhos" subMessage="Separando os produtos que mais saem na loja" />
    </div>
  );
}
