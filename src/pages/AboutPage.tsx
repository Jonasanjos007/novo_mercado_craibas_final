import {
  ArrowLeft, ArrowRight, MapPin, Heart, ShieldCheck, Smartphone, MessageCircle, Phone, Mail,
  Truck, RotateCcw, CreditCard, Compass, Laptop, Handshake, Rocket, ShoppingBag, Quote,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UseUserStore } from '../store/UseUserStore';
import { UseUserAdminStore } from '../storeAdmin/UseUserAdminStore';
import { getColorConfig } from '../types/Colors';
import { RETURN_WINDOW_DAYS } from '../utils';
import { formatStorePhone, storeTelUrl, storeWhatsAppUrl } from '../utils/contact';

/** A jornada dos fundadores, contada em quatro passos. */
const JOURNEY = [
  {
    icon: Compass,
    title: 'A partida',
    text: 'Um filho de Craíbas deixa a cidade em busca de conhecimento na área de tecnologia.',
  },
  {
    icon: Laptop,
    title: 'O aprendizado',
    text: 'Longe de casa, estuda, trabalha e cresce, sem perder de vista a vontade de voltar com algo novo.',
  },
  {
    icon: Handshake,
    title: 'O encontro',
    text: 'Convida um sócio, também craibense, que divide o mesmo sonho para a cidade natal.',
  },
  {
    icon: Rocket,
    title: 'O começo',
    text: 'Juntos, criam o Mercado Craíbas: tecnologia a serviço de quem compra e de quem vende aqui.',
  },
];

const VALUES = [
  {
    icon: Heart,
    title: 'Raiz craibense',
    text: 'Somos daqui e trabalhamos para daqui. Cada pedido fortalece o comércio e a economia da nossa cidade.',
  },
  {
    icon: Smartphone,
    title: 'Tecnologia que facilita',
    text: 'Comprar deve ser simples: escolher pelo celular, pagar em poucos toques e acompanhar tudo em tempo real.',
  },
  {
    icon: ShieldCheck,
    title: 'Compra segura',
    text: 'Pagamento processado pelo Mercado Pago, com PIX e cartão, e seus dados protegidos do início ao fim.',
  },
  {
    icon: MessageCircle,
    title: 'Atendimento de perto',
    text: 'Gente de verdade do outro lado. Quando você precisar, a gente responde como vizinho, não como robô.',
  },
];

const HOW_IT_WORKS = [
  { icon: ShoppingBag, title: 'Escolha', text: 'Navegue pelas categorias, ofertas e achadinhos direto do celular.' },
  { icon: CreditCard, title: 'Pague', text: 'PIX ou cartão, com confirmação na hora e total segurança.' },
  { icon: Truck, title: 'Receba', text: 'Acompanhe o pedido pelo site até ele chegar na sua porta.' },
];

