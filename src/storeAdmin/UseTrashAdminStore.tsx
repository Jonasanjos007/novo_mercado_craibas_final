import { create } from "zustand";
import { TrashServiceAdmin } from "../adminService/TrashServiceAdmin";
import { TrashBulkResult, TrashItem } from "../models/TrashItem";
import { makeResult, Result } from "../utils/Result";

interface TrashAdminState {
    trashItems: TrashItem[];
    LoadTrash: () => Promise<Result<boolean>>;
    RestoreTrashItem: (recordId: number) => Promise<Result<boolean>>;
    PurgeTrashItem: (recordId: number) => Promise<Result<boolean>>;
    BulkTrash: (ids: number[], action: 'restore' | 'purge') => Promise<Result<TrashBulkResult>>;
}

export const UseTrashAdminStore = create<TrashAdminState>((set, get) => ({
    trashItems: [],

    LoadTrash: async (): Promise<Result<boolean>> => {
        const result = await TrashServiceAdmin.GetTrash();

        if (result.success) {
            set({ trashItems: result.data || [] });
            return makeResult(true, true);
        }

        return makeResult(false, false, result.error);
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
