import { api } from "../config/api";
import { TrashBulkResult, TrashItem } from "../models/TrashItem";
import { makeResult, Result } from "../utils/Result";

export const TrashServiceAdmin = {
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
