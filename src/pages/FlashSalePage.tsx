import { useState, useEffect, useMemo } from 'react';
import { Zap, ArrowLeft, Clock, Ticket, Copy, Check, BadgePercent, ShieldCheck, PackageCheck, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';
import { UseProductStore } from '../store/UseProductStore';
import { UseUserStore } from '../store/UseUserStore';
import { getColorConfig } from '../types/Colors';
import { useFlashSaleController } from '../controller/useFlashSaleController';
import Loading from '../components/Loading';
import { UseOrderStore } from '../store/UseOrderStore';
import { formatDiscount, formatPrice } from '../utils';
import { useNotification } from '../utils/NotificationCard';

type SortKey = 'discount' | 'price' | 'sold';

const SORTS: { v: SortKey; l: string }[] = [
  { v: 'discount', l: 'Maior desconto' },
  { v: 'price', l: 'Menor preço' },
  { v: 'sold', l: 'Mais vendidos' },
];

/** Contagem regressiva até o fim real da oferta (cupom relâmpago do admin). */
function useCountdown(endDate?: string | null) {
  const [left, setLeft] = useState<{ d: number; h: string; m: string; s: string; done: boolean }>({ d: 0, h: '00', m: '00', s: '00', done: true });
  useEffect(() => {
    const tick = () => {
      const target = endDate ? new Date(endDate).getTime() : Number.NaN;
      const diff = target - Date.now();
      if (!Number.isFinite(target) || diff <= 0) {
        setLeft({ d: 0, h: '00', m: '00', s: '00', done: true });
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLeft({ d, h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0'), done: false });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);
  return left;
}

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

export default function FlashSalePage() {
  const Controller = useFlashSaleController();
  const { products } = UseProductStore();
  const { Category, Cupons } = UseOrderStore();
  const { ColorGlobalTema, NameColorGlobal } = UseUserStore();
  const notify = useNotification();
  const navigate = useNavigate();
  const colorConfig = getColorConfig(NameColorGlobal);
  const accent = colorConfig.hex;

  const [filter, setFilter] = useState<number | null>(null);
  const [sort, setSort] = useState<SortKey>('discount');
  const [copied, setCopied] = useState(false);

  // Cupom relâmpago ativo agora (mesma regra da faixa da Home).
  const flashOffer = useMemo(() => {
    const now = Date.now();
    return (Cupons ?? []).find((c) => {
      const start = c.date_Start ? new Date(c.date_Start).getTime() : Number.NaN;
      const end = new Date((c.date_end ?? c.date_End) ?? '').getTime();
      return c.show_Flash_Offer && c.active !== false && Number.isFinite(start) && Number.isFinite(end) && now >= start && now <= end;
    }) ?? null;
  }, [Cupons]);
  const offerEnd = flashOffer ? (flashOffer.date_end ?? flashOffer.date_End) : null;
  const countdown = useCountdown(offerEnd);
  const offerActive = !!flashOffer && !countdown.done;
  const usesLeft = flashOffer?.quantity_Uses != null ? Math.max(0, (flashOffer.quantity_Uses ?? 0) - (flashOffer.quantity_Used ?? 0)) : null;

  // Produtos em oferta de verdade: preço atual menor que o preço original.
  const saleProducts = useMemo(
    () => products.filter((p) => p.ativo !== false && p.origin_Price && p.origin_Price > p.price_Unic),
    [products],
  );
  const discountOf = (p: (typeof saleProducts)[number]) => formatDiscount(p.origin_Price!, p.price_Unic);
  const maxDiscount = useMemo(() => saleProducts.reduce((max, p) => Math.max(max, discountOf(p)), 0), [saleProducts]);

  // Só categorias que têm produto em oferta, com a quantidade.
  const categories = useMemo(
    () => Category
      .map((c) => ({ id: Number(c.id), name: c.category || 'Sem categoria', count: saleProducts.filter((p) => Number(p.id_category) === Number(c.id)).length }))
      .filter((c) => c.count > 0),
    [Category, saleProducts],
  );

  const filtered = useMemo(() => {
    const list = filter === null ? saleProducts : saleProducts.filter((p) => Number(p.id_category) === filter);
    return [...list].sort((a, b) => {
      if (sort === 'price') return a.price_Unic - b.price_Unic;
      if (sort === 'sold') return (b.count_Sold ?? 0) - (a.count_Sold ?? 0);
      return discountOf(b) - discountOf(a);
    });
  }, [saleProducts, filter, sort]);

  const copyCode = async () => {
    if (!flashOffer?.cod_Cupom) return;
    try {
      await navigator.clipboard.writeText(flashOffer.cod_Cupom);
      setCopied(true);
      notify.success('Cupom copiado', `Use ${flashOffer.cod_Cupom} no carrinho para garantir o desconto.`);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      notify.info('Seu cupom', `Digite ${flashOffer.cod_Cupom} no carrinho para aplicar o desconto.`);
    }
  };

  const chip = (active: boolean) =>
    `flex items-center gap-2 h-10 px-4 rounded-2xl whitespace-nowrap border text-sm font-display font-semibold transition-all flex-shrink-0 ${active
      ? `${ColorGlobalTema} border-transparent text-white`
      : 'bg-white border-surface-200 text-surface-600 hover:border-surface-300 hover:text-surface-900'}`;

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#09090b] via-[#111113] to-[#18181b]">
        <div className="pointer-events-none absolute -top-32 left-1/4 h-[26rem] w-[26rem] rounded-full opacity-25 blur-3xl" style={{ background: accent }} />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-[22rem] w-[22rem] rounded-full opacity-10 blur-3xl" style={{ background: accent }} />

        <div className="relative max-w-7xl mx-auto px-4 pt-6 pb-10 md:pb-14">
          <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-white/40 hover:text-white text-sm font-body transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-3xl">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-display font-bold uppercase tracking-widest"
                style={{ background: `${accent}1F`, color: accent }}
              >
                <Zap className="w-3.5 h-3.5" style={{ fill: accent }} /> Oferta relâmpago
              </span>

              <h1 className="mt-5 font-display font-bold text-white text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
                {maxDiscount > 0 ? (
                  <>Até <span style={{ color: accent }}>{maxDiscount}% OFF</span><span className="block">em produtos selecionados</span></>
                ) : (
                  <>Ofertas da loja</>
                )}
              </h1>

              <p className="mt-4 text-white/60 font-body text-base md:text-lg leading-relaxed">
                {saleProducts.length > 0
                  ? `${saleProducts.length} ${saleProducts.length === 1 ? 'produto com preço reduzido' : 'produtos com preço reduzido'}. O desconto já está no preço, é só escolher. Estoque limitado: quando acabar, acabou.`
                  : 'No momento não há produtos em promoção. Volte em breve: novas ofertas entram toda semana.'}
              </p>
            </div>

            {offerActive && (
              <div className="shrink-0">
                <div className="mb-3 flex items-center gap-1.5 text-white/50 text-xs font-body">
                  <Clock className="w-3.5 h-3.5" /> A oferta termina em
                </div>
                <div className="flex items-start gap-2">
                  {[
                    ...(countdown.d > 0 ? [{ v: String(countdown.d).padStart(2, '0'), l: countdown.d === 1 ? 'DIA' : 'DIAS' }] : []),
                    { v: countdown.h, l: 'HORAS' },
                    { v: countdown.m, l: 'MIN' },
                    { v: countdown.s, l: 'SEG' },
                  ].map((t, i, arr) => (
                    <div key={t.l} className="flex items-start gap-2">
                      <div className="flex flex-col items-center gap-1.5">
                        <span
                          className="min-w-[56px] rounded-xl px-3 py-2.5 text-center font-display text-2xl font-bold text-white tabular-nums"
                          style={{ background: accent, boxShadow: `0 6px 20px ${accent}55` }}
                        >
                          {t.v}
                        </span>
                        <span className="text-[10px] font-body tracking-wider text-white/40">{t.l}</span>
                      </div>
                      {i < arr.length - 1 && <span className="pt-2 font-display text-2xl font-bold" style={{ color: accent }}>:</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cupom relâmpago */}
          {offerActive && flashOffer?.cod_Cupom && (
            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between md:p-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `${accent}26`, color: accent }}>
                  <Ticket className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-white text-sm md:text-base">
                    {flashOffer.description?.trim() || flashOffer.name_Cupom || 'Cupom da oferta relâmpago'}
                  </p>
                  <p className="mt-0.5 text-white/50 text-xs font-body leading-relaxed">
                    {[
                      flashOffer.minimum_Value ? `Compras a partir de ${formatPrice(flashOffer.minimum_Value)}` : 'Sem valor mínimo',
                      offerEnd ? `válido até ${formatDateTime(offerEnd)}` : null,
                      usesLeft != null ? (usesLeft > 0 ? `${usesLeft} ${usesLeft === 1 ? 'uso restante' : 'usos restantes'}` : 'esgotado') : null,
                    ].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
              <button
                onClick={copyCode}
                disabled={usesLeft === 0}
                className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-2.5 font-display font-bold tracking-widest text-white transition-all hover:bg-white/10 disabled:opacity-40"
                style={{ borderColor: `${accent}AA` }}
              >
                {flashOffer.cod_Cupom}
                <span className="flex items-center gap-1 text-xs font-body font-semibold tracking-normal text-white/60 group-hover:text-white">
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── GARANTIAS ── */}
      <div className="border-b border-surface-100 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-3 px-2 sm:px-4">
          {[
            { icon: BadgePercent, t: 'Desconto já no preço', s: 'Sem letras miúdas' },
            { icon: ShieldCheck, t: 'Pagamento seguro', s: 'PIX ou cartão via Mercado Pago' },
            { icon: PackageCheck, t: 'Estoque limitado', s: 'Garanta o seu antes que acabe' },
          ].map(({ icon: Icon, t, s }) => (
            <div key={t} className="flex flex-col items-center gap-2 border-r border-surface-100 px-2 py-4 text-center last:border-0 sm:flex-row sm:gap-3 sm:px-4 sm:text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${accent}14`, color: accent }}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-display font-bold text-surface-900 text-[11px] leading-tight sm:text-sm">{t}</p>
                <p className="hidden text-surface-400 text-xs font-body sm:block">{s}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {saleProducts.length > 0 ? (
          <>
            {/* Filtros + ordenação */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:px-0">
                <button onClick={() => setFilter(null)} className={chip(filter === null)}>
                  Todas <span className={`rounded-full px-2 py-0.5 text-[10px] ${filter === null ? 'bg-white/20' : 'bg-surface-100'}`}>{saleProducts.length}</span>
                </button>
                {categories.map((c) => (
                  <button key={c.id} onClick={() => setFilter(c.id)} className={chip(filter === c.id)}>
                    {c.name} <span className={`rounded-full px-2 py-0.5 text-[10px] ${filter === c.id ? 'bg-white/20' : 'bg-surface-100'}`}>{c.count}</span>
                  </button>
                ))}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-surface-400" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="h-10 rounded-xl border border-surface-200 bg-white px-3 text-sm font-body text-surface-700 outline-none focus:border-surface-400"
                >
                  {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {filtered.map((p) => <ProductCard key={p.id} product={p} compact />)}
            </div>
          </>
        ) : (
          !Controller?.result?.Loading && (
            <div className="mx-auto max-w-md rounded-2xl bg-white p-10 text-center shadow-strong">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `${accent}14`, color: accent }}>
                <Zap className="w-7 h-7" />
              </div>
              <p className="font-display font-bold text-surface-900 text-lg">Nenhuma oferta no momento</p>
              <p className="mt-2 text-surface-500 text-sm font-body">As próximas promoções aparecem aqui primeiro. Enquanto isso, que tal ver as novidades da loja?</p>
              <button
                onClick={() => navigate('/')}
                className={`mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-display font-bold text-white ${ColorGlobalTema}`}
              >
                Ver a loja
              </button>
            </div>
          )
        )}
      </div>

      <Loading
        loading={Controller?.result?.Loading || false}
        message="Carregando ofertas"
        subMessage="Buscando os melhores preços para você"
      />
    </div>
  );
}
