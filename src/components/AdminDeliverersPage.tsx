import { useState } from 'react';
import {
    AlertTriangle,
    BadgeDollarSign,
    Bike,
    Calendar,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronDown,
    CircleDollarSign,
    Clock,
    Info,
    Loader2,
    Package,
    Pencil,
    Percent,
    Phone,
    Receipt,
    RefreshCw,
    RotateCcw,
    Save,
    Settings2,
    SlidersHorizontal,
    Truck,
    UserRound,
    Users,
    Wallet,
    X,
} from 'lucide-react';
import ConfirmAdminPopup from './ConfirmAdminPopup';
import { DeliverersSection, entryKey, useDeliverersAdminController } from '../controller/useDeliverersAdminController';
import { DeliveryDriver, DeliveryEarningEntry, DeliveryOrder, DeliveryPayout } from '../models/Delivery';
import { formatPrice } from '../utils';
import {
    addressLine,
    avatarUrl,
    deliveryTheme,
    formatRelative,
    initials,
    statusMeta,
    toDate,
} from '../utils/delivery';

interface AdminDeliverersPageProps {
    darkMode: boolean;
}

type Theme = ReturnType<typeof deliveryTheme>;
type ControllerType = ReturnType<typeof useDeliverersAdminController>;

/**
 * Aba "Deliverys" do admin:
 * atribuir pedidos, entregadores, configuração da gorjeta, baixas e estornos.
 */
