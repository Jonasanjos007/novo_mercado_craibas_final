import { useEffect, useState } from "react";
import { useStore } from "../context/store";
import { Address } from "../models/Address";
import { useNotification } from "../utils/NotificationCard";
import { AddressService } from "../service/AddressService";
import { UseAddressStore } from "../store/UseAddressStore";
import { UseUserStore } from "../store/UseUserStore";
import { UseCartStore } from "../store/UseCartStore";
import { UseProductStore } from "../store/UseProductStore";
import { UseUserAdminStore } from "../storeAdmin/UseUserAdminStore";
import { BaseRatesInterface, InfoSiteInterface } from "../models/User";
import { TaxasBases } from "../models/SiteBases";

type BrandsControllerReturn = {
    result: {
        settingsFormSite: Partial<InfoSiteInterface>;
        LoadingSentts: boolean;
        Loading: boolean;
        LoadingTaxas: boolean;
        infoErrors: Record<string, string>;
        taxasErrors: Record<string, string>;
        BaseRatesFormSite: Partial<BaseRatesInterface>;
    };
    action: {
        handleSaveInfoSite: () => void;
        handleUpdateTaxasBases: () => void;
        SetLoading: React.Dispatch<React.SetStateAction<boolean>>;
        SetLoadingSentts: React.Dispatch<React.SetStateAction<boolean>>;
        setSettingsFormSite: React.Dispatch<React.SetStateAction<Partial<InfoSiteInterface>>>;
        setBaseRatesFormSite: React.Dispatch<React.SetStateAction<Partial<BaseRatesInterface>>>;
    }
} | null;

export const useSiteSettingsController = (): BrandsControllerReturn => {
    const notify = useNotification();
    const [infoErrors, setInfoErrors] = useState<Record<string, string>>({});
    const [taxasErrors, setTaxasErrors] = useState<Record<string, string>>({});
    const { PostUpdateInfoSiteStore, BaseSiteInterface, getBaseSiteAdmin, PostUpdateTaxasBasesStore } = UseUserAdminStore();
    const [LoadingSentts, SetLoadingSentts] = useState(false);
    const [LoadingTaxas, SetLoadingTaxas] = useState(false);

    const [Loading, SetLoading] = useState(false);

    const [settingsFormSite, setSettingsFormSite] = useState<Partial<InfoSiteInterface>>({});
    const [BaseRatesFormSite, setBaseRatesFormSite] = useState<Partial<BaseRatesInterface>>({});

    useEffect(() => {

        const load = async () => {
            SetLoading(true);
            await getBaseSiteAdmin();
            SetLoading(false);
        };



        load();
    }, []);

    useEffect(() => {

        if (BaseSiteInterface) {
            setSettingsFormSite({
                storeName: BaseSiteInterface.storeName,
                storeLogo: BaseSiteInterface.storeImage,
                storeLogoIcone: BaseSiteInterface.storeImageIcone,
            });
            setBaseRatesFormSite({
                shippingCost: BaseSiteInterface.shippingCost,
                timeframeBusinessDays: BaseSiteInterface.timeframeBusinessDays
            });
        }
    }, [BaseSiteInterface]);


    const handleSaveInfoSite = async () => {
        SetLoadingSentts(true);
        try {
            const errors: Record<string, string> = {};

            if (!settingsFormSite?.storeName) {
                errors["storeName"] = "Informe o nome da loja.";
            }
            if (!settingsFormSite?.storeLogo && !settingsFormSite?.storeImageFile) {
                errors["storeLogo"] = "Informe a Imagem do site.";
            }
            if (!settingsFormSite?.storeLogoIcone && !settingsFormSite?.storeImageIconeFile) {
                errors["storeLogoIcone"] = "Informe a Icone do site.";
            }

            setInfoErrors(errors);

            if (Object.keys(errors).length > 0) {
                return;
            }
            const formData = new FormData();

            formData.append("StoreName", String(settingsFormSite?.storeName ?? ""));

            if (settingsFormSite?.storeImageFile) {
                formData.append("StoreImage", settingsFormSite.storeImageFile);
            }

            if (settingsFormSite.storeImageIconeFile) {
                formData.append("StoreImageIcone", settingsFormSite.storeImageIconeFile);
            }
            for (const [key, value] of formData.entries()) {
                console.log('formData.entries', key, value);
            }
            const result = await PostUpdateInfoSiteStore(formData);

            if (!result.success) {
                notify.error((result.error?.error.code ?? "error"), (result.error?.error.message || "Erro ao salvar produto"));
                return;
            }

            notify.success("success", "Informações salva com sucesso!");
        } finally {
            SetLoadingSentts(false);
        }

    };

    const handleUpdateTaxasBases = async () => {
        SetLoadingTaxas(true);

        try {
            const errors: Record<string, string> = {};

            if (BaseRatesFormSite?.shippingCost === undefined || BaseRatesFormSite.shippingCost < 5) {
                errors["shippingCost"] = "O valor mínimo do frete é R$ 5,00.";
            }

            if (BaseRatesFormSite?.timeframeBusinessDays === undefined || BaseRatesFormSite.timeframeBusinessDays <= 0) {
                errors["timeframeBusinessDays"] = "Informe o prazo em dias úteis.";
            }

            setTaxasErrors(errors);

            if (Object.keys(errors).length > 0) {
                return;
            }

            const data: TaxasBases = {
                shippingCost: BaseRatesFormSite.shippingCost,
                timeframeBusinessDays: BaseRatesFormSite.timeframeBusinessDays,
            };

            const result = await PostUpdateTaxasBasesStore(data);

            if (!result.success) {
                notify.error(result.error?.error.code ?? "error", result.error?.error.message || "Erro ao salvar taxas");
                return;
            }

            notify.success("success", "Taxas salvas com sucesso!");
        } finally {
            SetLoadingTaxas(false);
        }
    };

    return {
        result: {
            settingsFormSite,
            Loading,
            LoadingSentts,
            infoErrors,
            BaseRatesFormSite,
            taxasErrors,
            LoadingTaxas
        },
        action: {
            SetLoading,
            handleSaveInfoSite,
            setSettingsFormSite,
            SetLoadingSentts,
            setBaseRatesFormSite,
            handleUpdateTaxasBases
        }
    }
}



