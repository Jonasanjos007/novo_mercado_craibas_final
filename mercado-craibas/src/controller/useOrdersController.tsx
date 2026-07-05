import { useEffect, useState } from "react";
import { useNotification } from "../utils/NotificationCard";
import { UseOrderStore } from "../store/UseOrderStore";

type OrdersControllerReturn = {
    result: {
        Loading: boolean;
    };
    action: {

    }
} | null;

export const useOrdersController = (): OrdersControllerReturn => {
    const { LoadOrders } = UseOrderStore();
    const notify = useNotification();
    const [Loading, SetLoading] = useState(false);
    useEffect(() => {

        const load = async () => {
            SetLoading(true);
            await GetListOrders();
            SetLoading(false);
        };
        load();
    }, []);
    const GetListOrders = async () => {
        const result = await LoadOrders();
        // SetLoading(false);
        if (!result?.success) {
            notify.error(result?.error || "Erro ao carregar pedidos", "error");
        }
    };

    return {
        result: {
            Loading
        },
        action: {

        }
    }
}


