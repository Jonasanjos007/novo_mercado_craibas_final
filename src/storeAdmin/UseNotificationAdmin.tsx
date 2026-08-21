import { create } from "zustand";
import { NotificationModel } from "../models/NotificationModel";
import { NotificationAdmin } from "../adminService/NotificationAdmin";
import { makeResult, Result } from "../utils/Result";

interface NotificationState {
    Notification: NotificationModel[];
    LoadNotificationAll: () => Promise<Result<boolean>>;
    UpdateReadNotify: (Id: number) => Promise<Result<boolean>>;
    UpdateReadNotifyAll: () => Promise<Result<boolean>>;


}

export const UseNotificationAdmin = create<NotificationState>((set, get) => ({

    Notification: [],

    LoadNotificationAll: async (): Promise<Result<boolean>> => {
        const result = await NotificationAdmin.GetAllNotifications();
        console.log("resultigi.data", result.data);
        if (!result.success) {
            set({ Notification: [] });
            return makeResult(false, false, result.error);
        }
        set({ Notification: result.data || [] });
        return makeResult(true, true);

    },
    UpdateReadNotify: async (Id: number): Promise<Result<boolean>> => {
        const result = await NotificationAdmin.PostUpdateNotifyRead(Id);
        console.log("resultigi.data", result.data);
        if (!result.success) {
            set({ Notification: [] });
            return makeResult(false, false, result.error);
        }
        get().LoadNotificationAll();
        return makeResult(true, true);

    },
    UpdateReadNotifyAll: async (): Promise<Result<boolean>> => {
        const result = await NotificationAdmin.PostUpdateAllNotifyRead();
        console.log("resultigi.data", result.data);
        if (!result.success) {
            set({ Notification: [] });
            return makeResult(false, false, result.error);
        }
        get().LoadNotificationAll();
        return makeResult(true, true);

    },

}));