export default function AdminDeliverersPage({ darkMode }: AdminDeliverersPageProps) {
    const Controller = useDeliverersAdminController();
    const r = Controller.result;
    const a = Controller.action;
    const t = deliveryTheme(darkMode);

    const sections: { id: DeliverersSection; label: string; icon: JSX.Element; count?: number }[] = [
        { id: 'orders', label: 'Atribuir pedidos', icon: <Package className="w-4 h-4" />, count: r.totals.unassigned },
        { id: 'drivers', label: 'Entregadores', icon: <Users className="w-4 h-4" />, count: r.deliverers.length },
        { id: 'settings', label: 'Gorjeta e caixa', icon: <SlidersHorizontal className="w-4 h-4" /> },
        { id: 'payouts', label: 'Baixas', icon: <Receipt className="w-4 h-4" /> },
    ];

    return (
        <div className="w-full space-y-6 pb-10 animate-fade-in">
            {/* ── cabeçalho ── */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center">
                        <Truck className="w-6 h-6 text-brand-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className={`font-display text-2xl font-bold ${t.txt}`}>Deliverys</h1>
                            <span className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold ${r.settings.tipEnabled ? 'bg-emerald-500/10 text-emerald-500' : `${t.soft} ${t.sub}`}`}>
                                <BadgeDollarSign className="w-3 h-3" />
                                Gorjeta {r.settings.tipEnabled ? 'ativa' : 'desligada'}
                            </span>
                        </div>
                        <p className={`text-sm mt-1 ${t.sub}`}>Atribua pedidos, acompanhe os entregadores e controle os pagamentos.</p>
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

            {/* ── resumo ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <SummaryCard t={t} title="Entregadores ativos" value={`${r.activeDrivers.length}`} description={`de ${r.deliverers.length} cadastrados`} icon={<Users className="w-4 h-4 text-violet-500" />} />
                <SummaryCard t={t} title="Sem entregador" value={`${r.totals.unassigned}`} description="pedidos em preparo" icon={<AlertTriangle className="w-4 h-4 text-amber-500" />} highlight={r.totals.unassigned > 0} />
                <SummaryCard t={t} title="Em rota" value={`${r.totals.enRoute}`} description="saíram para entrega" icon={<Truck className="w-4 h-4 text-brand-500" />} />
                <SummaryCard
                    t={t}
                    title="A pagar"
                    value={r.settings.tipEnabled ? formatPrice(r.totals.pending) : '—'}
                    description={r.settings.tipEnabled ? 'para todos os entregadores' : 'gorjeta desligada'}
                    icon={<Wallet className="w-4 h-4 text-emerald-500" />}
                />
            </div>

            {/* ── seções ── */}
            <div className={`flex gap-1 overflow-x-auto rounded-2xl border p-1.5 ${t.card}`}>
                {sections.map((section) => (
                    <button
                        key={section.id}
                        type="button"
                        onClick={() => a.setSection(section.id)}
                        className={`flex-1 min-w-max flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition ${r.section === section.id ? 'bg-brand-500 text-white shadow-brand' : `${t.txt2} ${t.hover}`}`}
                    >
                        {section.icon}
                        {section.label}
                        {!!section.count && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${r.section === section.id ? 'bg-white/25' : 'bg-brand-500/15 text-brand-500'}`}>{section.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {r.loading ? (
                <div className={`rounded-3xl border p-12 flex items-center justify-center ${t.card}`}>
                    <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                </div>
            ) : (
                <>
                    {r.section === 'orders' && <OrdersSection Controller={Controller} t={t} />}
                    {r.section === 'drivers' && <DriversSection Controller={Controller} t={t} />}
                    {r.section === 'settings' && <SettingsSection Controller={Controller} t={t} />}
                    {r.section === 'payouts' && <PayoutsSection Controller={Controller} t={t} />}
                </>
            )}

            <RatesModal Controller={Controller} t={t} />
            <PayablesModal Controller={Controller} t={t} />

            <ConfirmAdminPopup
                open={r.payoutConfirmOpen}
                title="Confirmar pagamento"
                description={r.payablesTarget ? `Dar baixa de ${formatPrice(r.selectedTotal)} para ${r.payablesTarget.name} (${r.selectedEntries.length} ${r.selectedEntries.length === 1 ? 'item' : 'itens'}). Os valores ficam registrados e só mudam com estorno.` : ''}
                confirmText={`Pagar ${formatPrice(r.selectedTotal)}`}
                confirmColor="green"
                icon={<CircleDollarSign className="w-8 h-8 text-emerald-400" />}
                loading={r.creatingPayout}
                onCancel={() => a.setPayoutConfirmOpen(false)}
                onConfirm={() => a.createPayout()}
            />

            <ConfirmAdminPopup
                open={!!r.reverseTarget}
                title="Estornar baixa?"
                description={r.reverseTarget ? `A baixa de ${formatPrice(r.reverseTarget.total)} de ${r.reverseTarget.deliveryName} será cancelada e os itens voltam para "a receber".` : ''}
                confirmText="Estornar"
                confirmColor="red"
                icon={<RotateCcw className="w-8 h-8 text-red-400" />}
                requireReason
                reasonLabel="Motivo do estorno"
                reasonPlaceholder="Ex: valor pago errado, pagamento não foi feito..."
                reasonErrorText="Informe o motivo do estorno (mínimo de 3 caracteres)."
                minReasonLength={3}
                loading={r.reversing}
                onCancel={() => a.setReverseTarget(null)}
                onConfirm={(reason) => a.confirmReverse(reason)}
            />
        </div>
    );
}

/* ============================================================= */
/* ATRIBUIR PEDIDOS                                              */
/* ============================================================= */

function OrdersSection({ Controller, t }: { Controller: ControllerType; t: Theme }) {
    const r = Controller.result;
    const a = Controller.action;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className={`inline-flex rounded-xl p-1 ${t.soft}`}>
                    {([
                        ['all', 'Todos'],
                        ['unassigned', 'Sem entregador'],
                        ['assigned', 'Atribuídos'],
                    ] as const).map(([id, label]) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => a.setOrderFilter(id)}
                            className={`px-3.5 h-9 rounded-lg text-xs font-bold transition ${r.orderFilter === id ? `${t.cardSolid} ${t.txt} shadow-soft` : t.txt2}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <p className={`text-xs ${t.sub}`}>Pedidos em “Preparando” e “Saiu para entrega”.</p>
            </div>

            {r.activeDrivers.length === 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className={`text-xs ${t.dark ? 'text-amber-300' : 'text-amber-700'}`}>
                        Nenhum entregador ativo. Cadastre ou ative um entregador em <strong>Usuários</strong> para poder atribuir pedidos.
                    </p>
                </div>
            )}

            {r.board.length === 0 ? (
                <Empty t={t} icon={<Package className="w-7 h-7" />} text="Nenhum pedido para atribuir agora." />
            ) : (
                <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                    {r.board.map((order) => (
                        <AssignCard key={order.id} order={order} Controller={Controller} t={t} />
                    ))}
                </div>
            )}
        </div>
    );
}

function AssignCard({ order, Controller, t }: { order: DeliveryOrder; Controller: ControllerType; t: Theme }) {
    const r = Controller.result;
    const a = Controller.action;
    const status = statusMeta(order.order_Status);
    const busy = r.assigningId === order.id;
    const isEnRoute = order.order_Status === 'SAIU_PARA_ENTREGA';
    const dark = t.dark;
    const value = order.assigneeType === 'DELIVERY' ? String(order.assigneeId) : order.assigneeType === 'ADMIN' ? 'admin' : '0';

    // Entregador atual pode estar desativado: mantém na lista para não sumir
    const options = [...r.activeDrivers];
    if (order.assigneeType === 'DELIVERY' && !options.some((d) => d.id === order.assigneeId)) {
        const current = r.deliverers.find((d) => d.id === order.assigneeId);
        if (current) options.push(current);
    }

    return (
        <article className={`relative overflow-hidden rounded-3xl border p-4 ${t.card} ${order.assigneeType === 'NONE' ? 'ring-1 ring-amber-500/25' : ''}`}>
            <span className={`absolute left-0 top-0 h-full w-1 ${status.dot}`} />

            <div className="flex items-start gap-3 pl-1">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-display font-bold ${t.txt}`}>#{order.number_Order}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${status.chip}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} /> {status.label}
                        </span>
                    </div>
                    <p className={`mt-1 text-xs truncate ${t.txt2}`}>{addressLine(order.address)}</p>
                    <p className={`text-[11px] ${t.sub}`}>
                        {order.customerName ?? 'Cliente'} · {order.quantity} {order.quantity === 1 ? 'item' : 'itens'} · {formatRelative(order.insertDate)}
                    </p>
                </div>
                <p className={`font-display font-bold text-sm ${t.txt}`}>{formatPrice(order.total_Value_Order)}</p>
            </div>

            <div className="mt-4 pl-1">
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${t.sub}`}>Entregador</label>
                <div className="relative">
                    <UserRound className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.sub}`} />
                    <select
                        value={value}
                        disabled={busy}
                        onChange={(e) => {
                            const next = e.target.value;
                            if (next === 'admin') return;
                            a.assign(order, Number(next));
                        }}
                        className={` w-full h-12 pl-10 pr-10 rounded-xl border text-sm font-semibold outline-none appearance-none transition-all duration-200 ${t.input} ${dark
                                ? '[&>option]:bg-[#15151c] [&>option]:text-white'
                                : '[&>option]:bg-white [&>option]:text-surface-800'
                            }
    `}
                    >
                        {!isEnRoute && (
                            <option value="0">— Sem entregador —</option>
                        )}

                        {order.assigneeType === 'ADMIN' && (
                            <option value="admin">
                                Admin: {order.assigneeName}
                            </option>
                        )}

                        {options.map((driver) => (
                            <option key={driver.id} value={driver.id}>
                                {driver.name}
                                {driver.transport ? ` · ${driver.transport}` : ''}
                                {driver.enRouteOrders + driver.preparingOrders > 0
                                    ? ` (${driver.enRouteOrders + driver.preparingOrders} pedidos)`
                                    : ''}
                                {!driver.ativo ? ' — desativado' : ''}
                            </option>
                        ))}
                    </select>
                    {busy ? (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-brand-500" />
                    ) : (
                        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${t.sub}`} />
                    )}
                </div>

                {order.assigneeType === 'ADMIN' && (
                    <p className="mt-2 text-[11px] text-violet-500">Este pedido está com o admin {order.assigneeName}. Escolha um entregador para trocar.</p>
                )}
                {isEnRoute && order.assigneeType === 'DELIVERY' && (
                    <p className={`mt-2 text-[11px] ${t.sub}`}>Já saiu para entrega com {order.assigneeName}. Você pode trocar o entregador, mas não remover.</p>
                )}
            </div>
        </article>
    );
}

/* ============================================================= */
/* ENTREGADORES                                                  */
/* ============================================================= */

function DriversSection({ Controller, t }: { Controller: ControllerType; t: Theme }) {
    const r = Controller.result;

    if (r.deliverers.length === 0) {
        return <Empty t={t} icon={<Users className="w-7 h-7" />} text="Nenhum entregador cadastrado. Crie um usuário com perfil Delivery em Usuários." />;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {r.deliverers.map((driver) => (
                <DriverCard key={driver.id} driver={driver} Controller={Controller} t={t} />
            ))}
        </div>
    );
}

function DriverCard({ driver, Controller, t }: { driver: DeliveryDriver; Controller: ControllerType; t: Theme }) {
    const r = Controller.result;
    const a = Controller.action;
    const tip = r.settings.tipEnabled;
    const [imgFailed, setImgFailed] = useState(false);

    const personal = r.settings.mode === 'POR_DIA' ? driver.dailyRate : driver.commissionDelivers;

    return (
        <article className={`rounded-3xl border overflow-hidden ${t.card} ${!driver.ativo ? 'opacity-70' : ''}`}>
            <div className="p-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center flex-shrink-0">
                        {driver.avatar && !imgFailed ? (
                            <img src={avatarUrl(driver.avatar)} alt={driver.name} className="w-full h-full object-cover" onError={() => setImgFailed(true)} />
                        ) : (
                            <span className="text-white font-display font-bold">{initials(driver.name)}</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className={`font-display font-bold truncate ${t.txt}`}>{driver.name}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${driver.ativo ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-400'}`}>
                                {driver.ativo ? 'Ativo' : 'Desativado'}
                            </span>
                        </div>
                        <p className={`text-xs flex items-center gap-1.5 ${t.sub}`}>
                            <Bike className="w-3.5 h-3.5" /> {driver.transport || 'Transporte não informado'}
                        </p>
                        {driver.phone && (
                            <p className={`text-xs flex items-center gap-1.5 ${t.sub}`}>
                                <Phone className="w-3.5 h-3.5" /> {driver.phone}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2">
                    <MiniStat t={t} label="Preparo" value={driver.preparingOrders} tone="text-sky-500" />
                    <MiniStat t={t} label="Em rota" value={driver.enRouteOrders} tone="text-brand-500" />
                    <MiniStat t={t} label="Hoje" value={driver.deliveredToday} tone="text-emerald-500" />
                    <MiniStat t={t} label="Total" value={driver.deliveredTotal} tone={t.txt} />
                </div>

                <p className={`mt-3 text-[11px] flex items-center gap-1.5 ${t.sub}`}>
                    <Clock className="w-3.5 h-3.5" />
                    {driver.lastDeliveryAt ? `Última entrega ${formatRelative(driver.lastDeliveryAt)}` : 'Ainda não fez entregas'}
                </p>

                {tip && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-2xl px-3 py-2.5 bg-amber-500/10 border border-amber-500/20">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">A receber</p>
                            <p className={`font-display font-bold ${t.txt}`}>{formatPrice(driver.pendingAmount)}</p>
                            <p className={`text-[10px] ${t.sub}`}>{driver.pendingItems} {r.settings.mode === 'POR_DIA' ? 'dia(s)' : 'pedido(s)'}</p>
                        </div>
                        <div className="rounded-2xl px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Já recebeu</p>
                            <p className={`font-display font-bold ${t.txt}`}>{formatPrice(driver.paidAmount)}</p>
                            <p className={`text-[10px] ${t.sub}`}>em baixas</p>
                        </div>
                    </div>
                )}

                {personal != null && (
                    <p className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-violet-500/10 text-violet-500">
                        <SlidersHorizontal className="w-3.5 h-3.5" /> Valor próprio: {valueLabel(r.settings.mode, r.settings.orderValueType, personal)}
                    </p>
                )}
            </div>

            <div className={`grid grid-cols-2 border-t ${t.bord}`}>
                <button type="button" onClick={() => a.openRates(driver)} className={`h-12 flex items-center justify-center gap-2 text-xs font-bold transition ${t.txt2} ${t.hover}`}>
                    <Settings2 className="w-4 h-4" /> Valores
                </button>
                <button
                    type="button"
                    disabled={!tip || driver.pendingItems === 0}
                    onClick={() => a.openPayables(driver)}
                    className={`h-12 flex items-center justify-center gap-2 text-xs font-bold border-l transition disabled:opacity-40 ${t.bord} text-emerald-500 hover:bg-emerald-500/10`}
                >
                    <CircleDollarSign className="w-4 h-4" /> Dar baixa
                </button>
            </div>
        </article>
    );
}

function SettingsSection({ Controller, t }: { Controller: ControllerType; t: Theme }) {
    const r = Controller.result;
    const a = Controller.action;
    const f = r.settingsForm;

    const sampleTotal = 100;
    const sampleValue = Number((r.orderValueInput || '0').replace(',', '.')) || 0;
    const sample = f.orderValueType === 'PERCENTUAL' ? (sampleTotal * sampleValue) / 100 : sampleValue;

    return (
        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="space-y-4">
                {/* ligar/desligar */}
                <section className={`rounded-3xl border p-5 ${t.card}`}>
                    <button type="button" onClick={() => a.setSettingsForm({ ...f, tipEnabled: !f.tipEnabled })} className="w-full flex items-center gap-4 text-left">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${f.tipEnabled ? 'bg-emerald-500/15 text-emerald-500' : `${t.soft} ${t.sub}`}`}>
                            <BadgeDollarSign className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className={`font-display font-bold ${t.txt}`}>Gorjeta / pagamento dos entregadores</p>
                            <p className={`text-xs mt-0.5 ${t.sub}`}>
                                {f.tipEnabled
                                    ? 'Ativa: o sistema calcula o que cada entregador tem a receber.'
                                    : 'Desligada: o sistema não calcula nada e o portal não mostra ganhos.'}
                            </p>
                        </div>
                        <span className={`relative w-12 h-7 rounded-full transition flex-shrink-0 ${f.tipEnabled ? 'bg-emerald-500' : t.dark ? 'bg-white/10' : 'bg-surface-300'}`}>
                            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${f.tipEnabled ? 'left-6' : 'left-1'}`} />
                        </span>
                    </button>
                </section>

                <section className={`rounded-3xl border p-5 space-y-5 ${t.card} ${!f.tipEnabled ? 'opacity-60' : ''}`}>
                    {/* modo */}
                    <div>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${t.sub}`}>Como o entregador recebe</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <OptionCard
                                t={t}
                                active={f.mode === 'POR_PEDIDO'}
                                icon={<Package className="w-5 h-5" />}
                                title="Por pedido"
                                text="Um valor para cada entrega concluída. Você pode ajustar a gorjeta de um pedido específico."
                                onClick={() => a.setSettingsForm({ ...f, mode: 'POR_PEDIDO' })}
                            />
                            <OptionCard
                                t={t}
                                active={f.mode === 'POR_DIA'}
                                icon={<CalendarDays className="w-5 h-5" />}
                                title="Por dia (caixa)"
                                text="Valor fixo por dia trabalhado (dia com pelo menos 1 entrega). O entregador vê por semana."
                                onClick={() => a.setSettingsForm({ ...f, mode: 'POR_DIA' })}
                            />
                        </div>
                    </div>

                    {/* valor */}
                    {f.mode === 'POR_PEDIDO' ? (
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                                <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${t.sub}`}>Tipo do valor</p>
                                <div className={`grid grid-cols-2 rounded-xl p-1 ${t.soft}`}>
                                    {([
                                        ['FIXO', 'R$ fixo'],
                                        ['PERCENTUAL', '% do pedido'],
                                    ] as const).map(([id, label]) => (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => a.setSettingsForm({ ...f, orderValueType: id })}
                                            className={`h-10 rounded-lg text-xs font-bold transition ${f.orderValueType === id ? `${t.cardSolid} ${t.txt} shadow-soft` : t.txt2}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <MoneyInput
                                t={t}
                                label={f.orderValueType === 'PERCENTUAL' ? 'Porcentagem por pedido' : 'Valor por pedido'}
                                prefix={f.orderValueType === 'PERCENTUAL' ? undefined : 'R$'}
                                suffix={f.orderValueType === 'PERCENTUAL' ? '%' : undefined}
                                value={r.orderValueInput}
                                onChange={a.setOrderValueInput}
                            />
                        </div>
                    ) : (
                        <MoneyInput t={t} label="Valor por dia trabalhado" prefix="R$" value={r.dailyValueInput} onChange={a.setDailyValueInput} />
                    )}

                    {/* contar a partir de */}
                    <div>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${t.sub}`}>Contar entregas a partir de (opcional)</p>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.sub}`} />
                                <input
                                    type="date"
                                    value={f.countFrom ?? ''}
                                    onChange={(e) => a.setSettingsForm({ ...f, countFrom: e.target.value || null })}
                                    className={`w-full h-11 pl-9 pr-3 rounded-xl border text-sm outline-none transition ${t.input}`}
                                />
                            </div>
                            {f.countFrom && (
                                <button type="button" onClick={() => a.setSettingsForm({ ...f, countFrom: null })} className={`h-11 px-3 rounded-xl border text-xs font-bold ${t.ghostBtn}`}>
                                    Limpar
                                </button>
                            )}
                        </div>
                        <p className={`mt-1.5 text-[11px] ${t.sub}`}>
                            Em branco: ao ativar, o sistema conta todas as entregas que ainda não foram pagas.
                        </p>
                    </div>
                </section>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <p className={`text-[11px] ${t.sub}`}>
                        {r.settings.updateDate
                            ? `Última alteração ${formatRelative(r.settings.updateDate)}${r.settings.updatedByName ? ` por ${r.settings.updatedByName}` : ''}.`
                            : 'Ainda não configurado.'}
                    </p>
                    <button
                        type="button"
                        onClick={a.saveSettings}
                        disabled={r.savingSettings}
                        className="h-11 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-brand transition disabled:opacity-60"
                    >
                        {r.savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar configuração
                    </button>
                </div>
            </div>

            {/* resumo / regras */}
            <aside className="space-y-4">
                <section className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-brand-500 to-orange-700 text-white shadow-brand">
                    <Wallet className="absolute -right-4 -bottom-4 w-28 h-28 text-white/10" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/75">Prévia</p>
                    {!f.tipEnabled ? (
                        <p className="mt-2 font-display font-bold text-lg">Nada é calculado enquanto a gorjeta estiver desligada.</p>
                    ) : f.mode === 'POR_DIA' ? (
                        <>
                            <p className="mt-2 font-display font-black text-3xl">{formatPrice(Number((r.dailyValueInput || '0').replace(',', '.')) || 0)}</p>
                            <p className="text-sm text-white/80">por dia em que o entregador fizer pelo menos uma entrega.</p>
                        </>
                    ) : (
                        <>
                            <p className="mt-2 font-display font-black text-3xl">{formatPrice(sample)}</p>
                            <p className="text-sm text-white/80">em um pedido de {formatPrice(sampleTotal)}.</p>
                        </>
                    )}
                </section>

                <section className={`rounded-3xl border p-5 ${t.card}`}>
                    <p className={`flex items-center gap-2 font-display font-bold text-sm ${t.txt}`}>
                        <Info className="w-4 h-4 text-sky-500" /> Como funciona
                    </p>
                    <ul className={`mt-3 space-y-2.5 text-xs leading-relaxed ${t.txt2}`}>
                        <li>• Entregas feitas pelo admin nunca contam.</li>
                        <li>• O valor próprio de um entregador (em Entregadores → Valores) substitui o geral.</li>
                        <li>• Gorjeta de um pedido específico substitui os dois (em Dar baixa).</li>
                        <li>• Ao dar baixa, o valor fica congelado. Mudar a configuração depois só afeta o que ainda não foi pago.</li>
                        <li>• Estornar uma baixa devolve os itens para “a receber”.</li>
                    </ul>
                </section>
            </aside>
        </div>
    );
}

function PayoutsSection({ Controller, t }: { Controller: ControllerType; t: Theme }) {
    const r = Controller.result;
    const a = Controller.action;

    const active = r.payouts.filter((p) => !p.reversedAt);
    const total = active.reduce((sum, p) => sum + p.total, 0);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="relative w-full sm:w-72">
                    <UserRound className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.sub}`} />
                    <select
                        value={r.payoutFilter}
                        onChange={(e) => a.setPayoutFilter(Number(e.target.value))}
                        className={`w-full h-11 pl-9 pr-9 rounded-xl border text-sm font-semibold outline-none appearance-none ${t.input}`}
                    >
                        <option value={0}>Todos os entregadores</option>
                        {r.deliverers.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${t.sub}`} />
                </div>
                <p className={`text-sm ${t.txt2}`}>
                    {active.length} {active.length === 1 ? 'baixa' : 'baixas'} · <strong className={t.txt}>{formatPrice(total)}</strong>
                </p>
            </div>

            {r.payouts.length === 0 ? (
                <Empty t={t} icon={<Receipt className="w-7 h-7" />} text="Nenhuma baixa registrada ainda." />
            ) : (
                <div className={`rounded-3xl border divide-y overflow-hidden ${t.card} ${t.divide}`}>
                    {r.payouts.map((payout) => (
                        <PayoutRow key={payout.id} payout={payout} Controller={Controller} t={t} />
                    ))}
                </div>
            )}
        </div>
    );
}

function PayoutRow({ payout, Controller, t }: { payout: DeliveryPayout; Controller: ControllerType; t: Theme }) {
    const r = Controller.result;
    const a = Controller.action;
    const open = r.expandedPayoutId === payout.id;
    const reversed = !!payout.reversedAt;

    const start = toDate(payout.periodStart);
    const end = toDate(payout.periodEnd);
    const period = start && end
        ? start.toDateString() === end.toDateString()
            ? start.toLocaleDateString('pt-BR')
            : `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${end.toLocaleDateString('pt-BR')}`
        : '-';

    return (
        <div className={reversed ? 'opacity-70' : ''}>
            <button
                type="button"
                onClick={() => a.setExpandedPayoutId(open ? null : payout.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 text-left transition ${t.hover}`}
            >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${reversed ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {reversed ? <RotateCcw className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`font-display font-bold text-sm truncate ${t.txt}`}>
                        {payout.deliveryName}
                        {reversed && <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold uppercase">Estornada</span>}
                    </p>
                    <p className={`text-xs ${t.sub}`}>
                        {period} · {payout.mode === 'POR_DIA' ? `${payout.itemsCount} dia(s)` : `${payout.itemsCount} pedido(s)`} · pago {formatRelative(payout.paidAt)}
                        {payout.paidByName ? ` por ${payout.paidByName}` : ''}
                    </p>
                </div>
                <p className={`font-display font-bold ${reversed ? `line-through ${t.sub}` : t.txt}`}>{formatPrice(payout.total)}</p>
                <ChevronDown className={`w-4 h-4 transition-transform ${t.sub} ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className={`px-5 pb-5 space-y-3 animate-fade-in`}>
                    {payout.note && <p className={`text-xs rounded-xl px-3 py-2 ${t.soft} ${t.txt2}`}>Observação: {payout.note}</p>}
                    {reversed && (
                        <p className="text-xs rounded-xl px-3 py-2 bg-red-500/10 text-red-400">
                            Estornada {formatRelative(payout.reversedAt)}{payout.reversedByName ? ` por ${payout.reversedByName}` : ''}. Motivo: {payout.reversedReason}
                        </p>
                    )}

                    <div className={`rounded-2xl border divide-y ${t.bord} ${t.divide}`}>
                        {payout.items.map((item, index) => (
                            <EntryLine key={index} entry={item} t={t} />
                        ))}
                    </div>

                    {!reversed && (
                        <button
                            type="button"
                            onClick={() => a.setReverseTarget(payout)}
                            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Estornar baixa
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

/* ============================================================= */
/* MODAIS                                                        */
/* ============================================================= */

function ModalShell({ open, onClose, children, wide = false }: { open: boolean; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md sm:p-4" onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'} max-h-[92vh] flex flex-col overflow-hidden rounded-t-[28px] sm:rounded-[28px] border border-white/10 bg-[#0b0b0d] shadow-2xl animate-slide-up`}
            >
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
                {children}
            </div>
        </div>
    );
}

function RatesModal({ Controller, t }: { Controller: ControllerType; t: Theme }) {
    const r = Controller.result;
    const a = Controller.action;
    const driver = r.ratesTarget;
    const s = r.settings;

    return (
        <ModalShell open={!!driver} onClose={() => a.setRatesTarget(null)}>
            <div className="relative p-6 overflow-y-auto">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-black text-white">Valores de {driver?.name}</h2>
                        <p className="mt-1 text-sm text-white/55">Deixe em branco para usar o valor geral.</p>
                    </div>
                    <button type="button" onClick={() => a.setRatesTarget(null)} className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.06]">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="mt-6 space-y-4">
                    <DarkInput
                        label={s.orderValueType === 'PERCENTUAL' ? 'Por pedido (%)' : 'Por pedido (R$)'}
                        hint={`Geral: ${valueLabel('POR_PEDIDO', s.orderValueType, s.orderValue)}`}
                        value={r.ratesForm.commission}
                        onChange={(v) => a.setRatesForm({ ...r.ratesForm, commission: v })}
                        icon={s.orderValueType === 'PERCENTUAL' ? <Percent className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                    />
                    <DarkInput
                        label="Por dia trabalhado (R$)"
                        hint={`Geral: ${formatPrice(s.dailyValue)} por dia`}
                        value={r.ratesForm.daily}
                        onChange={(v) => a.setRatesForm({ ...r.ratesForm, daily: v })}
                        icon={<CalendarDays className="w-4 h-4" />}
                    />
                </div>

                <div className="mt-8 flex gap-3">
                    <button type="button" onClick={() => a.setRatesTarget(null)} className="flex-1 h-12 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold transition">
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={a.saveRates}
                        disabled={r.savingRates}
                        className="flex-1 h-12 rounded-2xl bg-brand-500 hover:bg-brand-600 shadow-brand text-white font-bold flex items-center justify-center gap-2 transition disabled:opacity-70"
                    >
                        {r.savingRates ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        Salvar
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}

function PayablesModal({ Controller, t }: { Controller: ControllerType; t: Theme }) {
    const r = Controller.result;
    const a = Controller.action;
    const driver = r.payablesTarget;
    const entries = r.payables?.entries ?? [];
    const allSelected = entries.length > 0 && r.selectedKeys.size === entries.length;

    return (
        <ModalShell open={!!driver} onClose={a.closePayables} wide>
            {/* topo */}
            <div className="relative p-6 pb-4 border-b border-white/[0.06]">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Dar baixa</p>
                        <h2 className="mt-1 text-xl font-black text-white">{driver?.name}</h2>
                        <p className="mt-1 text-sm text-white/55">
                            {r.payables
                                ? `${formatPrice(r.payables.total)} a receber · ${entries.length} ${r.payables.mode === 'POR_DIA' ? 'dia(s)' : 'pedido(s)'}`
                                : 'Carregando...'}
                        </p>
                    </div>
                    <button type="button" onClick={a.closePayables} className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.06]">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {entries.length > 0 && (
                    <button type="button" onClick={a.toggleAll} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white">
                        <Checkbox checked={allSelected} />
                        {allSelected ? 'Desmarcar todos' : 'Marcar todos'}
                    </button>
                )}
            </div>

            {/* lista */}
            <div className="relative flex-1 overflow-y-auto px-6 py-3">
                {r.payablesLoading && !r.payables ? (
                    <div className="py-12 flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
                    </div>
                ) : entries.length === 0 ? (
                    <p className="py-12 text-center text-sm text-white/50">Nada pendente para este entregador.</p>
                ) : (
                    <ul className="divide-y divide-white/[0.06]">
                        {entries.map((entry) => {
                            const key = entryKey(entry);
                            const checked = r.selectedKeys.has(key);
                            const editing = r.tipEdit && entry.orderId === r.tipEdit.orderId;
                            const date = toDate(entry.date);

                            return (
                                <li key={key} className="py-3">
                                    <div className="flex items-center gap-3">
                                        <button type="button" onClick={() => a.toggleKey(key)} aria-label="Selecionar">
                                            <Checkbox checked={checked} />
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white">
                                                {entry.kind === 'DIA'
                                                    ? date?.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })
                                                    : `Pedido #${entry.orderNumber}`}
                                            </p>
                                            <p className="text-[11px] text-white/45">
                                                {entry.kind === 'DIA'
                                                    ? `${entry.deliveries} ${entry.deliveries === 1 ? 'entrega' : 'entregas'}`
                                                    : `${formatRelative(entry.date)}${entry.orderTotal != null ? ` · pedido de ${formatPrice(entry.orderTotal)}` : ''}`}
                                                {entry.customTip && <span className="text-violet-400"> · gorjeta especial</span>}
                                            </p>
                                        </div>

                                        {!editing && (
                                            <>
                                                <p className="font-display font-bold text-white">{formatPrice(entry.amount)}</p>
                                                {entry.kind === 'PEDIDO' && entry.orderId && (
                                                    <button
                                                        type="button"
                                                        onClick={() => a.setTipEdit({ orderId: entry.orderId as number, value: String(entry.amount).replace('.', ',') })}
                                                        title="Ajustar gorjeta deste pedido"
                                                        className="p-2 rounded-xl text-white/45 hover:text-white hover:bg-white/[0.06]"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {editing && r.tipEdit && (
                                        <div className="mt-3 ml-8 flex flex-wrap items-center gap-2">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/40">R$</span>
                                                <input
                                                    autoFocus
                                                    value={r.tipEdit.value}
                                                    inputMode="decimal"
                                                    onChange={(e) => a.setTipEdit({ orderId: r.tipEdit!.orderId, value: e.target.value })}
                                                    className="w-32 h-10 pl-9 pr-3 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white outline-none focus:border-brand-500/60"
                                                />
                                            </div>
                                            <button type="button" disabled={r.savingTip} onClick={() => a.saveTip(false)} className="h-10 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-60">
                                                {r.savingTip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Salvar
                                            </button>
                                            {entry.customTip && (
                                                <button type="button" disabled={r.savingTip} onClick={() => a.saveTip(true)} className="h-10 px-3 rounded-xl border border-white/10 text-white/70 hover:bg-white/[0.06] text-xs font-bold">
                                                    Voltar ao padrão
                                                </button>
                                            )}
                                            <button type="button" onClick={() => a.setTipEdit(null)} className="h-10 w-10 rounded-xl text-white/50 hover:bg-white/[0.06] flex items-center justify-center">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* rodapé */}
            <div className="relative p-6 pt-4 border-t border-white/[0.06] space-y-3">
                <textarea
                    value={r.payoutNote}
                    onChange={(e) => a.setPayoutNote(e.target.value)}
                    maxLength={500}
                    rows={2}
                    placeholder="Observação (opcional): ex. pago no Pix"
                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-500/60"
                />
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <p className="text-[11px] uppercase tracking-wider font-bold text-white/40">Selecionado</p>
                        <p className="font-display font-black text-2xl text-white">{formatPrice(r.selectedTotal)}</p>
                    </div>
                    <button
                        type="button"
                        disabled={r.selectedEntries.length === 0 || r.payablesLoading}
                        onClick={() => a.setPayoutConfirmOpen(true)}
                        className="h-12 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition disabled:opacity-40"
                    >
                        <CircleDollarSign className="w-5 h-5" /> Dar baixa
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}

/* ============================================================= */
/* PEÇAS                                                         */
/* ============================================================= */

function valueLabel(mode: string, type: string, value: number) {
    if (mode === 'POR_DIA') return `${formatPrice(value)} por dia`;
    return type === 'PERCENTUAL' ? `${value.toLocaleString('pt-BR')}% do pedido` : `${formatPrice(value)} por pedido`;
}

function SummaryCard({ t, title, value, description, icon, highlight = false }: { t: Theme; title: string; value: string; description: string; icon: JSX.Element; highlight?: boolean }) {
    return (
        <div className={`rounded-2xl border p-4 shadow-soft ${t.card} ${highlight ? 'ring-1 ring-amber-500/30' : ''}`}>
            <div className="flex items-center justify-between">
                <p className={`text-xs font-semibold ${t.txt2}`}>{title}</p>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.soft}`}>{icon}</div>
            </div>
            <p className={`mt-2 font-display font-bold text-2xl ${t.txt}`}>{value}</p>
            <p className={`text-[11px] ${t.sub}`}>{description}</p>
        </div>
    );
}

function MiniStat({ t, label, value, tone }: { t: Theme; label: string; value: number; tone: string }) {
    return (
        <div className={`rounded-xl px-2 py-2 text-center ${t.soft}`}>
            <p className={`font-display font-bold text-base leading-none ${tone}`}>{value}</p>
            <p className={`mt-1 text-[9px] font-bold uppercase tracking-wider ${t.sub}`}>{label}</p>
        </div>
    );
}

function OptionCard({ t, active, icon, title, text, onClick }: { t: Theme; active: boolean; icon: JSX.Element; title: string; text: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative text-left rounded-2xl border p-4 transition ${active ? 'border-brand-500/60 bg-brand-500/[0.06] ring-1 ring-brand-500/30' : `${t.bord} ${t.hover}`}`}
        >
            {active && (
                <span className="absolute right-3 top-3 w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                </span>
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-brand-500 text-white' : `${t.soft} ${t.txt2}`}`}>{icon}</div>
            <p className={`mt-3 font-display font-bold text-sm ${t.txt}`}>{title}</p>
            <p className={`mt-1 text-xs leading-relaxed ${t.sub}`}>{text}</p>
        </button>
    );
}

function MoneyInput({ t, label, value, onChange, prefix, suffix }: { t: Theme; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string }) {
    return (
        <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${t.sub}`}>{label}</p>
            <div className="relative">
                {prefix && <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold ${t.sub}`}>{prefix}</span>}
                <input
                    value={value}
                    inputMode="decimal"
                    placeholder="0,00"
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full h-11 ${prefix ? 'pl-10' : 'pl-3.5'} ${suffix ? 'pr-9' : 'pr-3.5'} rounded-xl border text-sm font-semibold outline-none transition ${t.input}`}
                />
                {suffix && <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold ${t.sub}`}>{suffix}</span>}
            </div>
        </div>
    );
}

function DarkInput({ label, hint, value, onChange, icon }: { label: string; hint: string; value: string; onChange: (v: string) => void; icon: JSX.Element }) {
    return (
        <div>
            <label className="text-xs font-bold uppercase tracking-widest text-white/50">{label}</label>
            <div className="relative mt-2">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35">{icon}</span>
                <input
                    value={value}
                    inputMode="decimal"
                    placeholder="Usar o geral"
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-2xl border border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-500/60"
                />
            </div>
            <p className="mt-1.5 text-[11px] text-white/40">{hint}</p>
        </div>
    );
}

function Checkbox({ checked }: { checked: boolean }) {
    return (
        <span className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-white/25'}`}>
            {checked && <Check className="w-3.5 h-3.5 text-white" />}
        </span>
    );
}

function EntryLine({ entry, t }: { entry: DeliveryEarningEntry; t: Theme }) {
    const date = toDate(entry.date);
    return (
        <div className="flex items-center gap-3 px-4 py-2.5">
            {entry.kind === 'DIA' ? <CalendarDays className={`w-4 h-4 ${t.sub}`} /> : <Package className={`w-4 h-4 ${t.sub}`} />}
            <p className={`flex-1 text-xs ${t.txt2}`}>
                {entry.kind === 'DIA'
                    ? `${date?.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })} · ${entry.deliveries} entrega(s)`
                    : `Pedido #${entry.orderNumber ?? entry.orderId} · ${date?.toLocaleDateString('pt-BR')}`}
            </p>
            <p className={`text-xs font-bold ${t.txt}`}>{formatPrice(entry.amount)}</p>
        </div>
    );
}

function Empty({ t, icon, text }: { t: Theme; icon: JSX.Element; text: string }) {
    return (
        <div className={`rounded-3xl border px-6 py-14 text-center ${t.card}`}>
            <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center ${t.soft} text-brand-500`}>{icon}</div>
            <p className={`mt-4 text-sm max-w-sm mx-auto ${t.txt2}`}>{text}</p>
        </div>
    );
}
