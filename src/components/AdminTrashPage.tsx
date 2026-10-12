import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedValue } from '../utils/useDebouncedValue';
import {
    Search,
    Trash2,
    RotateCcw,
    ShieldAlert,
    UserRound,
    MapPin,
    ShoppingBag,
    FileText,
    Bell,
    Star,
    Ticket,
    Mail,
    ShoppingCart,
    X,
    Clock3,
    CalendarDays,
    AlertTriangle,
    Eye,
    User,
    Database,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Package,
    Hash,
    Image as ImageIcon,
    Layers,
    Tags,
    Link2,
    MessageSquareText,
    UserCog,
    Loader2,
    RefreshCw,
} from 'lucide-react';
import { TrashEntityType, TrashItem } from '../models/TrashItem';
import { useTrashAdminController } from '../controller/useTrashAdminController';

/* ============================================================= */
/* TIPOS                                                          */
/* ============================================================= */

export type { TrashEntityType, TrashItem } from '../models/TrashItem';

interface AdminTrashPageProps {
    darkMode: boolean;
    items?: TrashItem[];
    onRestore?: (item: TrashItem) => Promise<void>;
    onPermanentDelete?: (item: TrashItem) => Promise<void>;
}

/* ============================================================= */
/* CONFIGURAÇÃO                                                    */
/* ============================================================= */

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

const entityConfig: Record<
    TrashEntityType,
    { label: string; icon: React.ElementType; className: string }
