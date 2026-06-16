import { useState } from "react";
import { useStore } from "../context/store";
import { Address } from "../models/Address";
import { useNotification } from "../utils/NotificationCard";

type ProfileControllerReturn = {
    result: {
        LoadingProfile: boolean;
        LoadingMessage: string;
        LoadingTitleMessage: string;
    };
    action: {
        SubmitAddres: (FormAddres: Address) => Promise<boolean>;
    }
} | null;

export const userProfileController = (): ProfileControllerReturn => {
    const { saveAddress, user } = useStore();
    const notify = useNotification();
    const [LoadingProfile, setLoadingProfile] = useState(false);
    const [LoadingMessage, setLoadingMessage] = useState("");
    const [LoadingTitleMessage, setLoadingTitleMessage] = useState("");



    const SubmitAddres = async (FormAddres: Address): Promise<boolean> => {
        if (!FormAddres.road?.trim()) {
            notify.error("Rua / Avenida é obrigatório!", "error");
            return false;
        }

        if (!FormAddres.number) {
            notify.error("Número é obrigatório!", "error");
            return false;
        }

        if (!FormAddres.neighborhood?.trim()) {
            notify.error("Bairro é obrigatório!", "error");
            return false;
        }

        if (!FormAddres.city?.trim()) {
            notify.error("Cidade é obrigatória!", "error");
            return false;
        }

        if (!FormAddres.state?.trim()) {
            notify.error("Estado é obrigatório!", "error");
            return false;
        }

        try {
            setLoadingProfile(true);
            setLoadingMessage("Salvando Endereço");
            setLoadingTitleMessage("Salvando");

            const result = await saveAddress(FormAddres, user?.id || 0);

            if (!result?.success) {
                notify.error(result?.error || "Erro ao salvar o endereço!", "error");
                return false;
            }
            notify.success("Sucesso", "Endereço cadastrado com sucesso!");
            return true;
        } catch {
            notify.error("Erro ao salvar em API!", "error");
            return false;
        } finally {
            setLoadingProfile(false);
        }
    };
    return {
        result: {
            LoadingProfile,
            LoadingMessage,
            LoadingTitleMessage
        },
        action: {
            SubmitAddres,

        }
    }
}