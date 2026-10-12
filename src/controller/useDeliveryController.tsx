import { useCallback, useEffect, useMemo, useState } from "react";
import { DeliveryOrder } from "../models/Delivery";
import { UseDeliveryStore } from "../store/UseDeliveryStore";
import { UseUserStore } from "../store/UseUserStore";
import { useAuthStore } from "../context/AuthContext";
import { useSessionStore } from "../store/SessionStore";
import { useNotification } from "../utils/NotificationCard";
import { validatePasswordPolicy } from "../utils/passwordPolicy";

export type DeliveryTab = 'orders' | 'history' | 'earnings' | 'profile';

const THEME_KEY = '@delivery:dark';
const REFRESH_MS = 45000;

const readTheme = (): boolean => {
    try {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved !== null) return saved === '1';
    } catch {
        /* sem acesso ao storage */
    }
    return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
};

type PasswordForm = { currentPassword: string; newPassword: string; confirmPassword: string };
type ProfileForm = { name: string; phone: string; transport: string };

export const useDeliveryController = () => {
    const store = UseDeliveryStore();
    const { user, updateProfile, SaveChangePassword } = UseUserStore();
    const notify = useNotification();

    const [tab, setTab] = useState<DeliveryTab>('orders');
    const [dark, setDark] = useState<boolean>(readTheme);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);

    const [dispatchTarget, setDispatchTarget] = useState<DeliveryOrder | null>(null);
    const [deliverTarget, setDeliverTarget] = useState<DeliveryOrder | null>(null);

    const [profileForm, setProfileForm] = useState<ProfileForm>({ name: '', phone: '', transport: '' });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [savingProfile, setSavingProfile] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);

    const [passwordForm, setPasswordForm] = useState<PasswordForm>({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordErrors, setPasswordErrors] = useState<Partial<Record<keyof PasswordForm, string>>>({});
    const [savingPassword, setSavingPassword] = useState(false);

    const [logoutOpen, setLogoutOpen] = useState(false);

    /* ───────────── tema ───────────── */

    const toggleTheme = () => {
        setDark((value) => {
            const next = !value;
            try {
                localStorage.setItem(THEME_KEY, next ? '1' : '0');
            } catch {
                /* sem acesso ao storage */
            }
            return next;
        });
    };

    /* ───────────── carregamento ───────────── */

    const loadAll = useCallback(async (silent = false) => {
        if (!silent) setRefreshing(true);

        try {
            const results = await Promise.all([
                store.LoadOrders(),
                store.LoadHistory(),
                store.LoadEarnings(),
                store.LoadProfile(),
            ]);

            const failed = results.find((r) => !r.success);
            if (failed && !silent) {
                notify.error(failed.error?.error?.code ?? 'Entregas', failed.error?.error?.message ?? 'Não foi possível carregar seus dados.');
            }
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadAll();
        return () => store.Reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Atualiza sozinho enquanto a tela está aberta (novos pedidos atribuídos pelo admin)
    useEffect(() => {
        const timer = window.setInterval(() => {
            if (document.visibilityState === 'visible') store.LoadOrders();
        }, REFRESH_MS);

        const onFocus = () => store.LoadOrders();
        window.addEventListener('focus', onFocus);

        return () => {
            window.clearInterval(timer);
            window.removeEventListener('focus', onFocus);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Formulário do perfil
    useEffect(() => {
        if (!store.profile) return;
        setProfileForm({
            name: store.profile.name ?? '',
            phone: store.profile.phone ?? '',
            transport: store.profile.transport ?? '',
        });
    }, [store.profile]);

    /* ───────────── listas ───────────── */

    const toDispatch = useMemo(() => store.orders.filter((o) => o.order_Status === 'PREPARANDO'), [store.orders]);
    const enRoute = useMemo(() => store.orders.filter((o) => o.order_Status === 'SAIU_PARA_ENTREGA'), [store.orders]);

    const earningsEnabled = store.earnings?.enabled === true;

    useEffect(() => {
        if (tab === 'earnings' && store.earnings && !earningsEnabled) setTab('orders');
    }, [tab, store.earnings, earningsEnabled]);

    /* ───────────── ações do pedido ───────────── */

    const confirmDispatch = async () => {
        const order = dispatchTarget;
        if (!order) return;

        setBusyId(order.id);
        try {
            const result = await store.DispatchOrder(order.id);

            if (!result.success) {
                notify.error(result.error?.error?.code ?? 'Entrega', result.error?.error?.message ?? 'Não foi possível atualizar o pedido.');
                return;
            }

            notify.success('Boa entrega!', `Pedido #${order.number_Order} saiu para entrega. O cliente foi avisado.`);
        } finally {
            setBusyId(null);
            setDispatchTarget(null);
        }
    };

    const confirmDeliver = async (whoReceivedIt?: string) => {
        const order = deliverTarget;
        const name = whoReceivedIt?.trim() ?? '';
        if (!order || name.length < 2) return;

        setBusyId(order.id);
        try {
            const result = await store.DeliverOrder(order.id, name);

            if (!result.success) {
                notify.error(result.error?.error?.code ?? 'Entrega', result.error?.error?.message ?? 'Não foi possível confirmar a entrega.');
                return;
            }

            notify.success('Entregue!', `Pedido #${order.number_Order} entregue para ${name}.`);
        } finally {
            setBusyId(null);
            setDeliverTarget(null);
        }
    };

    /* ───────────── perfil ───────────── */

    const saveProfile = async () => {
        const name = profileForm.name.trim();
        const transport = profileForm.transport.trim();
        const phoneDigits = profileForm.phone.replace(/\D/g, '');

        if (name.length < 3) {
            notify.error('Perfil', 'Informe um nome válido.');
            return;
        }
        if (phoneDigits && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
            notify.error('Perfil', 'Informe um telefone válido com DDD.');
            return;
        }
        if (transport.length < 2) {
            notify.error('Perfil', 'Informe seu meio de transporte.');
            return;
        }

        setSavingProfile(true);
        try {
            const formData = new FormData();
            // O e-mail não é editável aqui: envia o atual
            formData.append('Email', store.profile?.email ?? user?.email ?? '');
            formData.append('Name', name);
            formData.append('Phone', profileForm.phone.trim());
            formData.append('Transport', transport);
            formData.append('Avatar', avatarFile || '');

            const result = await updateProfile(formData);

            if (!result.success) {
                notify.error(result.error?.error?.code ?? 'Perfil', result.error?.error?.message ?? 'Erro ao salvar o perfil.');
                return;
            }

            setAvatarFile(null);
            setEditingProfile(false);
            await store.LoadProfile();
            notify.success('Perfil', 'Perfil atualizado com sucesso!');
        } finally {
            setSavingProfile(false);
        }
    };

    const cancelEditProfile = () => {
        setEditingProfile(false);
        setAvatarFile(null);
        if (store.profile) {
            setProfileForm({
                name: store.profile.name ?? '',
                phone: store.profile.phone ?? '',
                transport: store.profile.transport ?? '',
            });
        }
    };

    const validatePassword = () => {
        const errors: Partial<Record<keyof PasswordForm, string>> = {};
        const { currentPassword, newPassword, confirmPassword } = passwordForm;

        if (!currentPassword) errors.currentPassword = 'Informe sua senha atual.';
        if (!newPassword) errors.newPassword = 'Informe a nova senha.';
        else {
            // Regra única do sistema (igual ao servidor)
            const policyError = validatePasswordPolicy(newPassword);
            if (policyError) errors.newPassword = policyError;
        }
        if (confirmPassword !== newPassword) errors.confirmPassword = 'As senhas não coincidem.';

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const changePassword = async () => {
        if (!validatePassword()) return;

        setSavingPassword(true);
        try {
            const result = await SaveChangePassword(passwordForm);

            if (!result.success) {
                notify.error(result.error?.error?.code ?? 'Senha', result.error?.error?.message ?? 'Erro ao alterar a senha.');
                return;
            }

            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPasswordErrors({});

            // O servidor encerrou todas as sessões (inclusive esta)
            useSessionStore.getState().open('PASSWORD_CHANGED_SELF');
            await useAuthStore.getState().logout();
        } finally {
            setSavingPassword(false);
        }
    };

    const logout = async () => {
        setLogoutOpen(false);
        await useAuthStore.getState().logout();
    };

    return {
        result: {
            tab,
            dark,
            loading,
            refreshing,
            busyId,
            user,
            profile: store.profile,
            orders: store.orders,
            toDispatch,
            enRoute,
            history: store.history,
            earnings: store.earnings,
            earningsEnabled,
            dispatchTarget,
            deliverTarget,
            profileForm,
            avatarFile,
            savingProfile,
            editingProfile,
            passwordForm,
            passwordErrors,
            savingPassword,
            logoutOpen,
        },
        action: {
            setTab,
            toggleTheme,
            loadAll,
            setDispatchTarget,
            setDeliverTarget,
            confirmDispatch,
            confirmDeliver,
            setProfileForm,
            setAvatarFile,
            setEditingProfile,
            saveProfile,
            cancelEditProfile,
            setPasswordForm,
            changePassword,
            setLogoutOpen,
            logout,
        },
    };
};
