import { create } from "zustand";
import { TrashPageQuery, TrashServiceAdmin } from "../adminService/TrashServiceAdmin";
import { DEFAULT_PAGE_SIZE, TrashSummary } from "../models/Paged";

let trashRequest = 0;
import { TrashBulkResult, TrashItem } from "../models/TrashItem";
import { makeResult, Result } from "../utils/Result";

interface TrashAdminState {
    /** Itens da página atual (tipo e busca aplicados no servidor antes de paginar). */
    trashItems: TrashItem[];
    trashTotal: number;
    trashQuery: TrashPageQuery;
    trashSummary: TrashSummary;
    SetTrashQuery: (query: Partial<TrashPageQuery>) => Promise<Result<boolean>>;
    LoadTrashPage: () => Promise<Result<boolean>>;
    LoadTrashSummary: () => Promise<Result<boolean>>;
    /** Recarrega a página atual e os cards. */
    LoadTrash: () => Promise<Result<boolean>>;
    RestoreTrashItem: (recordId: number) => Promise<Result<boolean>>;
    PurgeTrashItem: (recordId: number) => Promise<Result<boolean>>;
    BulkTrash: (ids: number[], action: 'restore' | 'purge') => Promise<Result<TrashBulkResult>>;
}

export const UseTrashAdminStore = create<TrashAdminState>((set, get) => ({
    trashItems: [],
    trashTotal: 0,
    trashQuery: { page: 1, pageSize: DEFAULT_PAGE_SIZE, search: '', filter: 'ALL' },
    trashSummary: { total: 0, users: 0, addresses: 0, orders: 0 },

    SetTrashQuery: async (query) => {
        set({ trashQuery: { ...get().trashQuery, ...query } });
        return get().LoadTrashPage();
    },

    LoadTrashPage: async (): Promise<Result<boolean>> => {
        const request = ++trashRequest;
        const result = await TrashServiceAdmin.GetTrashPaged(get().trashQuery);
        if (request !== trashRequest) return makeResult(true, true);

        if (!result.success || !result.data) {
            set({ trashItems: [], trashTotal: 0 });
            return makeResult(false, false, result.error);
        }

        // Página além do fim (ex.: depois de restaurar/excluir): volta para a última que existe
        const lastPage = Math.max(1, Math.ceil(result.data.totalCount / get().trashQuery.pageSize));
        if (result.data.items.length === 0 && get().trashQuery.page > lastPage) {
            set({ trashQuery: { ...get().trashQuery, page: lastPage } });
            return get().LoadTrashPage();
        }

        set({ trashItems: result.data.items, trashTotal: result.data.totalCount });
        return makeResult(true, true);
    },

    LoadTrashSummary: async (): Promise<Result<boolean>> => {
        const result = await TrashServiceAdmin.GetTrashSummary();
        if (!result.success || !result.data) return makeResult(false, false, result.error);
        set({ trashSummary: result.data });
        return makeResult(true, true);
    },

    LoadTrash: async (): Promise<Result<boolean>> => {
        const [page, summary] = await Promise.all([get().LoadTrashPage(), get().LoadTrashSummary()]);
        return !page.success ? page : summary;
    },

    RestoreTrashItem: async (recordId: number): Promise<Result<boolean>> => {
        const result = await TrashServiceAdmin.Restore(recordId);

        if (!result.success) {
            return makeResult(false, false, result.error);
        }

        await get().LoadTrash();
        return makeResult(true, true);
    },

    PurgeTrashItem: async (recordId: number): Promise<Result<boolean>> => {
        const result = await TrashServiceAdmin.Purge(recordId);

        if (!result.success) {
            return makeResult(false, false, result.error);
        }

        await get().LoadTrash();
        return makeResult(true, true);
    },

    BulkTrash: async (ids: number[], action: 'restore' | 'purge'): Promise<Result<TrashBulkResult>> => {
        const result = await TrashServiceAdmin.Bulk(ids, action);

        await get().LoadTrash();

        if (!result.success || !result.data) {
            return makeResult(false, { succeeded: 0, failed: [] }, result.error);
        }

        return makeResult(true, result.data);
    },
}));
