import { useEffect, useMemo, useState } from 'react';
import {
    Bike,
    Calendar,
    Camera,
    CheckCircle2,
    ChevronRight,
    Clock,
    Edit3,
    Eye,
    EyeOff,
    History,
    KeyRound,
    Loader2,
    LogOut,
    Mail,
    MapPin,
    Moon,
    Package,
    Phone,
    RefreshCw,
    Save,
    Sparkles,
    Sun,
    Truck,
    User as UserIcon,
    Wallet,
    X,
} from 'lucide-react';
import DeliveryOrderCard from '../components/DeliveryOrderCard';
import ConfirmAdminPopup from '../components/ConfirmAdminPopup';
import ConnectedDevices from '../components/ConnectedDevices';
import { DeliveryTab, useDeliveryController } from '../controller/useDeliveryController';
import { DeliveryEarningEntry, DeliveryOrder } from '../models/Delivery';
import { formatPrice } from '../utils';
import {
    DeliveryTheme,
    addressLine,
    avatarUrl,
    deliveryTheme,
    formatRelative,
    groupByDay,
    groupEarningsByWeek,
    initials,
    startOfWeek,
    toDate,
} from '../utils/delivery';

/* ============================================================= */
/* PORTAL DO ENTREGADOR                                          */
/* Feito para o celular, mas se ajusta a qualquer tela.          */
/* ============================================================= */

const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
};

