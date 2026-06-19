import { useState } from "react";
import { useStore } from "../context/store";
import { Address } from "../models/Address";
import { useNotification } from "../utils/NotificationCard";
import { AddressService } from "../service/AddressService";

type ProfileControllerReturn = {
    result: {
        LoadingProfile: boolean;
        LoadingMessage: string;
        LoadingTitleMessage: string;
        addrForm: Address;
        cardAddendereco: boolean;
        IsEditeAddres: boolean;
        openDelete: boolean;
        openAlert: boolean;
    };
    action: {
        SubmitAddres: (FormAddres: Address) => Promise<boolean>;
        setAddrForm: React.Dispatch<React.SetStateAction<Address>>;
        setcardAddendereco: React.Dispatch<React.SetStateAction<boolean>>;
        setIsEditeAddres: React.Dispatch<React.SetStateAction<boolean>>;
        setOpenDelete: React.Dispatch<React.SetStateAction<boolean>>;
        UpdateAddress: (FormAddres: Address) => Promise<boolean>;
        DeleteAddres: (Address: Address) => Promise<boolean>;
        setOpenAlert: React.Dispatch<React.SetStateAction<boolean>>;

    }
} | null;

export const userProfileController = (): ProfileControllerReturn => {
    const { saveAddress, user, updateAddress, removerAddress } = useStore();
    const notify = useNotification();
    const [LoadingProfile, setLoadingProfile] = useState(false);
    const [LoadingMessage, setLoadingMessage] = useState("");
    const [LoadingTitleMessage, setLoadingTitleMessage] = useState("");
    const [cardAddendereco, setcardAddendereco] = useState(false);
    const [IsEditeAddres, setIsEditeAddres] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);


    const [addrForm, setAddrForm] = useState<Address>(
        {
            road: '',
            number: 0,
            supplement: '',
            neighborhood: '',
            city: '',
            state: '',
            referencePoint: '',
            standard: false,
        });


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
            setLoadingTitleMessage("Salvando...");

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

    const UpdateAddress = async (FormAddres: Address): Promise<boolean> => {
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
            setLoadingMessage("Editando Endereço");
            setLoadingTitleMessage("Editando...");

            const result = await updateAddress(FormAddres);
            if (!result?.success) {
                notify.error(result?.error || "Erro ao salvar o endereço!", "error");
                return false;
            }
            notify.success("Sucesso", "Endereço Editado com sucesso!");
            return true;
        } catch {
            notify.error("Erro ao Editar em API!", "error");
            return false;
        } finally {
            setLoadingProfile(false);

        }
    }

    const DeleteAddres = async (Address: Address): Promise<boolean> => {
        try {
            setLoadingProfile(true);
            setLoadingMessage("Removendo Endereço");
            setLoadingTitleMessage("Removendo...");

            const result = await removerAddress(Address);
            console.log("result____", result);

            if (result?.error?.data.code == "Padrão" && !result.success) {
                setLoadingTitleMessage("Atenção");
                setLoadingMessage(result.error.data.message);
                setOpenAlert(true);
                return false;
            }
            if (!result.success) {
                notify.error("Error", result.error?.data.message);
                return false;
            }
            notify.success("Sucesso", "Endereço Removido com sucesso!");
            return true;
        } catch (err: any) {
            console.log("err", err)
            notify.error(err.data.error || "Erro ao Remover o endereço!", "error");
            return false;
        } finally {
            setLoadingProfile(false);
            setAddrForm({
                road: '',
                number: 0,
                supplement: '',
                neighborhood: '',
                city: '',
                state: '',
                referencePoint: '',
                standard: false,
            });
        }
    }

    return {
        result: {
            LoadingProfile,
            LoadingMessage,
            LoadingTitleMessage,
            addrForm,
            cardAddendereco,
            IsEditeAddres,
            openDelete,
            openAlert
        },
        action: {
            SubmitAddres,
            setAddrForm,
            setcardAddendereco,
            setIsEditeAddres,
            UpdateAddress,
            setOpenDelete,
            DeleteAddres,
            setOpenAlert
        }
    }
}