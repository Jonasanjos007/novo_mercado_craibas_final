import { useEffect, useState } from "react";
import { UseNotificationAdmin } from "../storeAdmin/UseNotificationAdmin";
import { useNotification } from "../utils/NotificationCard";
type useNotificationsControllerReturn = {
    result: {
        loading: boolean;
    };
    action: {
        setLoading: React.Dispatch<React.SetStateAction<boolean>>;


    }
} | null;
export const useNotificationsController = (): useNotificationsControllerReturn => {
    const { Notification, LoadNotificationAll } = UseNotificationAdmin();
    const notify = useNotification();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await GetLoadNotification();
            setLoading(false);
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
            setLoading
        },
        result: {
            loading
        }

    }
}