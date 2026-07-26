import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, X, ArrowRight, Sparkles, Gift, Flame, Truck, ShieldCheck,
  TrendingUp, Star, Zap, ChevronRight,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import { useBrandsController } from '../controller/useBrandsController';
import { UseProductStore } from '../store/UseProductStore';
import { UseUserStore } from '../store/UseUserStore';
import { getColorConfig } from '../types/Colors';

/* ============================================================================
 * CONSTANTES
 * ========================================================================== */

// Faixa "estilo Shopee" que roda em loop infinito logo abaixo do Hero.
const MARQUEE_ITEMS = [
  { emoji: '⚡', label: 'Oferta Relâmpago' },
  { emoji: '🚚', label: 'Frete Grátis' },
  { emoji: '🎁', label: 'Produto Viral' },
  { emoji: '🔥', label: 'Mais Vendido' },
  { emoji: '⭐', label: 'Avaliação 4.9' },
  { emoji: '💥', label: 'Últimas Unidades' },
];

// Selos de confiança — versão enxuta e "não institucional" da antiga stats bar.
const TRUST_SIGNALS = [
  { icon: Truck, label: 'Frete grátis em todo o Brasil' },
  { icon: ShieldCheck, label: 'Pagamento 100% seguro' },
  { icon: Star, label: '4.8/5 de avaliação média' },
  { icon: Flame, label: '+50 mil pedidos entregues' },
];

/**
 * MOCK — ainda não existe uma entidade real de categoria no projeto
 * (`Product` não tem campo de tag/categoria). `matchKeys` serve só para
 * aproximar produto → categoria comparando nome/descrição. Troque pela
 * store/controller real assim que existir.
 */
interface CategoryChip {
  id: string;
  label: string;
  emoji: string;
  matchKeys: string[];
}

const CATEGORY_CHIPS: CategoryChip[] = [
  { id: 'virais', label: 'Virais', emoji: '🔥', matchKeys: ['viral', 'tiktok', 'trend'] },
  { id: 'promocoes', label: 'Promoções', emoji: '⚡', matchKeys: ['oferta', 'promo', 'desconto', 'off'] },
  { id: 'presentes', label: 'Presentes', emoji: '🎁', matchKeys: ['presente', 'kit', 'caixa'] },
  { id: 'casa', label: 'Casa', emoji: '🏠', matchKeys: ['casa', 'decor', 'organizador', 'sala', 'quarto'] },
  { id: 'tecnologia', label: 'Tecnologia', emoji: '📱', matchKeys: ['eletrônic', 'eletronico', 'tech', 'smart'] },
  { id: 'gadgets', label: 'Gadgets', emoji: '⌚', matchKeys: ['gadget', 'usb', 'bluetooth', 'carregador'] },
  { id: 'beleza', label: 'Beleza', emoji: '💄', matchKeys: ['beleza', 'skincare', 'maquiagem', 'perfume', 'cuidado'] },
  { id: 'cozinha', label: 'Cozinha', emoji: '🍳', matchKeys: ['cozinha', 'panela', 'utensílio', 'utensilio'] },
  { id: 'fones', label: 'Fones', emoji: '🎧', matchKeys: ['fone', 'headset', 'earbud', 'ouvido'] },
  { id: 'escritorio', label: 'Escritório', emoji: '💻', matchKeys: ['escritório', 'escritorio', 'notebook', 'mouse', 'teclado'] },
  { id: 'moda', label: 'Moda', emoji: '👕', matchKeys: ['roupa', 'moda', 'bolsa', 'relógio', 'relogio', 'calçado', 'calcado'] },
];

// Badges de marketplace que aparecem sobre os cards de produto.
type BadgeKey = 'new' | 'offer' | 'favorite' | 'bestseller' | 'freeShipping' | 'rating';

