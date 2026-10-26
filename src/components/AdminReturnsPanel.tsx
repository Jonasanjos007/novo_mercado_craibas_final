import { useEffect } from 'react';
import { CheckCircle2, Clock, Loader2, MapPin, MessageCircle, PackageX, RotateCcw, Truck, XCircle } from 'lucide-react';
import { OrderReturnAdmin, ReturnStatus } from '../models/Order';
import { formatPrice, returnStatusColors, returnStatusLabels } from '../utils';
import { useAdminReturnsController, whatsAppReturnLink } from '../controller/useAdminReturnsController';
import { ReturnsFilter } from '../adminService/ReturnsServiceAdmin';
import ConfirmAdminPopup from './ConfirmAdminPopup';

const formatDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';

/** O que cada andamento permite (o servidor confere de novo). */
const nextActions: Record<string, ReturnStatus[]> = {
    EM_ANALISE: ['AGUARDANDO_COLETA', 'DEVOLVIDO', 'CANCELADA'],
    AGUARDANDO_COLETA: ['DEVOLVIDO', 'CANCELADA'],
};

const actionStyle: Record<string, { label: string; icon: typeof Truck; cls: string }> = {
    AGUARDANDO_COLETA: { label: 'Buscar produto', icon: Truck, cls: 'bg-blue-500 hover:bg-blue-600 text-white' },
    DEVOLVIDO: { label: 'Devolvido', icon: CheckCircle2, cls: 'bg-green-600 hover:bg-green-700 text-white' },
    CANCELADA: { label: 'Cancelar devolução', icon: XCircle, cls: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200' },
};

/** Aba "Devoluções" do admin: lista, contato pelo WhatsApp e mudança de andamento. */
export default function AdminReturnsPanel({ darkMode = false }: { darkMode?: boolean }) {
    const Controller = useAdminReturnsController();
    const { Returns, ReturnsFilter: filter, LoadingReturns, pending, saving } = Controller.result;
    const dk = darkMode;

    useEffect(() => {
        Controller.action.LoadReturns();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const card = dk ? 'bg-[#0d0d14] border-white/[0.06]' : 'bg-white border-surface-200';
    const txt = dk ? 'text-white' : 'text-surface-900';
    const txt2 = dk ? 'text-white/60' : 'text-surface-500';
    const sub = dk ? 'text-white/35' : 'text-surface-400';
    const soft = dk ? 'bg-white/[0.04] border-white/10' : 'bg-surface-50 border-surface-100';

    const by = Returns.byStatus ?? {};
    const tabs: { v: ReturnsFilter; l: string; n: number }[] = [
        { v: 'open', l: 'Abertas', n: Returns.open },
        { v: 'EM_ANALISE', l: 'Em análise', n: by['EM_ANALISE'] ?? 0 },
        { v: 'AGUARDANDO_COLETA', l: 'Buscar produto', n: by['AGUARDANDO_COLETA'] ?? 0 },
        { v: 'DEVOLVIDO', l: 'Devolvidas', n: by['DEVOLVIDO'] ?? 0 },
        { v: 'CANCELADA', l: 'Canceladas', n: by['CANCELADA'] ?? 0 },
        { v: 'all', l: 'Todas', n: Object.values(by).reduce((a, b) => a + b, 0) },
    ];

    const popup = (() => {
        if (!pending) return null;
        const o = pending.order;
        switch (pending.status) {
            case 'AGUARDANDO_COLETA':
                return {
                    title: 'Buscar produto?',
                    description: `A devolução do pedido #${o.number_Order} será aprovada e o cliente avisado de que vamos buscar o produto.`,
                    confirmText: 'Aprovar coleta', color: 'brand' as const, requireReason: false,
                    icon: <Truck className="w-8 h-8 text-blue-400" />,
                };
            case 'DEVOLVIDO':
                return {
                    title: 'Confirmar devolução?',
                    description: o.online_Refund
                        ? `O produto do pedido #${o.number_Order} voltou para a loja. O valor de ${formatPrice(o.total_Value_Order)} será estornado automaticamente no Mercado Pago e o estoque devolvido.`
                        : `O produto do pedido #${o.number_Order} voltou para a loja. O pagamento não foi online: faça a devolução de ${formatPrice(o.total_Value_Order)} ao cliente manualmente. O estoque será devolvido.`,
                    confirmText: 'Marcar como devolvido', color: 'green' as const, requireReason: false,
                    icon: <CheckCircle2 className="w-8 h-8 text-green-500" />,
                };
            default:
                return {
                    title: 'Cancelar devolução?',
                    description: `A devolução do pedido #${o.number_Order} será recusada e o pedido continua entregue. Explique o motivo ao cliente.`,
                    confirmText: 'Cancelar devolução', color: 'red' as const, requireReason: true,
                    icon: <XCircle className="w-8 h-8 text-red-400" />,
                };
        }
    })();

    return (
        <div className={`w-full min-w-0 rounded-[24px] sm:rounded-[30px] border p-3 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] ${card}`}>
            <ConfirmAdminPopup
                open={!!pending}
                title={popup?.title}
                description={popup?.description}
                confirmText={popup?.confirmText}
                cancelText="Voltar"
                confirmColor={popup?.color}
                loading={saving}
                requireReason={popup?.requireReason}
                minReasonLength={5}
                reasonLabel="Mensagem para o cliente"
                reasonPlaceholder="Ex.: o produto foi usado / passou do prazo de 7 dias..."
                icon={popup?.icon}
                onConfirm={Controller.action.confirm}
                onCancel={Controller.action.close}
            />

            {/* Cabeçalho */}
            <div className="flex items-center gap-3 mb-4 px-1 sm:px-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                </div>
                <div className="min-w-0">
                    <h3 className={`font-display font-bold text-sm sm:text-base ${txt}`}>Pedidos de devolução</h3>
                    <p className={`text-[11px] sm:text-xs leading-snug ${sub}`}>Fale com o cliente pelo WhatsApp e atualize o andamento.</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="-mx-3 px-3 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
                {tabs.map(t => {
                    const active = filter === t.v;
                    return (
                        <button
                            key={t.v}
                            type="button"
                            onClick={() => Controller.action.LoadReturns(t.v)}
                            className={`flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 px-3 sm:px-3.5 rounded-2xl whitespace-nowrap border text-xs font-bold transition-all flex-shrink-0 ${active
                                ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                                : `${soft} ${txt2}`}`}
                        >
                            {t.l}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-white/20' : dk ? 'bg-white/10' : 'bg-white'}`}>{t.n}</span>
                        </button>
                    );
                })}
            </div>

            {LoadingReturns && Returns.items.length === 0 ? (
                <div className="flex justify-center py-16"><Loader2 className={`w-6 h-6 animate-spin ${sub}`} /></div>
            ) : Returns.items.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                    <PackageX className={`w-10 h-10 mb-3 ${sub}`} />
                    <p className={`text-sm font-semibold ${txt2}`}>Nenhuma devolução aqui.</p>
                </div>
            ) : (
                <div className={`grid grid-cols-1 gap-3 xl:grid-cols-2 ${LoadingReturns ? 'opacity-60' : ''}`}>
                    {Returns.items.map(o => (
                        <ReturnCard
                            key={o.id_Order}
                            order={o}
                            dk={dk}
                            classes={{ txt, txt2, sub, soft }}
                            onAction={Controller.action.open}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function ReturnCard({ order: o, dk, classes, onAction }: {
    order: OrderReturnAdmin;
    dk: boolean;
    classes: { txt: string; txt2: string; sub: string; soft: string };
    onAction: (order: OrderReturnAdmin, status: ReturnStatus) => void;
}) {
    const { txt, txt2, sub, soft } = classes;
    const wa = whatsAppReturnLink(o);
    const actions = nextActions[o.return_Status] ?? [];

    return (
        <div className={`min-w-0 flex flex-col rounded-2xl border p-3 sm:p-4 ${dk ? 'border-white/10 bg-white/[0.02]' : 'border-surface-200 bg-white'}`}>
            <div className="flex items-start gap-3 min-w-0">
                <img
                    src={o.first_Image ? `/Imagens/Produtos/${o.first_Image}` : '/Imagens/sem-imagem.png'}
                    alt=""
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover border flex-shrink-0 ${dk ? 'border-white/10' : 'border-surface-200'}`}
                />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className={`font-display font-bold text-sm ${txt}`}>#{o.number_Order}</span>
                        <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${returnStatusColors[o.return_Status] ?? ''}`}>
                            {returnStatusLabels[o.return_Status] ?? o.return_Status}
                        </span>
                    </div>
                    <p className={`text-xs font-semibold mt-1 truncate ${txt2}`}>{o.customer_Name}</p>
                    <p className={`text-[11px] leading-snug line-clamp-2 sm:line-clamp-1 break-words ${sub}`}>
                        {o.first_Product}{o.items > 1 ? ` + ${o.items - 1} item(s)` : ''}
                    </p>
                    <p className={`text-[11px] font-semibold mt-0.5 ${txt2}`}>
                        {formatPrice(o.total_Value_Order)} <span className={`font-normal ${sub}`}>· {o.payment_terms}</span>
                    </p>
                </div>
            </div>

            {o.return_Reason && (
                <div className={`mt-3 rounded-xl border px-3 py-2 ${soft}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wide ${sub}`}>Motivo do cliente</p>
                    <p className={`text-xs mt-0.5 break-words whitespace-pre-line ${txt2}`}>{o.return_Reason}</p>
                </div>
            )}
            {o.return_Admin_Note && (
                <p className={`mt-2 text-[11px] break-words ${txt2}`}><span className="font-bold">Nota da loja:</span> {o.return_Admin_Note}</p>
            )}

            <div className={`mt-3 grid gap-1.5 text-[11px] leading-snug ${sub}`}>
                <span className="flex items-start gap-1.5"><Clock className="w-3 h-3 mt-0.5 shrink-0" /> <span>Pedido em {formatDateTime(o.return_Requested_At)}<span className="hidden sm:inline"> · </span><br className="sm:hidden" />Entregue em {formatDateTime(o.delivered_At)}</span></span>
                {o.address && <span className="flex items-start gap-1.5 min-w-0"><MapPin className="w-3 h-3 mt-0.5 shrink-0" /> <span className="break-words min-w-0">{o.address}</span></span>}
                {!o.online_Refund && o.return_Status !== 'DEVOLVIDO' && o.return_Status !== 'CANCELADA' && (
                    <span className="text-amber-600 font-semibold">Pagamento não foi online: estorno manual.</span>
                )}
            </div>

            <div className="mt-auto pt-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                {wa ? (
                    <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-1.5 h-10 sm:h-9 px-3.5 rounded-xl bg-[#25D366] hover:brightness-95 text-white text-xs font-bold transition-all ${actions.length % 2 === 0 ? 'col-span-2 sm:col-span-1' : ''}`}
                    >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                ) : (
                    <span className={`inline-flex items-center justify-center h-10 sm:h-9 px-3 rounded-xl text-[11px] border ${soft} ${sub} ${actions.length % 2 === 0 ? 'col-span-2 sm:col-span-1' : ''}`}>Sem telefone</span>
                )}
                {actions.map(status => {
                    const a = actionStyle[status];
                    const Icon = a.icon;
                    return (
                        <button
                            key={status}
                            type="button"
                            onClick={() => onAction(o, status)}
                            className={`inline-flex items-center justify-center gap-1.5 h-10 sm:h-9 px-3 sm:px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-[0.98] ${a.cls}`}
                        >
                            <Icon className="w-3.5 h-3.5 shrink-0" /> {a.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
