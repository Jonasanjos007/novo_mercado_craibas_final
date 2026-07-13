import { useEffect, useState } from "react";
import { useStore } from "../context/store";
import { useNotification } from "../utils/NotificationCard";
import { UseUserStore } from "../store/UseUserStore";
import { UseProductStore } from "../store/UseProductStore";
import { UseCartStore } from "../store/UseCartStore";

export const useHomeController = () => {
    const { loadProducts } = UseProductStore();
    const { LoadCartUser } = UseCartStore();
    const { user } = UseUserStore();
    const notify = useNotification();
    const [Loading, SetLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            SetLoading(true);
            await GetListProducts();
            if (user) {
                await GetCartUser();
            }
            SetLoading(false);
        };
        load();
    }, []);
    const GetListProducts = async () => {
        const result = await loadProducts();
        if (!result?.success) {
            notify.error(result?.error || "Erro ao carregar produtos", "error");
        }
    };
    const GetCartUser = async () => {
        await LoadCartUser(user);
    };
    return {
        action: {

        },
        result: {
            Loading
        }

    }
}