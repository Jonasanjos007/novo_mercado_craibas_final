import { useState } from "react";
import { OrderCancelAdmin } from "../models/Order";
import { UseCancellationsAdminStore } from "../storeAdmin/UseCancellationsAdminStore";
import { UseNotificationAdmin } from "../storeAdmin/UseNotificationAdmin";
import { useNotification } from "../utils/NotificationCard";
import { formatPrice } from "../utils";
import { whatsAppNumber } from "./useAdminReturnsController";

export type CancelDecision = { order: OrderCancelAdmin; approve: boolean } | null;

export const whatsAppCancelLink = (order: OrderCancelAdmin) => {
    const number = whatsAppNumber(order.customer_Phone);
    if (!number) return null;
    const firstName = (order.customer_Name || '').split(' ')[0];
    const text =
        `Olá ${firstName}! Aqui é do Mercado Craíbas. ` +
        `Recebemos seu pedido de cancelamento do pedido #${order.number_Order} (${formatPrice(order.total_Value_Order)}). ` +
        `Podemos conversar rapidinho sobre ele?`;
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
};

/** Aba "Cancelamentos" do admin: aprovar (cancela e estorna) ou recusar com explicação. */
export const useAdminCancellationsController = () => {
    const notify = useNotification();
    const { Cancellations, CancellationsFilter, LoadingCancellations, LoadCancellations, DecideCancellation } = UseCancellationsAdminStore();
    const { LoadNotificationAll } = UseNotificationAdmin();

    const [pending, setPending] = useState<CancelDecision>(null);
    const [saving, setSaving] = useState(false);

    const confirm = async (note?: string) => {
        if (!pending) return;
        setSaving(true);
        const result = await DecideCancellation(pending.order.id_Order, pending.approve, note);
        setSaving(false);
        if (!result.success) {
            notify.error(result.error?.error?.code || 'Cancelamento', result.error?.error?.message || 'Não foi possível responder o cancelamento.');
            return;
        }
        notify.success(
            pending.approve ? 'Cancelamento aprovado' : 'Cancelamento recusado',
            pending.approve
                ? `Pedido #${pending.order.number_Order} cancelado${pending.order.online_Refund ? ' e estornado' : ''}.`
                : `O cliente foi avisado e o pedido #${pending.order.number_Order} segue normalmente.`,
        );
        setPending(null);
        LoadNotificationAll();
    };

    return {
        result: { Cancellations, CancellationsFilter, LoadingCancellations, pending, saving },
        action: {
            LoadCancellations,
            open: (order: OrderCancelAdmin, approve: boolean) => setPending({ order, approve }),
            close: () => !saving && setPending(null),
            confirm,
        },
    };
};
