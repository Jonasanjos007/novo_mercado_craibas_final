import { useEffect, useState } from "react";
import { useStore } from "../context/store";
import { Address } from "../models/Address";
import { useNotification } from "../utils/NotificationCard";
import { AddressService } from "../service/AddressService";
import { UseAddressStore } from "../store/UseAddressStore";
import { UseUserStore } from "../store/UseUserStore";
import { UseCartStore } from "../store/UseCartStore";
import { UseProductStore } from "../store/UseProductStore";
import { UseOrderStore } from "../store/UseOrderStore";

type CategoryControllerReturn = {
    result: {
        Loading: boolean;
    };
    action: {

    }
} | null;

export const useCategoryController = (): CategoryControllerReturn => {
    const { loadProducts } = UseProductStore();
    const { LoadCategory } = UseOrderStore();
    const notify = useNotification();
    const [Loading, SetLoading] = useState(false);
    useEffect(() => {

        const load = async () => {
            SetLoading(true);
            await GetListProducts();
            await GetListCategory();
            SetLoading(false);
        };
        load();
    }, []);
    const GetListProducts = async () => {
        const result = await loadProducts();
        // SetLoading(false);
        if (!result?.success) {
            notify.error(result?.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar produtos");
        }
    };
    const GetListCategory = async () => {
        const result = await LoadCategory();
        // SetLoading(false);
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar Categorias");
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


