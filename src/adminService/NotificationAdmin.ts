import { api } from "../config/api";
import { NotificationModel } from "../models/NotificationModel";
import { makeResult, Result } from "../utils/Result";

export const NotificationAdmin = {
    GetAllNotifications: async (): Promise<Result<NotificationModel[]>> => {
        try {
            const response = await api.get("/admin/Notification/GetAllNotification");
            const { success, error, data } = response.data;
            return success ? makeResult(true, data) : makeResult(false, [] as NotificationModel[], error || "Erro ao buscar notificações!");
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, [] as NotificationModel[], err.response?.data);
        }
    },
    PostUpdateNotifyRead: async (Id: number): Promise<Result<boolean>> => {
        try {
            const response = await api.post("/admin/Notification/PostUpdateReadNotification", Id);
            const { success, error, data } = response.data;
            return success ? makeResult(true, true) : makeResult(false, false, error || "Erro ao buscar notificações!");
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    },
    PostUpdateAllNotifyRead: async (): Promise<Result<boolean>> => {
        try {
            const response = await api.post("/admin/Notification/PostUpdateReadAllNotification");
            const { success, error, data } = response.data;
            return success ? makeResult(true, true) : makeResult(false, false, error || "Erro ao buscar notificações!");
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    },

};