export default function DeliveryPage() {
    const Controller = useDeliveryController();
    const r = Controller.result;
    const a = Controller.action;
    const t = deliveryTheme(r.dark);

    const name = r.profile?.name ?? r.user?.name ?? 'Entregador';
    const firstName = name.split(' ')[0];

    const tabs: { id: DeliveryTab; label: string; icon: JSX.Element; count?: number; hidden?: boolean }[] = [
        { id: 'orders', label: 'Entregas', icon: <Truck className="w-5 h-5" />, count: r.orders.length },
        { id: 'history', label: 'Histórico', icon: <History className="w-5 h-5" /> },
        { id: 'earnings', label: 'Ganhos', icon: <Wallet className="w-5 h-5" />, hidden: !r.earningsEnabled },
        { id: 'profile', label: 'Perfil', icon: <UserIcon className="w-5 h-5" /> },
    ];

    const visibleTabs = tabs.filter((tab) => !tab.hidden);

    const weekEarning = useMemo(() => {
        if (!r.earnings?.enabled) return 0;
        const start = startOfWeek(new Date()).getTime();
        return r.earnings.entries
            .filter((e) => (toDate(e.date)?.getTime() ?? 0) >= start)
            .reduce((sum, e) => sum + e.amount, 0);
    }, [r.earnings]);

    return (
        <div className={`min-h-screen font-body ${t.page}`}>
            {/* ───────────── TOPO ───────────── */}
            <header className={`sticky top-0 z-30 border-b backdrop-blur-xl ${r.dark ? 'bg-[#07070b]/85 border-white/[0.06]' : 'bg-white/85 border-surface-200/70'}`}>
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Avatar name={name} avatar={r.profile?.avatar} size="sm" dark={r.dark} />

                    <div className="flex-1 min-w-0">
                        <p className={`font-display font-bold text-sm leading-none truncate ${t.txt}`}>{name}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500">
                            <span className="relative flex w-2 h-2">
                                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                                <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
                            </span>
                            Entregador · online
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => a.loadAll()}
                        disabled={r.refreshing}
                        aria-label="Atualizar"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${t.txt2} ${t.hover} disabled:opacity-50`}
                    >
                        <RefreshCw className={`w-[18px] h-[18px] ${r.refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        type="button"
                        onClick={a.toggleTheme}
                        aria-label="Alternar tema"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${t.txt2} ${t.hover}`}
                    >
                        {r.dark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => a.setLogoutOpen(true)}
                        className="hidden md:flex items-center gap-2 h-10 px-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition"
                    >
                        <LogOut className="w-4 h-4" /> Sair
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 pt-5 pb-32 md:pb-12">
                {/* ───────────── RESUMO ───────────── */}
                <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-500 via-brand-600 to-orange-700 text-white p-5 sm:p-7 shadow-brand-lg animate-fade-in">
                    <div
                        className="absolute inset-0 opacity-[0.12] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '22px 22px' }}
                    />
                    <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                    <Truck className="absolute -right-4 bottom-2 w-36 h-36 text-white/[0.07] -rotate-6 pointer-events-none" />

                    <div className="relative">
                        <p className="text-white/70 text-xs font-semibold uppercase tracking-[0.18em]">
                            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <h1 className="mt-1.5 font-display font-black text-2xl sm:text-3xl leading-tight">
                            {greeting()}, {firstName}!
                        </h1>
                        <p className="mt-1 text-sm text-white/80">
                            {r.orders.length === 0
                                ? 'Nenhuma entrega com você agora. Assim que o admin atribuir, ela aparece aqui.'
                                : `Você tem ${r.orders.length} ${r.orders.length === 1 ? 'entrega' : 'entregas'} em andamento.`}
                        </p>

                        <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                            <HeroStat label="Para sair" value={r.toDispatch.length} icon={<Package className="w-4 h-4" />} />
                            <HeroStat label="Em rota" value={r.enRoute.length} icon={<Truck className="w-4 h-4" />} />
                            <HeroStat label="Hoje" value={r.profile?.deliveredToday ?? 0} icon={<CheckCircle2 className="w-4 h-4" />} />
                        </div>

                        {r.earningsEnabled && r.earnings && (
                            <button
                                type="button"
                                onClick={() => a.setTab('earnings')}
                                className="mt-3 w-full flex items-center gap-3 rounded-2xl bg-black/15 hover:bg-black/25 border border-white/15 px-4 py-3 text-left transition"
                            >
                                <Wallet className="w-5 h-5 text-white/80" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] text-white/70 font-semibold uppercase tracking-wider">A receber</p>
                                    <p className="font-display font-bold text-lg leading-tight">{formatPrice(r.earnings.pendingTotal)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] text-white/70 font-semibold uppercase tracking-wider">Esta semana</p>
                                    <p className="font-display font-bold text-sm">{formatPrice(weekEarning)}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-white/70" />
                            </button>
                        )}
                    </div>
                </section>

                {/* ───────────── ABAS (tablet / computador) ───────────── */}
                <nav className={`hidden md:flex mt-6 p-1.5 rounded-2xl border gap-1 ${t.card}`}>
                    {visibleTabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => a.setTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-display font-semibold transition ${r.tab === tab.id ? 'bg-brand-500 text-white shadow-brand' : `${t.txt2} ${t.hover}`}`}
                        >
                            {tab.icon}
                            {tab.label}
                            {!!tab.count && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${r.tab === tab.id ? 'bg-white/25' : 'bg-brand-500/15 text-brand-500'}`}>{tab.count}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="mt-6">
                    {r.loading ? (
                        <LoadingList theme={t} />
                    ) : (
                        <>
                            {r.tab === 'orders' && <OrdersTab Controller={Controller} theme={t} />}
                            {r.tab === 'history' && <HistoryTab history={r.history} theme={t} showEarning={r.earningsEnabled} />}
                            {r.tab === 'earnings' && r.earningsEnabled && <EarningsTab Controller={Controller} theme={t} />}
                            {r.tab === 'profile' && <ProfileTab Controller={Controller} theme={t} />}
                        </>
                    )}
                </div>
            </main>

            {/* ───────────── ABAS (celular) ───────────── */}
            <nav
                className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-xl ${r.dark ? 'bg-[#0b0b11]/90 border-white/[0.06]' : 'bg-white/90 border-surface-200/70'}`}
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                <div className="flex px-2 pt-1.5 pb-1.5">
                    {visibleTabs.map((tab) => {
                        const active = r.tab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => a.setTab(tab.id)}
                                className={`relative flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition ${active ? 'text-brand-500' : t.sub}`}
                            >
                                {active && <span className="absolute -top-1.5 h-1 w-8 rounded-full bg-brand-500" />}
                                <span className="relative">
                                    {tab.icon}
                                    {!!tab.count && (
                                        <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                                            {tab.count}
                                        </span>
                                    )}
                                </span>
                                <span className="text-[11px] font-semibold">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* ───────────── POPUPS ───────────── */}
            <ConfirmAdminPopup
                open={!!r.dispatchTarget}
                title="Saiu para entrega?"
                description={r.dispatchTarget ? `O pedido #${r.dispatchTarget.number_Order} vai para "Em rota" e o cliente recebe o aviso de que a entrega está a caminho.` : ''}
                confirmText="Sim, saí para entregar"
                icon={<Truck className="w-8 h-8 text-brand-400" />}
                loading={r.busyId === r.dispatchTarget?.id}
                onCancel={() => a.setDispatchTarget(null)}
                onConfirm={() => a.confirmDispatch()}
            />

            <ConfirmAdminPopup
                open={!!r.deliverTarget}
                title="Confirmar entrega"
                description={r.deliverTarget ? `Pedido #${r.deliverTarget.number_Order} · ${addressLine(r.deliverTarget.address)}` : ''}
                confirmText="Confirmar entrega"
                confirmColor="green"
                icon={<CheckCircle2 className="w-8 h-8 text-emerald-400" />}
                requireReason
                reasonLabel="Quem recebeu"
                reasonPlaceholder="Nome de quem recebeu o pedido"
                reasonErrorText="Informe o nome de quem recebeu (mínimo de 2 letras)."
                minReasonLength={2}
                maxReasonLength={100}
                reasonRows={1}
                loading={r.busyId === r.deliverTarget?.id}
                onCancel={() => a.setDeliverTarget(null)}
                onConfirm={(who) => a.confirmDeliver(who)}
            />

            <ConfirmAdminPopup
                open={r.logoutOpen}
                title="Sair da conta?"
                description="Você vai precisar entrar de novo para ver suas entregas."
                confirmText="Sair"
                confirmColor="red"
                icon={<LogOut className="w-8 h-8 text-red-400" />}
                onCancel={() => a.setLogoutOpen(false)}
                onConfirm={() => a.logout()}
            />
        </div>
    );
}

