import { useState } from "react";
import { OrderReturnAdmin, ReturnStatus } from "../models/Order";
import { UseReturnsAdminStore } from "../storeAdmin/UseReturnsAdminStore";
import { UseNotificationAdmin } from "../storeAdmin/UseNotificationAdmin";
import { useNotification } from "../utils/NotificationCard";
import { formatPrice, returnStatusLabels } from "../utils";

export type ReturnAction = { order: OrderReturnAdmin; status: ReturnStatus } | null;

/** Só números, com DDI 55 (wa.me). */
export const whatsAppNumber = (phone?: string | null) => {
    const digits = (phone ?? '').replace(/\D/g, '');
    if (digits.length < 10) return null;
    return digits.startsWith('55') && digits.length >= 12 ? digits : `55${digits}`;
};

export const whatsAppReturnLink = (order: OrderReturnAdmin) => {
    const number = whatsAppNumber(order.customer_Phone);
    if (!number) return null;
    const firstName = (order.customer_Name || '').split(' ')[0];
    const text =
        `Olá ${firstName}! Aqui é do Mercado Craíbas. ` +
        `Recebemos seu pedido de devolução do pedido #${order.number_Order} (${formatPrice(order.total_Value_Order)}). ` +
        `Vamos combinar a coleta do produto?`;
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
};

/** Aba "Devoluções" do admin. */
export const useAdminReturnsController = () => {
    const notify = useNotification();
    const { Returns, ReturnsFilter, LoadingReturns, LoadReturns, UpdateReturnStatus } = UseReturnsAdminStore();
    const { LoadNotificationAll } = UseNotificationAdmin();

    const [pending, setPending] = useState<ReturnAction>(null);
    const [saving, setSaving] = useState(false);

    const confirm = async (note?: string) => {
        if (!pending) return;
        setSaving(true);
        const result = await UpdateReturnStatus(pending.order.id_Order, pending.status, note);
        setSaving(false);
        if (!result.success) {
            notify.error(result.error?.error?.code || 'Devolução', result.error?.error?.message || 'Não foi possível atualizar a devolução.');
            return;
        }
        notify.success('Devolução atualizada', `Pedido #${pending.order.number_Order}: ${returnStatusLabels[pending.status]}.`);
        setPending(null);
        LoadNotificationAll();
    };

    return {
        result: { Returns, ReturnsFilter, LoadingReturns, pending, saving },
        action: {
            LoadReturns,
            open: (order: OrderReturnAdmin, status: ReturnStatus) => setPending({ order, status }),
            close: () => !saving && setPending(null),
            confirm,
        },
    };
};
