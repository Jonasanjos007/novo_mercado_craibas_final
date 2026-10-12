import { useCallback, useEffect, useMemo, useState } from "react";
import {
    DeliveryDriver,
    DeliveryEarningEntry,
    DeliveryOrder,
    DeliveryPayables,
    DeliveryPayout,
    DeliverySettings,
} from "../models/Delivery";
import { UseDeliveryAdminStore } from "../storeAdmin/UseDeliveryAdminStore";
import { useNotification } from "../utils/NotificationCard";

export type DeliverersSection = 'orders' | 'drivers' | 'settings' | 'payouts';

const defaultSettings: DeliverySettings = {
    tipEnabled: false,
    mode: 'POR_PEDIDO',
    orderValueType: 'FIXO',
    orderValue: 0,
    dailyValue: 0,
    countFrom: null,
};

/** Chave única de um item a pagar (pedido ou dia). */
export const entryKey = (entry: DeliveryEarningEntry) =>
    entry.kind === 'DIA' ? `D:${entry.date.slice(0, 10)}` : `P:${entry.orderId}`;

const parseMoney = (value: string): number | null => {
    let clean = value.replace(/\s/g, '').replace(/^R\$/, '').replace('%', '');
    // "1.234,56" → 1234.56 | "5.5" → 5.5
    if (clean.includes(',')) clean = clean.replace(/\./g, '').replace(',', '.');
    if (clean === '') return null;
    const number = Number(clean);
    return Number.isFinite(number) ? number : NaN;
};

const toInput = (value?: number | null) => (value == null ? '' : value.toFixed(2).replace('.', ','));

/**
 * Aba "Deliverys" do admin: atribuir pedidos, configurar gorjeta, dar baixa e estornar.
 */