/* ============================================================= */
/* ENTREGAS                                                      */
/* ============================================================= */

type ControllerType = ReturnType<typeof useDeliveryController>;

function OrdersTab({ Controller, theme: t }: { Controller: ControllerType; theme: DeliveryTheme }) {
    const r = Controller.result;

    if (r.orders.length === 0) {
        return (
            <EmptyState
                theme={t}
                icon={<Truck className="w-8 h-8" />}
                title="Tudo entregue por aqui"
                subtitle="Quando o admin atribuir um pedido para você, ele aparece nesta tela."
            />
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {r.enRoute.length > 0 && (
                <OrderSection
                    theme={t}
                    title="Em rota"
                    subtitle="Confirme a entrega com o nome de quem recebeu"
                    accent="bg-brand-500"
                    orders={r.enRoute}
                    Controller={Controller}
                />
            )}

            {r.toDispatch.length > 0 && (
                <OrderSection
                    theme={t}
                    title="Para sair"
                    subtitle="Confira os itens e toque em “Saiu para entrega”"
                    accent="bg-sky-500"
                    orders={r.toDispatch}
                    Controller={Controller}
                />
            )}

            <div className="md:hidden">
                <p className={`text-center text-[11px] ${t.sub}`}>A lista atualiza sozinha a cada minuto.</p>
            </div>
        </div>
    );
}

function OrderSection({
    theme: t,
    title,
    subtitle,
    accent,
    orders,
    Controller,
}: {
    theme: DeliveryTheme;
    title: string;
    subtitle: string;
    accent: string;
    orders: DeliveryOrder[];
    Controller: ControllerType;
}) {
    const r = Controller.result;
    const a = Controller.action;

    return (
        <section>
            <div className="flex items-end justify-between gap-3 mb-3 px-1">
                <div>
                    <h2 className={`font-display font-bold text-lg flex items-center gap-2 ${t.txt}`}>
                        <span className={`w-2 h-2 rounded-full ${accent}`} />
                        {title}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.soft} ${t.txt2}`}>{orders.length}</span>
                    </h2>
                    <p className={`text-xs mt-0.5 ${t.sub}`}>{subtitle}</p>
                </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
                {orders.map((order) => (
                    <DeliveryOrderCard
                        key={order.id}
                        order={order}
                        theme={t}
                        showEarning={r.earningsEnabled}
                        busy={r.busyId === order.id}
                        onDispatch={(o) => a.setDispatchTarget(o)}
                        onDeliver={(o) => a.setDeliverTarget(o)}
                    />
                ))}
            </div>
        </section>
    );
}

/* ============================================================= */
/* HISTÓRICO                                                     */
/* ============================================================= */

function HistoryTab({ history, theme: t, showEarning }: { history: DeliveryOrder[]; theme: DeliveryTheme; showEarning: boolean }) {
    const groups = useMemo(() => groupByDay(history, (o) => o.deliveredAt), [history]);

    const weekStart = startOfWeek(new Date()).getTime();
    const thisWeek = history.filter((o) => (toDate(o.deliveredAt)?.getTime() ?? 0) >= weekStart).length;
    const today = groups.find((g) => g.label === 'Hoje')?.items.length ?? 0;

    if (history.length === 0) {
        return (
            <EmptyState
                theme={t}
                icon={<History className="w-8 h-8" />}
                title="Nenhuma entrega concluída"
                subtitle="Suas entregas confirmadas aparecem aqui, separadas por dia."
            />
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <MiniStat theme={t} label="Hoje" value={today} tone="text-brand-500" />
                <MiniStat theme={t} label="Esta semana" value={thisWeek} tone="text-sky-500" />
                <MiniStat theme={t} label="Total" value={history.length} tone="text-emerald-500" />
            </div>

            {groups.map((group) => {
                const dayEarning = group.items.reduce((sum, o) => sum + (o.earning ?? 0), 0);

                return (
                    <section key={group.key}>
                        <div className="flex items-center gap-3 mb-2.5">
                            <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${group.label === 'Hoje'
                                    ? 'bg-brand-500/15 text-brand-500'
                                    : group.label === 'Ontem'
                                        ? 'bg-sky-500/15 text-sky-500'
                                        : `${t.soft} ${t.txt2}`
                                    }`}
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                {group.label}
                            </span>
                            <span className={`flex-1 h-px ${t.dark ? 'bg-white/[0.06]' : 'bg-surface-200'}`} />
                            <span className={`text-xs font-semibold ${t.sub}`}>
                                {group.items.length} {group.items.length === 1 ? 'entrega' : 'entregas'}
                            </span>
                            {showEarning && dayEarning > 0 && (
                                <span className="text-xs font-bold text-emerald-500">+{formatPrice(dayEarning)}</span>
                            )}
                        </div>

                        <div className={`rounded-3xl border overflow-hidden divide-y ${t.card} ${t.divide}`}>
                            {group.items.map((order) => (
                                <div key={order.id} className="flex items-center gap-3 px-4 py-3.5">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-display font-bold text-sm ${t.txt}`}>
                                            #{order.number_Order}
                                            <span className={`ml-2 font-body font-normal text-[11px] ${t.sub}`}>
                                                {toDate(order.deliveredAt)?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </p>
                                        <p className={`text-xs truncate ${t.txt2}`}>{addressLine(order.address)}</p>
                                        {order.whoReceivedIt && (
                                            <p className={`text-[11px] truncate ${t.sub}`}>Recebido por {order.whoReceivedIt}</p>
                                        )}
                                    </div>
                                    {showEarning && order.earning != null && (
                                        <span className="font-display font-bold text-sm text-emerald-500 flex-shrink-0">+{formatPrice(order.earning)}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

/* ============================================================= */
/* GANHOS                                                        */
/* ============================================================= */

function EarningsTab({ Controller, theme: t }: { Controller: ControllerType; theme: DeliveryTheme }) {
    const earnings = Controller.result.earnings;
    const weeks = useMemo(() => groupEarningsByWeek(earnings?.entries ?? []), [earnings]);
    const [openWeek, setOpenWeek] = useState<string | null>(null);

    useEffect(() => {
        if (weeks.length > 0 && openWeek === null) setOpenWeek(weeks[0].key);
    }, [weeks, openWeek]);

    if (!earnings?.enabled) return null;

    const valueLabel =
        earnings.mode === 'POR_DIA'
            ? `${formatPrice(earnings.currentValue ?? 0)} por dia trabalhado`
            : earnings.orderValueType === 'PERCENTUAL'
                ? `${(earnings.currentValue ?? 0).toLocaleString('pt-BR')}% de cada pedido`
                : `${formatPrice(earnings.currentValue ?? 0)} por entrega`;

    const chartWeeks = weeks.slice(0, 8).reverse();
    const maxWeek = Math.max(1, ...chartWeeks.map((w) => w.total));

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/20">
                    <Wallet className="absolute -right-3 -bottom-3 w-24 h-24 text-white/10" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/75">A receber</p>
                    <p className="mt-1 font-display font-black text-3xl">{formatPrice(earnings.pendingTotal)}</p>
                    <p className="mt-1 text-xs text-white/75">Aguardando a baixa do admin</p>
                </div>
                <div className={`rounded-3xl border p-5 ${t.card}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${t.sub}`}>Já recebido</p>
                    <p className={`mt-1 font-display font-bold text-2xl ${t.txt}`}>{formatPrice(earnings.paidTotal)}</p>
                    <p className={`mt-1 text-xs ${t.sub}`}>Total das baixas</p>
                </div>
                <div className={`rounded-3xl border p-5 ${t.card}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${t.sub}`}>Seu valor</p>
                    <p className={`mt-1 font-display font-bold text-lg leading-snug ${t.txt}`}>{valueLabel}</p>
                    <p className={`mt-1 text-xs ${t.sub}`}>Definido pelo admin</p>
                </div>
            </div>

            {chartWeeks.length > 1 && (
                <div className={`rounded-3xl border p-5 ${t.card}`}>
                    <p className={`text-sm font-display font-bold ${t.txt}`}>Últimas semanas</p>
                    <div className="mt-4 flex items-end gap-2 h-32">
                        {chartWeeks.map((week) => (
                            <div key={week.key} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                                <span className={`text-[10px] font-bold ${t.txt2}`}>{week.total > 0 ? formatPrice(week.total).replace('R$', '').trim() : ''}</span>
                                <div
                                    className="w-full max-w-[38px] rounded-t-xl bg-gradient-to-t from-brand-600 to-brand-400"
                                    style={{ height: `${Math.max(6, (week.total / maxWeek) * 100)}%` }}
                                    title={`${week.label}: ${formatPrice(week.total)}`}
                                />
                                <span className={`text-[10px] ${t.sub}`}>
                                    {week.start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {weeks.length === 0 ? (
                <EmptyState
                    theme={t}
                    icon={<Wallet className="w-8 h-8" />}
                    title="Nenhum ganho ainda"
                    subtitle="Seus ganhos aparecem aqui assim que você concluir uma entrega."
                />
            ) : (
                <div className="space-y-3">
                    {weeks.map((week) => {
                        const open = openWeek === week.key;
                        return (
                            <section key={week.key} className={`rounded-3xl border overflow-hidden ${t.card}`}>
                                <button
                                    type="button"
                                    onClick={() => setOpenWeek(open ? '' : week.key)}
                                    className={`w-full flex items-center gap-3 px-5 py-4 text-left transition ${t.hover}`}
                                >
                                    <div className="w-11 h-11 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-display font-bold text-sm ${t.txt}`}>{week.label}</p>
                                        <p className={`text-xs ${t.sub}`}>
                                            {week.deliveries} {week.deliveries === 1 ? 'entrega' : 'entregas'}
                                            {week.pending > 0 && <span className="text-amber-500"> · {formatPrice(week.pending)} a receber</span>}
                                        </p>
                                    </div>
                                    <p className={`font-display font-bold ${t.txt}`}>{formatPrice(week.total)}</p>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${t.sub} ${open ? 'rotate-90' : ''}`} />
                                </button>

                                {open && (
                                    <div className={`border-t divide-y ${t.bord} ${t.divide} animate-fade-in`}>
                                        {week.entries.map((entry, index) => (
                                            <EarningRow key={`${entry.kind}-${entry.orderId ?? entry.date}-${index}`} entry={entry} theme={t} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function EarningRow({ entry, theme: t }: { entry: DeliveryEarningEntry; theme: DeliveryTheme }) {
    const date = toDate(entry.date);

    return (
        <div className="flex items-center gap-3 px-5 py-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${entry.paid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {entry.kind === 'DIA' ? <Calendar className="w-4 h-4" /> : <Package className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${t.txt}`}>
                    {entry.kind === 'DIA'
                        ? date?.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })
                        : `Pedido #${entry.orderNumber ?? entry.orderId}`}
                </p>
                <p className={`text-[11px] ${t.sub}`}>
                    {entry.kind === 'DIA'
                        ? `${entry.deliveries} ${entry.deliveries === 1 ? 'entrega' : 'entregas'}`
                        : formatRelative(entry.date)}
                    {entry.customTip && <span className="text-violet-500"> · gorjeta especial</span>}
                </p>
            </div>
            <div className="text-right">
                <p className={`font-display font-bold text-sm ${t.txt}`}>{formatPrice(entry.amount)}</p>
                <span className={`text-[10px] font-bold uppercase tracking-wide ${entry.paid ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {entry.paid ? 'Pago' : 'A receber'}
                </span>
            </div>
        </div>
    );
}

/* ============================================================= */
/* PERFIL                                                        */
/* ============================================================= */

function ProfileTab({ Controller, theme: t }: { Controller: ControllerType; theme: DeliveryTheme }) {
    const r = Controller.result;
    const a = Controller.action;
    const profile = r.profile;

    const [showPassword, setShowPassword] = useState(false);

    const preview = useMemo(() => (r.avatarFile ? URL.createObjectURL(r.avatarFile) : null), [r.avatarFile]);
    useEffect(() => () => {
        if (preview) URL.revokeObjectURL(preview);
    }, [preview]);

    const since = toDate(profile?.insertDate);

    return (
        <div className="space-y-5 animate-fade-in">
            {/* ── cartão do perfil ── */}
            <section className={`rounded-3xl border overflow-hidden ${t.card}`}>
                <div className="relative h-24 sm:h-28 bg-gradient-to-r from-brand-500 via-brand-600 to-amber-500">
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '22px 22px' }}
                    />
                </div>

                <div className="px-5 pb-5">
                    <div className="flex items-end gap-4 -mt-10 flex-wrap">
                        <div className="relative">
                            <Avatar name={profile?.name} avatar={profile?.avatar} preview={preview} size="lg" dark={r.dark} />
                            {r.editingProfile && (
                                <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-brand cursor-pointer hover:bg-brand-600 transition">
                                    <Camera className="w-4 h-4" />
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        onChange={(e) => a.setAvatarFile(e.target.files?.[0] ?? null)}
                                    />
                                </label>
                            )}
                        </div>

                        <div className="flex-1" />

                        {!r.editingProfile ? (
                            <button
                                type="button"
                                onClick={() => a.setEditingProfile(true)}
                                className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-brand transition"
                            >
                                <Edit3 className="w-3.5 h-3.5" /> Editar
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={a.cancelEditProfile}
                                    disabled={r.savingProfile}
                                    className={`h-10 w-10 rounded-xl border flex items-center justify-center transition ${t.ghostBtn}`}
                                    aria-label="Cancelar"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={a.saveProfile}
                                    disabled={r.savingProfile}
                                    className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-brand transition disabled:opacity-60"
                                >
                                    {r.savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                    Salvar
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-3 min-w-0">
                            <p className={`font-display font-bold text-lg leading-tight truncate ${t.txt}`}>{profile?.name}</p>
                            <p className="text-xs font-semibold text-brand-500">
                                Entregador parceiro{since ? ` · desde ${since.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}` : ''}
                            </p>
                        </div>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                        <MiniStat theme={t} label="Entregas" value={profile?.deliveredTotal ?? 0} tone={t.txt} />
                        <MiniStat theme={t} label="Esta semana" value={profile?.deliveredThisWeek ?? 0} tone={t.txt} />
                        <MiniStat theme={t} label="Hoje" value={profile?.deliveredToday ?? 0} tone={t.txt} />
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <ProfileField theme={t} icon={<UserIcon className="w-3.5 h-3.5" />} label="Nome" editing={r.editingProfile}
                            value={r.profileForm.name} onChange={(v) => a.setProfileForm({ ...r.profileForm, name: v })} />
                        <ProfileField theme={t} icon={<Phone className="w-3.5 h-3.5" />} label="Telefone" editing={r.editingProfile}
                            value={r.profileForm.phone} placeholder="(82) 99999-9999" inputMode="tel"
                            onChange={(v) => a.setProfileForm({ ...r.profileForm, phone: v })} />
                        <ProfileField theme={t} icon={<Bike className="w-3.5 h-3.5" />} label="Transporte" editing={r.editingProfile}
                            value={r.profileForm.transport} placeholder="Moto, bicicleta, carro..."
                            onChange={(v) => a.setProfileForm({ ...r.profileForm, transport: v })} />
                        <ProfileField theme={t} icon={<Mail className="w-3.5 h-3.5" />} label="E-mail" editing={false}
                            value={profile?.email ?? ''} hint="Para trocar o e-mail, fale com o administrador." />
                    </div>
                </div>
            </section>

            {/* ── senha ── */}
            <section className={`rounded-3xl border p-5 ${t.card}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                        <KeyRound className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <p className={`font-display font-bold text-sm ${t.txt}`}>Alterar senha</p>
                        <p className={`text-xs ${t.sub}`}>Por segurança, todos os aparelhos serão desconectados.</p>
                    </div>
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.txt2} ${t.hover}`} aria-label="Mostrar senhas">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {([
                        ['currentPassword', 'Senha atual'],
                        ['newPassword', 'Nova senha'],
                        ['confirmPassword', 'Confirmar nova senha'],
                    ] as const).map(([key, label]) => (
                        <div key={key}>
                            <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${t.sub}`}>{label}</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={r.passwordForm[key]}
                                autoComplete={key === 'currentPassword' ? 'current-password' : 'new-password'}
                                onChange={(e) => a.setPasswordForm({ ...r.passwordForm, [key]: e.target.value })}
                                className={`w-full h-11 px-3.5 rounded-xl border text-sm outline-none transition ${t.input} ${r.passwordErrors[key] ? 'border-red-500/60' : ''}`}
                            />
                            {r.passwordErrors[key] && <p className="mt-1 text-[11px] text-red-400">{r.passwordErrors[key]}</p>}
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={a.changePassword}
                    disabled={r.savingPassword}
                    className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-bold transition disabled:opacity-60"
                >
                    {r.savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    Alterar senha
                </button>
            </section>

            {/* ── preferências ── */}
            <section className={`rounded-3xl border divide-y ${t.card} ${t.divide}`}>
                <button type="button" onClick={a.toggleTheme} className={`w-full flex items-center gap-3 px-5 py-4 text-left transition ${t.hover} rounded-t-3xl`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${t.soft}`}>
                        {r.dark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-sky-500" />}
                    </div>
                    <div className="flex-1">
                        <p className={`text-sm font-semibold ${t.txt}`}>{r.dark ? 'Modo claro' : 'Modo escuro'}</p>
                        <p className={`text-xs ${t.sub}`}>Fica salvo neste aparelho</p>
                    </div>
                    <span className={`relative w-11 h-6 rounded-full transition ${r.dark ? 'bg-brand-500' : 'bg-surface-300'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${r.dark ? 'left-[22px]' : 'left-0.5'}`} />
                    </span>
                </button>
                <button type="button" onClick={() => a.setLogoutOpen(true)} className="w-full flex items-center gap-3 px-5 py-4 text-left transition hover:bg-red-500/10 rounded-b-3xl">
                    <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <LogOut className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-red-400">Sair da conta</p>
                        <p className={`text-xs ${t.sub}`}>Encerrar a sessão neste aparelho</p>
                    </div>
                </button>
            </section>

            {/* ── dispositivos ── */}
            <section>
                <p className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-3 px-1 ${t.sub}`}>
                    <Sparkles className="w-3.5 h-3.5" /> Segurança da conta
                </p>
                <ConnectedDevices />
            </section>
        </div>
    );
}