const BADGE_STYLES: Record<BadgeKey, { emoji: string; label: string; className: string }> = {
  new: { emoji: '🔥', label: 'Novo', className: 'bg-red-500 text-white' },
  offer: { emoji: '⚡', label: 'Oferta', className: 'bg-amber-400 text-black' },
  favorite: { emoji: '❤️', label: 'Favorito', className: 'bg-pink-500 text-white' },
  bestseller: { emoji: '🏆', label: 'Mais vendido', className: 'bg-yellow-500 text-black' },
  freeShipping: { emoji: '📦', label: 'Frete grátis', className: 'bg-emerald-500 text-white' },
  rating: { emoji: '⭐', label: '4.9', className: 'bg-white text-surface-900 border border-surface-200' },
};

interface ThemeSection {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  primaryBadge: BadgeKey;
  seed: number;
}

// Ao invés de separar por marca, as seções agora giram em torno de
// "temas de descoberta" — o mesmo catálogo é reaproveitado sob ângulos
// diferentes (igual Shopee/Temu fazem com o mesmo estoque).
const THEME_SECTIONS: ThemeSection[] = [
  { id: 'bombando-agora', emoji: '🔥', title: 'Bombando Agora', subtitle: 'Os produtos mais comentados neste momento', primaryBadge: 'bestseller', seed: 0 },
  { id: 'promocoes-relampago', emoji: '⚡', title: 'Promoções Relâmpago', subtitle: 'Preços baixos por tempo limitado', primaryBadge: 'offer', seed: 3 },
  { id: 'escolhidos-pra-voce', emoji: '❤️', title: 'Escolhidos para Você', subtitle: 'Selecionados com base no que você gosta', primaryBadge: 'favorite', seed: 6 },
  { id: 'novidades', emoji: '✨', title: 'Novidades', subtitle: 'Acabou de chegar por aqui', primaryBadge: 'new', seed: 9 },
  { id: 'presentes', emoji: '🎁', title: 'Ideias para Presentear', subtitle: 'Pra acertar em cheio em qualquer ocasião', primaryBadge: 'freeShipping', seed: 12 },
  { id: 'mais-vendidos', emoji: '📈', title: 'Mais Vendidos', subtitle: 'Os campeões de venda da loja', primaryBadge: 'bestseller', seed: 15 },
  { id: 'vale-a-pena', emoji: '💎', title: 'Vale a Pena Comprar', subtitle: 'Ótimo custo-benefício, garantido', primaryBadge: 'rating', seed: 18 },
];

const SECTION_PAGE_SIZE = 10;
const SECTION_EXPANDED_SIZE = 20;
const SUGGESTIONS_PAGE_SIZE = 12;
const SUGGESTIONS_MAX = 48;

interface MegaBanner {
  id: string;
  icon: typeof Zap;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  gradient: string;
  targetSectionId?: string;
  targetCategoryId?: string;
}

const MEGA_BANNERS: MegaBanner[] = [
  {
    id: 'off-70',
    icon: Zap,
    eyebrow: 'Somente hoje',
    title: 'Até 70% OFF',
    subtitle: 'Descontos gigantes em produtos selecionados. Corre que acaba rápido.',
    ctaLabel: 'Comprar Agora',
    gradient: 'from-red-600 via-orange-500 to-amber-400',
    targetSectionId: 'promocoes-relampago',
    targetCategoryId: 'promocoes',
  },
  {
    id: 'frete-gratis',
    icon: Truck,
    eyebrow: 'Sem custo extra',
    title: 'Frete Grátis',
    subtitle: 'Em compras selecionadas para todo o Brasil. Aproveite antes que mude.',
    ctaLabel: 'Aproveitar Agora',
    gradient: 'from-blue-600 via-cyan-500 to-teal-400',
    targetSectionId: 'bombando-agora',
  },
  {
    id: 'compre-2-leve-3',
    icon: Gift,
    eyebrow: 'Combo imperdível',
    title: 'Compre 2 Leve 3',
    subtitle: 'Quanto mais você leva, mais você economiza. Válido em itens participantes.',
    ctaLabel: 'Ver Produtos',
    gradient: 'from-fuchsia-600 via-purple-500 to-indigo-500',
    targetSectionId: 'mais-vendidos',
  },
  {
    id: 'novidades-semana',
    icon: Sparkles,
    eyebrow: 'Recém-chegados',
    title: 'Novidades da Semana',
    subtitle: 'Os lançamentos mais recentes, escolhidos antes de todo mundo ver.',
    ctaLabel: 'Ver Novidades',
    gradient: 'from-emerald-600 via-teal-500 to-lime-400',
    targetSectionId: 'novidades',
  },
];

