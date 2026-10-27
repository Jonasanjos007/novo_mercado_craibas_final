import {
    Bike,
    CheckCircle2,
    Hand,
    History,
    Info,
    Loader2,
    RefreshCw,
    Truck,
    Undo2,
    Users,
} from 'lucide-react';
import DeliveryOrderCard from './DeliveryOrderCard';
import ConfirmAdminPopup from './ConfirmAdminPopup';
import { MyDeliveriesView, useAdminMyDeliveriesController } from '../controller/useAdminMyDeliveriesController';
import { DeliveryOrder } from '../models/Delivery';
import { addressLine, deliveryTheme, groupByDay, toDate } from '../utils/delivery';

interface AdminMyDeliveriesPageProps {
    darkMode: boolean;
}

/**
 * Aba "Minhas entregas" do admin.
 * O admin pega pedidos e entrega ele mesmo. Não conta gorjeta, diária nem caixa.
 */
export default function AdminMyDeliveriesPage({ darkMode }: AdminMyDeliveriesPageProps) {
    const Controller = useAdminMyDeliveriesController();
    const r = Controller.result;
    const a = Controller.action;
    const t = deliveryTheme(darkMode);

    const views: { id: MyDeliveriesView; label: string; count: number; icon: JSX.Element }[] = [
        { id: 'mine', label: 'Comigo', count: r.mine.length, icon: <Bike className="w-4 h-4" /> },
        { id: 'free', label: 'Livres', count: r.free.length, icon: <Hand className="w-4 h-4" /> },
        { id: 'others', label: 'Com entregadores', count: r.others.length, icon: <Users className="w-4 h-4" /> },
        { id: 'history', label: 'Entreguei', count: r.history.length, icon: <History className="w-4 h-4" /> },
    ];

    const list: DeliveryOrder[] = r.view === 'mine' ? r.mine : r.view === 'free' ? r.free : r.view === 'others' ? r.others : [];

    const emptyText: Record<MyDeliveriesView, string> = {
        mine: 'Nenhum pedido com você. Pegue um pedido em "Livres".',
        free: 'Todos os pedidos já têm alguém responsável.',
        others: 'Nenhum pedido com entregadores agora.',
        history: 'Você ainda não fez nenhuma entrega.',
    };

    return (
        <div className="w-full space-y-6 pb-10 animate-fade-in">
            {/* ── cabeçalho ── */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center">
                        <Bike className="w-6 h-6 text-brand-500" />
                        {r.mine.length > 0 && (
                            <span className={`absolute -right-1 -top-1 w-3 h-3 rounded-full bg-brand-500 border-2 ${darkMode ? 'border-[#0a0a0f]' : 'border-[#f0f0f5]'}`} />
                        )}
                    </div>
                    <div>
                        <h1 className={`font-display text-2xl font-bold ${t.txt}`}>Minhas entregas</h1>
                        <p className={`text-sm mt-1 ${t.sub}`}>Pegue um pedido e entregue você mesmo. Quando estiver com um entregador, você vê quem é.</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => a.load()}
                    disabled={r.refreshing}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition disabled:opacity-60 ${t.card} ${t.txt2} ${t.hover}`}
                >
                    {r.refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Atualizar
                </button>
            </div>

            {/* ── aviso ── */}
            <div className="flex items-start gap-3 rounded-2xl border border-sky-500/20 bg-sky-500/10 px-4 py-3">
                <Info className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                <p className={`text-xs leading-relaxed ${t.dark ? 'text-sky-300' : 'text-sky-700'}`}>
                    Entregas feitas por você não contam gorjeta, diária nem caixa. O cliente recebe os mesmos avisos de "saiu para entrega" e "entregue".
                </p>
            </div>

            {/* ── resumo ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <SummaryCard t={t} title="Comigo" value={r.mine.length} description="para entregar" icon={<Bike className="w-4 h-4 text-brand-500" />} />
                <SummaryCard t={t} title="Livres" value={r.free.length} description="sem responsável" icon={<Hand className="w-4 h-4 text-amber-500" />} />
                <SummaryCard t={t} title="Com entregadores" value={r.others.length} description="em andamento" icon={<Truck className="w-4 h-4 text-violet-500" />} />
                <SummaryCard t={t} title="Entreguei hoje" value={r.deliveredToday} description="pedidos" icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} />
            </div>

            {/* ── filtro ── */}
            <div className={`flex gap-1 overflow-x-auto rounded-2xl border p-1.5 ${t.card}`}>
                {views.map((view) => (
                    <button
                        key={view.id}
                        type="button"
                        onClick={() => a.setView(view.id)}
                        className={`flex-1 min-w-max flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition ${r.view === view.id ? 'bg-brand-500 text-white shadow-brand' : `${t.txt2} ${t.hover}`}`}
                    >
                        {view.icon}
                        {view.label}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${r.view === view.id ? 'bg-white/25' : 'bg-brand-500/15 text-brand-500'}`}>{view.count}</span>
                    </button>
                ))}
            </div>

            {/* ── conteúdo ── */}
            {r.loading ? (
                <div className={`rounded-3xl border p-12 flex items-center justify-center ${t.card}`}>
                    <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                </div>
            ) : r.view === 'history' ? (
                <HistoryList history={r.history} t={t} empty={emptyText.history} />
            ) : list.length === 0 ? (
                <Empty t={t} text={emptyText[r.view]} />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    {list.map((order) => (
                        <DeliveryOrderCard
                            key={order.id}
                            order={order}
                            theme={t}
                            showAssignee
                            busy={r.busyId === order.id}
                            onTake={a.requestTake}
                            onRelease={(o) => a.setReleaseTarget(o)}
                            onDispatch={(o) => a.setDispatchTarget(o)}
                            onDeliver={(o) => a.setDeliverTarget(o)}
                        />
                    ))}
                </div>
            )}

            {/* ── popups ── */}
            <ConfirmAdminPopup
                open={!!r.takeTarget}
                title="Assumir este pedido?"
                description={r.takeTarget?.message}
                confirmText="Assumir pedido"
                icon={<Hand className="w-8 h-8 text-brand-400" />}
                loading={r.busyId === r.takeTarget?.order.id}
                onCancel={() => a.setTakeTarget(null)}
                onConfirm={() => a.confirmTakeForce()}
            />

            <ConfirmAdminPopup
                open={!!r.releaseTarget}
                title="Soltar pedido?"
                description={r.releaseTarget ? `#${r.releaseTarget.number_Order} volta para "Livres" e pode ser atribuído a um entregador.` : ''}
                confirmText="Soltar"
                icon={<Undo2 className="w-8 h-8 text-brand-400" />}
                loading={r.busyId === r.releaseTarget?.id}
                onCancel={() => a.setReleaseTarget(null)}
                onConfirm={() => a.confirmRelease()}
            />

            <ConfirmAdminPopup
                open={!!r.dispatchTarget}
                title={r.dispatchTarget?.kind === 'COLETA' ? 'Saiu para coleta?' : 'Saiu para entrega?'}
                description={r.dispatchTarget ? (r.dispatchTarget.kind === 'COLETA' ? `Coleta da devolução #${r.dispatchTarget.number_Order}: o cliente recebe o aviso de que você está indo buscar o produto.` : `#${r.dispatchTarget.number_Order} vai para "Em rota" e o cliente recebe o aviso.`) : ''}
                confirmText={r.dispatchTarget?.kind === 'COLETA' ? 'Sim, saí para buscar' : 'Sim, saí para entregar'}
                icon={<Truck className="w-8 h-8 text-brand-400" />}
                loading={r.busyId === r.dispatchTarget?.id}
                onCancel={() => a.setDispatchTarget(null)}
                onConfirm={() => a.confirmDispatch()}
            />

            <ConfirmAdminPopup
                open={!!r.deliverTarget}
                title={r.deliverTarget?.kind === 'COLETA' ? 'Confirmar coleta' : 'Confirmar entrega'}
                description={r.deliverTarget ? `#${r.deliverTarget.number_Order} · ${addressLine(r.deliverTarget.address)}` : ''}
                confirmText={r.deliverTarget?.kind === 'COLETA' ? 'Confirmar coleta' : 'Confirmar entrega'}
                confirmColor="green"
                icon={<CheckCircle2 className="w-8 h-8 text-emerald-400" />}
                requireReason
                reasonLabel={r.deliverTarget?.kind === 'COLETA' ? 'Quem entregou o produto' : 'Quem recebeu'}
                reasonPlaceholder={r.deliverTarget?.kind === 'COLETA' ? 'Nome de quem entregou o produto da devolução' : 'Nome de quem recebeu o pedido'}
                reasonErrorText={r.deliverTarget?.kind === 'COLETA' ? 'Informe o nome de quem entregou o produto (mínimo de 2 letras).' : 'Informe o nome de quem recebeu (mínimo de 2 letras).'}
                minReasonLength={2}
                maxReasonLength={100}
                reasonRows={1}
                loading={r.busyId === r.deliverTarget?.id}
                onCancel={() => a.setDeliverTarget(null)}
                onConfirm={(who) => a.confirmDeliver(who)}
            />
        </div>
    );
}