/* ============================================================= */
/* PEÇAS                                                         */
/* ============================================================= */

function Avatar({
    name,
    avatar,
    preview,
    size,
    dark,
}: {
    name?: string | null;
    avatar?: string | null;
    preview?: string | null;
    size: 'sm' | 'lg';
    dark: boolean;
}) {
    const [failed, setFailed] = useState(false);
    const src = preview ?? (avatar && !failed ? avatarUrl(avatar) : '');
    const box = size === 'lg' ? 'w-20 h-20 rounded-3xl text-2xl border-4' : 'w-10 h-10 rounded-xl text-sm border-0';

    return (
        <div
            className={`${box} ${dark ? 'border-[#0f0f16]' : 'border-white'} overflow-hidden bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center flex-shrink-0 shadow-brand`}
        >
            {src ? (
                <img src={src} alt={name ?? 'Foto'} className="w-full h-full object-cover" onError={() => setFailed(true)} />
            ) : (
                <span className="text-white font-display font-bold">{initials(name)}</span>
            )}
        </div>
    );
}

function HeroStat({ label, value, icon }: { label: string; value: number; icon: JSX.Element }) {
    return (
        <div className="rounded-2xl bg-white/15 border border-white/15 backdrop-blur-sm px-3 py-3">
            <div className="flex items-center gap-1.5 text-white/75">
                {icon}
                <span className="text-[11px] font-semibold">{label}</span>
            </div>
            <p className="mt-1 font-display font-black text-2xl leading-none">{value}</p>
        </div>
    );
}

