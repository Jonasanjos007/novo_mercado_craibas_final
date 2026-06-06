import { useEffect, useState } from "react";
import { ApiService } from "../config/api";
import { useStore } from "../context/store";
import { useNotification } from "../utils/NotificationCard";

export const useHomeController = () => {
    const { getListProducts } = ApiService;
    const { loadProducts, user } = useStore();
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