> = {
    USER: {
        label: 'Usuário',
        icon: UserRound,
        className:
            'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
    },

    ADDRESS: {
        label: 'Endereço',
        icon: MapPin,
        className:
            'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    },

    ORDER: {
        label: 'Pedido',
        icon: ShoppingBag,
        className:
            'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
    },

    CART: {
        label: 'Carrinho',
        icon: ShoppingCart,
        className:
            'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    },

    CART_ITEM: {
        label: 'Item do carrinho',
        icon: ShoppingCart,
        className:
            'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    },

    LOG: {
        label: 'Log',
        icon: FileText,
        className:
            'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
    },

    NOTIFICATION: {
        label: 'Notificação',
        icon: Bell,
        className:
            'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
    },

    RATING: {
        label: 'Avaliação',
        icon: Star,
        className:
            'bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400',
    },

    COUPON_USE: {
        label: 'Uso de cupom',
        icon: Ticket,
        className:
            'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',
    },

    EMAIL_VERIFICATION: {
        label: 'Verificação de e-mail',
        icon: Mail,
        className:
            'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
    },

    CUSTOMIZE: {
        label: 'Personalização',
        icon: User,
        className:
            'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-400',
    },

    ORDER_ITEM: {
        label: 'Item do pedido',
        icon: Package,
        className:
            'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
    },

    PRODUCT: {
        label: 'Produto',
        icon: Package,
        className:
            'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400',
    },

    PRODUCT_IMAGE: {
        label: 'Imagem do produto',
        icon: ImageIcon,
        className:
            'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400',
    },

    PRODUCT_VARIANT: {
        label: 'Variação do produto',
        icon: Layers,
        className:
            'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400',
    },

    CATEGORY: {
        label: 'Categoria',
        icon: Tags,
        className:
            'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
    },

    COUPON: {
        label: 'Cupom',
        icon: Ticket,
        className:
            'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
    },

    COUPON_PRODUCT: {
        label: 'Cupom × produto',
        icon: Link2,
        className:
            'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
    },

    COUPON_CATEGORY: {
        label: 'Cupom × categoria',
        icon: Link2,
        className:
            'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
    },

    OTHER: {
        label: 'Outro',
        icon: Database,
        className:
            'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
    },
};

/** Seções de itens excluídos junto (na ordem de exibição). */
const RELATED_SECTIONS: { key: string; title: string; icon: React.ElementType }[] = [
    { key: 'addresses', title: 'Endereços', icon: MapPin },
    { key: 'orders', title: 'Pedidos', icon: ShoppingBag },
    { key: 'orderItems', title: 'Itens dos pedidos', icon: Package },
    { key: 'carts', title: 'Carrinhos', icon: ShoppingCart },
    { key: 'cartItems', title: 'Itens do carrinho', icon: ShoppingCart },
    { key: 'ratings', title: 'Avaliações', icon: Star },
    { key: 'couponUses', title: 'Usos de cupom', icon: Ticket },
    { key: 'notifications', title: 'Notificações', icon: Bell },
    { key: 'emailVerifications', title: 'Verificações de e-mail', icon: Mail },
    { key: 'customizes', title: 'Personalização', icon: User },
    { key: 'products', title: 'Produtos', icon: Package },
    { key: 'productImages', title: 'Imagens dos produtos', icon: ImageIcon },
    { key: 'productVariants', title: 'Variações dos produtos', icon: Layers },
    { key: 'couponProducts', title: 'Produtos vinculados ao cupom', icon: Link2 },
    { key: 'couponCategories', title: 'Categorias vinculadas ao cupom', icon: Link2 },
    { key: 'logs', title: 'Logs', icon: FileText },
    { key: 'others', title: 'Outros', icon: Database },
];

const getEntityConfig = (type: string) =>
    entityConfig[type as TrashEntityType] ?? entityConfig.OTHER;

/* ============================================================= */
/* HELPERS                                                        */
/* ============================================================= */

const getTrashKey = (item: TrashItem) =>
    `${item.entityType}-${item.id}`;

const isExpired = (item: TrashItem) => {
    if (!item.permanentDeleteAt) return false;

    return (
        new Date(item.permanentDeleteAt).getTime() <= Date.now()
    );
};

export default function AdminTrashPage({
    darkMode,
    items,
    onRestore,
    onPermanentDelete,
}: AdminTrashPageProps) {
    const [search, setSearch] = useState('');

    const [filter, setFilter] = useState<
        'ALL' | 'USER' | 'ADDRESS' | 'PRODUCT' | 'CATEGORY' | 'COUPON' | 'ORDER' | 'OTHER'
    >('ALL');

    const [selectedItem, setSelectedItem] =
        useState<TrashItem | null>(null);

    const [modalIntent, setModalIntent] =
        useState<'view' | 'delete'>('view');

    const [loadingAction, setLoadingAction] =
        useState(false);

    const [page, setPage] = useState(1);

    /* NOVO: quantidade de registros por página */
    const [pageSize, setPageSize] = useState(10);

    const [selectedKeys, setSelectedKeys] =
        useState<Set<string>>(new Set());

    const [bulkConfirmOpen, setBulkConfirmOpen] =
        useState(false);

    /* ========================================================= */
    /* MOCK / API                                                  */
    /* ========================================================= */

    const Controller = useTrashAdminController();

    // Sem "items" (uso real): cada página é buscada no banco com a quantidade escolhida
    const serverMode = !items;

    const sourceItems = items ?? Controller.result.items;

    /* ========================================================= */
    /* RESET DA PAGINA                                             */
    /* ========================================================= */

    useEffect(() => {
        if (serverMode) return;
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, filter, pageSize]);

    /* ========================================================= */
    /* SERVIDOR: tipo e busca aplicados antes de paginar           */
    /* ========================================================= */

    const debouncedSearch = useDebouncedValue(search);
    const serverPage = Controller.result.query.page;

    useEffect(() => {
        if (!serverMode) return;
        const current = Controller.result.query;

        // Mudou busca, tipo ou quantidade: volta para a página 1
        if ((current.search ?? '') !== debouncedSearch || current.filter !== filter || current.pageSize !== pageSize) {
            setPage(1);
            Controller.action.SetQuery({ search: debouncedSearch, filter, pageSize, page: 1 });
            return;
        }

        if (current.page !== page) {
            Controller.action.SetQuery({ page });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverMode, debouncedSearch, filter, pageSize, page]);

    // Página ajustada pelo servidor (ex.: a última página ficou vazia depois de restaurar)
    useEffect(() => {
        if (serverMode && serverPage !== page) setPage(serverPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverPage]);

    // Itens já vistos (para a seleção continuar valendo ao trocar de página)
    const knownItems = useRef(new Map<string, TrashItem>());
    sourceItems.forEach((item) => knownItems.current.set(getTrashKey(item), item));

    /* ========================================================= */
    /* CORES                                                       */
    /* ========================================================= */

    const pageBackground = darkMode
        ? 'bg-surface-950'
        : 'bg-[#f7f8fa]';

    const cardBackground = darkMode
        ? 'bg-surface-900'
        : 'bg-white';

    const cardBorder = darkMode
        ? 'border-surface-800'
        : 'border-[#e7e9ee]';

    const dividerClass = darkMode
        ? 'divide-surface-800'
        : 'divide-[#e7e9ee]';

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

    /* ========================================================= */
    /* FILTROS                                                     */
    /* ========================================================= */

    const filteredItems = useMemo(() => {
        // Servidor já devolve a página filtrada e na mesma ordem
        if (serverMode) return sourceItems;

        const term = search.trim().toLowerCase();

        const matches = sourceItems.filter((item) => {
            let matchesType = true;

            if (filter === 'USER') {
                matchesType =
                    item.entityType === 'USER';
            }

            if (filter === 'ADDRESS') {
                matchesType =
                    item.entityType === 'ADDRESS';
            }

            if (filter === 'PRODUCT') {
                matchesType =
                    item.entityType === 'PRODUCT';
            }

            if (filter === 'CATEGORY') {
                matchesType =
                    item.entityType === 'CATEGORY';
            }

            if (filter === 'COUPON') {
                matchesType =
                    item.entityType === 'COUPON';
            }

            if (filter === 'ORDER') {
                matchesType =
                    item.entityType === 'ORDER' ||
                    item.entityType === 'ORDER_ITEM';
            }

            if (filter === 'OTHER') {
                matchesType = ![
                    'USER',
                    'ADDRESS',
                    'PRODUCT',
                    'CATEGORY',
                    'COUPON',
                    'ORDER',
                    'ORDER_ITEM',
                ].includes(item.entityType);
            }

            const dataText = Object.values(
                item.data ?? {}
            )
                .map((value) =>
                    typeof value === 'object'
                        ? JSON.stringify(value)
                        : String(value ?? '')
                )
                .join(' ')
                .toLowerCase();

            const matchesSearch =
                !term ||
                item.entityName
                    ?.toLowerCase()
                    .includes(term) ||
                item.userName
                    ?.toLowerCase()
                    .includes(term) ||
                item.userEmail
                    ?.toLowerCase()
                    .includes(term) ||
                item.userRole
                    ?.toLowerCase()
                    .includes(term) ||
                String(item.id).includes(term) ||
                item.reason
                    ?.toLowerCase()
                    .includes(term) ||
                item.deletedByName
                    ?.toLowerCase()
                    .includes(term) ||
                dataText.includes(term);

            return (
                matchesType &&
                matchesSearch
            );
        });

        /*
         * Vencidos primeiro.
         * Depois, os que estão mais próximos
         * de vencer.
         */
        return [...matches].sort((a, b) => {
            const aExpired = isExpired(a);
            const bExpired = isExpired(b);

            if (aExpired !== bExpired) {
                return aExpired ? -1 : 1;
            }

            const aTime = a.permanentDeleteAt
                ? new Date(
                    a.permanentDeleteAt
                ).getTime()
                : Infinity;

            const bTime = b.permanentDeleteAt
                ? new Date(
                    b.permanentDeleteAt
                ).getTime()
                : Infinity;

            if (aTime !== bTime) {
                return aTime - bTime;
            }

            // Mais recentes primeiro
            return (
                new Date(b.deletedAt ?? 0).getTime() -
                new Date(a.deletedAt ?? 0).getTime()
            );
        });
    }, [serverMode, sourceItems, search, filter]);

    /* ========================================================= */
    /* PAGINAÇÃO                                                   */
    /* ========================================================= */

    const totalCount = serverMode
        ? Controller.result.total
        : filteredItems.length;

    const totalPages = Math.max(
        1,
        Math.ceil(
            totalCount / pageSize
        )
    );

    const startIndex =
        (page - 1) * pageSize;

    const endIndex =
        startIndex + pageSize;

    const paginatedItems = serverMode
        ? filteredItems
        : filteredItems.slice(
            startIndex,
            endIndex
        );

    const showingFrom =
        totalCount === 0
            ? 0
            : startIndex + 1;

    const showingTo = Math.min(
        endIndex,
        totalCount
    );

    /* ========================================================= */
    /* SELEÇÃO                                                     */
    /* ========================================================= */

    const selectedItems = useMemo(
        () =>
            serverMode
                ? Array.from(selectedKeys)
                    .map((key) => knownItems.current.get(key))
                    .filter((item): item is TrashItem => !!item)
                : sourceItems.filter((item) =>
                    selectedKeys.has(
                        getTrashKey(item)
                    )
                ),
        [serverMode, sourceItems, selectedKeys]
    );

    const allOnPageSelected =
        paginatedItems.length > 0 &&
        paginatedItems.every((item) =>
            selectedKeys.has(
                getTrashKey(item)
            )
        );

    /* ========================================================= */
    /* HELPERS                                                      */
    /* ========================================================= */

    const getRemainingTime = (
        date?: string | null
    ) => {
        if (!date) {
            return 'Sem exclusão automática';
        }

        const diff =
            new Date(date).getTime() -
            Date.now();

        if (diff <= 0) {
            return 'Expirado';
        }

        const days = Math.floor(
            diff / 86400000
        );

        const hours = Math.floor(
            (diff % 86400000) /
            3600000
        );

        const minutes = Math.floor(
            (diff % 3600000) /
            60000
        );

        if (days > 0) {
            return `${days}d ${hours}h restantes`;
        }

        if (hours > 0) {
            return `${hours}h ${minutes}min restantes`;
        }

        return `${minutes}min restantes`;
    };

    const formatDate = (
        date?: string | null
    ) => {
        if (!date) {
            return 'Não informado';
        }

        return new Date(
            date
        ).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // A lista é recarregada pela store após cada ação.
    const removeFromMock = (
        _keys: string[]
    ) => {
        setSelectedKeys(new Set());
    };

    const getRelatedCount = (
        item: TrashItem
    ) => {
        if (!item.related) {
            return 0;
        }

        return Object.values(
            item.related
        ).reduce(
            (total, list) =>
                total +
                (Array.isArray(list)
                    ? list.length
                    : 0),
            0
        );
    };

    const getRoleLabel = (
        role?: string | null
    ) => {
        if (!role) {
            return 'Não informado';
        }

        switch (
        role.toUpperCase()
        ) {
            case 'CLIENTE':
                return 'Cliente';

            case 'ADMIN':
                return 'Administrador';

            case 'DELIVERY':
                return 'Entregador';

            default:
                return role;
        }
    };

    /* ========================================================= */
    /* AÇÕES                                                        */
    /* ========================================================= */

    const openDetails = (
        item: TrashItem
    ) => {
        setModalIntent('view');
        setSelectedItem(item);
    };

    const openDelete = (
        item: TrashItem
    ) => {
        setModalIntent('delete');
        setSelectedItem(item);
    };

    const toggleSelected = (
        key: string
    ) => {
        setSelectedKeys((prev) => {
            const next = new Set(prev);

            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }

            return next;
        });
    };

    const togglePageSelection =
        () => {
            setSelectedKeys((prev) => {
                const next = new Set(
                    prev
                );

                if (
                    allOnPageSelected
                ) {
                    paginatedItems.forEach(
                        (item) =>
                            next.delete(
                                getTrashKey(
                                    item
                                )
                            )
                    );
                } else {
                    paginatedItems.forEach(
                        (item) =>
                            next.add(
                                getTrashKey(
                                    item
                                )
                            )
                    );
                }

                return next;
            });
        };

    const handlePermanentDelete =
        async () => {
            if (!selectedItem) return;

            try {
                setLoadingAction(true);

                if (onPermanentDelete) {
                    await onPermanentDelete(selectedItem);
                } else {
                    const ok = await Controller.action.purgeItem(selectedItem);
                    if (!ok) return;
                }

                removeFromMock([getTrashKey(selectedItem)]);
                setSelectedItem(null);
            } finally {
                setLoadingAction(false);
            }
        };

    const handleRestore =
        async () => {
            if (!selectedItem) return;

            try {
                setLoadingAction(true);

                if (onRestore) {
                    await onRestore(selectedItem);
                } else {
                    const ok = await Controller.action.restoreItem(selectedItem);
                    if (!ok) return;
                }

                removeFromMock([getTrashKey(selectedItem)]);
                setSelectedItem(null);
            } finally {
                setLoadingAction(false);
            }
        };

    const handleBulkRestore =
        async () => {
            try {
                setLoadingAction(true);

                if (onRestore) {
                    for (const item of selectedItems) {
                        await onRestore(item);
                    }
                } else {
                    await Controller.action.bulkAction(selectedItems, 'restore');
                }

                removeFromMock(selectedItems.map(getTrashKey));
                setSelectedKeys(new Set());
            } finally {
                setLoadingAction(false);
            }
        };

    const handleBulkDelete =
        async () => {
            try {
                setLoadingAction(true);

                if (onPermanentDelete) {
                    for (const item of selectedItems) {
                        await onPermanentDelete(item);
                    }
                } else {
                    await Controller.action.bulkAction(selectedItems, 'purge');
                }

                removeFromMock(selectedItems.map(getTrashKey));
                setSelectedKeys(new Set());
                setBulkConfirmOpen(false);
            } finally {
                setLoadingAction(false);
            }
        };

    return (
        <>
            <div
                className={`w-full min-h-full space-y-6 pb-10 ${pageBackground}`}
            >
                {/* ================================================= */}
                {/* HEADER                                             */}
                {/* ================================================= */}

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                            <Trash2 className="w-6 h-6 text-red-500" />

                            <span
                                className={`absolute -right-1 -top-1 w-3 h-3 rounded-full bg-red-500 border-2 ${darkMode
                                        ? 'border-surface-950'
                                        : 'border-[#f7f8fa]'
                                    }`}
                            />
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h1
                                    className={`font-display text-2xl font-bold ${primaryText}`}
                                >
                                    Lixeira
                                </h1>

                                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold">
                                    <ShieldAlert className="w-3 h-3" />
                                    Área administrativa
                                </span>
                            </div>

                            <p
                                className={`text-sm mt-1 ${mutedText}`}
                            >
                                Tudo o que foi excluído no sistema: o quê, por quem e por quê.
                            </p>
                        </div>
                    </div>

                    {!items && (
                        <button
                            type="button"
                            onClick={() => Controller.action.LoadTrash()}
                            disabled={Controller.result.LoadingTrash}
                            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition disabled:opacity-60 ${cardBorder} ${darkMode
                                    ? 'bg-surface-900 text-surface-200 hover:bg-surface-800'
                                    : 'bg-white text-[#4b5563] hover:bg-[#f3f4f6]'
                                }`}
                        >
                            {Controller.result.LoadingTrash ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            Atualizar
                        </button>
                    )}
                </div>

                {/* ================================================= */}
                {/* RESUMO                                             */}
                {/* ================================================= */}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <SummaryCard
                        border={cardBorder}
                        background={
                            cardBackground
                        }
                        title="Excluídos"
                        value={
                            serverMode
                                ? Controller.result.summary.total
                                : sourceItems.length
                        }
                        description="registros na lixeira"
                        icon={
                            <Trash2 className="w-4 h-4 text-red-500" />
                        }
                        primaryText={
                            primaryText
                        }
                        mutedText={
                            mutedText
                        }
                    />

                    <SummaryCard
                        border={cardBorder}
                        background={
                            cardBackground
                        }
                        title="Usuários"
                        value={
                            serverMode
                                ? Controller.result.summary.users
                                : sourceItems.filter(
                                    (x) =>
                                        x.entityType ===
                                        'USER'
                                ).length
                        }
                        description="contas excluídas"
                        icon={
                            <UserRound className="w-4 h-4 text-violet-500" />
                        }
                        primaryText={
                            primaryText
                        }
                        mutedText={
                            mutedText
                        }
                    />

                    <SummaryCard
                        border={cardBorder}
                        background={
                            cardBackground
                        }
                        title="Endereços"
                        value={
                            serverMode
                                ? Controller.result.summary.addresses
                                : sourceItems.filter(
                                    (x) =>
                                        x.entityType ===
                                        'ADDRESS'
                                ).length
                        }
                        description="endereços excluídos"
                        icon={
                            <MapPin className="w-4 h-4 text-blue-500" />
                        }
                        primaryText={
                            primaryText
                        }
                        mutedText={
                            mutedText
                        }
                    />

                    <SummaryCard
                        border={cardBorder}
                        background={
                            cardBackground
                        }
                        title="Pedidos"
                        value={
                            serverMode
                                ? Controller.result.summary.orders
                                : sourceItems.filter(
                                    (x) =>
                                        x.entityType ===
                                        'ORDER' ||
                                        x.entityType ===
                                        'ORDER_ITEM'
                                ).length
                        }
                        description="registros relacionados"
                        icon={
                            <ShoppingBag className="w-4 h-4 text-orange-500" />
                        }
                        primaryText={
                            primaryText
                        }
                        mutedText={
                            mutedText
                        }
                    />
                </div>

                {/* ================================================= */}
                {/* FILTROS                                            */}
                {/* ================================================= */}

                <div
                    className={`rounded-2xl border ${cardBorder} ${cardBackground} shadow-soft p-3`}
                >
                    <div className="relative flex-1">
                        <Search
                            className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedText}`}
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Buscar por registro, usuário, e-mail, ID ou informação..."
                            className={`w-full pl-11 pr-4 py-3 rounded-xl ${darkMode
                                    ? 'bg-surface-950 border-surface-700'
                                    : 'bg-white border-[#dfe3e8]'
                                } border text-sm ${primaryText} outline-none focus:border-brand-400`}
                        />
                    </div>

                    <div
                        className={`flex gap-1 overflow-x-auto ${darkMode
                                ? 'bg-surface-950'
                                : 'bg-[#f7f8fa]'
                            } rounded-xl p-1 mt-3`}
                    >
                        {(
                            [
                                [
                                    'ALL',
                                    'Todos',
                                ],
                                [
                                    'USER',
                                    'Usuários',
                                ],
                                [
                                    'ADDRESS',
                                    'Endereços',
                                ],
                                [
                                    'PRODUCT',
                                    'Produtos',
                                ],
                                [
                                    'CATEGORY',
                                    'Categorias',
                                ],
                                [
                                    'COUPON',
                                    'Cupons',
                                ],
                                [
                                    'ORDER',
                                    'Pedidos',
                                ],
                                [
                                    'OTHER',
                                    'Outros',
                                ],
                            ] as const
                        ).map(
                            ([
                                id,
                                label,
                            ]) => {
                                const active =
                                    filter ===
                                    id;

                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() =>
                                            setFilter(
                                                id
                                            )
                                        }
                                        className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap ${active
                                                ? darkMode
                                                    ? 'bg-surface-800 text-brand-400'
                                                    : 'bg-white text-brand-600 shadow-sm border border-[#e5e7eb]'
                                                : mutedText
                                            }`}
                                    >
                                        {label}
                                    </button>
                                );
                            }
                        )}
                    </div>
                </div>

                {/* ================================================= */}
                {/* BARRA DE SELEÇÃO EM LOTE                          */}
                {/* ================================================= */}

                {selectedItems.length >
                    0 && (
                        <div
                            className={`sticky top-2 z-10 rounded-2xl border ${cardBorder} ${cardBackground} shadow-medium p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}
                        >
                            <p
                                className={`text-sm font-bold ${primaryText}`}
                            >
                                {
                                    selectedItems.length
                                }{' '}
                                {selectedItems.length ===
                                    1
                                    ? 'registro selecionado'
                                    : 'registros selecionados'}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={
                                        loadingAction
                                    }
                                    onClick={() =>
                                        setSelectedKeys(
                                            new Set()
                                        )
                                    }
                                    className={`px-3 py-2 rounded-xl text-xs font-bold ${mutedText} ${darkMode
                                            ? 'hover:bg-surface-800'
                                            : 'hover:bg-[#f0f2f5]'
                                        }`}
                                >
                                    Limpar
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        loadingAction
                                    }
                                    onClick={
                                        handleBulkRestore
                                    }
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-50"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Restaurar selecionados
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        loadingAction
                                    }
                                    onClick={() =>
                                        setBulkConfirmOpen(
                                            true
                                        )
                                    }
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Excluir selecionados
                                </button>
                            </div>
                        </div>
                    )}

                {/* ================================================= */}
                {/* LISTA                                              */}
                {/* ================================================= */}

                <div
                    className={`rounded-2xl border ${cardBorder} ${cardBackground} overflow-hidden`}
                >
                    {totalCount ===
                        0 ? (
                        <div className="py-20 text-center px-6">
                            <div
                                className={`w-16 h-16 rounded-2xl ${darkMode
                                        ? 'bg-surface-800'
                                        : 'bg-[#f0f2f5]'
                                    } mx-auto flex items-center justify-center`}
                            >
                                <Database
                                    className={`w-6 h-6 ${mutedText}`}
                                />
                            </div>

                            <h3
                                className={`font-display font-bold mt-5 ${primaryText}`}
                            >
                                Lixeira vazia
                            </h3>

                            <p
                                className={`text-sm mt-1 ${mutedText}`}
                            >
                                Nenhum registro excluído encontrado.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* ================================================= */}
                            {/* CONTROLE DA LISTA                                 */}
                            {/* ================================================= */}

                            <div
                                className={`px-5 py-3 border-b ${cardBorder} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={
                                            allOnPageSelected
                                        }
                                        onChange={
                                            togglePageSelection
                                        }
                                        className="w-4 h-4 rounded accent-red-500"
                                        aria-label="Selecionar todos os registros desta página"
                                    />

                                    <span
                                        className={`text-[11px] font-bold ${mutedText}`}
                                    >
                                        Selecionar página
                                    </span>
                                </div>

                                {/* ================================================= */}
                                {/* QUANTIDADE POR PÁGINA                            */}
                                {/* ================================================= */}

                                <div className="flex items-center gap-2">
                                    <span
                                        className={`text-[11px] font-semibold ${mutedText}`}
                                    >
                                        Mostrar
                                    </span>

                                    <select
                                        value={
                                            pageSize
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setPageSize(
                                                Number(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            )
                                        }
                                        className={`px-3 py-2 rounded-lg border text-xs font-bold outline-none cursor-pointer ${darkMode
                                                ? 'bg-surface-950 border-surface-700 text-white'
                                                : 'bg-white border-[#dfe3e8] text-[#4b5563]'
                                            }`}
                                        aria-label="Quantidade de registros por página"
                                    >
                                        {PAGE_SIZE_OPTIONS.map(
                                            (
                                                size
                                            ) => (
                                                <option
                                                    key={
                                                        size
                                                    }
                                                    value={
                                                        size
                                                    }
                                                >
                                                    {
                                                        size
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>

                                    <span
                                        className={`text-[11px] font-semibold ${mutedText}`}
                                    >
                                        por página
                                    </span>
                                </div>
                            </div>

                            {/* ================================================= */}
                            {/* REGISTROS                                         */}
                            {/* ================================================= */}

                            <div
                                className={`divide-y ${dividerClass}`}
                            >
                                {paginatedItems.map(
                                    (
                                        item
                                    ) => {
                                        const config =
                                            getEntityConfig(item.entityType);

                                        const Icon =
                                            config.icon;

                                        const expired =
                                            isExpired(
                                                item
                                            );

                                        const relatedCount =
                                            getRelatedCount(
                                                item
                                            );

                                        const key =
                                            getTrashKey(
                                                item
                                            );

                                        const checked =
                                            selectedKeys.has(
                                                key
                                            );

                                        return (
                                            <div
                                                key={
                                                    key
                                                }
                                                className={`p-5 transition-colors ${darkMode
                                                        ? 'hover:bg-surface-950'
                                                        : 'hover:bg-[#fafbfc]'
                                                    }`}
                                            >
                                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            checked
                                                        }
                                                        onChange={() =>
                                                            toggleSelected(
                                                                key
                                                            )
                                                        }
                                                        className="w-4 h-4 rounded accent-red-500 shrink-0"
                                                        aria-label={`Selecionar ${item.entityName}`}
                                                    />

                                                    <div
                                                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${config.className}`}
                                                    >
                                                        <Icon className="w-5 h-5" />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3
                                                                className={`font-bold text-sm ${primaryText}`}
                                                            >
                                                                {
                                                                    item.entityName
                                                                }
                                                            </h3>

                                                            <span
                                                                className={`px-2 py-1 rounded-lg text-[9px] font-bold ${config.className}`}
                                                            >
                                                                {
                                                                    config.label
                                                                }
                                                            </span>

                                                            {relatedCount >
                                                                0 && (
                                                                    <span
                                                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold ${darkMode
                                                                                ? 'bg-surface-800 text-surface-300'
                                                                                : 'bg-[#f0f1f3] text-[#626975]'
                                                                            }`}
                                                                    >
                                                                        <Package className="w-3 h-3" />

                                                                        {
                                                                            relatedCount
                                                                        }{' '}
                                                                        relacionados
                                                                    </span>
                                                                )}

                                                            {expired && (
                                                                <span className="px-2 py-1 rounded-lg text-[9px] font-bold bg-red-500/10 text-red-500">
                                                                    Prazo expirado
                                                                </span>
                                                            )}
                                                        </div>

                                                        {item.userName && (
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                                                <div
                                                                    className={`flex items-center gap-1.5 text-xs ${secondaryText}`}
                                                                >
                                                                    <UserRound className="w-3.5 h-3.5" />

                                                                    <span>
                                                                        {
                                                                            item.userName
                                                                        }
                                                                    </span>
                                                                </div>

                                                                {item.userEmail && (
                                                                    <div
                                                                        className={`flex items-center gap-1.5 text-xs ${mutedText}`}
                                                                    >
                                                                        <Mail className="w-3.5 h-3.5" />

                                                                        {
                                                                            item.userEmail
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {(item.reason || item.deletedByName) && (
                                                            <div
                                                                className={`flex flex-wrap items-start gap-x-4 gap-y-1 mt-2 text-xs ${secondaryText}`}
                                                            >
                                                                {item.reason && (
                                                                    <span className="flex items-start gap-1.5 min-w-0">
                                                                        <MessageSquareText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                                                        <span className="line-clamp-2">
                                                                            {item.reason}
                                                                        </span>
                                                                    </span>
                                                                )}
                                                                {item.deletedByName && (
                                                                    <span className={`flex items-center gap-1.5 ${mutedText}`}>
                                                                        <UserCog className="w-3.5 h-3.5" />
                                                                        por {item.deletedByName}
                                                                        {item.deletedByRole
                                                                            ? ` · ${getRoleLabel(item.deletedByRole)}`
                                                                            : ''}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div
                                                            className={`flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-[10px] ${mutedText}`}
                                                        >
                                                            <span className="flex items-center gap-1.5">
                                                                <CalendarDays className="w-3.5 h-3.5" />

                                                                Excluído em{' '}
                                                                {formatDate(
                                                                    item.deletedAt
                                                                )}
                                                            </span>

                                                            <span
                                                                className={`flex items-center gap-1.5 font-bold ${expired
                                                                        ? 'text-red-500'
                                                                        : 'text-orange-500'
                                                                    }`}
                                                            >
                                                                <Clock3 className="w-3.5 h-3.5" />

                                                                {expired
                                                                    ? 'Pronto para exclusão permanente'
                                                                    : getRemainingTime(
                                                                        item.permanentDeleteAt
                                                                    )}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openDetails(
                                                                    item
                                                                )
                                                            }
                                                            className={`inline-flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold ${darkMode
                                                                    ? 'bg-surface-800 text-surface-200 hover:bg-surface-700'
                                                                    : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e9eaed]'
                                                                }`}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            Detalhes
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openDelete(
                                                                    item
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Excluir
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>

                            {/* ================================================= */}
                            {/* PAGINAÇÃO                                         */}
                            {/* ================================================= */}

                            {totalPages >
                                1 && (
                                    <div
                                        className={`px-5 py-4 border-t ${cardBorder} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}
                                    >
                                        <p
                                            className={`text-xs ${mutedText}`}
                                        >
                                            Mostrando{' '}
                                            <span
                                                className={`font-bold ${primaryText}`}
                                            >
                                                {
                                                    showingFrom
                                                }
                                                –
                                                {
                                                    showingTo
                                                }
                                            </span>{' '}
                                            de{' '}
                                            <span
                                                className={`font-bold ${primaryText}`}
                                            >
                                                {
                                                    totalCount
                                                }
                                            </span>{' '}
                                            registros
                                        </p>

                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`text-xs ${mutedText}`}
                                            >
                                                Página{' '}
                                                <span
                                                    className={`font-bold ${primaryText}`}
                                                >
                                                    {
                                                        page
                                                    }
                                                </span>{' '}
                                                de{' '}
                                                <span
                                                    className={`font-bold ${primaryText}`}
                                                >
                                                    {
                                                        totalPages
                                                    }
                                                </span>
                                            </span>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        page <=
                                                        1
                                                    }
                                                    onClick={() =>
                                                        setPage(
                                                            (
                                                                p
                                                            ) =>
                                                                Math.max(
                                                                    1,
                                                                    p -
                                                                    1
                                                                )
                                                        )
                                                    }
                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 ${darkMode
                                                            ? 'bg-surface-800 text-surface-200'
                                                            : 'bg-[#f3f4f6] text-[#4b5563]'
                                                        }`}
                                                    aria-label="Página anterior"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        page >=
                                                        totalPages
                                                    }
                                                    onClick={() =>
                                                        setPage(
                                                            (
                                                                p
                                                            ) =>
                                                                Math.min(
                                                                    totalPages,
                                                                    p +
                                                                    1
                                                                )
                                                        )
                                                    }
                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 ${darkMode
                                                            ? 'bg-surface-800 text-surface-200'
                                                            : 'bg-[#f3f4f6] text-[#4b5563]'
                                                        }`}
                                                    aria-label="Próxima página"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </>
                    )}
                </div>
            </div>

            {/* ===================================================== */}
            {/* MODAL DE DETALHES                                      */}
            {/* ===================================================== */}

            {selectedItem && (
                <TrashDetailsModal
                    item={
                        selectedItem
                    }
                    darkMode={
                        darkMode
                    }
                    cardBackground={
                        cardBackground
                    }
                    cardBorder={
                        cardBorder
                    }
                    primaryText={
                        primaryText
                    }
                    secondaryText={
                        secondaryText
                    }
                    mutedText={
                        mutedText
                    }
                    softBackground={
                        softBackground
                    }
                    loadingAction={
                        loadingAction
                    }
                    focusDelete={
                        modalIntent ===
                        'delete'
                    }
                    onClose={() =>
                        !loadingAction &&
                        setSelectedItem(
                            null
                        )
                    }
                    onRestore={
                        handleRestore
                    }
                    onPermanentDelete={
                        handlePermanentDelete
                    }
                    formatDate={
                        formatDate
                    }
                    getRemainingTime={
                        getRemainingTime
                    }
                    getRoleLabel={
                        getRoleLabel
                    }
                />
            )}

            {/* ===================================================== */}
            {/* CONFIRMAÇÃO EM LOTE                                    */}
            {/* ===================================================== */}

            {bulkConfirmOpen && (
                <ConfirmDeleteDialog
                    darkMode={
                        darkMode
                    }
                    cardBackground={
                        cardBackground
                    }
                    cardBorder={
                        cardBorder
                    }
                    primaryText={
                        primaryText
                    }
                    mutedText={
                        mutedText
                    }
                    loading={
                        loadingAction
                    }
                    count={
                        selectedItems.length
                    }
                    onCancel={() =>
                        setBulkConfirmOpen(
                            false
                        )
                    }
                    onConfirm={
                        handleBulkDelete
                    }
                />
            )}
        </>
    );
}

