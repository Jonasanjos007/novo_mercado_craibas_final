import { useEffect, useState } from "react";
import { useStore } from "../context/store";
import { Address } from "../models/Address";
import { useNotification } from "../utils/NotificationCard";
import { AddressService } from "../service/AddressService";
import { UseAddressStore } from "../store/UseAddressStore";
import { UseUserStore } from "../store/UseUserStore";
import { UseCartStore } from "../store/UseCartStore";
import { UseProductStore } from "../store/UseProductStore";

type BrandsControllerReturn = {
    result: {
        Loading: boolean;
    };
    action: {

    }
} | null;

export const useBrandsController = (): BrandsControllerReturn => {
    const { loadProducts } = UseProductStore();
    const notify = useNotification();
    const [Loading, SetLoading] = useState(false);
    useEffect(() => {

        const load = async () => {
            SetLoading(true);
            await GetListProducts();
            SetLoading(false);
        };
        load();
    }, []);
    const GetListProducts = async () => {
        const result = await loadProducts();
        // SetLoading(false);
        if (!result?.success) {
            notify.error(result?.error || "Erro ao carregar produtos", "error");
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


