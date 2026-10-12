import { useEffect, useState } from "react";
import { UseUserAdminStore } from "../storeAdmin/UseUserAdminStore";
import { AdminCreatableRole, AdminCreateUser, UserFilter } from "../models/User";
import { useNotification } from "../utils/NotificationCard";
import { validatePasswordPolicy } from "../utils/passwordPolicy";

/** Depois de confirmar a senha, não pede de novo por 10 minutos (igual ao servidor). */
const REAUTH_WINDOW_MS = 10 * 60 * 1000;

type CreateField = keyof Omit<AdminCreateUser, 'adminPassword'>;
type CreateErrors = Partial<Record<CreateField, string>>;

const emptyCreateForm: AdminCreateUser = {
    name: '',
    email: '',
    confirmEmail: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'DELIVERY',
    transport: '',
};

/** (82) 99999-9999 enquanto digita. */
export const formatPhoneInput = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : '';
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

/** Código de erro do servidor → campo do formulário. */
const serverFieldByCode: Record<string, CreateField> = {
    Nome: 'name',
    Email: 'email',
    Telefone: 'phone',
    Transporte: 'transport',
    Senha: 'password',
    Tipo: 'role',
};

type UsersAdminControllerReturn = {
    result: {
        userFilter: UserFilter;
        statusFilter: 'all' | 'ativo' | 'inactive';
        Loading: boolean;
        ShowDeleteUser: boolean;
        showCouponModalActive: boolean;
        openMenu: string | null;
        TitleCOnfirm: string;
        DescriptionConfirm: string;
        ButtonConfirm: string;
        showCreateModal: boolean;
        createForm: AdminCreateUser;
        createErrors: CreateErrors;
        creating: boolean;
        adminPasswordOpen: boolean;
        adminPasswordError: string;
    };
    action: {
        SetLoading: React.Dispatch<React.SetStateAction<boolean>>;
        setUserFilter: React.Dispatch<React.SetStateAction<UserFilter>>;
        setStatusFilter: React.Dispatch<React.SetStateAction<'all' | 'ativo' | 'inactive'>>;
        SetTitleCOnfirm: React.Dispatch<React.SetStateAction<string>>;
        SetDescriptionConfirm: React.Dispatch<React.SetStateAction<string>>;
        SetButtonConfirm: React.Dispatch<React.SetStateAction<string>>;
        setOpenMenu: React.Dispatch<React.SetStateAction<string | null>>;
        setShowCouponModalActive: React.Dispatch<React.SetStateAction<boolean>>;
        setShowDeleteUser: React.Dispatch<React.SetStateAction<boolean>>;
        setRoleFilter: (role: UserFilter) => void;
        handleDesactivUSer: (IdUserNumber: number, Role: string, activ: boolean) => void;
        openCreate: () => void;
        closeCreate: () => void;
        setCreateField: (field: CreateField, value: string) => void;
        setCreateRole: (role: AdminCreatableRole) => void;
        handleCreateUser: () => Promise<void>;
        confirmAdminPassword: (password?: string) => Promise<void>;
        cancelAdminPassword: () => void;
    }
} | null;

