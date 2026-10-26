import { useState } from "react";
import { Order } from "../models/Order";
import { UseOrderStore } from "../store/UseOrderStore";
import { UseNotificationAdmin } from "../storeAdmin/UseNotificationAdmin";
import { useNotification } from "../utils/NotificationCard";
import { RETURN_WINDOW_DAYS } from "../utils";

/** Regras da tela (o servidor confere tudo de novo). */
export const canCancelOrder = (order: Order) => {
    const status = (order.order_Status ?? '').toUpperCase();
    return status === 'PENDENTE' || status === 'CONFIRMADO';
};

/** Prazo final para pedir devolução (7 dias após a entrega). */
export const returnDeadline = (order: Order): Date | null => {
    if ((order.order_Status ?? '').toUpperCase() !== 'ENTREGUE') return null;
    if (order.return_Deadline) return new Date(order.return_Deadline);
    if (order.customerDeliveryDate) {
        const d = new Date(order.customerDeliveryDate);
        d.setDate(d.getDate() + RETURN_WINDOW_DAYS);
        return d;
    }
    return null;
};

export const canRequestReturn = (order: Order) => {
    if (order.return_Status) return false;
    const deadline = returnDeadline(order);
    return !!deadline && deadline.getTime() >= Date.now();
};

/** Cancelar pedido e pedir devolução (Meus pedidos e Perfil). */
export const useOrderAfterSaleController = () => {
    const notify = useNotification();
    const { CancelOrderUser, RequestReturnUser } = UseOrderStore();
    const { LoadNotificationAll } = UseNotificationAdmin();

    const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
    const [returnTarget, setReturnTarget] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);

    const confirmCancel = async (reason?: string) => {
        if (!cancelTarget) return;
        setLoading(true);
        const result = await CancelOrderUser(cancelTarget.id_Order, reason ?? '');
        setLoading(false);
        if (!result.success) {
            notify.error(result.error?.error?.code || 'Pedido', result.error?.error?.message || 'Não foi possível cancelar o pedido.');
            return;
        }
        const paid = (cancelTarget.order_Status ?? '').toUpperCase() === 'CONFIRMADO';
        notify.success('Pedido cancelado', paid ? 'O valor pago será estornado na mesma forma de pagamento.' : 'Seu pedido foi cancelado.');
        setCancelTarget(null);
        LoadNotificationAll();
    };

    const confirmReturn = async (reason?: string) => {
        if (!returnTarget) return;
        setLoading(true);
        const result = await RequestReturnUser(returnTarget.id_Order, reason ?? '');
        setLoading(false);
        if (!result.success) {
            notify.error(result.error?.error?.code || 'Devolução', result.error?.error?.message || 'Não foi possível pedir a devolução.');
            return;
        }
        notify.success('Devolução solicitada', 'Vamos entrar em contato pelo WhatsApp para combinar a coleta.');
        setReturnTarget(null);
        LoadNotificationAll();
    };

    return {
        result: { cancelTarget, returnTarget, loading },
        action: {
            openCancel: setCancelTarget,
            openReturn: setReturnTarget,
            closeCancel: () => !loading && setCancelTarget(null),
            closeReturn: () => !loading && setReturnTarget(null),
            confirmCancel,
            confirmReturn,
        },
    };
};
