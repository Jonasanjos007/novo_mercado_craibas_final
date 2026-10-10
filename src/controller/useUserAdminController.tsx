import { useEffect, useState } from "react";
import { UseUserAdminStore } from "../storeAdmin/UseUserAdminStore";
import { UserFilter } from "../models/User";
import { useNotification } from "../utils/NotificationCard";

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
    }
} | null;

export const useUserAdminController = (): UsersAdminControllerReturn => {
    const { getUser, UserAllAdmin, PostUpdateDesactiv } = UseUserAdminStore();
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
            ShowDeleteUser
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
            setShowDeleteUser
        }
    }
}



