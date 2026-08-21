
export interface NotificationModel {
    idNotificationUser: number;
    idNotification: number;
    kind: string;
    title: string;
    description: string;
    icone: string;
    isRead: boolean;
    readDate: Date;
    actionUrl: string;
    referenceId: number;
    referenceType: string;
    insertDate: Date;
    updateDate?: string | Date | null;
}
