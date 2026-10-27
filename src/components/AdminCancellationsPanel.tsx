import { useEffect } from 'react';
import { CheckCircle2, Clock, Loader2, MapPin, MessageCircle, PackageX, ShieldCheck, Truck, XCircle } from 'lucide-react';
import { OrderCancelAdmin } from '../models/Order';
import { cancelStatusColors, cancelStatusLabels, formatPrice, orderStatusColors, orderStatusLabels } from '../utils';
import { useAdminCancellationsController, whatsAppCancelLink } from '../controller/useAdminCancellationsController';
import { CancellationsFilter } from '../adminService/CancellationsServiceAdmin';
import ConfirmAdminPopup from './ConfirmAdminPopup';

const formatDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';

/** Pedido que já saiu para entrega não pode mais ser cancelado (o servidor confere de novo). */
const canApprove = (o: OrderCancelAdmin) => !['SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO'].includes((o.order_Status ?? '').toUpperCase());

/** Aba "Cancelamentos" do admin: pedidos pagos que o cliente pediu para cancelar. */
export default function AdminCancellationsPanel({ darkMode = false }: { darkMode?: boolean }) {
    const Controller = useAdminCancellationsController();
    const { Cancellations, CancellationsFilter: filter, LoadingCancellations, pending, saving } = Controller.result;
    const dk = darkMode;

    useEffect(() => {
        Controller.action.LoadCancellations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const card = dk ? 'bg-[#0d0d14] border-white/[0.06]' : 'bg-white border-surface-200';
    const txt = dk ? 'text-white' : 'text-surface-900';
    const txt2 = dk ? 'text-white/60' : 'text-surface-500';
    const sub = dk ? 'text-white/35' : 'text-surface-400';
    const soft = dk ? 'bg-white/[0.04] border-white/10' : 'bg-surface-50 border-surface-100';

    const by = Cancellations.byStatus ?? {};
    const tabs: { v: CancellationsFilter; l: string; n: number }[] = [
        { v: 'open', l: 'Aguardando', n: Cancellations.open },
        { v: 'APROVADO', l: 'Aprovados', n: by['APROVADO'] ?? 0 },
        { v: 'RECUSADO', l: 'Recusados', n: by['RECUSADO'] ?? 0 },
        { v: 'all', l: 'Todos', n: Object.values(by).reduce((a, b) => a + b, 0) },
    ];

    const o = pending?.order;
    const popup = pending?.approve
        ? {
            title: 'Aprovar o cancelamento?',
            description: o?.online_Refund
                ? `O pedido #${o?.number_Order} será cancelado, o valor de ${formatPrice(o?.total_Value_Order ?? 0)} estornado no Mercado Pago e o estoque devolvido. O cliente é avisado.`
                : `O pedido #${o?.number_Order} será cancelado e o estoque devolvido. O pagamento não foi online: devolva ${formatPrice(o?.total_Value_Order ?? 0)} ao cliente manualmente.`,
            confirmText: 'Aprovar e estornar',
            color: 'green' as const,
            requireReason: false,
            icon: <CheckCircle2 className="w-8 h-8 text-green-500" />,
        }
        : {
            title: 'Recusar o cancelamento?',
            description: `O pedido #${o?.number_Order ?? ''} segue normalmente. Explique ao cliente por que o cancelamento não foi aprovado.`,
            confirmText: 'Recusar cancelamento',
            color: 'red' as const,
            requireReason: true,
            icon: <XCircle className="w-8 h-8 text-red-400" />,
        };

    return (
        <div className={`w-full min-w-0 rounded-[24px] sm:rounded-[30px] border p-3 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] ${card}`}>
            <ConfirmAdminPopup
                open={!!pending}
                title={popup.title}
                description={popup.description}
                confirmText={popup.confirmText}
                cancelText="Voltar"
                confirmColor={popup.color}
                loading={saving}
                requireReason={popup.requireReason}
                minReasonLength={5}
                reasonLabel="Mensagem para o cliente"
                reasonPlaceholder="Ex.: o pedido já foi separado e sai para entrega hoje."
                icon={popup.icon}
                onConfirm={Controller.action.confirm}
                onCancel={Controller.action.close}
            />

            {/* Cabeçalho */}
            <div className="flex items-center gap-3 mb-4 px-1 sm:px-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-red-500/10 flex items-center justify-center">
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                </div>
                <div className="min-w-0">
                    <h3 className={`font-display font-bold text-sm sm:text-base ${txt}`}>Pedidos de cancelamento</h3>
                    <p className={`text-[11px] sm:text-xs leading-snug ${sub}`}>Pedidos pagos que o cliente quer cancelar. Aprove (estorna) ou recuse com uma explicação.</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="-mx-3 px-3 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1 mb-4">
                {tabs.map(t => {
                    const active = filter === t.v;
                    return (
                        <button
                            key={t.v}
                            type="button"
                            onClick={() => Controller.action.LoadCancellations(t.v)}
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

            {LoadingCancellations && Cancellations.items.length === 0 ? (
                <div className="flex justify-center py-16"><Loader2 className={`w-6 h-6 animate-spin ${sub}`} /></div>
            ) : Cancellations.items.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                    <PackageX className={`w-10 h-10 mb-3 ${sub}`} />
                    <p className={`text-sm font-semibold ${txt2}`}>Nenhum pedido de cancelamento aqui.</p>
                </div>
            ) : (
                <div className={`grid grid-cols-1 gap-3 xl:grid-cols-2 ${LoadingCancellations ? 'opacity-60' : ''}`}>
                    {Cancellations.items.map(item => {
                        const wa = whatsAppCancelLink(item);
                        const open = item.cancel_Status === 'SOLICITADO';
                        const approvable = open && canApprove(item);
                        return (
                            <div key={item.id_Order} className={`min-w-0 flex flex-col rounded-2xl border p-3 sm:p-4 ${dk ? 'border-white/10 bg-white/[0.02]' : 'border-surface-200 bg-white'}`}>
                                <div className="flex items-start gap-3 min-w-0">
                                    <img
                                        src={item.first_Image ? `/Imagens/Produtos/${item.first_Image}` : '/Imagens/sem-imagem.png'}
                                        alt=""
                                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover border flex-shrink-0 ${dk ? 'border-white/10' : 'border-surface-200'}`}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <span className={`font-display font-bold text-sm ${txt}`}>#{item.number_Order}</span>
                                            <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${cancelStatusColors[item.cancel_Status] ?? ''}`}>
                                                {cancelStatusLabels[item.cancel_Status] ?? item.cancel_Status}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${orderStatusColors[item.order_Status] ?? ''}`}>
                                                {orderStatusLabels[item.order_Status] ?? item.order_Status}
                                            </span>
                                        </div>
                                        <p className={`text-xs font-semibold mt-1 truncate ${txt2}`}>{item.customer_Name}</p>
                                        <p className={`text-[11px] leading-snug line-clamp-2 sm:line-clamp-1 break-words ${sub}`}>
                                            {item.first_Product}{item.items > 1 ? ` + ${item.items - 1} item(s)` : ''}
                                        </p>
                                        <p className={`text-[11px] font-semibold mt-0.5 ${txt2}`}>
                                            {formatPrice(item.total_Value_Order)} <span className={`font-normal ${sub}`}>· {item.payment_terms}</span>
                                        </p>
                                    </div>
                                </div>

                                {item.cancel_Reason && (
                                    <div className={`mt-3 rounded-xl border px-3 py-2 ${soft}`}>
                                        <p className={`text-[10px] font-bold uppercase tracking-wide ${sub}`}>Motivo do cliente</p>
                                        <p className={`text-xs mt-0.5 break-words whitespace-pre-line ${txt2}`}>{item.cancel_Reason}</p>
                                    </div>
                                )}
                                {item.cancel_Admin_Note && (
                                    <p className={`mt-2 text-[11px] break-words ${txt2}`}><span className="font-bold">Resposta da loja:</span> {item.cancel_Admin_Note}</p>
                                )}

                                <div className={`mt-3 grid gap-1.5 text-[11px] leading-snug ${sub}`}>
                                    <span className="flex items-start gap-1.5"><Clock className="w-3 h-3 mt-0.5 shrink-0" /> <span>Pedido em {formatDateTime(item.order_Date)}<span className="hidden sm:inline"> · </span><br className="sm:hidden" />Cancelamento pedido em {formatDateTime(item.cancel_Requested_At)}</span></span>
                                    {item.address && <span className="flex items-start gap-1.5 min-w-0"><MapPin className="w-3 h-3 mt-0.5 shrink-0" /> <span className="break-words min-w-0">{item.address}</span></span>}
                                    {item.delivery_Assignee_Name && open && (
                                        <span className="flex items-start gap-1.5"><Truck className="w-3 h-3 mt-0.5 shrink-0" /> Entrega com {item.delivery_Assignee_Name}</span>
                                    )}
                                    {open && !item.online_Refund && (
                                        <span className="text-amber-600 font-semibold">Pagamento não foi online: o estorno será manual.</span>
                                    )}
                                    {open && !approvable && (
                                        <span className="text-red-500 font-semibold">O pedido já saiu para entrega: só dá para recusar. O cliente pode pedir devolução depois.</span>
                                    )}
                                    {item.cancel_Status === 'APROVADO' && (
                                        <span className="flex items-center gap-1.5 text-green-600 font-semibold"><ShieldCheck className="w-3 h-3" /> Respondido em {formatDateTime(item.cancel_Decided_At)}</span>
                                    )}
                                </div>

                                <div className="mt-auto pt-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                                    {wa ? (
                                        <a
                                            href={wa}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`inline-flex items-center justify-center gap-1.5 h-10 sm:h-9 px-3.5 rounded-xl bg-[#25D366] hover:brightness-95 text-white text-xs font-bold transition-all ${open ? 'col-span-2 sm:col-span-1' : 'col-span-2 sm:col-span-1'}`}
                                        >
                                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                        </a>
                                    ) : (
                                        <span className={`col-span-2 sm:col-span-1 inline-flex items-center justify-center h-10 sm:h-9 px-3 rounded-xl text-[11px] border ${soft} ${sub}`}>Sem telefone</span>
                                    )}
                                    {open && (
                                        <>
                                            <button
                                                type="button"
                                                disabled={!approvable}
                                                onClick={() => Controller.action.open(item, true)}
                                                className="inline-flex items-center justify-center gap-1.5 h-10 sm:h-9 px-3 sm:px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-[0.98] bg-green-600 hover:bg-green-700 text-white disabled:opacity-40 disabled:pointer-events-none"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Aprovar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => Controller.action.open(item, false)}
                                                className="inline-flex items-center justify-center gap-1.5 h-10 sm:h-9 px-3 sm:px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-[0.98] bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                                            >
                                                <XCircle className="w-3.5 h-3.5 shrink-0" /> Recusar
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