export default function AboutPage() {
  const navigate = useNavigate();
  const { NameColorGlobal, ColorGlobalTema, ColorGlobalHover } = UseUserStore();
  const { BaseSiteInterface } = UseUserAdminStore();
  const colorConfig = getColorConfig(NameColorGlobal);
  const accent = colorConfig.hex;

  const storeName = BaseSiteInterface?.storeName?.trim() || 'Mercado Craíbas';
  const initials = storeName.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const deliveryDays = Number(BaseSiteInterface?.timeframeBusinessDays) || 0;

  const phoneLabel = formatStorePhone(BaseSiteInterface?.phoneSupport);
  const whatsUrl = storeWhatsAppUrl(BaseSiteInterface?.phoneSupport, `Olá! Vim pelo site do ${storeName} e gostaria de falar com vocês.`);
  const telUrl = storeTelUrl(BaseSiteInterface?.phoneSupport);
  const email = BaseSiteInterface?.emailSupport?.trim() || null;
  const hasContact = !!(whatsUrl || email);

  // Fatos reais da loja (nada de número inventado).
  const facts = [
    { icon: MapPin, title: 'Nascido em Craíbas', text: 'Alagoas' },
    {
      icon: Truck,
      title: deliveryDays > 0 ? `Entrega em até ${deliveryDays} ${deliveryDays === 1 ? 'dia útil' : 'dias úteis'}` : 'Entrega na sua porta',
      text: 'Acompanhe pelo site',
    },
    { icon: CreditCard, title: 'PIX e cartão', text: 'Via Mercado Pago' },
    { icon: RotateCcw, title: `${RETURN_WINDOW_DAYS} dias para devolver`, text: 'Direito de arrependimento' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#09090b] via-[#111113] to-[#18181b]">
        <div
          className="pointer-events-none absolute -top-32 -right-24 h-[28rem] w-[28rem] rounded-full opacity-25 blur-3xl"
          style={{ background: accent }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-24 h-[24rem] w-[24rem] rounded-full opacity-10 blur-3xl"
          style={{ background: accent }}
        />

        <div className="relative max-w-6xl mx-auto px-4 pt-6 pb-16 md:pb-24">
          <button
            onClick={() => navigate(-1)}
            className="mb-10 flex items-center gap-2 text-white/40 hover:text-white text-sm font-body transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          <div className="max-w-3xl">
            <div className="mb-6 flex items-center gap-3">
              {BaseSiteInterface?.storeImageIcone ? (
                <img
                  src={`/Imagens/Site/${BaseSiteInterface.storeImageIcone}`}
                  alt={storeName}
                  className="h-12 w-12 rounded-2xl object-cover shadow-strong"
                />
              ) : (
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl font-display text-lg font-bold text-white shadow-strong"
                  style={{ background: accent }}
                >
                  {initials}
                </div>
              )}
              <span
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-display font-bold uppercase tracking-widest"
                style={{ background: `${accent}1F`, color: accent }}
              >
                Nossa história
              </span>
            </div>

            <h1 className="font-display font-bold text-white text-4xl md:text-6xl leading-[1.05] tracking-tight">
              De Craíbas para o mundo,
              <span className="block" style={{ color: accent }}>e de volta para Craíbas.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-white/60 font-body text-base md:text-lg leading-relaxed">
              O {storeName} nasceu do encontro entre o conhecimento em tecnologia e o amor pela nossa cidade.
              Uma loja feita por craibenses, para tornar a compra mais fácil para quem vive aqui.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-display font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] ${ColorGlobalTema} ${ColorGlobalHover}`}
                style={{ boxShadow: `0 8px 24px ${accent}55` }}
              >
                Conhecer a loja <ArrowRight className="w-4 h-4" />
              </button>
              {whatsUrl && (
                <a
                  href={whatsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-display font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <MessageCircle className="w-4 h-4" /> Falar com a gente
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FATOS ── */}
      <div className="relative z-10 max-w-6xl mx-auto -mt-10 px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {facts.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl bg-white p-4 md:p-5 shadow-strong">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${accent}14`, color: accent }}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-display font-bold text-surface-900 text-sm md:text-base leading-tight">{title}</p>
              <p className="mt-1 text-surface-400 text-xs font-body">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14 md:py-20 space-y-16 md:space-y-24">
        {/* ── HISTÓRIA + JORNADA ── */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-3">
            <p className="text-xs font-display font-bold uppercase tracking-widest" style={{ color: accent }}>Como tudo começou</p>
            <h2 className="mt-2 font-display font-bold text-surface-900 text-3xl md:text-4xl tracking-tight">
              Uma saudade que virou projeto
            </h2>
            <div className="mt-6 space-y-5 text-surface-600 font-body text-[15px] md:text-base leading-relaxed">
              <p>
                O {storeName} começou com uma partida. Um filho de Craíbas deixou a cidade em busca de conhecimento
                na área de tecnologia. Estudou, trabalhou e cresceu longe de casa, mas levou junto uma certeza:
                um dia, aquele conhecimento voltaria para a terra onde ele nasceu.
              </p>
              <p>
                A ideia ganhou força quando ele convidou um sócio, também natural de Craíbas, que dividia o mesmo
                sonho: criar algo novo na nossa cidade natal. Juntos, transformaram a vontade em uma loja online
                pensada para quem vive aqui, para comprar pelo celular, pagar com segurança e receber em casa,
                sem precisar sair da cidade.
              </p>
              <p>
                Acreditamos que inovação não precisa estar longe. Quando a tecnologia chega perto de casa, ela
                facilita a vida de quem compra, abre portas para quem vende e movimenta a economia local.
                É isso que queremos construir: <strong className="font-semibold text-surface-900">uma Craíbas mais conectada, com o jeito e o cuidado da nossa gente.</strong>
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl bg-white p-6 md:p-8 shadow-strong">
            <p className="font-display font-bold text-surface-900 text-lg">A jornada</p>
            <ol className="mt-6 space-y-6">
              {JOURNEY.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="relative flex gap-4">
                  {i < JOURNEY.length - 1 && (
                    <span className="absolute left-5 top-11 bottom-[-1.5rem] w-px" style={{ background: `${accent}33` }} />
                  )}
                  <span
                    className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ background: accent, boxShadow: `0 6px 16px ${accent}40` }}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="font-display font-bold text-surface-900 text-sm">{title}</p>
                    <p className="mt-1 text-surface-500 text-sm font-body leading-relaxed">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── FRASE ── */}
        <section className="relative overflow-hidden rounded-3xl bg-[#09090b] px-6 py-12 md:px-14 md:py-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-20 blur-3xl" style={{ background: accent }} />
          <Quote className="relative w-10 h-10 mb-5" style={{ color: accent }} />
          <p className="relative max-w-3xl font-display font-bold text-white text-2xl md:text-4xl leading-tight tracking-tight">
            Tecnologia não é coisa só de cidade grande. Ela também pode nascer, e crescer, no interior.
          </p>
          <p className="relative mt-5 text-white/50 font-body text-sm">{storeName} · nossa visão</p>
        </section>

        {/* ── VALORES ── */}
        <section>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-display font-bold uppercase tracking-widest" style={{ color: accent }}>No que acreditamos</p>
            <h2 className="mt-2 font-display font-bold text-surface-900 text-3xl md:text-4xl tracking-tight">Nossos valores</h2>
            <p className="mt-3 text-surface-500 font-body">O que guia cada decisão, do produto que entra na loja ao jeito de atender.</p>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="group flex items-start gap-4 rounded-2xl bg-white p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-strong"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors"
                  style={{ background: `${accent}14`, color: accent }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-surface-900 text-base">{title}</h3>
                  <p className="mt-1 text-surface-500 font-body text-sm leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── COMO FUNCIONA ── */}
        <section className="rounded-3xl bg-white p-6 md:p-10 shadow-strong">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-display font-bold uppercase tracking-widest" style={{ color: accent }}>Simples assim</p>
              <h2 className="mt-2 font-display font-bold text-surface-900 text-2xl md:text-3xl tracking-tight">Comprar aqui é fácil</h2>
            </div>
            <p className="max-w-sm text-surface-500 font-body text-sm">Do celular até a sua porta, em três passos.</p>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {HOW_IT_WORKS.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="relative rounded-2xl border border-surface-100 bg-surface-50/60 p-5">
                <span className="absolute right-5 top-4 font-display text-4xl font-bold text-surface-200">{i + 1}</span>
                <Icon className="w-6 h-6" style={{ color: accent }} />
                <p className="mt-4 font-display font-bold text-surface-900">{title}</p>
                <p className="mt-1 text-surface-500 font-body text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTATO ── */}
        <section className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-white" style={{ background: `linear-gradient(135deg, ${accent}, #09090b 140%)` }}>
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-white/10" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="lg:max-w-md">
              <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight">
                {hasContact ? 'Vamos conversar?' : 'Faça parte dessa história'}
              </h2>
              <p className="mt-3 text-white/80 font-body text-sm md:text-base leading-relaxed max-w-md">
                {hasContact
                  ? 'Dúvida sobre um produto, um pedido ou uma ideia para a loja? Fale com a gente. Do outro lado tem gente de Craíbas pronta para ajudar.'
                  : 'Cada compra no Mercado Craíbas ajuda a construir uma cidade mais conectada. Venha conhecer a loja.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 lg:shrink-0 lg:justify-end">
              {whatsUrl && (
                <a
                  href={whatsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-white px-5 py-3 text-sm font-display font-bold text-surface-900 shadow-strong transition-all hover:scale-[1.02]"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" /> WhatsApp
                </a>
              )}
              {telUrl && phoneLabel && (
                <a
                  href={telUrl}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-body font-semibold backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <Phone className="w-4 h-4" /> {phoneLabel}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-body font-semibold backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <Mail className="w-4 h-4 shrink-0" /> <span className="truncate">{email}</span>
                </a>
              )}
              {!hasContact && (
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-display font-bold text-surface-900 shadow-strong transition-all hover:scale-[1.02]"
                >
                  Ver produtos <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