export const useDeliverersAdminController = () => {
    const store = UseDeliveryAdminStore();
    const notify = useNotification();

    const [section, setSection] = useState<DeliverersSection>('orders');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Pedidos
    const [assigningId, setAssigningId] = useState<number | null>(null);
    const [orderFilter, setOrderFilter] = useState<'all' | 'unassigned' | 'assigned'>('all');

    // Configuração
    const [settingsForm, setSettingsForm] = useState<DeliverySettings>(defaultSettings);
    const [orderValueInput, setOrderValueInput] = useState('');
    const [dailyValueInput, setDailyValueInput] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);

    // Valores próprios
    const [ratesTarget, setRatesTarget] = useState<DeliveryDriver | null>(null);
    const [ratesForm, setRatesForm] = useState({ commission: '', daily: '' });
    const [savingRates, setSavingRates] = useState(false);

    // Dar baixa
    const [payablesTarget, setPayablesTarget] = useState<DeliveryDriver | null>(null);
    const [payables, setPayables] = useState<DeliveryPayables | null>(null);
    const [payablesLoading, setPayablesLoading] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [payoutNote, setPayoutNote] = useState('');
    const [payoutConfirmOpen, setPayoutConfirmOpen] = useState(false);
    const [creatingPayout, setCreatingPayout] = useState(false);
    const [tipEdit, setTipEdit] = useState<{ orderId: number; value: string } | null>(null);
    const [savingTip, setSavingTip] = useState(false);

    // Pagamentos
    const [payoutFilter, setPayoutFilter] = useState<number>(0);
    const [expandedPayoutId, setExpandedPayoutId] = useState<number | null>(null);
    const [reverseTarget, setReverseTarget] = useState<DeliveryPayout | null>(null);
    const [reversing, setReversing] = useState(false);

    const fail = (result: { error?: any }, fallback: string) =>
        notify.error(result.error?.error?.code ?? 'Deliverys', result.error?.error?.message ?? fallback);

    /* ───────────── carregamento ───────────── */

    const load = useCallback(async (silent = false) => {
        if (!silent) setRefreshing(true);
        try {
            const results = await Promise.all([
                store.LoadBoard(),
                store.LoadDeliverers(),
                store.LoadSettings(),
                store.LoadPayouts(),
            ]);
            const failed = results.find((r) => !r.success);
            if (failed && !silent) fail(failed, 'Não foi possível carregar os dados de entrega.');
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Formulário da configuração acompanha o servidor
    useEffect(() => {
        const s = store.settings ?? defaultSettings;
        setSettingsForm({ ...s, countFrom: s.countFrom ? s.countFrom.slice(0, 10) : null });
        setOrderValueInput(toInput(s.orderValue));
        setDailyValueInput(toInput(s.dailyValue));
    }, [store.settings]);

    useEffect(() => {
        store.LoadPayouts(payoutFilter || undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [payoutFilter]);

    const activeDrivers = useMemo(() => store.deliverers.filter((d) => d.ativo), [store.deliverers]);

    const filteredBoard = useMemo(() => {
        if (orderFilter === 'unassigned') return store.board.filter((o) => o.assigneeType === 'NONE');
        if (orderFilter === 'assigned') return store.board.filter((o) => o.assigneeType !== 'NONE');
        return store.board;
    }, [store.board, orderFilter]);

    const totals = useMemo(() => ({
        unassigned: store.board.filter((o) => o.assigneeType === 'NONE').length,
        enRoute: store.board.filter((o) => o.order_Status === 'SAIU_PARA_ENTREGA').length,
        pending: store.deliverers.reduce((sum, d) => sum + d.pendingAmount, 0),
    }), [store.board, store.deliverers]);

    /* ───────────── pedidos ───────────── */

    const assign = async (order: DeliveryOrder, deliveryId: number) => {
        if (deliveryId === (order.assigneeType === 'DELIVERY' ? order.assigneeId : -1)) return;

        setAssigningId(order.id);
        try {
            const result = deliveryId === 0
                ? await store.UnassignOrder(order.id)
                : await store.AssignOrder(order.id, deliveryId);

            if (!result.success) {
                fail(result, 'Não foi possível atualizar o pedido.');
                return;
            }

            const driver = store.deliverers.find((d) => d.id === deliveryId);
            notify.success(
                deliveryId === 0 ? 'Entregador removido' : 'Pedido atribuído',
                deliveryId === 0 ? `#${order.number_Order} ficou sem entregador.` : `#${order.number_Order} foi para ${driver?.name ?? 'o entregador'}.`
            );
        } finally {
            setAssigningId(null);
        }
    };

    /* ───────────── configuração ───────────── */

    const saveSettings = async () => {
        const orderValue = parseMoney(orderValueInput) ?? 0;
        const dailyValue = parseMoney(dailyValueInput) ?? 0;

        if (Number.isNaN(orderValue) || orderValue < 0) {
            notify.error('Configuração', 'Valor por pedido inválido.');
            return;
        }
        if (settingsForm.orderValueType === 'PERCENTUAL' && orderValue > 100) {
            notify.error('Configuração', 'A porcentagem deve ficar entre 0 e 100.');
            return;
        }
        if (Number.isNaN(dailyValue) || dailyValue < 0) {
            notify.error('Configuração', 'Valor por dia inválido.');
            return;
        }

        setSavingSettings(true);
        try {
            const result = await store.SaveSettings({
                ...settingsForm,
                orderValue,
                dailyValue,
                countFrom: settingsForm.countFrom || null,
            });
            if (!result.success) {
                fail(result, 'Não foi possível salvar a configuração.');
                return;
            }
            notify.success(
                'Configuração salva',
                settingsForm.tipEnabled ? 'Os ganhos foram recalculados para todos os entregadores.' : 'Gorjeta desativada: o portal dos entregadores não mostra ganhos.'
            );
        } finally {
            setSavingSettings(false);
        }
    };

    /* ───────────── valores próprios ───────────── */

    const openRates = (driver: DeliveryDriver) => {
        setRatesTarget(driver);
        setRatesForm({ commission: toInput(driver.commissionDelivers), daily: toInput(driver.dailyRate) });
    };

    const saveRates = async () => {
        if (!ratesTarget) return;

        const commission = parseMoney(ratesForm.commission);
        const daily = parseMoney(ratesForm.daily);

        if ((commission !== null && (Number.isNaN(commission) || commission < 0)) || (daily !== null && (Number.isNaN(daily) || daily < 0))) {
            notify.error('Valores', 'Informe valores válidos ou deixe em branco para usar o geral.');
            return;
        }

        setSavingRates(true);
        try {
            const result = await store.SaveRates(ratesTarget.id, commission, daily);
            if (!result.success) {
                fail(result, 'Não foi possível salvar os valores.');
                return;
            }
            notify.success('Valores salvos', `Valores de ${ratesTarget.name} atualizados.`);
            setRatesTarget(null);
        } finally {
            setSavingRates(false);
        }
    };

    /* ───────────── dar baixa ───────────── */

    const loadPayables = async (driver: DeliveryDriver, keepSelection = false) => {
        setPayablesLoading(true);
        try {
            const result = await store.GetPayables(driver.id);
            if (!result.success || !result.data) {
                fail(result, 'Não foi possível carregar o que falta pagar.');
                return;
            }
            setPayables(result.data);

            const keys = result.data.entries.map(entryKey);
            setSelectedKeys((current) =>
                keepSelection ? new Set(keys.filter((k) => current.has(k))) : new Set(keys)
            );
        } finally {
            setPayablesLoading(false);
        }
    };

    const openPayables = (driver: DeliveryDriver) => {
        setPayablesTarget(driver);
        setPayables(null);
        setPayoutNote('');
        setTipEdit(null);
        loadPayables(driver);
    };

    const closePayables = () => {
        setPayablesTarget(null);
        setPayables(null);
        setSelectedKeys(new Set());
        setTipEdit(null);
    };

    const toggleKey = (key: string) => {
        setSelectedKeys((current) => {
            const next = new Set(current);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const toggleAll = () => {
        if (!payables) return;
        const all = payables.entries.map(entryKey);
        setSelectedKeys((current) => (current.size === all.length ? new Set() : new Set(all)));
    };

    const selectedEntries = useMemo(
        () => (payables?.entries ?? []).filter((e) => selectedKeys.has(entryKey(e))),
        [payables, selectedKeys]
    );

    const selectedTotal = useMemo(
        () => Math.round(selectedEntries.reduce((sum, e) => sum + e.amount, 0) * 100) / 100,
        [selectedEntries]
    );

    const saveTip = async (resetToDefault = false) => {
        if (!tipEdit || !payablesTarget) return;

        const amount = resetToDefault ? null : parseMoney(tipEdit.value);
        if (!resetToDefault && (amount === null || Number.isNaN(amount) || amount < 0)) {
            notify.error('Gorjeta', 'Informe um valor válido.');
            return;
        }

        setSavingTip(true);
        try {
            const result = await store.SetOrderTip(tipEdit.orderId, amount);
            if (!result.success) {
                fail(result, 'Não foi possível salvar a gorjeta.');
                return;
            }
            setTipEdit(null);
            await loadPayables(payablesTarget, true);
        } finally {
            setSavingTip(false);
        }
    };

    const createPayout = async () => {
        if (!payablesTarget || !payables || selectedEntries.length === 0) return;

        setCreatingPayout(true);
        try {
            const result = await store.CreatePayout({
                deliveryId: payablesTarget.id,
                orderIds: selectedEntries.filter((e) => e.kind === 'PEDIDO' && e.orderId).map((e) => e.orderId as number),
                workDates: selectedEntries.filter((e) => e.kind === 'DIA').map((e) => e.date.slice(0, 10)),
                note: payoutNote.trim() || undefined,
            });

            if (!result.success) {
                fail(result, 'Não foi possível dar baixa.');
                await loadPayables(payablesTarget, true);
                return;
            }

            notify.success('Baixa registrada', `${payablesTarget.name} recebeu ${result.data ? result.data.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''}.`);
            setPayoutConfirmOpen(false);
            closePayables();
        } finally {
            setCreatingPayout(false);
            setPayoutConfirmOpen(false);
        }
    };

    /* ───────────── estorno ───────────── */

    const confirmReverse = async (reason?: string) => {
        if (!reverseTarget || !reason) return;

        setReversing(true);
        try {
            const result = await store.ReversePayout(reverseTarget.id, reason);
            if (!result.success) {
                fail(result, 'Não foi possível estornar.');
                return;
            }
            notify.success('Baixa estornada', `Os itens de ${reverseTarget.deliveryName} voltaram para "a receber".`);
            await store.LoadPayouts(payoutFilter || undefined);
        } finally {
            setReversing(false);
            setReverseTarget(null);
        }
    };

    return {
        result: {
            section,
            loading,
            refreshing,
            board: filteredBoard,
            allBoard: store.board,
            orderFilter,
            deliverers: store.deliverers,
            activeDrivers,
            settings: store.settings ?? defaultSettings,
            settingsForm,
            orderValueInput,
            dailyValueInput,
            savingSettings,
            assigningId,
            totals,
            ratesTarget,
            ratesForm,
            savingRates,
            payablesTarget,
            payables,
            payablesLoading,
            selectedKeys,
            selectedEntries,
            selectedTotal,
            payoutNote,
            payoutConfirmOpen,
            creatingPayout,
            tipEdit,
            savingTip,
            payouts: store.payouts,
            payoutFilter,
            expandedPayoutId,
            reverseTarget,
            reversing,
        },
        action: {
            setSection,
            load,
            setOrderFilter,
            assign,
            setSettingsForm,
            setOrderValueInput,
            setDailyValueInput,
            saveSettings,
            openRates,
            setRatesTarget,
            setRatesForm,
            saveRates,
            openPayables,
            closePayables,
            toggleKey,
            toggleAll,
            setPayoutNote,
            setPayoutConfirmOpen,
            createPayout,
            setTipEdit,
            saveTip,
            setPayoutFilter,
            setExpandedPayoutId,
            setReverseTarget,
            confirmReverse,
        },
    };
};
