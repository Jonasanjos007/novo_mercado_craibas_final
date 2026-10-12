import { api } from "../config/api";
import { TrashBulkResult, TrashItem } from "../models/TrashItem";
import { makeResult, Result } from "../utils/Result";
import { emptyPaged, PagedResult, TrashSummary } from "../models/Paged";

export interface TrashPageQuery { page: number; pageSize: number; search?: string; filter?: string; }

export const TrashServiceAdmin = {
    GetTrashPaged: async (q: TrashPageQuery): Promise<Result<PagedResult<TrashItem>>> => {
        try {
            const response = await api.get("/admin/trash/paged", { params: { ...q } });
            const { success, data, error } = response.data;

            if (!success) {
                return makeResult(false, emptyPaged<TrashItem>(), error);
            }

            return makeResult(true, (data ?? emptyPaged<TrashItem>()) as PagedResult<TrashItem>, error);
        } catch (err: any) {
            console.log(err.response?.data);
            return makeResult(false, emptyPaged<TrashItem>(), err.response?.data);
        }
    },

    GetTrashSummary: async (): Promise<Result<TrashSummary | null>> => {
        try {
            const response = await api.get("/admin/trash/summary");
            const { success, data, error } = response.data;

            if (!success) {
                return makeResult(false, null, error);
            }

            return makeResult(true, (data ?? null) as TrashSummary | null, error);
        } catch (err: any) {
            console.log(err.response?.data);
            return makeResult(false, null, err.response?.data);
        }
    },

    GetTrash: async (): Promise<Result<TrashItem[]>> => {
        try {
            const response = await api.get("/admin/trash");
            const { success, data, error } = response.data;

            if (!success) {
                return makeResult(false, [] as TrashItem[], error);
            }

            return makeResult(true, data ?? [], error);
        } catch (err: any) {
            console.log(err.response?.data);
            return makeResult(false, [] as TrashItem[], err.response?.data);
        }
    },
    Restore: async (recordId: number): Promise<Result<boolean>> => {
        try {
            const response = await api.post(`/admin/trash/${recordId}/restore`, {});
            const { success, data, error } = response.data;

            if (!success) {
                return makeResult(false, false, error);
            }

            return makeResult(true, data ?? true, error);
        } catch (err: any) {
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    },
    Purge: async (recordId: number): Promise<Result<boolean>> => {
        try {
            const response = await api.delete(`/admin/trash/${recordId}`);
            const { success, data, error } = response.data;

            if (!success) {
                return makeResult(false, false, error);
            }

            return makeResult(true, data ?? true, error);
        } catch (err: any) {
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    },
    Bulk: async (ids: number[], action: 'restore' | 'purge'): Promise<Result<TrashBulkResult>> => {
        try {
            const response = await api.post("/admin/trash/bulk", { ids, action });
            const { success, data, error } = response.data;

            if (!success) {
                return makeResult(false, { succeeded: 0, failed: [] }, error);
            }

            return makeResult(true, data, error);
        } catch (err: any) {
            console.log(err.response?.data);
            return makeResult(false, { succeeded: 0, failed: [] }, err.response?.data);
        }
    },
};
