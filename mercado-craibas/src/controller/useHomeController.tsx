import { useEffect, useState } from "react";
import { useStore } from "../context/store";
import { useNotification } from "../utils/NotificationCard";
import { UseUserStore } from "../store/UseUserStore";
import { UseProductStore } from "../store/UseProductStore";

export const useHomeController = () => {
    const { loadProducts } = UseProductStore();
    const { user } = UseUserStore();
    const notify = useNotification();
    const [Loading, SetLoading] = useState(false);

    useEffect(() => {
        SetLoading(true);
        const Response = async () => {
            const result = await loadProducts(user);
            SetLoading(false);
            if (!result?.success) {
                notify.error(result?.error || "Erro ao carregar produtos", "error");
            }
        };
        Response();
    }, []);
    return {
        action: {

        },
        result: {
            Loading
        }

    }
}