import { useCallback, useEffect, useState } from "react";
import { TrashItem } from "../models/TrashItem";
import { TrashPageQuery } from "../adminService/TrashServiceAdmin";
import { DEFAULT_PAGE_SIZE, TrashSummary } from "../models/Paged";
import { UseTrashAdminStore } from "../storeAdmin/UseTrashAdminStore";
import { useNotification } from "../utils/NotificationCard";

type TrashAdminControllerReturn = {
    result: {
        items: TrashItem[];
        total: number;
        query: TrashPageQuery;
        summary: TrashSummary;
        LoadingTrash: boolean;
        LoadError: boolean;
    };
    action: {
        LoadTrash: () => Promise<void>;
        SetQuery: (query: Partial<TrashPageQuery>) => Promise<void>;
        restoreItem: (item: TrashItem) => Promise<boolean>;
        purgeItem: (item: TrashItem) => Promise<boolean>;
        bulkAction: (items: TrashItem[], action: 'restore' | 'purge') => Promise<boolean>;
    };
};

export const useTrashAdminController = (): TrashAdminControllerReturn => {
    const {
        trashItems, trashTotal, trashQuery, trashSummary, SetTrashQuery,
        LoadTrash: LoadTrashStore, RestoreTrashItem, PurgeTrashItem, BulkTrash,
    } = UseTrashAdminStore();
    const notify = useNotification();

    const [LoadingTrash, setLoadingTrash] = useState(false);
    const [LoadError, setLoadError] = useState(false);

    const LoadTrash = useCallback(async () => {
        setLoadingTrash(true);
        setLoadError(false);

        try {
            const result = await LoadTrashStore();

            if (!result.success) {
                setLoadError(true);
                notify.error(
                    result.error?.error?.code ?? 'Lixeira',
                    result.error?.error?.message ?? 'Não foi possível carregar a lixeira.'
                );
            }
        } finally {
            setLoadingTrash(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [LoadTrashStore]);

    useEffect(() => {
        // Tela abre sem filtros, na primeira página
        UseTrashAdminStore.setState({ trashQuery: { page: 1, pageSize: DEFAULT_PAGE_SIZE, search: '', filter: 'ALL' } });
        LoadTrash();
    }, [LoadTrash]);

    // Troca de página / filtros: busca só a página no servidor
    const SetQuery = useCallback(async (query: Partial<TrashPageQuery>) => {
        setLoadingTrash(true);
        try {
            const result = await SetTrashQuery(query);
            if (!result.success) {
                notify.error(
                    result.error?.error?.code ?? 'Lixeira',
                    result.error?.error?.message ?? 'Não foi possível carregar a lixeira.'
                );
            }
        } finally {
            setLoadingTrash(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [SetTrashQuery]);

    const restoreItem = async (item: TrashItem): Promise<boolean> => {
        const result = await RestoreTrashItem(item.id);

        if (!result.success) {
            notify.error(
                result.error?.error?.code ?? 'Lixeira',
                result.error?.error?.message ?? 'Não foi possível restaurar o item.'
            );
            return false;
        }

        notify.success('Restaurado', `${item.entityName} foi restaurado com sucesso.`);
        return true;
    };

    const purgeItem = async (item: TrashItem): Promise<boolean> => {
        const result = await PurgeTrashItem(item.id);

        if (!result.success) {
            notify.error(
                result.error?.error?.code ?? 'Lixeira',
                result.error?.error?.message ?? 'Não foi possível excluir definitivamente.'
            );
            return false;
        }

        notify.success('Excluído definitivamente', `${item.entityName} foi removido da lixeira.`);
        return true;
    };

    const bulkAction = async (items: TrashItem[], action: 'restore' | 'purge'): Promise<boolean> => {
        if (items.length === 0) return false;

        const result = await BulkTrash(items.map((i) => i.id), action);

        if (!result.success || !result.data) {
            notify.error(
                result.error?.error?.code ?? 'Lixeira',
                result.error?.error?.message ?? 'Não foi possível concluir a ação.'
            );
            return false;
        }

        const { succeeded, failed } = result.data;
        const verb = action === 'restore' ? 'restaurado(s)' : 'excluído(s) definitivamente';

        if (succeeded > 0) {
            notify.success('Lixeira', `${succeeded} item(ns) ${verb}.`);
        }

        if (failed.length > 0) {
            notify.error(
                'Alguns itens não foram processados',
                failed.map((f) => f.message).filter((m, i, arr) => arr.indexOf(m) === i).join(' ')
            );
        }

        return failed.length === 0;
    };

    return {
        result: {
            items: trashItems,
            total: trashTotal,
            query: trashQuery,
            summary: trashSummary,
            LoadingTrash,
            LoadError,
        },
        action: {
            LoadTrash,
            SetQuery,
            restoreItem,
            purgeItem,
            bulkAction,
        },
    };
};