type Theme = ReturnType<typeof deliveryTheme>;

function SummaryCard({ t, title, value, description, icon }: { t: Theme; title: string; value: number | string; description: string; icon: JSX.Element }) {
    return (
        <div className={`rounded-2xl border p-4 shadow-soft ${t.card}`}>
            <div className="flex items-center justify-between">
                <p className={`text-xs font-semibold ${t.txt2}`}>{title}</p>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.soft}`}>{icon}</div>
            </div>
            <p className={`mt-2 font-display font-bold text-2xl ${t.txt}`}>{value}</p>
            <p className={`text-[11px] ${t.sub}`}>{description}</p>
        </div>
    );
}

function Empty({ t, text }: { t: Theme; text: string }) {
    return (
        <div className={`rounded-3xl border px-6 py-14 text-center ${t.card}`}>
            <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center ${t.soft} text-brand-500`}>
                <Truck className="w-7 h-7" />
            </div>
            <p className={`mt-4 text-sm ${t.txt2}`}>{text}</p>
        </div>
    );
}

function HistoryList({ history, t, empty }: { history: DeliveryOrder[]; t: Theme; empty: string }) {
    const groups = groupByDay(history, (o) => o.deliveredAt);

    if (history.length === 0) return <Empty t={t} text={empty} />;

    return (
        <div className="space-y-5">
            {groups.map((group) => (
                <section key={group.key}>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${group.label === 'Hoje' ? 'bg-brand-500/15 text-brand-500' : `${t.soft} ${t.txt2}`}`}>{group.label}</span>
                        <span className={`flex-1 h-px ${t.dark ? 'bg-white/[0.06]' : 'bg-surface-200'}`} />
                        <span className={`text-xs ${t.sub}`}>{group.items.length} {group.items.length === 1 ? 'entrega' : 'entregas'}</span>
                    </div>
                    <div className={`rounded-2xl border divide-y overflow-hidden ${t.card} ${t.divide}`}>
                        {group.items.map((order) => (
                            <div key={order.id} className="flex items-center gap-3 px-4 py-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold ${t.txt}`}>
                                        #{order.number_Order}
                                        <span className={`ml-2 text-[11px] font-normal ${t.sub}`}>
                                            {toDate(order.deliveredAt)?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </p>
                                    <p className={`text-xs truncate ${t.txt2}`}>{addressLine(order.address)}</p>
                                </div>
                                {order.whoReceivedIt && <p className={`hidden sm:block text-xs ${t.sub}`}>Recebido por {order.whoReceivedIt}</p>}
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