const FLOAT_POSITIONS = [
  { top: '4%', left: '4%', delay: '0s', duration: '6.5s', rotate: '-6deg' },
  { top: '2%', left: '54%', delay: '0.7s', duration: '7.5s', rotate: '4deg' },
  { top: '48%', left: '0%', delay: '1.2s', duration: '6s', rotate: '5deg' },
  { top: '58%', left: '58%', delay: '0.4s', duration: '8s', rotate: '-4deg' },
  { top: '30%', left: '30%', delay: '1.6s', duration: '7s', rotate: '3deg' },
];

/* ============================================================================
 * HELPERS
 * ========================================================================== */

// Repete/gira o catálogo para preencher grids grandes mesmo com poucos
// produtos cadastrados — evita seções vazias ("nunca deixar espaço vazio").
function pickFromPool(pool: any[], seed: number, count: number) {
  if (!pool || pool.length === 0) return [];
  const result: any[] = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[(seed + i) % pool.length]);
  }
  return result;
}

function getProductHaystack(product: any) {
  return `${product?.name ?? ''} ${product?.description ?? ''}`.toLowerCase();
}

function getProductImage(product: any): string | undefined {
  return product?.image ?? product?.images?.[0] ?? product?.thumbnail ?? product?.photo ?? undefined;
}

function getProductPrice(product: any): number | undefined {
  const raw = product?.price ?? product?.value ?? product?.priceFrom;
  const num = typeof raw === 'string' ? Number(raw) : raw;
  return typeof num === 'number' && !Number.isNaN(num) ? num : undefined;
}

function formatPrice(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

/* ============================================================================
 * HOOK: scroll reveal
 * ========================================================================== */

function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
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

  return { ref, isVisible };
}

function ScrollReveal({ children, delayMs = 0 }: { children: React.ReactNode; delayMs?: number }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
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

/* ============================================================================
 * SUBCOMPONENTES
 * ========================================================================== */

// Wrapper fino em volta do ProductCard existente — não altera o componente,
// só sobrepõe badges de marketplace no canto superior.
function MarketplaceProductCard({ product, badges }: { product: any; badges: BadgeKey[] }) {
  return (
    <div className="relative group">
      {badges.length > 0 && (
        <div className="pointer-events-none absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
          {badges.map((key) => {
            const style = BADGE_STYLES[key];
            if (!style) return null;
            return (
              <span
                key={key}
                className={`inline-flex items-center gap-1 ${style.className} text-[10px] font-display font-bold px-2 py-1 rounded-full shadow-sm`}
              >
                {style.emoji} {style.label}
              </span>
            );
          })}
        </div>
      )}
      <div className="transition-transform duration-300 group-hover:-translate-y-1">
        <ProductCard product={product} compact />
      </div>
    </div>
  );
}

function FloatingProductPreview({ product, position }: { product: any; position: (typeof FLOAT_POSITIONS)[number] }) {
  const image = getProductImage(product);
  const price = getProductPrice(product);
  return (
    <div
      className="absolute w-28 md:w-32 rounded-2xl bg-white shadow-strong border border-surface-100 overflow-hidden animate-float"
      style={{
        top: position.top,
        left: position.left,
        animationDelay: position.delay,
        animationDuration: position.duration,
        transform: `rotate(${position.rotate})`,
      }}
    >
      <div className="h-20 md:h-24 bg-surface-50 flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt={product?.name ?? 'Produto'} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">🛍️</span>
        )}
      </div>
      <div className="p-2">
        <p className="text-[10px] font-body text-surface-500 truncate">{product?.name ?? 'Achadinho incrível'}</p>
        {price != null && <p className="text-xs font-display font-bold text-surface-900">{formatPrice(price)}</p>}
      </div>
    </div>
  );
}

