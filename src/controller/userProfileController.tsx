import { useEffect, useState } from "react";
import { useStore } from "../context/store";
import { Address } from "../models/Address";
import { useNotification } from "../utils/NotificationCard";
import { AddressService } from "../service/AddressService";
import { UseAddressStore } from "../store/UseAddressStore";
import { UseUserStore } from "../store/UseUserStore";
import { UseOrderStore } from "../store/UseOrderStore";
import { ChangePassword, UserProfile } from "../models/User";
import { UseProductStore } from "../store/UseProductStore";
import { RatingResponse } from "../models/OrderSave";
import { Product } from "../models/Product";

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
        form: FormData;
        avatarFile: File | null;
        profileErrors: Partial<Record<keyof UserProfile, string>>;
        passwordErrors: Partial<Record<keyof ChangePassword, string>>;
        removingFavoriteId: number | null;
        reviewDetailsTarget: boolean;
        assessmentResponse: RatingResponse;
        Loading: boolean;
        passwordForm: ChangePassword;
        LoadingPassword: boolean;
    };
    action: {
        SubmitAddres: (FormAddres: Address) => Promise<boolean>;
        setAddrForm: React.Dispatch<React.SetStateAction<Address>>;
        setcardAddendereco: React.Dispatch<React.SetStateAction<boolean>>;
        setIsEditeAddres: React.Dispatch<React.SetStateAction<boolean>>;
        setOpenDelete: React.Dispatch<React.SetStateAction<boolean>>;
        setReviewDetailsTarget: React.Dispatch<React.SetStateAction<boolean>>;

        UpdateAddress: (FormAddres: Address) => Promise<boolean>;
        handleGetAssents: (IdOrder: number, IdProduct: number) => void;
        setAssessmentResponse: React.Dispatch<React.SetStateAction<RatingResponse>>;
        removeFavorite: (productId?: number) => void;

        DeleteAddres: (Address: Address) => Promise<boolean>;
        handleSaveProfile: () => void;
        handleChangePassword: () => void;
        setOpenAlert: React.Dispatch<React.SetStateAction<boolean>>;
        setForm: React.Dispatch<React.SetStateAction<FormData>>;
        setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>;
        setRemovingFavoriteId: React.Dispatch<React.SetStateAction<number | null>>;


        setNameColorGlobal: React.Dispatch<React.SetStateAction<string>>;
        setPasswordForm: React.Dispatch<React.SetStateAction<ChangePassword>>;

        SaveCustomizeGlobal: (NameColorGlobal: string) => Promise<void>;
    }
} | null;
type FormData = {
    name: string;
    email: string;
    phone: number;
};
export const userProfileController = (): ProfileControllerReturn => {
    const { user, SaveColorGlobal, updateProfile, LoadUser, SaveChangePassword } = UseUserStore();
    const { LoadAddressUser } = UseAddressStore();
    const { LoadOrders, GetRating, orders } = UseOrderStore();
    const { GetfavoriteAll, DeleteOneFavorite, products } = UseProductStore();
    const [removingFavoriteId, setRemovingFavoriteId] = useState<number | null>(null);
    const { saveAddress, updateAddress, removerAddress } = UseAddressStore();
    const notify = useNotification();
    const [LoadingProfile, setLoadingProfile] = useState(false);
    const [LoadingMessage, setLoadingMessage] = useState("");
    const [LoadingTitleMessage, setLoadingTitleMessage] = useState("");
    const [cardAddendereco, setcardAddendereco] = useState(false);
    const [IsEditeAddres, setIsEditeAddres] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [Loading, SetLoading] = useState(false);
    const [LoadingPassword, setLoadingPassword] = useState(false);

    const [reviewDetailsTarget, setReviewDetailsTarget] = useState<boolean>(false);

    const [NameColorGlobal, setNameColorGlobal] = useState("");
    const [form, setForm] = useState<FormData>({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? 0,
    });
    const [passwordForm, setPasswordForm] = useState<ChangePassword>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [assessmentResponse, setAssessmentResponse] = useState<RatingResponse>({
        id: 0,
        id_Product: 0,
        id_Order: 0,
        id_user_Customer: 0,
        ranting: 0,
        comment: '',
        media: '',
        recommend: false,
        isDelete: false,
        product: {} as Product,
        numberOrder: ''
    });
    const [profileErrors, setProfileErrors] = useState<Partial<Record<keyof UserProfile, string>>>({});
    const [passwordErrors, setPasswordErrors] = useState<Partial<Record<keyof ChangePassword, string>>>({});

    useEffect(() => {
        const load = async () => {
            setLoadingProfile(true);
            setLoadingMessage("");
            setLoadingTitleMessage("Carreganco...")
            await GetAddressUser();
            await GetListOrders();
            await LoadUser();
            await GetListFavorites();
            setLoadingProfile(false);
        };

        load();
    }, []);
    const GetListFavorites = async () => {
        const result = await GetfavoriteAll();
        console.log("result.data", result.data);
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar Favoritos");
        }
    };
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

    };
    const validateProfile = () => {
        const errors: Partial<Record<keyof UserProfile, string>> = {};
        const phoneDigits = String(form.phone).replace(/\D/g, '');
        if (!form.email?.trim())
            errors.email = 'Informe o Email!';

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errors.email = 'Informe o Email valido!';
        }

        if (!form.name?.trim())
            errors.name = 'Informe Seu Nome!';

        if (!form.phone)
            errors.phone = 'Informe seu numero!';

        if (phoneDigits && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
            errors.phone = 'Informe seu numero valido!';
        }
        setProfileErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSaveProfile = async () => {

        try {
            setLoadingProfile(true);
            if (!validateProfile()) return;

            const formData = new FormData();

            formData.append('Email', String(form?.email ?? 0));
            formData.append("Name", form.name?.trim() ?? "");
            formData.append('Phone', String(form.phone) ?? '');
            formData.append('Avatar', avatarFile || '');

            const result = await updateProfile(formData);
            if (!result.success) {
                notify.error(result.error?.error?.code ?? 'Perfil', result.error?.error?.message ?? 'Erro ao Salvar Perfil!');
                return;
            }

            notify.success('success', 'Perfil atualizado com sucesso!');
        } finally {
            setLoadingProfile(false);
        }
    };
    const removeFavorite = async (productId?: number) => {
        if (!productId) return;
        setRemovingFavoriteId(productId);
        const result = await DeleteOneFavorite(productId);
        if (!result.success) {
            notify.error(result.error?.error?.code ?? 'Favoritos', result.error?.error?.message ?? 'Erro ao Remover dos favoritos!');
            return;
        }

        notify.success('success', 'Produto removido com sucesso!');
        setRemovingFavoriteId(null);

    };
    const handleGetAssents = async (IdOrder: number, IdProduct: number) => {
        if (!IdOrder) {
            notify.error("Error", "Pedido Inválido!");
            SetLoading(false);
            return false;
        }
        if (!IdProduct) {
            notify.error("Error", "Produto Inválido!");
            SetLoading(false);
            return false;
        }
        const result = await GetRating(IdProduct, IdOrder)
        if (!result.success) {
            notify.error(result.error?.error.code || 'Buscar Avaliação', result.error?.error.message || 'erro ao buscar avaliação');
            SetLoading(false);
            return false;
        }
        const objeto = result.data;
        setAssessmentResponse(
            {
                id: objeto?.id || 0,
                id_Product: objeto?.id_Product ?? 0,
                id_Order: objeto?.id_Order ?? 0,
                id_user_Customer: objeto?.id_user_Customer ?? 0,
                ranting: objeto?.ranting ?? 0,
                comment: objeto?.comment ?? '',
                media: objeto?.media ?? '',
                recommend: objeto?.recommend ?? false,
                isDelete: objeto?.isDelete ?? false,
                updateDate: objeto?.updateDate,
                insertDate: objeto?.insertDate,
                product: products.filter(item => item.id == objeto?.id_Product)[0] ?? {} as Product,
                numberOrder: orders.filter(item => item.id_Order == objeto?.id_Order)[0].number_Order ?? ''
            }
        );
        setReviewDetailsTarget(true);
        SetLoading(false);
        return true;
    };
    const validatePassword = () => {
        const errors: {
            currentPassword?: string;
            newPassword?: string;
            confirmPassword?: string;
        } = {};

        const currentPassword = passwordForm.currentPassword?.trim() ?? '';
        const newPassword = passwordForm.newPassword ?? '';
        const confirmPassword = passwordForm.confirmPassword ?? '';

        // Senha atual
        if (!currentPassword) {
            errors.currentPassword = 'Informe sua senha atual!';
        }

        // Nova senha
        if (!newPassword.trim()) {
            errors.newPassword = 'Informe uma nova senha!';
        }

        // Confirmação
        if (!confirmPassword.trim()) {
            errors.confirmPassword = 'Confirme sua nova senha!';
        }

        // Se já existe senha nova, fazer as demais validações
        if (newPassword) {

            // Mínimo de 8 caracteres
            if (newPassword.length < 8) {
                errors.newPassword = 'A nova senha deve possuir pelo menos 8 caracteres!';
            }

            // Maiúscula
            const temMaiuscula = /[A-Z]/.test(newPassword);

            // Minúscula
            const temMinuscula = /[a-z]/.test(newPassword);

            // Número
            const temNumero = /[0-9]/.test(newPassword);

            if (!temMaiuscula || !temMinuscula || !temNumero) {
                errors.newPassword = 'A senha deve conter letras maiúsculas, minúsculas e números!';
            }

            // Senha nova diferente da atual
            if (currentPassword && newPassword === currentPassword) {
                errors.newPassword = 'A nova senha deve ser diferente da senha atual!';
            }

            // Senhas coincidem
            if (confirmPassword && newPassword !== confirmPassword) {
                errors.confirmPassword =
                    'As senhas não coincidem!';
            }

            // Senhas fracas
            const senhasFracas = [
                '12345678',
                '123456789',
                '1234567890',
                'password',
                'password123',
                'qwerty123',
                'senha123',
                'senha1234',
                'admin123'
            ];

            if (senhasFracas.includes(newPassword.toLowerCase())) {
                errors.newPassword = 'Essa senha é muito fácil de descobrir. Escolha uma senha mais forte!';
            }
        }

        setPasswordErrors(errors);

        return Object.keys(errors).length === 0;
    };
    const handleChangePassword = async () => {
        try {
            setLoadingPassword(true);

            // Validação antes de enviar
            if (!validatePassword()) {
                return;
            }

            const result = await SaveChangePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword,
            });

            if (!result.success) {
                notify.error(result.error?.error?.code ?? 'Senha', result.error?.error?.message ?? 'Erro ao alterar senha!');
                return;
            }

            notify.success('Sucesso', 'Senha alterada com sucesso!');

            // Limpar formulário depois de alterar
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            setPasswordErrors({});

        } finally {
            setLoadingPassword(false);
        }
    };
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
            NameColorGlobal,
            form,
            avatarFile,
            profileErrors,
            removingFavoriteId,
            reviewDetailsTarget,
            assessmentResponse,
            Loading,
            passwordForm,
            passwordErrors,
            LoadingPassword
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
            setNameColorGlobal,
            setForm,
            setAvatarFile,
            handleSaveProfile,
            setRemovingFavoriteId,
            removeFavorite,
            handleGetAssents,
            setReviewDetailsTarget,
            setAssessmentResponse,
            handleChangePassword,
            setPasswordForm
        }
    }
}