export const useUserAdminController = (): UsersAdminControllerReturn => {
    const { getUser, UserAllAdmin, PostUpdateDesactiv, CreateUser } = UseUserAdminStore();
    const [Loading, SetLoading] = useState(false);
    const [userFilter, setUserFilter] = useState<UserFilter>('ALL');
    const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'inactive'>('all');
    const notify = useNotification();
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [showCouponModalActive, setShowCouponModalActive] = useState(false);
    const [ShowDeleteUser, setShowDeleteUser] = useState(false);
    const [TitleCOnfirm, SetTitleCOnfirm] = useState<string>('');
    const [DescriptionConfirm, SetDescriptionConfirm] = useState<string>('');
    const [ButtonConfirm, SetButtonConfirm] = useState<string>('');

    // Novo usuário
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState<AdminCreateUser>(emptyCreateForm);
    const [createErrors, setCreateErrors] = useState<CreateErrors>({});
    const [creating, setCreating] = useState(false);
    const [adminPasswordOpen, setAdminPasswordOpen] = useState(false);
    const [adminPasswordError, setAdminPasswordError] = useState('');
    const [reauthUntil, setReauthUntil] = useState(0);

    useEffect(() => {
        const load = async () => {
            SetLoading(true);
            await getUser();
            SetLoading(false);
        };
        load();
    }, []);
    const handleDesactivUSer = async (IdUserNumber: number, Role: string, activ: boolean) => {
        SetLoading(true);
        try {

            const result = await PostUpdateDesactiv(IdUserNumber, Role);

            if (!result.success) {
                notify.info(result.error?.error.code || "Erro", result.error?.error.message || "Erro inrsperado!");
                return;
            }
            notify.success("Usuário", result.data + " com Sucesso" || "Sucesso");
            setOpenMenu(null);
        } finally {
            SetLoading(false);
            setShowCouponModalActive(false);
        }

    };
    /* ───────────── Novo usuário ───────────── */

    const openCreate = () => {
        setCreateForm(emptyCreateForm);
        setCreateErrors({});
        setShowCreateModal(true);
    };

    const closeCreate = () => {
        if (creating) return;
        setShowCreateModal(false);
        setAdminPasswordOpen(false);
        setAdminPasswordError('');
    };

    const setCreateField = (field: CreateField, value: string) => {
        setCreateForm((form) => ({ ...form, [field]: field === 'phone' ? formatPhoneInput(value) : value }));
        setCreateErrors((errors) => ({ ...errors, [field]: undefined }));
    };

    const setCreateRole = (role: AdminCreatableRole) => {
        setCreateForm((form) => ({ ...form, role, transport: role === 'DELIVERY' ? form.transport : '' }));
        setCreateErrors((errors) => ({ ...errors, role: undefined, transport: undefined }));
    };

    const validateCreate = (): boolean => {
        const f = createForm;
        const errors: CreateErrors = {};
        const email = f.email.trim().toLowerCase();
        const phoneDigits = f.phone.replace(/\D/g, '');

        if (f.name.trim().length < 3) errors.name = 'Informe o nome completo.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Informe um e-mail válido.';
        if (!errors.email && f.confirmEmail.trim().toLowerCase() !== email) errors.confirmEmail = 'Os e-mails não são iguais.';
        if (phoneDigits.length < 10 || phoneDigits.length > 11) errors.phone = 'Informe um telefone válido com DDD.';
        if (f.role === 'DELIVERY' && (f.transport ?? '').trim().length < 2) errors.transport = 'Informe o meio de transporte.';

        const passwordError = validatePasswordPolicy(f.password);
        if (passwordError) errors.password = passwordError;
        else if (f.confirmPassword !== f.password) errors.confirmPassword = 'As senhas não coincidem.';

        setCreateErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const submitCreate = async (adminPassword?: string) => {
        setCreating(true);
        try {
            const result = await CreateUser({
                ...createForm,
                name: createForm.name.trim(),
                email: createForm.email.trim().toLowerCase(),
                confirmEmail: createForm.confirmEmail.trim().toLowerCase(),
                transport: createForm.role === 'DELIVERY' ? createForm.transport?.trim() : undefined,
                adminPassword,
            });

            if (!result.success) {
                const code = result.error?.error?.code ?? '';
                const message = result.error?.error?.message ?? 'Não foi possível criar o usuário.';

                // Confirmação de senha do admin
                if (code === 'Auth.InvalidPassword' || code === 'Auth.ReauthRequired') {
                    setReauthUntil(0);
                    setAdminPasswordError(code === 'Auth.ReauthRequired' ? 'Confirme sua senha para continuar.' : message);
                    setAdminPasswordOpen(true);
                    return;
                }
                if (code === 'Auth.ReauthLocked') {
                    setReauthUntil(0);
                    setAdminPasswordOpen(false);
                    notify.error('Muitas tentativas', message);
                    return;
                }

                setAdminPasswordOpen(false);

                const field = serverFieldByCode[code];
                if (field) {
                    setCreateErrors((errors) => ({ ...errors, [field]: message }));
                } else {
                    notify.error(code || 'Usuário', message);
                }
                return;
            }

            if (adminPassword) setReauthUntil(Date.now() + REAUTH_WINDOW_MS);

            setAdminPasswordOpen(false);
            setAdminPasswordError('');
            setShowCreateModal(false);
            setCreateForm(emptyCreateForm);

            notify.success(
                'Usuário criado',
                `${result.data} foi cadastrado como ${createForm.role === 'ADMIN' ? 'administrador' : 'entregador'}. Enviamos um e-mail de boas-vindas.`
            );
        } finally {
            setCreating(false);
        }
    };

    const handleCreateUser = async () => {
        if (!validateCreate()) return;

        // Criar outro admin exige a senha (a menos que já tenha confirmado há pouco)
        if (createForm.role === 'ADMIN' && Date.now() >= reauthUntil) {
            setAdminPasswordError('');
            setAdminPasswordOpen(true);
            return;
        }

        await submitCreate();
    };

    const confirmAdminPassword = async (password?: string) => {
        if (!password) return;
        setAdminPasswordError('');
        await submitCreate(password);
    };

    const cancelAdminPassword = () => {
        if (creating) return;
        setAdminPasswordOpen(false);
        setAdminPasswordError('');
    };

    const setRoleFilter = async (role: UserFilter) => {
        setUserFilter(role);
        setStatusFilter('all');
    };

    return {
        result: {
            userFilter,
            statusFilter,
            Loading,
            openMenu,
            showCouponModalActive,
            TitleCOnfirm,
            DescriptionConfirm,
            ButtonConfirm,
            ShowDeleteUser,
            showCreateModal,
            createForm,
            createErrors,
            creating,
            adminPasswordOpen,
            adminPasswordError,
        },
        action: {
            SetLoading,
            setUserFilter,
            setStatusFilter,
            setRoleFilter,
            handleDesactivUSer,
            setOpenMenu,
            setShowCouponModalActive,
            SetButtonConfirm,
            SetDescriptionConfirm,
            SetTitleCOnfirm,
            setShowDeleteUser,
            openCreate,
            closeCreate,
            setCreateField,
            setCreateRole,
            handleCreateUser,
            confirmAdminPassword,
            cancelAdminPassword,
        }
    }
}



