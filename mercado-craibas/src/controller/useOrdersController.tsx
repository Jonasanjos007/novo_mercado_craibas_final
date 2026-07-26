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
    const { LoadOrders, LoadCupons } = UseOrderStore();
    const notify = useNotification();
    const [Loading, SetLoading] = useState(false);
    useEffect(() => {

        const load = async () => {
            SetLoading(true);
            await GetListOrders();
            await GetListCupom();
            SetLoading(false);
        };
        load();
    }, []);
    const GetListOrders = async () => {
        const result = await LoadOrders();
        // SetLoading(false);
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar pedidos");
        }
    };
    const GetListCupom = async () => {
        const result = await LoadCupons();
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar produtos");
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


