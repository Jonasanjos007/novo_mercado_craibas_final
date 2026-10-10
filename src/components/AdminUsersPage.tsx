import React, { useEffect, useMemo, useState } from 'react';
import { Search, Users, UserRound, ShieldCheck, Truck, UserPlus, MoreVertical, Eye, Pencil, LockKeyhole, UnlockKeyhole, Trash2, Mail, Phone, CalendarDays, X, CheckCircle2, UserCheck, UserX, ChevronDown, ShieldAlert, Activity, Plus, MapPin, ShoppingBag, Loader2, Turtle } from 'lucide-react';
import { useUserAdminController } from '../controller/useUserAdminController';
import { User, UserAdminAll, UserFilter, UserRole } from '../models/User';
import { UseUserAdminStore } from '../storeAdmin/UseUserAdminStore';
import ConfirmAdminPopup from './ConfirmAdminPopup';
import { Address } from '../models/Address';
import { GeneralOrderInformation } from '../models/Order';
import { Logs } from '../models/Logs';
import { UseOrderAdminStore } from '../storeAdmin/UseOrderAdminStore';
import { configs } from '../utils';
import { useNotification } from '../utils/NotificationCard';

interface AdminUsersPageProps {
    darkMode: boolean;
    onNavigate?: (target: string) => void;
}

const roleConfig: Record<UserRole, {
    label: string;
    icon: React.ElementType;
    badge: string;
    avatar: string;
}> = {
    ADMIN: {
        label: 'Administrador',
        icon: ShieldCheck,
        badge: 'bg-violet-50 text-violet-700 border border-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:border-transparent',
        avatar: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
    },

    CLIENTE: {
        label: 'Cliente',
        icon: UserRound,
        badge: 'bg-orange-50 text-orange-700 border border-orange-100 dark:bg-brand-500/10 dark:text-brand-400 dark:border-transparent',
        avatar: 'bg-orange-50 text-orange-700 dark:bg-brand-500/10 dark:text-brand-400',
    },

    DELIVERY: {
        label: 'Delivery',
        icon: Truck,
        badge: 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-transparent',
        avatar: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    },
};