function MegaPromoBanner({ banner, onAction }: { banner: MegaBanner; onAction: (banner: MegaBanner) => void }) {
  const Icon = banner.icon;
  return (
    <div
      onClick={() => onAction(banner)}
      className={`relative overflow-hidden rounded-3xl p-7 md:p-10 cursor-pointer group hover:scale-[1.01] transition-all bg-gradient-to-br ${banner.gradient}`}
    >
      <div className="pointer-events-none absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-10 w-56 h-56 rounded-full bg-black/10 blur-2xl" />
      <div className="relative">
        <Icon className="w-9 h-9 mb-4 text-white drop-shadow" />
        <span className="text-xs font-bold uppercase tracking-widest text-white/80">{banner.eyebrow}</span>
        <h3 className="font-display font-extrabold text-white text-3xl md:text-4xl mt-1 mb-2 drop-shadow-sm">{banner.title}</h3>
        <p className="text-white/90 text-sm font-body mb-5 max-w-md">{banner.subtitle}</p>
        <div className="inline-flex items-center gap-2 bg-white text-surface-900 font-display font-bold text-sm px-5 py-2.5 rounded-xl group-hover:gap-3 transition-all shadow-md">
          {banner.ctaLabel} <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  emoji,
  title,
  subtitle,
  onViewAll,
  expanded,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  onViewAll: () => void;
  expanded: boolean;
}) {
  const { ColorGlobalText, ColorGlobalHoverText } = UseUserStore();
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="font-display font-bold text-surface-900 text-xl md:text-2xl tracking-tight">
          {emoji} {title}
        </h2>
        <p className="text-surface-400 text-xs md:text-sm font-body mt-1">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onViewAll}
        className={`flex-shrink-0 flex items-center gap-1 text-sm font-display font-semibold transition-colors ${ColorGlobalText} ${ColorGlobalHoverText}`}
      >
        {expanded ? 'Ver menos' : 'Ver Tudo'} <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ============================================================================
 * PÁGINA PRINCIPAL
 * ========================================================================== */