/* ============================================================= */
/* SUMMARY CARD                                                   */
/* ============================================================= */

interface SummaryCardProps {
    border: string;
    background: string;
    title: string;
    value: number;
    description: string;
    icon: React.ReactNode;
    primaryText: string;
    mutedText: string;
}

function SummaryCard({
    border,
    background,
    title,
    value,
    description,
    icon,
    primaryText,
    mutedText,
}: SummaryCardProps) {
    return (
        <div
            className={`rounded-2xl border ${border} ${background} p-5`}
        >
            <div className="flex items-center justify-between">
                <span
                    className={`text-[10px] font-bold uppercase tracking-widest ${mutedText}`}
                >
                    {title}
                </span>

                {icon}
            </div>

            <p
                className={`font-display text-3xl font-bold mt-5 ${primaryText}`}
            >
                {value}
            </p>

            <p
                className={`text-[11px] mt-1 ${mutedText}`}
            >
                {description}
            </p>
        </div>
    );
}

/* ============================================================= */
/* CONFIRMAÇÃO DE EXCLUSÃO                                       */
/* ============================================================= */

interface ConfirmDeleteDialogProps {
    darkMode: boolean;
    cardBackground: string;
    cardBorder: string;
    primaryText: string;
    mutedText: string;
    loading: boolean;
    count: number;
    onCancel: () => void;
    onConfirm: () => void | Promise<void>;
}