export default function AdminUsersPage({
    darkMode,
    onNavigate,
}: AdminUsersPageProps) {
    const notify = useNotification();
    const Controller = useUserAdminController();
    const { UserAllAdmin, GetUserAnddresAll, GetUserInfoOrdersAll, DeleteUserSelected } = UseUserAdminStore();
    const { logs } = UseOrderAdminStore();
    const [users, setUsers] = useState<UserAdminAll[]>(UserAllAdmin);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserAdminAll | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [loadingDelet, setLoadingDelete] = useState(false);
    const [newUserRole, setNewUserRole] = useState<UserRole>('CLIENTE');
    const [DesactvUserSelectd, setDesactvUserSelectd] = useState({
        UserId: 0,
        role: '',
        Activ: false
    });
    const [showPurchases, setShowPurchases] = useState(false);
    const [showAddress, setShowAddress] = useState(false);
    // const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [AllAddress, setAllAddress] = useState<Address[] | null>(null);
    const [AllInforntion, setAllInforntions] = useState<GeneralOrderInformation | null>(null);
    const [showLogs, setShowLogs] = useState(false);
    const [selectedLog, setSelectedLog] = useState<Logs | null>(null);
    const [AllLogs, setAllLogs] = useState<Logs[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const stats = useMemo(() => {
        const active = users.filter(user => user.ativo).length;
        const inactive = users.filter(user => !user.ativo).length;

        return {
            total: users.length,
            active,
            inactive,
            admins: users.filter(user => user.role === 'ADMIN').length,
            clients: users.filter(user => user.role === 'CLIENTE').length,
            delivery: users.filter(user => user.role === 'DELIVERY').length,
        };
    }, [users]);

    useEffect(() => {
        setUsers(UserAllAdmin);
    }, [UserAllAdmin]);

    const FilterLogsUserSelect = useMemo(() => {
        return logs
            .filter(log => log.id_User === selectedUser?.id)
            .sort((a, b) => {
                return (
                    new Date(b.insertDate).getTime() -
                    new Date(a.insertDate).getTime()
                );
            });
    }, [logs, selectedUser]);
    const LastAccessLog = useMemo(() => {
        return FilterLogsUserSelect
            .filter(log => log.tipo?.toUpperCase() === 'ACESSO')
            .sort((a, b) => {
                const dateA = new Date(a.insertDate).getTime();
                const dateB = new Date(b.insertDate).getTime();

                return dateB - dateA;
            })[0] ?? null;
    }, [FilterLogsUserSelect, selectedUser]);
    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase();

        return users.filter(user => {
            const matchesRole =
                Controller?.result.userFilter === 'ALL' ||
                user.role === Controller?.result.userFilter;

            const matchesStatus =
                Controller?.result.statusFilter === 'all' ||
                (Controller?.result.statusFilter === 'ativo' && user.ativo) ||
                (Controller?.result.statusFilter === 'inactive' && !user.ativo);

            const matchesSearch =
                !term ||
                user.name?.toLowerCase().includes(term) ||
                user.email?.toLowerCase().includes(term) ||
                user.phone?.toLowerCase().includes(term);

            return (
                matchesRole &&
                matchesStatus &&
                matchesSearch
            );
        });
    }, [users, Controller?.result.userFilter, Controller?.result.statusFilter, search,]);

    const OncloseCard = () => {
        setSelectedUser(null)
        setAllAddress([])
        setSelectedAddress(null)
        setShowAddress(false)
        setAllInforntions(null)
        setShowPurchases(false)
        setSelectedLog(null)
        setShowLogs(false)
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .slice(0, 2)
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase();
    };

    const getFilterLabel = () => {
        switch (Controller?.result.userFilter) {
            case 'ADMIN':
                return 'ADMIN';

            case 'CLIENTE':
                return 'CLIENTE';

            case 'DELIVERY':
                return 'DELIVERY';

            default:
                return 'Todos os usuários';
        }
    };



    /*
    |--------------------------------------------------------------------------
    | CORES DO TEMA
    |--------------------------------------------------------------------------
    */

    const pageBackground = darkMode
        ? 'bg-surface-950'
        : 'bg-[#f7f8fa]';

    const cardBackground = darkMode
        ? 'bg-surface-900'
        : 'bg-white';

    const cardBorder = darkMode
        ? 'border-surface-800'
        : 'border-[#e7e9ee]';

    const primaryText = darkMode
        ? 'text-white'
        : 'text-[#17191f]';

    const secondaryText = darkMode
        ? 'text-surface-300'
        : 'text-[#596170]';

    const mutedText = darkMode
        ? 'text-surface-400'
        : 'text-[#8a919e]';

    const softBackground = darkMode
        ? 'bg-surface-950'
        : 'bg-[#f7f8fa]';

    const softBorder = darkMode
        ? 'border-surface-700'
        : 'border-[#dfe3e8]';

    const rowHover = darkMode
        ? 'hover:bg-surface-950/70'
        : 'hover:bg-[#fafbfc]';

    const inputBackground = darkMode
        ? 'bg-surface-950'
        : 'bg-white';

    const inputBorder = darkMode
        ? 'border-surface-700'
        : 'border-[#dfe3e8]';

    return (
        <>
            <div className={` w-full min-h-full space-y-6 pb-10 transition-colors duration-200 `}>

                <div className=" flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div className="flex items-center gap-4">
                        <div className=" relative w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-brand-500" />
                            <span className={` absolute -right-1 -top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 ${darkMode ? 'border-surface-950' : 'border-[#f7f8fa]'}`} />
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className={` font-display text-2xl font-bold ${primaryText}`}>
                                    Usuários
                                </h1>

                                <span className=" hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                    <Activity className="w-3 h-3" />Ativo
                                </span>
                            </div>
                            <p className={` text-sm mt-1 ${mutedText}`}>
                                Gerencie o acesso e os perfis da plataforma.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setShowCreateModal(true)
                        }
                        className=" inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-brand transition-all hover:-translate-y-0.5 active:translate-y-0">
                        <UserPlus className="w-4 h-4" />
                        Novo usuário
                    </button>
                </div>

                <div className=" grid grid-cols-2 lg:grid-cols-4 gap-3">

                    <button
                        type="button"
                        onClick={() => Controller?.action.setRoleFilter('ALL')}
                        className={` group relative overflow-hidden text-left rounded-2xl border p-5 transition-all ${Controller?.result.userFilter === 'ALL' ? darkMode ? 'border-brand-800 bg-brand-500/[0.04]' : 'border-brand-200 bg-brand-50' : `${cardBorder} ${cardBackground} ${darkMode ? 'hover:border-brand-900' : 'hover:border-brand-200'}`}`}
                    >
                        <div className=" absolute -right-8 -top-8 w-24 h-24 rounded-full bg-brand-500/[0.04] group-hover:scale-125 transition-transform" />
                        <div className="relative">
                            <div className="flex items-center justify-between">
                                <span className={` text-[10px] font-bold uppercase tracking-widest ${mutedText}`}>
                                    Usuários
                                </span>
                                <Users className="w-4 h-4 text-brand-500" />
                            </div>
                            <div className="flex items-end justify-between mt-5">
                                <div>
                                    <p className={` font-display text-3xl font-bold ${primaryText}`}>
                                        {stats.total}
                                    </p>
                                    <p className={` text-[11px] mt-1 ${mutedText}`}>
                                        total cadastrado
                                    </p>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-500">
                                    {stats.active} ativos
                                </span>
                            </div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => Controller?.action.setRoleFilter('CLIENTE')}
                        className={` group relative overflow-hidden text-left rounded-2xl border p-5 transition-all ${Controller?.result.userFilter === 'CLIENTE' ? darkMode ? 'border-brand-800 bg-brand-500/[0.04]' : 'border-orange-200 bg-orange-50' : `${cardBorder} ${cardBackground} ${darkMode ? 'hover:border-brand-900' : 'hover:border-orange-200'}`}`}
                    >
                        <div className="flex items-center justify-between">
                            <span className={` text-[10px] font-bold uppercase tracking-widest ${mutedText}`}>
                                Clientes
                            </span>

                            <UserRound className="w-4 h-4 text-brand-500" />
                        </div>
                        <p className={` font-display text-3xl font-bold mt-5 ${primaryText}`}>
                            {stats.clients}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />

                            <p className={`text-[11px] ${mutedText}`}>
                                compradores
                            </p>
                        </div>
                    </button>


                    {/* ADMIN */}

                    <button
                        type="button"
                        onClick={() => Controller?.action.setRoleFilter('ADMIN')}
                        className={`group relative overflow-hidden text-left rounded-2xl border p-5 transition-all ${Controller?.result.userFilter === 'ADMIN' ? darkMode ? 'border-violet-800 bg-violet-500/[0.04]' : 'border-violet-200 bg-violet-50' : `${cardBorder} ${cardBackground} ${darkMode ? 'hover:border-violet-900' : 'hover:border-violet-200'}`}`}
                    >
                        <div className="flex items-center justify-between">
                            <span className={` text-[10px] font-bold uppercase tracking-widest ${mutedText}`}>
                                Administradores
                            </span>
                            <ShieldCheck className="w-4 h-4 text-violet-500" />
                        </div>

                        <p className={` font-display text-3xl font-bold mt-5 ${primaryText}`}>
                            {stats.admins}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-violet-500" />
                            <p className={`text-[11px] ${mutedText}`} >
                                acesso administrativo
                            </p>
                        </div>
                    </button>

                    {/* DELIVERY */}

                    <button
                        type="button"
                        onClick={() => Controller?.action.setRoleFilter('DELIVERY')}
                        className={` group relative overflow-hidden text-left rounded-2xl border p-5 transition-all ${Controller?.result.userFilter === 'DELIVERY' ? darkMode ? 'border-blue-800 bg-blue-500/[0.04]' : 'border-blue-200 bg-blue-50' : `${cardBorder} ${cardBackground} ${darkMode ? 'hover:border-blue-900' : 'hover:border-blue-200'}`}`}
                    >
                        <div className="flex items-center justify-between">
                            <span className={` text-[10px] font-bold uppercase tracking-widest ${mutedText}`} >
                                Delivery
                            </span>
                            <Truck className="w-4 h-4 text-blue-500" />
                        </div>

                        <p className={` font-display text-3xl font-bold mt-5 ${primaryText}`}>
                            {stats.delivery}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1">
                            <Activity className="w-3.5 h-3.5 text-blue-500" />
                            <p className={`text-[11px] ${mutedText}`}>
                                equipe de entrega
                            </p>
                        </div>
                    </button>
                </div>

                <div className={` rounded-2xl border ${cardBorder} ${cardBackground} shadow-soft p-3`}>
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col lg:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className={` absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedText}`} />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Buscar por nome, e-mail ou telefone..."
                                    className={` w-full pl-11 pr-4 py-3 rounded-xl ${inputBackground} border ${inputBorder} text-sm ${primaryText} placeholder:${darkMode ? 'text-surface-500' : 'text-[#9aa1ad]'} outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10 transition-all`}
                                />
                            </div>

                            <div className="relative">
                                <select
                                    value={Controller?.result.statusFilter}
                                    onChange={e =>
                                        Controller?.action.setStatusFilter(
                                            e.target.value as
                                            | 'all'
                                            | 'ativo'
                                            | 'inactive'
                                        )
                                    }
                                    className={` appearance-none w-full lg:w-48 pl-4 pr-10 py-3 rounded-xl ${inputBackground} border ${inputBorder} text-sm font-semibold ${darkMode ? 'text-surface-200' : 'text-[#353b45]'} outline-none focus:border-brand-400 cursor-pointer`}
                                >
                                    <option value="all">
                                        {`Todos os status (${filteredUsers.length})`}
                                    </option>

                                    <option value="ativo">
                                        {`Ativos (${filteredUsers.filter(User => User.ativo == true).length})`}
                                    </option>

                                    <option value="inactive">
                                        {`Inativos (${filteredUsers.filter(User => User.ativo == false).length})`}
                                    </option>
                                </select>

                                <ChevronDown className={` absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedText} pointer-events-none`} />
                            </div>
                        </div>

                        {/* ROLE FILTER */}

                        <div className={` flex gap-1 overflow-x-auto ${softBackground} rounded-xl p-1`}>
                            {[
                                {
                                    id: 'ALL' as UserFilter,
                                    label: 'Todos',
                                    icon: Users,
                                },
                                {
                                    id: 'CLIENTE' as UserFilter,
                                    label: 'Clientes',
                                    icon: UserRound,
                                },
                                {
                                    id: 'ADMIN' as UserFilter,
                                    label: 'Administradores',
                                    icon: ShieldCheck,
                                },
                                {
                                    id: 'DELIVERY' as UserFilter,
                                    label: 'Delivery',
                                    icon: Truck,
                                },
                            ].map(filter => {
                                const Icon = filter.icon;
                                const active =
                                    Controller?.result.userFilter === filter.id;

                                return (
                                    <button
                                        key={filter.id}
                                        type="button"
                                        onClick={() =>
                                            Controller?.action.setRoleFilter(
                                                filter.id
                                            )
                                        }
                                        className={` flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${active ? darkMode ? 'bg-surface-800 text-brand-400 shadow-sm' : 'bg-white text-brand-600 shadow-sm border border-[#e5e7eb]' : `${darkMode ? 'text-surface-500 hover:text-white' : 'text-[#747c89] hover:text-[#20242b]'}`}`}
                                    >
                                        <Icon className="w-4 h-4" />

                                        {filter.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className={`font-display font-bold text-lg ${primaryText} `} >
                                {getFilterLabel()}
                            </h2>

                            <span className={` px-2 py-0.5 rounded-md ${darkMode ? 'bg-surface-800 text-surface-400' : 'bg-[#eceff3] text-[#68717e]'} text-[10px] font-bold`}>
                                {filteredUsers.length}
                            </span>
                        </div>

                        <p className={` text-xs mt-1 ${mutedText} `} >
                            Gerencie os usuários cadastrados na plataforma.
                        </p>
                    </div>

                    {(search ||
                        Controller?.result.userFilter !== 'ALL' ||
                        Controller?.result.statusFilter !== 'all') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    Controller?.action.setUserFilter('ALL');
                                    Controller?.action.setStatusFilter('all');
                                }}
                                className=" hidden sm:flex items-center gap-1.5 text-xs font-bold text-brand-500 hover:text-brand-600"
                            >
                                <X className="w-3.5 h-3.5" />
                                Limpar filtros
                            </button>
                        )}
                </div>

                <div className={` overflow-visible rounded-2xl border ${cardBorder} ${cardBackground} shadow-soft`}>
                    {filteredUsers.length === 0 ? (
                        <div className="py-20 text-center px-6">
                            <div className={` w-16 h-16 rounded-2xl ${darkMode ? 'bg-surface-800' : 'bg-[#f0f2f5]'} mx-auto flex items-center justify-center `}>
                                <Search className={`w-6h-6${mutedText}`} />
                            </div>

                            <h3 className={` font-display font-bold mt-5 ${primaryText}`}>
                                Nenhum usuário encontrado
                            </h3>

                            <p className={` text-sm mt-1 max-w-sm mx-auto ${mutedText}`} >
                                Não encontramos usuários para os filtros
                                selecionados.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* DESKTOP */}

                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr
                                            className={`
                                                border-b
                                                ${cardBorder}
                                            `}
                                        >
                                            <th className={` text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                Usuário
                                            </th>

                                            <th className={` text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                Contato
                                            </th>

                                            <th className={` text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                Perfil
                                            </th>

                                            <th className={` text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                Status
                                            </th>

                                            <th className={` text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                Último acesso
                                            </th>

                                            <th className="w-16" />
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredUsers.map(user => {
                                            const config = roleConfig[user.role];
                                            const RoleIcon = config.icon;

                                            return (
                                                <tr
                                                    key={`${user.role}-${user.id}`}
                                                    className={` group border-b ${cardBorder} last:border-0 ${rowHover} transition-colors`}
                                                >
                                                    {/* USER */}

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={` w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${config.avatar}`}
                                                            >
                                                                {getInitials(
                                                                    user.name || ""
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className={` font-bold text-sm truncate ${primaryText}`}>
                                                                    {user.name}
                                                                </p>
                                                                <p className={`text-[11px] mt-1 ${mutedText} `} >
                                                                    ID #{user.id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* CONTACT */}

                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1.5">
                                                            <div
                                                                className={`
                                                                    flex
                                                                    items-center
                                                                    gap-2
                                                                    text-xs
                                                                    ${secondaryText}
                                                                `}
                                                            >
                                                                <Mail className={` w-3.5 h-3.5 ${mutedText} `} />

                                                                <span className="truncate max-w-[200px]">
                                                                    {user.email}
                                                                </span>
                                                            </div>

                                                            <div
                                                                className={`
                                                                    flex
                                                                    items-center
                                                                    gap-2
                                                                    text-[11px]
                                                                    ${mutedText}
                                                                `}
                                                            >
                                                                <Phone className="w-3.5 h-3.5" />

                                                                {user.phone}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* ROLE */}

                                                    <td className="px-6 py-4">
                                                        <span className={` inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${config.badge}`}>
                                                            <RoleIcon className="w-3.5 h-3.5" />
                                                            {config.label}
                                                        </span>
                                                    </td>

                                                    {/* STATUS */}

                                                    <td className="px-6 py-4">
                                                        <span className={` inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${user.ativo ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent' : darkMode ? 'bg-surface-800 text-surface-400' : 'bg-[#f0f1f3] text-[#747b87] border border-[#e3e5e8]'}`}>
                                                            <span className={` w-1.5 h-1.5 rounded-full ${user.ativo ? 'bg-emerald-500' : 'bg-surface-400'}`} />
                                                            {user.ativo ? 'Ativo' : 'Inativo'}
                                                        </span>
                                                    </td>

                                                    {/* LAST ACCESS */}

                                                    <td className="px-6 py-4">
                                                        <div className={` flex items-center gap-2 text-xs ${secondaryText}`}>
                                                            <CalendarDays className={`     w-3.5     h-3.5     ${mutedText} `} />
                                                            {new Date(user.insert_Date).toLocaleDateString("pt-BR")}
                                                        </div>
                                                    </td>

                                                    {/* ACTIONS */}

                                                    <td className="px-4 py-4">
                                                        <div className="relative">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const menuId = `${user.role}-${user.id}`;

                                                                    Controller?.action.setOpenMenu(prev =>
                                                                        prev === menuId ? null : menuId
                                                                    );
                                                                }}
                                                                className={` w-9 h-9 rounded-xl flex items-center justify-center ${mutedText} ${darkMode ? 'hover:text-white hover:bg-surface-800' : 'hover:text-[#20242b] hover:bg-[#f0f2f5]'} transition-all`}
                                                            >
                                                                <MoreVertical className="w-4 h-4" />
                                                            </button>

                                                            {Controller?.result.openMenu === `${user.role}-${user.id}` && (
                                                                <div className={` absolute right-0 top-11 z-50 w-56 rounded-2xl border ${cardBorder} ${cardBackground} shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-100`}>
                                                                    <div className="px-3 py-2">
                                                                        <p className={` text-[10px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                                            Ações
                                                                        </p>
                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedUser(
                                                                                user
                                                                            );
                                                                            Controller?.action.setOpenMenu(
                                                                                null
                                                                            );
                                                                        }}
                                                                        className={` w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold ${secondaryText} ${darkMode ? 'hover:bg-surface-800' : 'hover:bg-[#f5f6f8]'}`}
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                        Visualizar perfil
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            Controller?.action.setOpenMenu(
                                                                                null
                                                                            )
                                                                        }
                                                                        className={` w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold ${secondaryText} ${darkMode ? 'hover:bg-surface-800' : 'hover:bg-[#f5f6f8]'}`}
                                                                    >
                                                                        <Pencil className="w-4 h-4" />
                                                                        Editar usuário
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (user.ativo) {
                                                                                Controller.action.SetTitleCOnfirm('Desativar Usuário');
                                                                                Controller.action.SetDescriptionConfirm('Tem certeza que deseja desativar este usuário? Ele não poderá mais acessar o sistema com esta conta.');
                                                                                Controller.action.SetButtonConfirm('Desativar');
                                                                            } else {
                                                                                Controller.action.SetTitleCOnfirm('Ativar Usuário');
                                                                                Controller.action.SetDescriptionConfirm('Tem certeza que deseja ativar este usuário? Ele poderá acessar novamente o sistema com esta conta.');
                                                                                Controller.action.SetButtonConfirm('Ativar');
                                                                            }
                                                                            Controller.action.setShowCouponModalActive(true);
                                                                            setDesactvUserSelectd({ UserId: user.id || 0, role: user.role, Activ: user.ativo });
                                                                        }

                                                                        }
                                                                        className={` w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold ${secondaryText} ${darkMode ? 'hover:bg-surface-800' : 'hover:bg-[#f5f6f8]'}`}
                                                                    >
                                                                        {user.ativo ? (
                                                                            <>
                                                                                <LockKeyhole className="w-4 h-4" />
                                                                                Desativar acesso
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <UnlockKeyhole className="w-4 h-4" />
                                                                                Reativar acesso
                                                                            </>
                                                                        )}
                                                                    </button>

                                                                    <div className={` h-px my-1.5 ${darkMode ? 'bg-surface-800' : 'bg-[#edf0f2]'}`} />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setDesactvUserSelectd({ UserId: user.id || 0, role: user.role, Activ: user.ativo });
                                                                            Controller.action.SetTitleCOnfirm('Excluir Usuário');
                                                                            Controller.action.SetDescriptionConfirm('Tem certeza que deseja Excluir este usuário? Ele não poderá mais acessar o sistema com esta conta Iremos deletar tudo que tem ligamento com esse usuário.');
                                                                            Controller.action.SetButtonConfirm('Excluir');
                                                                            Controller.action.setShowDeleteUser(true);
                                                                        }}
                                                                        className=" w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-red-500 hover:bg-red-500/10"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                        Excluir usuário
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* MOBILE */}

                            <div className={`lg:hidden divide-y ${darkMode ? 'divide-surface-800' : 'divide-[#edf0f2]'} `}>
                                {filteredUsers.map(user => {
                                    const config = roleConfig[user.role];

                                    const RoleIcon = config.icon;


                                    return (
                                        <div
                                            key={`${user.role}-${user.id}`}
                                            className="p-4"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={` w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${config.avatar}`}>
                                                    {getInitials(user.name || "")}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className={`font-bold text-sm truncate ${primaryText}`} >
                                                                {user.name}
                                                            </p>

                                                            <p className={`text-xs mt-1 truncate ${mutedText} `}>
                                                                {user.email}
                                                            </p>
                                                        </div>

                                                        <div className="relative">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const menuId = `${user.role}-${user.id}`;

                                                                    Controller?.action.setOpenMenu(prev =>
                                                                        prev === menuId ? null : menuId
                                                                    );
                                                                }}
                                                                className={` w-9 h-9 rounded-xl flex items-center justify-center ${mutedText} ${darkMode ? 'hover:text-white hover:bg-surface-800' : 'hover:text-[#20242b] hover:bg-[#f0f2f5]'}transition-all`}>
                                                                <MoreVertical className="w-4 h-4" />
                                                            </button>

                                                            {Controller?.result.openMenu === `${user.role}-${user.id}` && (
                                                                <div className={` absolute right-0 top-11 z-50 w-56 rounded-2xl border ${cardBorder} ${cardBackground} shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-100`} >
                                                                    <div className="px-3 py-2">
                                                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${mutedText}`} >
                                                                            Ações
                                                                        </p>
                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedUser(user);
                                                                            Controller?.action.setOpenMenu(null);
                                                                        }}
                                                                        className={` w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold ${secondaryText} ${darkMode ? 'hover:bg-surface-800' : 'hover:bg-[#f5f6f8]'}`}
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                        Visualizar perfil
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            Controller?.action.setOpenMenu(null);
                                                                        }}
                                                                        className={` w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold ${secondaryText} ${darkMode ? 'hover:bg-surface-800' : 'hover:bg-[#f5f6f8]'}`}
                                                                    >
                                                                        <Pencil className="w-4 h-4" />
                                                                        Editar usuário
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (user.ativo) {
                                                                                Controller.action.SetTitleCOnfirm('Desativar Usuário');
                                                                                Controller.action.SetDescriptionConfirm('Tem certeza que deseja desativar este usuário? Ele não poderá mais acessar o sistema com esta conta.');
                                                                                Controller.action.SetButtonConfirm('Desativar');
                                                                            } else {
                                                                                Controller.action.SetTitleCOnfirm('Ativar Usuário');
                                                                                Controller.action.SetDescriptionConfirm('Tem certeza que deseja ativar este usuário? Ele poderá acessar novamente o sistema com esta conta.');
                                                                                Controller.action.SetButtonConfirm('Ativar');
                                                                            }
                                                                            Controller.action.setShowCouponModalActive(true);
                                                                            setDesactvUserSelectd({ UserId: user.id || 0, role: user.role, Activ: user.ativo });
                                                                        }}
                                                                        className={` w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold ${secondaryText} ${darkMode ? 'hover:bg-surface-800' : 'hover:bg-[#f5f6f8]'}`}
                                                                    >
                                                                        {user.ativo ? (
                                                                            <>
                                                                                <LockKeyhole className="w-4 h-4" />
                                                                                Desativar acesso
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <UnlockKeyhole className="w-4 h-4" />
                                                                                Reativar acesso
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    <div className={`h-px my-1.5 ${darkMode ? 'bg-surface-800' : 'bg-[#edf0f2]'}`} />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            Controller?.action.setOpenMenu(null);
                                                                        }}
                                                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-red-500 hover:bg-red-500/10"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                        Excluir usuário
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                                        <span className={` inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold ${config.badge}`} >
                                                            <RoleIcon className="w-3 h-3" />
                                                            {config.label}
                                                        </span>

                                                        <span className={` inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold ${user.ativo ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent' : darkMode ? 'bg-surface-800 text-surface-400' : 'bg-[#f0f1f3] text-[#747b87] border border-[#e3e5e8]'} `}>
                                                            <span className={` w-1.5 h-1.5 rounded-full ${user.ativo ? 'bg-emerald-500' : 'bg-surface-400'}`} />
                                                            {user.ativo ? 'Ativo' : 'Inativo'}
                                                        </span>
                                                    </div>

                                                    <div className={` flex items-center gap-2 mt-3 text-[11px] ${mutedText}`}>
                                                        <CalendarDays className="w-3.5 h-3.5" />
                                                        Último acesso:{' '}
                                                        {new Date(user.insert_Date).toLocaleDateString("pt-BR")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* =========================================================
                USER DETAILS MODAL
            ========================================================== */}

            {selectedUser && (
                <div
                    className=" fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => {
                        setSelectedUser(null)
                        OncloseCard()
                    }
                    }
                >
                    <div
                        className={`w-full max-w-lg max-h-[90vh] rounded-3xl ${cardBackground} border ${cardBorder} shadow-2xl overflow-hidden flex flex-col`}
                        onClick={e => { e.stopPropagation() }}
                    >
                        {/* HEADER */}
                        {/* FOOTER */}
                        <div className="flex gap-3 p-6 pt-5 shrink-0">
                            <div className=" absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-brand-500/15 via-brand-500/5 to-transparent" />
                            <div className="relative flex items-start justify-between w-full">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div
                                        className={`w-16 h-16 rounded-2xl flex items-center justify-center font-display font-bold text-lg overflow-hidden shrink-0 ${roleConfig[selectedUser.role].avatar}`}
                                    >
                                        {selectedUser.avatar ? (
                                            <img
                                                src={`/Imagens/Usuarios/${selectedUser.avatar}`}
                                                alt={selectedUser.name || 'Usuário'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            getInitials(selectedUser.name || "")
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className={`font-display font-bold text-xl ${primaryText} truncate`}>
                                            {selectedUser.name}
                                        </h3>

                                        <div className="flex items-center gap-2 mt-2">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${roleConfig[selectedUser.role].badge}`}
                                            >
                                                {React.createElement(
                                                    roleConfig[selectedUser.role].icon,
                                                    { className: 'w-3 h-3' }
                                                )}

                                                {roleConfig[selectedUser.role].label}
                                            </span>

                                            <span
                                                className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${selectedUser.ativo
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : mutedText
                                                    }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${selectedUser.ativo
                                                        ? 'bg-emerald-500'
                                                        : 'bg-surface-400'
                                                        }`}
                                                />

                                                {selectedUser.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* X no canto direito */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        OncloseCard()
                                    }}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ml-4 ${mutedText} ${darkMode ? 'hover:bg-surface-800 hover:text-white' : 'hover:bg-[#f0f2f5] hover:text-[#20242b]'}`}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* CONTENT */}
                        <div className="px-6 pb-6 space-y-4 overflow-y-auto flex-1 min-h-0">
                            <div className="grid grid-cols-2 gap-3">
                                <div className={`rounded-2xl ${softBackground} p-4 `}>
                                    <p className={` text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                        E-mail
                                    </p>

                                    <div className="flex items-center gap-2 mt-2">
                                        <Mail className="w-4 h-4 text-brand-500 shrink-0" />

                                        <p className={` text-xs font-semibold truncate ${secondaryText}`}>
                                            {selectedUser.email}
                                        </p>
                                    </div>
                                </div>

                                <div className={` rounded-2xl ${softBackground} p-4`}>
                                    <p className={` text-[9px] font-bold uppercase tracking-widest ${mutedText}`} >
                                        Telefone
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                                        <p className={`text-xs font-semibold ${secondaryText} `}>
                                            {selectedUser.phone}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className={` rounded-2xl border ${cardBorder} p-4`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={` text-sm font-bold ${primaryText}`}>
                                            Informações da conta
                                        </p>

                                        <p className={`text-xs mt-1 ${mutedText} `}>
                                            Dados administrativos do usuário.
                                        </p>
                                    </div>

                                    <UserRound className={`w-5 h-5 ${darkMode ? 'text-surface-700' : 'text-[#c7ccd3]'}`} />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-5">
                                    <div>
                                        <p className={` text-[9px] font-bold uppercase tracking-widest ${mutedText} `}>
                                            Cadastro
                                        </p>

                                        <p className={` text-xs font-semibold mt-1 ${secondaryText}`}>
                                            {new Date(selectedUser.insert_Date).toLocaleDateString("pt-BR")}

                                        </p>
                                    </div>

                                    <div>
                                        <p className={` text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                            Último acesso
                                        </p>

                                        <p className={`text-xs font-semibold mt-1 ${secondaryText} `} >
                                            {LastAccessLog.insertDate
                                                ? new Date(LastAccessLog.insertDate).toLocaleString('pt-BR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })
                                                : 'Não informado'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* ENDEREÇO */}

                            <div className={`rounded-2xl border ${cardBorder} overflow-hidden`}>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!showAddress) {
                                            setLoading(true)
                                            const result = await GetUserAnddresAll(selectedUser?.id || 0);
                                            setAllAddress(result.data || [])
                                            setLoading(false)
                                        } else {
                                            setAllAddress([])
                                            setSelectedAddress(null)
                                        }
                                        setShowAddress(prev => !prev);
                                    }}
                                    className={`w-full flex items-center justify-between p-4 text-left transition-colors ${darkMode ? 'hover:bg-surface-800/50' : 'hover:bg-[#f8f9fa]'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${darkMode ? 'bg-surface-800 text-brand-400' : 'bg-brand-500/10 text-brand-500'}`}>
                                            <MapPin className="w-4 h-4" />
                                        </div>

                                        <div>
                                            <p className={`text-sm font-bold ${primaryText}`}>
                                                Endereço
                                            </p>

                                            <p className={`text-xs mt-0.5 ${mutedText}`}>
                                                Informações de endereço do usuário.
                                            </p>
                                        </div>
                                    </div>
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    ) : (
                                        <ChevronDown className={`w-5 h-5 ${mutedText} transition-transform duration-200 ${showAddress ? 'rotate-180' : ''}`} />
                                    )}

                                </button>
                                {showAddress && (
                                    <div className={`px-4 pb-4 border-t ${cardBorder}`}>

                                        {(!AllAddress || AllAddress.length === 0) ? (

                                            <div className={`pt-4`}>
                                                <div className={`rounded-xl p-4 ${softBackground} text-center`}>
                                                    <MapPin className={`w-5 h-5 mx-auto mb-2 ${mutedText}`} />
                                                    <p className={`text-xs font-semibold ${secondaryText}`}>
                                                        Nenhum endereço cadastrado
                                                    </p>

                                                    <p className={`text-[10px] mt-1 ${mutedText}`}>
                                                        Este usuário ainda não possui um endereço.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="pt-4 space-y-3">
                                                {AllAddress.map(
                                                    (address: Address, index: number) => {
                                                        const isSelected = selectedAddress === address;
                                                        const isStandard = address.standard === true;

                                                        return (
                                                            <button
                                                                key={address.id ?? index}
                                                                type="button"
                                                                onClick={() => setSelectedAddress(address)}
                                                                className={`w-full text-left rounded-xl border p-3 transition-all ${isSelected ? darkMode ? 'border-brand-500/50 bg-brand-500/10' : 'border-brand-300 bg-brand-50' : `${cardBorder} ${softBackground}`}`}
                                                            >
                                                                <div className="flex items-center gap-3">

                                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-brand-500 text-white' : darkMode ? 'bg-surface-800 text-surface-400' : 'bg-white text-[#8a919e]'}`}>
                                                                        <MapPin className="w-4 h-4" />
                                                                    </div>

                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <p className={`text-xs font-bold ${isSelected ? 'text-brand-500' : primaryText}`}>
                                                                                {address.name || address.road || `Endereço ${index + 1}`}
                                                                            </p>

                                                                            {/* ENDEREÇO PADRÃO */}
                                                                            {isStandard && (
                                                                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500 text-white">
                                                                                    Padrão
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        <p
                                                                            className={`text-[10px] mt-1 truncate ${mutedText}`}
                                                                        >{address.road || 'Endereço não informado'} {address.number ? `, ${address.number}` : ''}
                                                                        </p>

                                                                        <p
                                                                            className={`text-[10px] mt-0.5 ${mutedText}`}
                                                                        >
                                                                            {address.city || ''}
                                                                            {address.state
                                                                                ? ` - ${address.state}`
                                                                                : ''}
                                                                        </p>
                                                                    </div>

                                                                    {isSelected && (
                                                                        <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    }
                                                )}
                                                {selectedAddress && (
                                                    <div className={`rounded-xl border ${cardBorder} overflow-hidden`} >

                                                        {/* HEADER DO ENDEREÇO */}

                                                        <div className={`px-4 py-3 ${softBackground} border-b ${cardBorder} `}>
                                                            <div className="flex items-center gap-3">

                                                                <div className={` w-9 h-9 rounded-xl flex items-center justify-center bg-brand-500/10 text-brand-500`}>
                                                                    <MapPin className="w-4 h-4" />
                                                                </div>

                                                                <div>

                                                                    <p className={`text-xs font-bold ${primaryText}`}>
                                                                        {selectedAddress.name || 'Endereço'}
                                                                    </p>

                                                                    <p className={`text-[10px] mt-0.5 ${mutedText}`}>
                                                                        Dados do endereço selecionado
                                                                    </p>
                                                                </div>

                                                            </div>
                                                        </div>
                                                        {/* DADOS */}
                                                        <div className="p-3">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                {/* RUA */}
                                                                <div className={`rounded-xl p-3 ${softBackground}`}>
                                                                    <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                                        Endereço
                                                                    </p>

                                                                    <p
                                                                        className={`text-xs font-semibold mt-1 ${secondaryText}`}
                                                                    >
                                                                        {selectedAddress.road || 'Não informado'}
                                                                    </p>
                                                                </div>

                                                                {/* NÚMERO */}

                                                                <div className={`rounded-xl p-3 ${softBackground}`}>
                                                                    <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                                        Número
                                                                    </p>

                                                                    <p className={`text-xs font-semibold mt-1 ${secondaryText}`}>
                                                                        {selectedAddress.number || 'Não informado'}
                                                                    </p>
                                                                </div>
                                                                {/* BAIRRO */}
                                                                <div className={`rounded-xl p-3 ${softBackground}`}>
                                                                    <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                                        Bairro
                                                                    </p>

                                                                    <p className={`text-xs font-semibold mt-1 ${secondaryText}`}>
                                                                        {selectedAddress.neighborhood || 'Não informado'}
                                                                    </p>
                                                                </div>
                                                                {/* CIDADE */}
                                                                <div className={`rounded-xl p-3 ${softBackground}`} >
                                                                    <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                                        Cidade
                                                                    </p>

                                                                    <p className={`text-xs font-semibold mt-1 ${secondaryText}`}>
                                                                        {selectedAddress.city || 'Não informado'}
                                                                    </p>
                                                                </div>
                                                                {/* ESTADO */}
                                                                <div className={`rounded-xl p-3 ${softBackground}`}>
                                                                    <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                                        Estado
                                                                    </p>

                                                                    <p className={`text-xs font-semibold mt-1 ${secondaryText}`}>
                                                                        {selectedAddress.state || 'Não informado'}
                                                                    </p>
                                                                </div>

                                                                {/* CEP */}

                                                                <div className={`rounded-xl p-3 ${softBackground}`}>
                                                                    <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                                        Ponto de referência
                                                                    </p>

                                                                    <p className={`text-xs font-semibold mt-1 ${secondaryText}`}>
                                                                        {selectedAddress.referencePoint || 'Não informado'}
                                                                    </p>
                                                                </div>
                                                                <div className={`rounded-xl p-3 ${softBackground}`}>
                                                                    <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                                        Telefone do Endereço
                                                                    </p>

                                                                    <p className={`text-xs font-semibold mt-1 ${secondaryText}`}>
                                                                        {selectedAddress.phone
                                                                            ? selectedAddress.phone
                                                                                .replace(/\D/g, '')
                                                                                .replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
                                                                            : 'Não informado'
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className={`rounded-xl p-3 ${softBackground}`}>
                                                                    <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                                        Recebedor do Endereço
                                                                    </p>

                                                                    <p className={`text-xs font-semibold mt-1 ${secondaryText}`}>
                                                                        {selectedAddress.name || 'Não informado'}
                                                                    </p>
                                                                </div>
                                                                <div className={`rounded-xl p-3 ${softBackground}`}>
                                                                    <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                                        Complemento
                                                                    </p>

                                                                    <p className={`text-xs font-semibold mt-1 ${secondaryText}`}>
                                                                        {selectedAddress.supplement || 'Não informado'}
                                                                    </p>
                                                                </div>

                                                                {/* CEP */}

                                                                <div className={`rounded-xl p-3 ${softBackground}`}>
                                                                    <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                                        Data Do Cadastro do Endereço
                                                                    </p>

                                                                    <p className={`text-xs font-semibold mt-1 ${secondaryText}`}>
                                                                        {selectedAddress.insertDate
                                                                            ? new Date(selectedAddress.insertDate).toLocaleString('pt-BR', {
                                                                                day: '2-digit',
                                                                                month: '2-digit',
                                                                                year: 'numeric',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                            })
                                                                            : 'Não informado'
                                                                        }
                                                                    </p>
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </div>)}
                                            </div>)}
                                    </div>)}
                                {/* MOVIMENTAÇÕES / LOGS */}
                                {selectedUser.role === `CLIENTE` &&
                                    <div className={`rounded-2xl border ${cardBorder} overflow-hidden`}>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (!showPurchases) {
                                                    setLoadingInfo(true)
                                                    const result = await GetUserInfoOrdersAll(selectedUser.id || 0)
                                                    setAllInforntions(result.data || {})
                                                } else {
                                                    setAllInforntions(null)
                                                }
                                                setShowPurchases(prev => !prev)
                                                setLoadingInfo(false)
                                            }}
                                            className={`w-full flex items-center justify-between p-4 text-left transition-colors ${darkMode ? 'hover:bg-surface-800/50' : 'hover:bg-[#f8f9fa]'}`}
                                        >
                                            <div className="flex items-center gap-3">

                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${darkMode ? 'bg-surface-800 text-brand-400' : 'bg-brand-500/10 text-brand-500'}`} >
                                                    <ShoppingBag className="w-4 h-4" />
                                                </div>

                                                <div>
                                                    <p className={`text-sm font-bold ${primaryText}`}>
                                                        Resumo de compras
                                                    </p>

                                                    <p className={`text-xs mt-0.5 ${mutedText}`}>
                                                        Pedidos, pagamentos e histórico de compras.
                                                    </p>
                                                </div>
                                            </div>
                                            {loadingInfo ? (
                                                <Loader2 className={`w-4 h-4 animate-spin ${mutedText}`} />
                                            ) : (
                                                <ChevronDown className={`w-5 h-5 ${mutedText} transition-transform duration-200 ${showPurchases ? 'rotate-180' : ''}`} />
                                            )}
                                        </button>

                                        {showPurchases && (
                                            <div className={`px-4 pb-4 border-t ${cardBorder}`}>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">

                                                    {/* QUANTIDADE DE PEDIDOS */}
                                                    <div className={`rounded-xl p-3 ${softBackground}`}>
                                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                            Pedidos
                                                        </p>

                                                        <p className={`text-lg font-bold mt-1 ${primaryText}`}>
                                                            {AllInforntion?.ordersAmount ?? 0}
                                                        </p>

                                                        <p className={`text-[10px] mt-0.5 ${mutedText}`}>
                                                            pedidos realizados
                                                        </p>
                                                    </div>

                                                    {/* PEDIDOS ENTREGUES */}
                                                    <div className={`rounded-xl p-3 ${softBackground}`}>
                                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                            Entregues
                                                        </p>

                                                        <p className="text-lg font-bold mt-1 text-emerald-500">
                                                            {AllInforntion?.ordersDelivered ?? 0}
                                                        </p>

                                                        <p className={`text-[10px] mt-0.5 ${mutedText}`}>
                                                            pedidos entregues
                                                        </p>
                                                    </div>

                                                    {/* PEDIDOS CANCELADOS */}
                                                    <div className={`rounded-xl p-3 ${softBackground}`}>
                                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                            Cancelados
                                                        </p>

                                                        <p className="text-lg font-bold mt-1 text-red-500">
                                                            {AllInforntion?.ordersCanceled ?? 0}
                                                        </p>

                                                        <p className={`text-[10px] mt-0.5 ${mutedText}`}>
                                                            pedidos cancelados
                                                        </p>
                                                    </div>

                                                    {/* CUPONS UTILIZADOS */}
                                                    <div className={`rounded-xl p-3 ${softBackground}`}>
                                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                            Cupons usados
                                                        </p>

                                                        <p className={`text-lg font-bold mt-1 ${primaryText}`}>
                                                            {AllInforntion?.couponAmount ?? 0}
                                                        </p>

                                                        <p className={`text-[10px] mt-0.5 ${mutedText}`}>
                                                            cupons utilizados
                                                        </p>
                                                    </div>

                                                    {/* TOTAL GASTO */}
                                                    <div className={`rounded-xl p-3 ${softBackground}`}>
                                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                            Total gasto
                                                        </p>

                                                        <p className={`text-sm font-bold mt-2 ${primaryText}`}>
                                                            {(AllInforntion?.totalExpenses ?? 0).toLocaleString('pt-BR', {
                                                                style: 'currency',
                                                                currency: 'BRL'
                                                            })}
                                                        </p>

                                                        <p className={`text-[10px] mt-0.5 ${mutedText}`}>
                                                            valor total dos pedidos
                                                        </p>
                                                    </div>

                                                    {/* CARRINHO */}
                                                    <div className={`rounded-xl p-3 ${softBackground}`}>
                                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                            Carrinho
                                                        </p>

                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span
                                                                className={`w-2 h-2 rounded-full ${AllInforntion?.emptyCart
                                                                    ? 'bg-brand-500'
                                                                    : 'bg-surface-400'
                                                                    }`}
                                                            />

                                                            <p className={`text-xs font-bold ${primaryText}`}>
                                                                {AllInforntion?.emptyCart
                                                                    ? 'Possui produtos'
                                                                    : 'Carrinho vazio'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* PAGAMENTO PENDENTE */}
                                                    <div className={`rounded-xl p-3 sm:col-span-2 ${softBackground}`}>
                                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                            Pagamento
                                                        </p>

                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span
                                                                className={`w-2 h-2 rounded-full ${AllInforntion?.paymentRequestPending
                                                                    ? 'bg-amber-500'
                                                                    : 'bg-emerald-500'
                                                                    }`}
                                                            />

                                                            <p
                                                                className={`text-xs font-bold ${AllInforntion?.paymentRequestPending
                                                                    ? 'text-amber-600 dark:text-amber-400'
                                                                    : 'text-emerald-600 dark:text-emerald-400'
                                                                    }`}
                                                            >
                                                                {AllInforntion?.paymentRequestPending
                                                                    ? 'Possui pagamento pendente'
                                                                    : 'Nenhum pagamento pendente'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        )}
                                    </div>}

                                <div className={`rounded-2xl border ${cardBorder} overflow-hidden`}>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const nextState = !showLogs;

                                            setShowLogs(nextState);
                                        }}
                                        className={`w-full flex items-center justify-between p-4 text-left transition-colors ${darkMode ? 'hover:bg-surface-800/50' : 'hover:bg-[#f8f9fa]'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${darkMode ? 'bg-brand-500/10 text-brand-400' : 'bg-brand-50 text-brand-500'}`}>
                                                <Activity className="w-4 h-4" />
                                            </div>

                                            <div>
                                                <p className={`text-xs font-bold ${primaryText}`}>
                                                    Movimentações
                                                </p>

                                                <p className={`text-[10px] mt-0.5 ${mutedText}`}>
                                                    Histórico de atividades do usuário.
                                                </p>
                                            </div>
                                        </div>

                                        {loadingLogs ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        ) : (
                                            <ChevronDown className={`w-5 h-5 ${mutedText} transition-transform duration-200 ${showLogs ? 'rotate-180' : ''}`} />
                                        )}
                                    </button>

                                    {showLogs && (
                                        <div className={`px-4 pb-4 border-t ${cardBorder}`}>
                                            <div className="pt-4 space-y-3">

                                                {(!FilterLogsUserSelect || FilterLogsUserSelect.length === 0) ? (

                                                    <div className={`rounded-xl p-4 ${softBackground} text-center`}>
                                                        <Activity
                                                            className={`w-5 h-5 mx-auto mb-2 ${mutedText}`}
                                                        />

                                                        <p className={`text-xs font-semibold ${secondaryText}`}>
                                                            Nenhuma movimentação encontrada
                                                        </p>

                                                        <p className={`text-[10px] mt-1 ${mutedText}`}>
                                                            Este usuário ainda não possui movimentações registradas.
                                                        </p>
                                                    </div>

                                                ) : (

                                                    <>
                                                        {/* CONTADOR */}
                                                        <div className="flex items-center justify-between">
                                                            <p
                                                                className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}
                                                            >
                                                                Histórico de movimentações
                                                            </p>

                                                            <span
                                                                className={`text-[9px] font-bold px-2 py-1 rounded-full ${darkMode
                                                                    ? 'bg-surface-800 text-surface-300'
                                                                    : 'bg-gray-100 text-gray-600'
                                                                    }`}
                                                            >
                                                                {FilterLogsUserSelect.length} registro
                                                                {FilterLogsUserSelect.length !== 1 ? 's' : ''}
                                                            </span>
                                                        </div>

                                                        {/* LISTA DE LOGS */}
                                                        <div
                                                            className={`max-h-72 overflow-y-auto pr-1 space-y-2 scrollbar-thin ${darkMode
                                                                ? 'scrollbar-thumb-surface-700'
                                                                : 'scrollbar-thumb-gray-300'
                                                                }`}
                                                        >
                                                            {FilterLogsUserSelect.map((log: Logs, index: number) => {
                                                                const level = log.tipo?.toUpperCase() || 'SISTEMA';

                                                                const isSelected = selectedLog === log;
                                                                const levelConfig = configs[level] ?? configs["SISTEMA"];

                                                                return (
                                                                    <button
                                                                        key={log.id ?? index}
                                                                        type="button"
                                                                        onClick={() => setSelectedLog(log)}
                                                                        className={`
                    w-full text-left rounded-xl border p-3
                    transition-all
                    ${isSelected
                                                                                ? darkMode
                                                                                    ? 'border-brand-500/50 bg-brand-500/10'
                                                                                    : 'border-brand-300 bg-brand-50'
                                                                                : `${cardBorder} ${softBackground}`
                                                                            }
                `}
                                                                    >
                                                                        <div className="flex items-center gap-3">

                                                                            {/* ÍCONE */}
                                                                            <div className={` w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${levelConfig.border} ${levelConfig.bg} ${levelConfig.text}`}>
                                                                                <levelConfig.icon className="w-4 h-4" />
                                                                            </div>

                                                                            {/* INFORMAÇÕES */}
                                                                            <div className="min-w-0 flex-1">

                                                                                {/* TÍTULO + TIPO */}
                                                                                <div className="flex items-center gap-2 min-w-0">

                                                                                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-brand-500' : primaryText}`}>
                                                                                        {log.acao || 'Movimentação'}
                                                                                    </p>

                                                                                    {/* BADGE DO TIPO */}
                                                                                    <span className={` shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${levelConfig.border} ${levelConfig.bg} ${levelConfig.text}`} >
                                                                                        {levelConfig.label}
                                                                                    </span>

                                                                                </div>

                                                                                {/* DESCRIÇÃO */}
                                                                                <p
                                                                                    className={`text-[10px] mt-1 truncate ${mutedText}`}
                                                                                >
                                                                                    {log.log || 'Sem descrição'}
                                                                                </p>

                                                                                {/* DATA */}
                                                                                <p
                                                                                    className={`text-[9px] mt-1 ${mutedText}`}
                                                                                >
                                                                                    {log.insertDate
                                                                                        ? new Date(log.insertDate).toLocaleString(
                                                                                            'pt-BR'
                                                                                        )
                                                                                        : 'Data não informada'}
                                                                                </p>

                                                                            </div>

                                                                            {/* SELECIONADO */}
                                                                            {isSelected && (
                                                                                <CheckCircle2
                                                                                    className="w-4 h-4 text-brand-500 shrink-0"
                                                                                />
                                                                            )}

                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* DETALHES DO LOG SELECIONADO */}
                                                        {selectedLog && (
                                                            <div
                                                                className={`rounded-xl border ${cardBorder} overflow-hidden`}
                                                            >
                                                                {/* HEADER */}
                                                                <div
                                                                    className={`px-4 py-3 ${softBackground} border-b ${cardBorder}`}
                                                                >
                                                                    <div className="flex items-center gap-3">

                                                                        <div
                                                                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand-500/10 text-brand-500"
                                                                        >
                                                                            <Activity className="w-4 h-4" />
                                                                        </div>

                                                                        <div>
                                                                            <p
                                                                                className={`text-xs font-bold ${primaryText}`}
                                                                            >
                                                                                Detalhes da movimentação
                                                                            </p>

                                                                            <p
                                                                                className={`text-[10px] mt-0.5 ${mutedText}`}
                                                                            >
                                                                                Informações do registro selecionado
                                                                            </p>
                                                                        </div>

                                                                    </div>
                                                                </div>

                                                                {/* DADOS */}
                                                                <div className="p-3">
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                                                        {/* AÇÃO */}
                                                                        <div className={`rounded-xl p-3 ${softBackground}`}>
                                                                            <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                                                Ação
                                                                            </p>

                                                                            <p className={`text-xs font-semibold mt-1 ${secondaryText}`}>
                                                                                {selectedLog.acao || 'Não informado'}
                                                                            </p>
                                                                        </div>

                                                                        {/* DATA */}
                                                                        <div className={`rounded-xl p-3 ${softBackground}`}>
                                                                            <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                                                Data
                                                                            </p>

                                                                            <p className={`text-xs font-semibold mt-1 ${secondaryText}`}
                                                                            >
                                                                                {selectedLog.insertDate
                                                                                    ? new Date(selectedLog.insertDate).toLocaleString('pt-BR') : 'Não informado'}
                                                                            </p>
                                                                        </div>

                                                                        {/* DESCRIÇÃO */}
                                                                        <div className={`rounded-xl p-3 sm:col-span-2 ${softBackground}`}>
                                                                            <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                                                Descrição
                                                                            </p>

                                                                            <p className={`text-xs font-semibold mt-1 ${secondaryText} break-words`}>
                                                                                {selectedLog.log || 'Não informado'}
                                                                            </p>
                                                                        </div>

                                                                        {/* TIPO */}
                                                                        <div className={`rounded-xl p-3 ${softBackground}`}>
                                                                            <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                                                Tipo
                                                                            </p>

                                                                            <p className={`text-xs font-semibold mt-1 ${secondaryText}`}>
                                                                                {selectedLog.tipo || 'Não informado'}
                                                                            </p>
                                                                        </div>

                                                                        {/* IP */}
                                                                        <div className={`rounded-xl p-3 ${softBackground}`}>
                                                                            <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                                                IP
                                                                            </p>

                                                                            <p className={`text-xs font-semibold mt-1 ${secondaryText}`}>
                                                                                {selectedLog.id ||
                                                                                    'Não informado'}
                                                                            </p>
                                                                        </div>
                                                                        <div className={`rounded-xl p-3 sm:col-span-2 ${softBackground}`}>
                                                                            <p className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}>
                                                                                Informação
                                                                            </p>

                                                                            <p className={`text-xs font-semibold mt-1 ${secondaryText} break-words`}>
                                                                                {selectedLog.info || 'Não informado'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* ACCESS STATUS */}

                            <div className={` flex items-center justify-between rounded-2xl p-4 ${selectedUser.ativo ? 'bg-emerald-500/5 border border-emerald-500/10' : `${softBackground} border ${cardBorder}`}`}>
                                <div className="flex items-center gap-3">
                                    <div className={` w-9 h-9 rounded-xl flex items-center justify-center ${selectedUser.ativo ? 'bg-emerald-500/10 text-emerald-500' : darkMode ? 'bg-surface-800 text-surface-400' : 'bg-[#e9ebee] text-[#8b929c]'}`}>
                                        {selectedUser.ativo ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : (
                                            <UserX className="w-5 h-5" />
                                        )}
                                    </div>

                                    <div>
                                        <p className={`text-xs font-bold ${primaryText} `} >
                                            {selectedUser.ativo ? 'Conta ativa' : 'Conta inativa'}
                                        </p>

                                        <p className={` text-[10px] mt-0.5 ${mutedText}`}>
                                            {selectedUser.ativo ? 'O usuário possui acesso à plataforma.' : 'O acesso do usuário está bloqueado.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}

                        <div className="flex gap-3 p-6 pt-0">
                            <button
                                type="button"
                                onClick={() => {
                                    OncloseCard()
                                }
                                }
                                className={` flex-1 px-4 py-3 rounded-xl border ${softBorder} text-sm font-bold ${secondaryText} ${darkMode ? 'hover:bg-surface-800' : 'hover:bg-[#f5f6f8]'} transition-colors`}
                            >
                                Fechar
                            </button>

                            <button
                                type="button"
                                className=" flex-1 px-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-brand transition-all"
                            >
                                <span className="inline-flex items-center justify-center gap-2">
                                    <Pencil className="w-4 h-4" />
                                    Editar usuário
                                </span>
                            </button>
                        </div>
                    </div>
                </div >
            )
            }

            {showCreateModal && (
                <div
                    className=" fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() =>
                        setShowCreateModal(false)
                    }
                >
                    <div
                        className={` w-full max-w-md rounded-3xl ${cardBackground} border ${cardBorder} shadow-2xl overflow-hidden`}
                        onClick={e =>
                            e.stopPropagation()
                        }
                    >
                        <div
                            className={`
                                p-6
                                border-b
                                ${cardBorder}
                            `}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className=" w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                                        <UserPlus className="w-5 h-5 text-brand-500" />
                                    </div>

                                    <div>
                                        <h3 className={` font-display font-bold text-lg ${primaryText}`}>
                                            Novo usuário
                                        </h3>

                                        <p
                                            className={`
                                                text-xs
                                                mt-0.5
                                                ${mutedText}
                                            `}
                                        >
                                            Cadastre um novo acesso.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCreateModal(
                                            false
                                        )
                                    }
                                    className={` w-9 h-9 rounded-xl flex items-center justify-center ${mutedText} ${darkMode ? 'hover:bg-surface-800' : 'hover:bg-[#f0f2f5]'}
                                    `}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label
                                    className={` block text-[10px] font-bold uppercase tracking-widest ${mutedText} mb-2`}
                                >
                                    Nome completo
                                </label>

                                <input
                                    type="text"
                                    placeholder="Ex.: João da Silva"
                                    className={` w-full px-4 py-3 rounded-xl ${inputBackground} border ${inputBorder} text-sm ${primaryText} outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10`}
                                />
                            </div>

                            <div>
                                <label
                                    className={` block text-[10px] font-bold uppercase tracking-widest ${mutedText} mb-2`}
                                >
                                    E-mail
                                </label>

                                <input
                                    type="email"
                                    placeholder="usuario@email.com"
                                    className={` w-full px-4 py-3 rounded-xl ${inputBackground} border ${inputBorder} text-sm ${primaryText} outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10
                                    `}
                                />
                            </div>

                            <div>
                                <label
                                    className={`
                                        block
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-widest
                                        ${mutedText}
                                        mb-2
                                    `}
                                >
                                    Tipo de usuário
                                </label>

                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        {
                                            role: 'client' as UserRole,
                                            label: 'Cliente',
                                            icon: UserRound,
                                        },
                                        {
                                            role: 'delivery' as UserRole,
                                            label: 'Delivery',
                                            icon: Truck,
                                        },
                                        {
                                            role: 'admin' as UserRole,
                                            label: 'Admin',
                                            icon: ShieldCheck,
                                        },
                                    ].map(item => {
                                        const Icon =
                                            item.icon;

                                        const active =
                                            newUserRole === item.role;

                                        return (
                                            <button
                                                key={item.role}
                                                type="button"
                                                onClick={() =>
                                                    setNewUserRole(
                                                        item.role
                                                    )
                                                }
                                                className={` flex flex-col items-center justify-center gap-2 py-3 rounded-xl border text-xs transition-all ${active ? darkMode ? 'border-brand-700 bg-brand-500/10 text-brand-400' : 'border-brand-300 bg-brand-50 text-brand-600' : `${softBorder} ${mutedText} ${darkMode ? 'hover:bg-surface-800 hover:text-white' : 'hover:bg-[#f7f8fa] hover:text-[#20242b]'}`}`}
                                            >
                                                <Icon className="w-5 h-5" />

                                                <span className="text-[10px] font-bold">
                                                    {item.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 pt-0">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowCreateModal(false)
                                }
                                className={` flex-1 px-4 py-3 rounded-xl border ${softBorder} text-sm font-bold ${secondaryText} ${darkMode ? 'hover:bg-surface-800' : 'hover:bg-[#f5f6f8]'}`}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="  flex-1  px-4  py-3  rounded-xl  bg-brand-500  hover:bg-brand-600  text-white  text-sm  font-bold  shadow-brand"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Criar usuário
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
            <ConfirmAdminPopup
                open={Controller?.result.showCouponModalActive ?? false}
                title={Controller?.result.TitleCOnfirm}
                description={Controller?.result.DescriptionConfirm}
                confirmText={Controller?.result.ButtonConfirm}
                cancelText="Cancelar"
                confirmColor="red"
                loading={Controller?.result.Loading}
                onConfirm={() => Controller?.action.handleDesactivUSer(DesactvUserSelectd.UserId, DesactvUserSelectd.role, DesactvUserSelectd.Activ)}
                onCancel={() => {
                    Controller?.action.setShowCouponModalActive(false)
                }}
            />
            <ConfirmAdminPopup
                open={Controller?.result.ShowDeleteUser ?? false}
                title={Controller?.result.TitleCOnfirm}
                description={Controller?.result.DescriptionConfirm}
                confirmText={Controller?.result.ButtonConfirm}
                cancelText="Cancelar"
                confirmColor="red"
                loading={loadingDelet}
                requireReason
                onConfirm={async (reason) => {
                    setLoadingDelete(true)
                    const result = await DeleteUserSelected(DesactvUserSelectd.UserId, DesactvUserSelectd.role, reason ?? '');
                    setLoadingDelete(false)
                    if (!result.success) {
                        // Mantém o popup aberto para corrigir o motivo
                        notify.error(result.error?.error.code || 'Usuário', result.error?.error.message || "error ao Excluir Usuário!")
                        return;
                    }
                    notify.success("Usuário Excluido", "Usuário enviado para a Lixeira.")
                    Controller?.action.setShowDeleteUser(false)
                    Controller?.action.setOpenMenu(null);
                }}
                onCancel={() => {
                    Controller?.action.setShowDeleteUser(false)
                }}
            />
        </>
    );
}