function scrollToSection(sectionId: string) {
  document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function AchadinhosPage() {
  const Controller = useBrandsController();
  const { products } = UseProductStore();
  const { NameColorGlobal, ColorGlobalTema, ColorGlobalHover, ColorGlobalText, ColorGlobalHoverText } = UseUserStore();
  const colorConfig = getColorConfig(NameColorGlobal);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [suggestionsCount, setSuggestionsCount] = useState(SUGGESTIONS_PAGE_SIZE);

  const allProducts = useMemo(() => products ?? [], [products]);

  // Pool ativo de produtos considerando busca + categoria. Nunca fica vazio:
  // se o filtro não encontra nada, cai de volta no catálogo completo para
  // a página nunca mostrar espaços em branco.
  const activePool = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      const bySearch = allProducts.filter((product: any) => getProductHaystack(product).includes(term));
      return bySearch.length > 0 ? bySearch : allProducts;
    }
    if (selectedCategory) {
      const category = CATEGORY_CHIPS.find((chip) => chip.id === selectedCategory);
      if (category) {
        const byCategory = allProducts.filter((product: any) => {
          const haystack = getProductHaystack(product);
          return category.matchKeys.some((key) => haystack.includes(key));
        });
        if (byCategory.length > 0) return byCategory;
      }
    }
    return allProducts;
  }, [allProducts, searchTerm, selectedCategory]);

  const heroProducts = useMemo(() => pickFromPool(allProducts, 0, FLOAT_POSITIONS.length), [allProducts]);

  const suggestions = useMemo(
    () => pickFromPool(activePool, 1, Math.min(suggestionsCount, SUGGESTIONS_MAX)),
    [activePool, suggestionsCount],
  );

  const handleToggleCategory = useCallback((categoryId: string) => {
    setSelectedCategory((current) => (current === categoryId ? null : categoryId));
  }, []);

  const handleViewAll = useCallback((sectionId: string) => {
    setExpandedSections((current) => ({ ...current, [sectionId]: !current[sectionId] }));
  }, []);

  const handleHeroCta = useCallback(() => {
    scrollToSection(THEME_SECTIONS[0].id);
  }, []);

  const handleBannerAction = useCallback((banner: MegaBanner) => {
    if (banner.targetCategoryId) setSelectedCategory(banner.targetCategoryId);
    if (banner.targetSectionId) scrollToSection(banner.targetSectionId);
  }, []);

  const handleLoadMoreSuggestions = useCallback(() => {
    setSuggestionsCount((current) => Math.min(current + SUGGESTIONS_PAGE_SIZE, SUGGESTIONS_MAX));
  }, []);

  const suggestionsExhausted = suggestionsCount >= SUGGESTIONS_MAX || suggestionsCount >= activePool.length * 4;

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#09090b]">
        <div
          className="pointer-events-none absolute top-0 right-0 w-[32rem] h-[32rem] opacity-20"
          style={{ background: `radial-gradient(circle, ${colorConfig.hex}, transparent)`, transform: 'translate(20%, -20%)' }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 w-[28rem] h-[28rem] opacity-10"
          style={{ background: `radial-gradient(circle, ${colorConfig.hex}, transparent)`, transform: 'translate(-20%, 20%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-bold border border-white/20 backdrop-blur-sm animate-pulse"
              style={{ background: `${colorConfig.hex}22`, color: colorConfig.hex }}
            >
              <Flame className="w-3.5 h-3.5" />
              Atualizado agora mesmo
            </span>

            <h1 className="mt-5 font-display font-extrabold text-white text-4xl md:text-6xl leading-[1.05] tracking-tight">
              🔥 Achadinhos que estão bombando
            </h1>

            <p className="mt-5 text-white/60 font-body text-base md:text-lg max-w-md mx-auto lg:mx-0">
              Descubra produtos incríveis escolhidos especialmente para você. Preço bom, entrega rápida, sem enrolação.
            </p>

            <button
              type="button"
              onClick={handleHeroCta}
              className={`mt-8 inline-flex items-center gap-2 px-7 py-3.5 ${ColorGlobalTema} ${ColorGlobalHover} text-white font-display font-bold text-sm md:text-base rounded-2xl transition-all hover:scale-[1.03] active:scale-[0.98]`}
              style={{ boxShadow: `0 8px 24px ${colorConfig.hex}66` }}
            >
              Começar a explorar <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative hidden lg:block h-[24rem]" aria-hidden>
            {heroProducts.map((product, index) => (
              <FloatingProductPreview key={product?.id ?? index} product={product} position={FLOAT_POSITIONS[index]} />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
            50% { transform: translateY(-16px) rotate(var(--r, 0deg)); }
          }
          .animate-float {
            animation-name: float;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
          }
          @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-float, .animate-marquee { animation: none; }
          }
        `}</style>
      </section>

      {/* ── BANNER INFINITO ── */}
      <div className="overflow-hidden bg-surface-900 py-2.5 whitespace-nowrap" style={{ background: '#111113' }}>
        <div className="flex w-max animate-marquee">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
            <span key={index} className="flex items-center gap-2 px-6 text-white/80 font-body text-xs md:text-sm font-semibold">
              <span>{item.emoji}</span>
              {item.label}
              <span className="text-white/20 ml-6">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── PESQUISA GRANDE ── */}
      <div className="max-w-2xl mx-auto px-6 -mt-0 mt-8 relative z-10">
        <div className="group flex items-center gap-3 bg-white rounded-2xl px-5 py-4 md:py-5 shadow-medium hover:shadow-strong focus-within:shadow-strong border border-surface-100 transition-shadow duration-300">
          <Search className="w-5 h-5 text-surface-400 flex-shrink-0 group-focus-within:text-surface-700 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="O que você procura hoje?"
            className="w-full bg-transparent font-body text-surface-900 placeholder:text-surface-400 focus:outline-none text-base md:text-lg"
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label="Limpar pesquisa"
              className="p-1 rounded-full text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── SELOS DE CONFIANÇA ── */}
      <div className="max-w-5xl mx-auto px-6 mt-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-surface-500 font-body text-xs md:text-sm">
          {TRUST_SIGNALS.map(({ icon: Icon, label }, index) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" />
              {label}
              {index < TRUST_SIGNALS.length - 1 && <span className="hidden md:inline text-surface-300 ml-4">|</span>}
            </span>
          ))}
        </div>
      </div>

      {/* ── CHIPS / BARRA FIXA DE CATEGORIAS ── */}
      <nav className="sticky top-0 z-20 mt-8 bg-white/90 backdrop-blur-md border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-6 flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORY_CHIPS.map((chip) => {
            const isActive = selectedCategory === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleToggleCategory(chip.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-body text-sm transition-colors ${isActive
                    ? `${ColorGlobalTema} text-white shadow-sm`
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                  }`}
              >
                {chip.emoji} {chip.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4">
        {/* ── SEÇÕES TEMÁTICAS + BANNERS INTERCALADOS ── */}
        {THEME_SECTIONS.map((theme, themeIndex) => {
          const expanded = !!expandedSections[theme.id];
          const count = expanded ? SECTION_EXPANDED_SIZE : SECTION_PAGE_SIZE;
          const themeProducts = pickFromPool(activePool, theme.seed, count);
          const banner = MEGA_BANNERS[themeIndex % MEGA_BANNERS.length];

          return (
            <div key={theme.id}>
              <section
                id={`section-${theme.id}`}
                className={`scroll-mt-24 py-10 ${themeIndex % 2 === 1 ? '-mx-4 px-4 bg-surface-50/60 rounded-3xl' : ''}`}
              >
                <ScrollReveal>
                  <SectionHeader
                    emoji={theme.emoji}
                    title={theme.title}
                    subtitle={theme.subtitle}
                    expanded={expanded}
                    onViewAll={() => handleViewAll(theme.id)}
                  />
                </ScrollReveal>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  {themeProducts.map((product, productIndex) => {
                    const badges: BadgeKey[] = [theme.primaryBadge];
                    if (productIndex % 3 === 0 && theme.primaryBadge !== 'rating') badges.push('rating');
                    if (productIndex % 4 === 0 && theme.primaryBadge !== 'freeShipping') badges.push('freeShipping');
                    return (
                      <ScrollReveal key={`${product?.id ?? productIndex}-${productIndex}`} delayMs={(productIndex % 5) * 50}>
                        <MarketplaceProductCard product={product} badges={badges} />
                      </ScrollReveal>
                    );
                  })}
                </div>
              </section>

              {/* Banner gigante entre seções — nunca duas seções seguidas sem estímulo visual */}
              <section className="py-4">
                <MegaPromoBanner banner={banner} onAction={handleBannerAction} />
              </section>
            </div>
          );
        })}

        {/* ── VOCÊ PODE GOSTAR (grid "infinito") ── */}
        <section className="mb-16 pt-4">
          <ScrollReveal>
            <div className="text-center mb-8">
              <h2 className="font-display font-bold text-surface-900 text-2xl md:text-3xl tracking-tight">
                ✨ Você pode gostar
              </h2>
              <p className="text-surface-400 text-sm font-body mt-1">Continue explorando, tem sempre algo novo por aqui</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {suggestions.map((product, index) => {
              const badgeCycle: BadgeKey[] = ['new', 'offer', 'favorite', 'bestseller', 'freeShipping', 'rating'];
              const badges: BadgeKey[] = [badgeCycle[index % badgeCycle.length]];
              return (
                <ScrollReveal key={`${product?.id ?? index}-${index}`} delayMs={(index % 6) * 40}>
                  <MarketplaceProductCard product={product} badges={badges} />
                </ScrollReveal>
              );
            })}
          </div>

          <div className="flex justify-center mt-8">
            {!suggestionsExhausted ? (
              <button
                type="button"
                onClick={handleLoadMoreSuggestions}
                className={`inline-flex items-center gap-2 px-7 py-3 border-2 ${ColorGlobalText} border-current font-display font-bold text-sm rounded-2xl hover:scale-[1.03] active:scale-[0.98] transition-all`}
              >
                Carregar mais produtos <TrendingUp className="w-4 h-4" />
              </button>
            ) : (
              <p className="text-surface-400 font-body text-sm">Você viu tudo por agora 👀 volte mais tarde para novidades!</p>
            )}
          </div>
        </section>
      </div>

      {/* <Loading
        loading={Controller.result.Loading}
        message="Carregando achadinhos"
        subMessage="Buscando os produtos mais quentes para você"
      /> */}
    </div>
  );
}