function ConfirmDeleteDialog({
    darkMode,
    cardBackground,
    cardBorder,
    primaryText,
    mutedText,
    loading,
    count,
    onCancel,
    onConfirm,
}: ConfirmDeleteDialogProps) {
    const [confirmText, setConfirmText] =
        useState('');

    const canConfirm =
        confirmText
            .trim()
            .toUpperCase() ===
        'EXCLUIR' &&
        !loading;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() =>
                !loading &&
                onCancel()
            }
        >
            <div
                className={`w-full max-w-md rounded-3xl ${cardBackground} border ${cardBorder} shadow-2xl p-6`}
                onClick={(e) =>
                    e.stopPropagation()
                }
            >
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>

                    <div>
                        <p
                            className={`font-bold text-base ${primaryText}`}
                        >
                            Excluir permanentemente
                        </p>

                        <p
                            className={`text-xs mt-1 ${mutedText}`}
                        >
                            {count ===
                                1
                                ? 'Este registro sairá da lixeira'
                                : `Estes ${count} registros sairão da lixeira`}{' '}
                            e não poderão mais ser restaurados. Dados pessoais serão anonimizados. Não pode ser desfeito.
                        </p>
                    </div>
                </div>

                <div className="mt-5">
                    <label
                        className={`text-[10px] font-bold uppercase tracking-widest ${mutedText}`}
                    >
                        Digite EXCLUIR para confirmar
                    </label>

                    <input
                        autoFocus
                        type="text"
                        value={
                            confirmText
                        }
                        onChange={(e) =>
                            setConfirmText(
                                e.target.value
                            )
                        }
                        className={`w-full mt-2 px-4 py-3 rounded-xl border text-sm outline-none focus:border-red-400 ${darkMode
                                ? 'bg-surface-950 border-surface-700 text-white'
                                : 'bg-white border-[#dfe3e8] text-[#17191f]'
                            }`}
                        placeholder="EXCLUIR"
                    />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        type="button"
                        disabled={
                            loading
                        }
                        onClick={
                            onCancel
                        }
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold ${mutedText} ${darkMode
                                ? 'hover:bg-surface-800'
                                : 'hover:bg-[#f0f2f5]'
                            }`}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        disabled={
                            !canConfirm
                        }
                        onClick={
                            onConfirm
                        }
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-40"
                    >
                        <Trash2 className="w-4 h-4" />

                        {loading
                            ? 'Excluindo...'
                            : 'Excluir definitivamente'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ============================================================= */
/* MODAL DE DETALHES                                              */
/* ============================================================= */

interface TrashDetailsModalProps {
    item: TrashItem;
    darkMode: boolean;
    cardBackground: string;
    cardBorder: string;
    primaryText: string;
    secondaryText: string;
    mutedText: string;
    softBackground: string;
    loadingAction: boolean;
    focusDelete: boolean;
    onClose: () => void;
    onRestore: () => void | Promise<void>;
    onPermanentDelete: () => void | Promise<void>;
    formatDate: (
        date?: string | null
    ) => string;
    getRemainingTime: (
        date?: string | null
    ) => string;
    getRoleLabel: (
        role?: string | null
    ) => string;
}

function TrashDetailsModal({
    item,
    darkMode,
    cardBackground,
    cardBorder,
    primaryText,
    secondaryText,
    mutedText,
    softBackground,
    loadingAction,
    focusDelete,
    onClose,
    onRestore,
    onPermanentDelete,
    formatDate,
    getRemainingTime,
    getRoleLabel,
}: TrashDetailsModalProps) {
    const [
        activeSection,
        setActiveSection,
    ] = useState<string | null>(
        item.entityType ===
            'USER'
            ? 'owner'
            : null
    );

    const [
        confirmOpen,
        setConfirmOpen,
    ] = useState(false);

    const config =
        getEntityConfig(item.entityType);

    const Icon =
        config.icon;

    const expired =
        isExpired(item);

    const related =
        item.related;

    useEffect(() => {
        const onKeyDown = (
            e: KeyboardEvent
        ) => {
            if (
                e.key ===
                'Escape' &&
                !loadingAction
            ) {
                onClose();
            }
        };

        window.addEventListener(
            'keydown',
            onKeyDown
        );

        return () =>
            window.removeEventListener(
                'keydown',
                onKeyDown
            );
    }, [
        loadingAction,
        onClose,
    ]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() =>
                !loadingAction &&
                onClose()
            }
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`w-full max-w-5xl max-h-[92vh] rounded-3xl ${cardBackground} border ${cardBorder} shadow-2xl overflow-hidden flex flex-col`}
                onClick={(e) =>
                    e.stopPropagation()
                }
            >
                {/* HEADER */}

                <div
                    className={`p-6 border-b ${cardBorder}`}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center ${config.className}`}
                            >
                                <Icon className="w-5 h-5" />
                            </div>

                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3
                                        className={`font-bold text-lg ${primaryText}`}
                                    >
                                        {
                                            item.entityName
                                        }
                                    </h3>

                                    <span
                                        className={`px-2 py-1 rounded-lg text-[9px] font-bold ${config.className}`}
                                    >
                                        {
                                            config.label
                                        }
                                    </span>
                                </div>

                                <p
                                    className={`text-xs mt-1 ${mutedText}`}
                                >
                                    Registro #
                                    {
                                        item.id
                                    }
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            aria-label="Fechar"
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${mutedText} ${darkMode
                                    ? 'hover:bg-surface-800'
                                    : 'hover:bg-[#f0f2f5]'
                                }`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* CONTEÚDO */}

                <div className="p-6 overflow-y-auto">
                    <div className="space-y-5">
                        {item.userName && (
                            <section
                                className={`rounded-2xl border ${cardBorder} overflow-hidden`}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveSection(
                                            activeSection ===
                                                'owner'
                                                ? null
                                                : 'owner'
                                        )
                                    }
                                    className={`w-full px-5 py-4 flex items-center justify-between ${softBackground}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                                            <UserRound className="w-5 h-5" />
                                        </div>

                                        <div className="text-left">
                                            <p
                                                className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}
                                            >
                                                Proprietário
                                            </p>

                                            <p
                                                className={`text-sm font-bold mt-1 ${primaryText}`}
                                            >
                                                {
                                                    item.userName
                                                }
                                            </p>

                                            <p
                                                className={`text-xs mt-0.5 ${mutedText}`}
                                            >
                                                {item.userEmail ||
                                                    'E-mail não informado'}
                                            </p>
                                        </div>
                                    </div>

                                    <ChevronDown
                                        className={`w-4 h-4 transition-transform ${mutedText} ${activeSection ===
                                                'owner'
                                                ? 'rotate-180'
                                                : ''
                                            }`}
                                    />
                                </button>

                                {activeSection ===
                                    'owner' && (
                                        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <InfoBox
                                                label="ID do usuário"
                                                value={
                                                    item.userId ??
                                                    'Não informado'
                                                }
                                                icon={
                                                    <Hash className="w-3.5 h-3.5" />
                                                }
                                                softBackground={
                                                    softBackground
                                                }
                                                mutedText={
                                                    mutedText
                                                }
                                                valueClassName={
                                                    secondaryText
                                                }
                                            />

                                            <InfoBox
                                                label="Perfil"
                                                value={getRoleLabel(
                                                    item.userRole
                                                )}
                                                icon={
                                                    <ShieldAlert className="w-3.5 h-3.5" />
                                                }
                                                softBackground={
                                                    softBackground
                                                }
                                                mutedText={
                                                    mutedText
                                                }
                                                valueClassName={
                                                    secondaryText
                                                }
                                            />

                                            <InfoBox
                                                label="E-mail"
                                                value={
                                                    item.userEmail ||
                                                    'Não informado'
                                                }
                                                icon={
                                                    <Mail className="w-3.5 h-3.5" />
                                                }
                                                softBackground={
                                                    softBackground
                                                }
                                                mutedText={
                                                    mutedText
                                                }
                                                valueClassName={
                                                    secondaryText
                                                }
                                            />
                                        </div>
                                    )}
                            </section>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <InfoBox
                                label="Excluído em"
                                value={formatDate(
                                    item.deletedAt
                                )}
                                icon={
                                    <CalendarDays className="w-3.5 h-3.5" />
                                }
                                softBackground={
                                    softBackground
                                }
                                mutedText={
                                    mutedText
                                }
                                valueClassName={
                                    secondaryText
                                }
                            />

                            <InfoBox
                                label="Exclusão permanente"
                                value={
                                    expired
                                        ? 'Prazo expirado'
                                        : getRemainingTime(
                                            item.permanentDeleteAt
                                        )
                                }
                                icon={
                                    <Clock3 className="w-3.5 h-3.5" />
                                }
                                softBackground={
                                    softBackground
                                }
                                mutedText={
                                    mutedText
                                }
                                valueClassName={
                                    expired
                                        ? 'text-red-500'
                                        : 'text-orange-500'
                                }
                            />

                            <InfoBox
                                label="Descrição"
                                value={
                                    item.description ||
                                    'Nenhuma descrição.'
                                }
                                icon={
                                    <FileText className="w-3.5 h-3.5" />
                                }
                                softBackground={
                                    softBackground
                                }
                                mutedText={
                                    mutedText
                                }
                                valueClassName={
                                    secondaryText
                                }
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <InfoBox
                                label="Motivo da exclusão"
                                value={
                                    item.reason ||
                                    'Não informado'
                                }
                                icon={
                                    <MessageSquareText className="w-3.5 h-3.5" />
                                }
                                softBackground={
                                    softBackground
                                }
                                mutedText={
                                    mutedText
                                }
                                valueClassName={
                                    secondaryText
                                }
                            />

                            <InfoBox
                                label="Excluído por"
                                value={
                                    item.deletedByName
                                        ? `${item.deletedByName}${item.deletedByRole ? ` · ${getRoleLabel(item.deletedByRole)}` : ''}`
                                        : 'Não informado'
                                }
                                icon={
                                    <UserCog className="w-3.5 h-3.5" />
                                }
                                softBackground={
                                    softBackground
                                }
                                mutedText={
                                    mutedText
                                }
                                valueClassName={
                                    secondaryText
                                }
                            />
                        </div>

                        <DataSection
                            title="Dados do registro"
                            subtitle="Informações pertencentes somente ao registro selecionado."
                            icon={
                                <Database className="w-4 h-4" />
                            }
                            data={
                                item.data
                            }
                            cardBorder={
                                cardBorder
                            }
                            primaryText={
                                primaryText
                            }
                            secondaryText={
                                secondaryText
                            }
                            mutedText={
                                mutedText
                            }
                            softBackground={
                                softBackground
                            }
                        />

                        {related &&
                            RELATED_SECTIONS.some(
                                (section) =>
                                    (related[section.key]?.length ?? 0) > 0
                            ) && (
                                <div className="space-y-3">
                                    <div>
                                        <h3
                                            className={`font-bold text-base ${primaryText}`}
                                        >
                                            Excluídos junto
                                        </h3>

                                        <p
                                            className={`text-xs mt-1 ${mutedText}`}
                                        >
                                            Itens excluídos junto com este registro. Ao restaurar, eles voltam juntos.
                                        </p>
                                    </div>

                                    {RELATED_SECTIONS.filter(
                                        (section) =>
                                            (related[section.key]?.length ?? 0) > 0
                                    ).map((section) => {
                                        const SectionIcon = section.icon;

                                        return (
                                            <RelatedSection
                                                key={section.key}
                                                title={section.title}
                                                icon={
                                                    <SectionIcon className="w-4 h-4" />
                                                }
                                                items={
                                                    related[section.key]
                                                }
                                                darkMode={
                                                    darkMode
                                                }
                                                cardBorder={
                                                    cardBorder
                                                }
                                                primaryText={
                                                    primaryText
                                                }
                                                secondaryText={
                                                    secondaryText
                                                }
                                                mutedText={
                                                    mutedText
                                                }
                                                softBackground={
                                                    softBackground
                                                }
                                            />
                                        );
                                    })}
                                </div>
                            )}

                        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                            <div className="flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />

                                <div>
                                    <p className="text-sm font-bold text-red-500">
                                        Atenção
                                    </p>

                                    <p
                                        className={`text-xs mt-1 leading-relaxed ${secondaryText}`}
                                    >
                                        A exclusão definitiva tira o item da lixeira e ele não poderá mais ser restaurado. Dados pessoais (nome, e-mail, telefone e endereço) são anonimizados; pedidos e produtos continuam no histórico. Essa operação não pode ser desfeita.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}

                <div
                    className={`p-5 border-t ${cardBorder} flex flex-col sm:flex-row justify-end gap-2`}
                >
                    <button
                        type="button"
                        disabled={
                            loadingAction
                        }
                        onClick={
                            onRestore
                        }
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 disabled:opacity-50"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Restaurar
                    </button>

                    <button
                        type="button"
                        disabled={
                            loadingAction
                        }
                        onClick={() =>
                            setConfirmOpen(
                                true
                            )
                        }
                        autoFocus={
                            focusDelete
                        }
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" />
                        Excluir permanentemente
                    </button>
                </div>
            </div>

            {confirmOpen && (
                <ConfirmDeleteDialog
                    darkMode={
                        darkMode
                    }
                    cardBackground={
                        cardBackground
                    }
                    cardBorder={
                        cardBorder
                    }
                    primaryText={
                        primaryText
                    }
                    mutedText={
                        mutedText
                    }
                    loading={
                        loadingAction
                    }
                    count={1}
                    onCancel={() =>
                        setConfirmOpen(
                            false
                        )
                    }
                    onConfirm={
                        onPermanentDelete
                    }
                />
            )}
        </div>
    );
}

