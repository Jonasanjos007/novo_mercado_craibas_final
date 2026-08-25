import { useEffect, useState } from "react";
import { useStore } from "../context/store";
import { useNotification } from "../utils/NotificationCard";
import { UseUserStore } from "../store/UseUserStore";
import { UseProductStore } from "../store/UseProductStore";
import { UseCartStore } from "../store/UseCartStore";
import { UseOrderStore } from "../store/UseOrderStore";

export const useHomeController = () => {
    const { loadProducts, products } = UseProductStore();
    const { LoadCartUser, cart } = UseCartStore();
    const { LoadCupons, Cupons } = UseOrderStore();
    const { user } = UseUserStore();
    const notify = useNotification();
    const [Loading, SetLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            SetLoading(true);
            await GetListProducts();
            if (user) {
                if (cart) {
                    await GetCartUser();
                }
            }
            await GetLoadCupons();
            SetLoading(false);
        };
        load();
    }, []);
    const GetListProducts = async () => {
        const result = await loadProducts();
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar produtos");
        }
    };
    const GetCartUser = async () => {
        const result = await LoadCartUser(user);
        if (user?.role === "CLIENTE") {
            if (!result?.success) {
                notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar Carrinho!");
            }
        }
    };
    const GetLoadCupons = async () => {
        const result = await LoadCupons();
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar Cupons!");
        }
    };

    return {
        action: {

        },
        result: {
            Loading
        }

    }
}