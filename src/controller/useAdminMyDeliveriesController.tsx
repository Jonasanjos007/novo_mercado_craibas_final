import { useCallback, useEffect, useMemo, useState } from "react";
import { DeliveryOrder } from "../models/Delivery";
import { UseDeliveryAdminStore } from "../storeAdmin/UseDeliveryAdminStore";
import { useNotification } from "../utils/NotificationCard";
import { sameDay, toDate } from "../utils/delivery";

export type MyDeliveriesView = 'mine' | 'free' | 'others' | 'history';

const REFRESH_MS = 45000;

/**
 * Aba "Minhas entregas" do admin: o admin entrega ele mesmo (não conta ganho).
 */
export const useAdminMyDeliveriesController = () => {
    const store = UseDeliveryAdminStore();
    const notify = useNotification();

    const [view, setView] = useState<MyDeliveriesView>('mine');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);

    /** Pedido que já está com alguém: pergunta se quer assumir. */
    const [takeTarget, setTakeTarget] = useState<{ order: DeliveryOrder; message: string } | null>(null);
    const [dispatchTarget, setDispatchTarget] = useState<DeliveryOrder | null>(null);
    const [deliverTarget, setDeliverTarget] = useState<DeliveryOrder | null>(null);
    const [releaseTarget, setReleaseTarget] = useState<DeliveryOrder | null>(null);

    const fail = (result: { error?: any }, fallback: string) =>
        notify.error(result.error?.error?.code ?? 'Entregas', result.error?.error?.message ?? fallback);

    const load = useCallback(async (silent = false) => {
        if (!silent) setRefreshing(true);
        try {
            const [board, history] = await Promise.all([store.LoadBoard(), store.LoadMyHistory()]);
            if (!silent && !board.success) fail(board, 'Não foi possível carregar os pedidos.');
            else if (!silent && !history.success) fail(history, 'Não foi possível carregar o histórico.');
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        load();
        const timer = window.setInterval(() => {
            if (document.visibilityState === 'visible') store.LoadBoard();
        }, REFRESH_MS);
        return () => window.clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const mine = useMemo(() => store.board.filter((o) => o.isMine), [store.board]);
    const free = useMemo(() => store.board.filter((o) => o.assigneeType === 'NONE'), [store.board]);
    const others = useMemo(() => store.board.filter((o) => !o.isMine && o.assigneeType !== 'NONE'), [store.board]);

    const deliveredToday = useMemo(() => {
        const today = new Date();
        return store.myHistory.filter((o) => {
            const date = toDate(o.deliveredAt);
            return date ? sameDay(date, today) : false;
        }).length;
    }, [store.myHistory]);

    /* ───────────── pegar pedido ───────────── */

    const requestTake = async (order: DeliveryOrder) => {
        // Já está com outra pessoa: avisa antes de assumir
        if (order.assigneeType !== 'NONE' && !order.isMine) {
            setTakeTarget({
                order,
                message: `Este pedido já está sendo entregue por ${order.assigneeName ?? 'outro entregador'}. Se você assumir, ele sai da lista dessa pessoa.`,
            });
            return;
        }

        setBusyId(order.id);
        try {
            const result = await store.TakeOrder(order.id, false);

            if (!result.success) {
                // Alguém pegou entre a lista e o clique
                if (result.error?.error?.code === 'Delivery.AlreadyAssigned') {
                    setTakeTarget({ order, message: `${result.error.error.message} Deseja assumir mesmo assim?` });
                    return;
                }
                fail(result, 'Não foi possível pegar o pedido.');
                return;
            }

            notify.success('Pedido com você', `#${order.number_Order} agora está na sua lista de entregas.`);
            setView('mine');
        } finally {
            setBusyId(null);
        }
    };

    const confirmTakeForce = async () => {
        const target = takeTarget;
        if (!target) return;

        setBusyId(target.order.id);
        try {
            const result = await store.TakeOrder(target.order.id, true);
            if (!result.success) {
                fail(result, 'Não foi possível assumir o pedido.');
                return;
            }
            notify.success('Pedido assumido', `#${target.order.number_Order} agora está com você.`);
            setView('mine');
        } finally {
            setBusyId(null);
            setTakeTarget(null);
        }
    };

    const confirmRelease = async () => {
        const order = releaseTarget;
        if (!order) return;

        setBusyId(order.id);
        try {
            const result = await store.ReleaseOrder(order.id);
            if (!result.success) {
                fail(result, 'Não foi possível soltar o pedido.');
                return;
            }
            notify.success('Pedido liberado', `#${order.number_Order} voltou para a lista de livres.`);
        } finally {
            setBusyId(null);
            setReleaseTarget(null);
        }
    };

    const confirmDispatch = async () => {
        const order = dispatchTarget;
        if (!order) return;

        setBusyId(order.id);
        try {
            const result = await store.DispatchOrder(order.id);
            if (!result.success) {
                fail(result, 'Não foi possível atualizar o pedido.');
                return;
            }
            notify.success('Saiu para entrega', `#${order.number_Order} está em rota. O cliente foi avisado.`);
        } finally {
            setBusyId(null);
            setDispatchTarget(null);
        }
    };

    const confirmDeliver = async (whoReceivedIt?: string) => {
        const order = deliverTarget;
        const name = whoReceivedIt?.trim() ?? '';
        if (!order || name.length < 2) return;

        setBusyId(order.id);
        try {
            const result = await store.DeliverOrder(order.id, name);
            if (!result.success) {
                fail(result, 'Não foi possível confirmar a entrega.');
                return;
            }
            notify.success('Entregue!', `#${order.number_Order} entregue para ${name}.`);
        } finally {
            setBusyId(null);
            setDeliverTarget(null);
        }
    };

    return {
        result: {
            view,
            loading,
            refreshing,
            busyId,
            mine,
            free,
            others,
            history: store.myHistory,
            deliveredToday,
            takeTarget,
            dispatchTarget,
            deliverTarget,
            releaseTarget,
        },
        action: {
            setView,
            load,
            requestTake,
            confirmTakeForce,
            setTakeTarget,
            setDispatchTarget,
            confirmDispatch,
            setDeliverTarget,
            confirmDeliver,
            setReleaseTarget,
            confirmRelease,
        },
    };
};