/* ============================================================= */
/* INFO BOX                                                       */
/* ============================================================= */

interface InfoBoxProps {
    label: string;
    value: React.ReactNode;
    icon: React.ReactNode;
    softBackground: string;
    mutedText: string;
    valueClassName: string;
}

function InfoBox({
    label,
    value,
    icon,
    softBackground,
    mutedText,
    valueClassName,
}: InfoBoxProps) {
    return (
        <div
            className={`rounded-xl p-4 ${softBackground}`}
        >
            <div
                className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest ${mutedText}`}
            >
                {icon}
                {label}
            </div>

            <p
                className={`text-xs font-semibold mt-2 break-words ${valueClassName}`}
            >
                {value}
            </p>
        </div>
    );
}

/* ============================================================= */
/* DATA SECTION                                                   */
/* ============================================================= */

interface DataSectionProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    data?: Record<string, any>;
    cardBorder: string;
    primaryText: string;
    secondaryText: string;
    mutedText: string;
    softBackground: string;
}

function DataSection({
    title,
    subtitle,
    icon,
    data,
    cardBorder,
    primaryText,
    secondaryText,
    mutedText,
    softBackground,
}: DataSectionProps) {
    const entries =
        Object.entries(
            data ?? {}
        );

    return (
        <section
            className={`rounded-2xl border ${cardBorder} overflow-hidden`}
        >
            <div
                className={`px-5 py-4 ${softBackground} border-b ${cardBorder}`}
            >
                <div className="flex items-center gap-2">
                    <span
                        className={
                            mutedText
                        }
                    >
                        {icon}
                    </span>

                    <div>
                        <p
                            className={`text-sm font-bold ${primaryText}`}
                        >
                            {title}
                        </p>

                        <p
                            className={`text-[10px] mt-1 ${mutedText}`}
                        >
                            {subtitle}
                        </p>
                    </div>
                </div>
            </div>

            {entries.length ===
                0 ? (
                <div className="p-6 text-center">
                    <p
                        className={`text-xs ${mutedText}`}
                    >
                        Nenhuma informação disponível.
                    </p>
                </div>
            ) : (
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {entries.map(
                        ([
                            key,
                            value,
                        ]) => (
                            <div
                                key={
                                    key
                                }
                                className={`rounded-xl p-3 ${softBackground}`}
                            >
                                <p
                                    className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}
                                >
                                    {
                                        key
                                    }
                                </p>

                                <p
                                    className={`text-xs font-semibold mt-1 break-words ${secondaryText}`}
                                >
                                    {value ===
                                        null ||
                                        value ===
                                        undefined ||
                                        value ===
                                        ''
                                        ? 'Não informado'
                                        : typeof value ===
                                            'object'
                                            ? JSON.stringify(
                                                value
                                            )
                                            : String(
                                                value
                                            )}
                                </p>
                            </div>
                        )
                    )}
                </div>
            )}
        </section>
    );
}

/* ============================================================= */
/* RELATED SECTION                                                */
/* ============================================================= */

interface RelatedSectionProps {
    title: string;
    icon: React.ReactNode;
    items?: TrashItem[];
    darkMode: boolean;
    cardBorder: string;
    primaryText: string;
    secondaryText: string;
    mutedText: string;
    softBackground: string;
}

function RelatedSection({
    title,
    icon,
    items,
    darkMode,
    cardBorder,
    primaryText,
    secondaryText,
    mutedText,
    softBackground,
}: RelatedSectionProps) {
    const [
        open,
        setOpen,
    ] = useState(false);

    const count =
        items?.length ?? 0;

    return (
        <section
            className={`rounded-2xl border ${cardBorder} overflow-hidden`}
        >
            <button
                type="button"
                onClick={() =>
                    setOpen(!open)
                }
                className={`w-full px-5 py-4 flex items-center justify-between ${darkMode
                        ? 'hover:bg-surface-950'
                        : 'hover:bg-[#fafbfc]'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <div
                        className={`w-9 h-9 rounded-xl ${softBackground} flex items-center justify-center ${mutedText}`}
                    >
                        {icon}
                    </div>

                    <div className="text-left">
                        <p
                            className={`text-sm font-bold ${primaryText}`}
                        >
                            {title}
                        </p>

                        <p
                            className={`text-[10px] mt-0.5 ${mutedText}`}
                        >
                            {count}{' '}
                            {count ===
                                1
                                ? 'registro'
                                : 'registros'}
                        </p>
                    </div>
                </div>

                <ChevronDown
                    className={`w-4 h-4 transition-transform ${mutedText} ${open
                            ? 'rotate-180'
                            : ''
                        }`}
                />
            </button>

            {open && (
                <div
                    className={`border-t ${cardBorder} p-4`}
                >
                    {!items ||
                        items.length ===
                        0 ? (
                        <div className="py-5 text-center">
                            <p
                                className={`text-xs ${mutedText}`}
                            >
                                Nenhum registro relacionado encontrado.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {items.map(
                                (
                                    relatedItem
                                ) => {
                                    const config =
                                        getEntityConfig(relatedItem.entityType);

                                    const RelatedIcon =
                                        config.icon;

                                    return (
                                        <div
                                            key={getTrashKey(
                                                relatedItem
                                            )}
                                            className={`rounded-xl p-4 ${softBackground}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${config.className}`}
                                                >
                                                    <RelatedIcon className="w-4 h-4" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p
                                                            className={`text-xs font-bold ${primaryText}`}
                                                        >
                                                            {
                                                                relatedItem.entityName
                                                            }
                                                        </p>

                                                        <span
                                                            className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold ${config.className}`}
                                                        >
                                                            {
                                                                config.label
                                                            }
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
                                                        {Object.entries(
                                                            relatedItem.data ??
                                                            {}
                                                        )
                                                            .slice(
                                                                0,
                                                                6
                                                            )
                                                            .map(
                                                                ([
                                                                    key,
                                                                    value,
                                                                ]) => (
                                                                    <div
                                                                        key={
                                                                            key
                                                                        }
                                                                    >
                                                                        <p
                                                                            className={`text-[8px] uppercase font-bold tracking-wider ${mutedText}`}
                                                                        >
                                                                            {
                                                                                key
                                                                            }
                                                                        </p>

                                                                        <p
                                                                            className={`text-[10px] mt-0.5 break-words ${secondaryText}`}
                                                                        >
                                                                            {value ===
                                                                                null ||
                                                                                value ===
                                                                                undefined ||
                                                                                value ===
                                                                                ''
                                                                                ? 'Não informado'
                                                                                : typeof value ===
                                                                                    'object'
                                                                                    ? JSON.stringify(
                                                                                        value
                                                                                    )
                                                                                    : String(
                                                                                        value
                                                                                    )}
                                                                        </p>
                                                                    </div>
                                                                )
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}