function MiniStat({ theme: t, label, value, tone }: { theme: DeliveryTheme; label: string; value: number | string; tone: string }) {
    return (
        <div className={`rounded-2xl px-3 py-3 text-center ${t.soft}`}>
            <p className={`font-display font-bold text-xl leading-none ${tone}`}>{value}</p>
            <p className={`mt-1 text-[10px] font-semibold uppercase tracking-wider ${t.sub}`}>{label}</p>
        </div>
    );
}

function ProfileField({
    theme: t,
    icon,
    label,
    value,
    editing,
    onChange,
    placeholder,
    hint,
    inputMode,
}: {
    theme: DeliveryTheme;
    icon: JSX.Element;
    label: string;
    value: string;
    editing: boolean;
    onChange?: (value: string) => void;
    placeholder?: string;
    hint?: string;
    inputMode?: 'tel' | 'text';
}) {
    return (
        <div className={`rounded-2xl p-3.5 ${t.soft}`}>
            <div className="flex items-center gap-1.5 text-brand-500">
                {icon}
                <span className={`text-[10px] uppercase tracking-wider font-bold ${t.sub}`}>{label}</span>
            </div>
            {editing && onChange ? (
                <input
                    value={value}
                    inputMode={inputMode}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    className={`mt-1.5 w-full h-10 px-3 rounded-xl border text-sm outline-none transition ${t.input}`}
                />
            ) : (
                <p className={`mt-1 text-sm font-medium truncate ${t.txt}`}>{value || '—'}</p>
            )}
            {hint && <p className={`mt-1 text-[10px] ${t.sub}`}>{hint}</p>}
        </div>
    );
}

