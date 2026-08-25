import { useEffect, useState } from "react";
import { UseNotificationAdmin } from "../storeAdmin/UseNotificationAdmin";
import { useNotification } from "../utils/NotificationCard";
type useNotificationsControllerReturn = {
    result: {
    };
    action: {

    }
} | null;
export const useNotificationsController = (): useNotificationsControllerReturn => {
    const { Notification, LoadNotificationAll } = UseNotificationAdmin();
    const notify = useNotification();

    useEffect(() => {
        const load = async () => {
            await GetLoadNotification();
        };
        load();
    }, []);

    const GetLoadNotification = async () => {
        const result = await LoadNotificationAll();
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar Cupons!");
        }
    };

    return {
        action: {

        },
        result: {
        }

    }
}