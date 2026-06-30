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

type CheckoutControllerReturn = {
    result: {
        Loading: boolean;
        AddressStandard: Address | undefined;
    };
    action: {

    }
} | null;

export const useCheckoutController = (): CheckoutControllerReturn => {
    const { LoadCartUser } = UseCartStore();
    const { loadProducts } = UseProductStore();
    const { LoadCupons, Cupons } = UseOrderStore();

    const { LoadAddressUser, address } = UseAddressStore();
    const AddressStandard = address.find(p => p.standard === Boolean(true));

    const notify = useNotification();
    const { user } = UseUserStore();
    const [Loading, SetLoading] = useState(false);

    useEffect(() => {

        const load = async () => {
            SetLoading(true);
            await GetListProducts();
            await GetCartUser();
            await GetAddressUser();
            await GetListCupom();
            SetLoading(false);

        };
        load();
    }, []);


    const GetListCupom = async () => {
        const result = await LoadCupons();
        // SetLoading(false);
        if (!result?.success) {
            notify.error(result?.error || "Erro ao carregar produtos", "error");
        }
    };
    const GetListProducts = async () => {
        const result = await loadProducts();
        // SetLoading(false);
        if (!result?.success) {
            notify.error(result?.error || "Erro ao carregar produtos", "error");
        }
    };
    const GetCartUser = async () => {
        const result = await LoadCartUser(user);
        if (!result?.success) {
            notify.error(result?.error || "Erro ao carregar Carrinho", "error");
        }
    };
    const GetAddressUser = async () => {
        const result = await LoadAddressUser();
        if (!result?.success) {
            notify.error(result?.error || "Erro ao carregar Endereços", "error");
        }
    };
    return {
        result: {
            Loading,
            AddressStandard
        },
        action: {

        }
    }
}