function EmptyState({ theme: t, icon, title, subtitle }: { theme: DeliveryTheme; icon: JSX.Element; title: string; subtitle: string }) {
    return (
        <div className={`rounded-3xl border px-6 py-14 text-center animate-fade-in ${t.card}`}>
            <div className="relative mx-auto w-16 h-16">
                <div className="absolute inset-0 rounded-2xl bg-brand-500/20 blur-xl" />
                <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center ${t.soft} text-brand-500`}>{icon}</div>
            </div>
            <p className={`mt-4 font-display font-bold text-base ${t.txt}`}>{title}</p>
            <p className={`mt-1 text-sm max-w-xs mx-auto ${t.sub}`}>{subtitle}</p>
        </div>
    );
}

function LoadingList({ theme: t }: { theme: DeliveryTheme }) {
    return (
        <div className="grid gap-3 lg:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`rounded-3xl border p-5 animate-pulse ${t.card}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl ${t.soft}`} />
                        <div className="flex-1 space-y-2">
                            <div className={`h-3 w-1/3 rounded ${t.soft}`} />
                            <div className={`h-2.5 w-1/2 rounded ${t.soft}`} />
                        </div>
                    </div>
                    <div className={`mt-4 h-16 rounded-2xl ${t.soft}`} />
                    <div className={`mt-3 h-11 rounded-2xl ${t.soft}`} />
                    <div className="mt-3 flex items-center gap-2">
                        <Clock className={`w-3 h-3 ${t.sub}`} />
                        <MapPin className={`w-3 h-3 ${t.sub}`} />
                    </div>
                </div>
            ))}
        </div>
    );
}
