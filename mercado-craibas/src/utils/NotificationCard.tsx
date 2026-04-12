import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, XCircle, X, AlertTriangle, Info } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    duration: number;
}

interface NotificationContextData {
    addNotification: (type: NotificationType, title: string, message: string, duration?: number) => void;
    removeNotification: (id: string) => void;
}

interface NotificationCardProps {
    data: NotificationItem;
    onRemove: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

const NotificationCard: React.FC<NotificationCardProps> = ({ data, onRemove }) => {
    const [isExiting, setIsExiting] = useState(false);

    const config = {
        success: {
            icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
            border: 'border-l-emerald-500',
            progress: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
            bgIcon: 'bg-emerald-100 dark:bg-emerald-900/30'
        },
        error: {
            icon: <XCircle className="w-6 h-6 text-rose-500" />,
            border: 'border-l-rose-500',
            progress: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]',
            bgIcon: 'bg-rose-100 dark:bg-rose-900/30'
        },
        warning: {
            icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
            border: 'border-l-amber-500',
            progress: 'bg-amber-500',
            bgIcon: 'bg-amber-100 dark:bg-amber-900/30'
        },
        info: {
            icon: <Info className="w-6 h-6 text-blue-500" />,
            border: 'border-l-blue-500',
            progress: 'bg-blue-500',
            bgIcon: 'bg-blue-100 dark:bg-blue-900/30'
        }
    };

    const theme = config[data.type];

    const handleRemove = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => onRemove(data.id), 400);
    }, [onRemove, data.id]);

    useEffect(() => {
        const timer = setTimeout(handleRemove, data.duration);
        return () => clearTimeout(timer);
    }, [data.duration, handleRemove]);

    return (
        <div
            className={`
        relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-2xl shadow-slate-200/50 dark:shadow-black/50
        transition-all duration-500 ease-out transform mb-3 select-none
        ${isExiting ? 'translate-x-[120%] opacity-0' : 'translate-x-0 opacity-100'}
        ${theme.border} border-l-4
      `}
            role="alert"
        >
            <div className="p-4 flex gap-4 items-start">
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${theme.bgIcon}`}>
                    {theme.icon}
                </div>

                <div className="flex-1 pt-0.5">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-none mb-1">
                        {data.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">
                        {data.message}
                    </p>
                </div>

                <button
                    onClick={handleRemove}
                    className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-100 dark:bg-slate-800">
                <div
                    className={`h-full ${theme.progress}`}
                    style={{
                        width: '100%',
                        animation: `notificationProgress ${data.duration}ms linear forwards`
                    }}
                />
            </div>

            <style>{`
        @keyframes notificationProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    );
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    const addNotification = useCallback((type: NotificationType, title: string, message: string, duration = 4000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications((state) => [...state, { id, type, title, message, duration }]);
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications((state) => state.filter((item) => item.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ addNotification, removeNotification }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end gap-2 p-4 pointer-events-none">
                <div className="pointer-events-auto flex flex-col items-end">
                    {notifications.map((item) => (
                        <NotificationCard key={item.id} data={item} onRemove={removeNotification} />
                    ))}
                </div>
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');

    return {
        success: (title: string, message: string, duration?: number) => context.addNotification('success', title, message, duration),
        error: (title: string, message: string, duration?: number) => context.addNotification('error', title, message, duration),
        warning: (title: string, message: string, duration?: number) => context.addNotification('warning', title, message, duration),
        info: (title: string, message: string, duration?: number) => context.addNotification('info', title, message, duration),
    };
};