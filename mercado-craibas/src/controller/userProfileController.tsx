import { useEffect, useState } from "react";
import { useStore } from "../context/store";
import { Address } from "../models/Address";
import { useNotification } from "../utils/NotificationCard";
import { AddressService } from "../service/AddressService";
import { UseAddressStore } from "../store/UseAddressStore";
import { UseUserStore } from "../store/UseUserStore";
import { UseOrderStore } from "../store/UseOrderStore";

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
        NameColorGlobal: string;
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
        setNameColorGlobal: React.Dispatch<React.SetStateAction<string>>;
        SaveCustomizeGlobal: (NameColorGlobal: string) => Promise<void>;
    }
} | null;

export const userProfileController = (): ProfileControllerReturn => {
    const { user, SaveColorGlobal } = UseUserStore();
    const { LoadAddressUser } = UseAddressStore();
    const { LoadOrders } = UseOrderStore();

    const { saveAddress, updateAddress, removerAddress } = UseAddressStore();
    const notify = useNotification();
    const [LoadingProfile, setLoadingProfile] = useState(false);
    const [LoadingMessage, setLoadingMessage] = useState("");
    const [LoadingTitleMessage, setLoadingTitleMessage] = useState("");
    const [cardAddendereco, setcardAddendereco] = useState(false);
    const [IsEditeAddres, setIsEditeAddres] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [NameColorGlobal, setNameColorGlobal] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoadingProfile(true);
            setLoadingMessage("");
            setLoadingTitleMessage("Carreganco...")
            await GetAddressUser();
            await GetListOrders();
            setLoadingProfile(false);
        };

        load();
    }, []);

    const GetAddressUser = async () => {
        const result = await LoadAddressUser();
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar Endereços");
        }
    };
    const GetListOrders = async () => {
        const result = await LoadOrders();
        // SetLoading(false);
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar pedidos");
        }
    };
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
            phone: "",
            name: ''
        });


    const SubmitAddres = async (FormAddres: Address): Promise<boolean> => {
        if (!FormAddres.phone?.trim()) {
            notify.error("Telefone é obrigatório!", "error");
            return false;
        }
        if (!FormAddres.name?.trim()) {
            notify.error("Nome Completo é obrigatório!", "error");
            return false;
        }
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
                notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao salvar o endereço!");
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
                notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao salvar o endereço!");
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
                phone: '',
                name: ''
            });
        }
    }
    const SaveCustomizeGlobal = async (NameColorGlobal: string): Promise<void> => {
        try {
            setLoadingProfile(true);
            setLoadingMessage("Salvando Cor Global");
            setLoadingTitleMessage("Salvando...");
            if (!NameColorGlobal.trim() || !NameColorGlobal.trim()) {
                notify.error("Escolha uma cor!", "error");
            }
            const result = await SaveColorGlobal(NameColorGlobal, user?.id || 0)
            if (!result.success) {
                notify.error(result.error?.error.code || "error", result?.error?.error.message || "Cor não salva Entre em coontato com Suporte!");
            } else {
                notify.success("Sucesso", "Cor salva com sucesso!");
            }
        } catch (err: any) {
            console.log("err", err)
            notify.error(err.data.error || "Erro ao Cor salva", "error");
        } finally {
            setLoadingProfile(false);
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
            openAlert,
            NameColorGlobal
        },
        action: {
            SubmitAddres,
            setAddrForm,
            setcardAddendereco,
            setIsEditeAddres,
            UpdateAddress,
            setOpenDelete,
            DeleteAddres,
            setOpenAlert,
            SaveCustomizeGlobal,
            setNameColorGlobal
        }
    }
}