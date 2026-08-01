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

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

const NotificationCard: React.FC<{ data: NotificationItem; onRemove: (id: string) => void }> = ({ data, onRemove }) => {
    const [isExiting, setIsExiting] = useState(false);

    const config = {
        success: {
            icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
            border: 'border-green-500',
            progress: 'bg-green-500',
            bg: 'bg-green-50'
        },
        error: {
            icon: <XCircle className="w-6 h-6 text-rose-500" />,
            border: 'border-rose-500',
            progress: 'bg-rose-500',
            bg: 'bg-rose-50'
        },
        warning: {
            icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
            border: 'border-amber-500',
            progress: 'bg-amber-500',
            bg: 'bg-amber-50'
        },
        info: {
            icon: <Info className="w-6 h-6 text-brand-500" />,
            border: 'border-brand-500',
            progress: 'bg-brand-500',
            bg: 'bg-brand-50'
        }
    };

    const theme = config[data.type];

    const handleRemove = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => onRemove(data.id), 300);
    }, [onRemove, data.id]);

    useEffect(() => {
        const timer = setTimeout(handleRemove, data.duration);
        return () => clearTimeout(timer);
    }, [data.duration, handleRemove]);

    return (
        <div
            className={`
                relative w-full max-w-sm overflow-hidden rounded-2xl border
                bg-white shadow-lg shadow-slate-200/60
                transition-all duration-300 ease-out transform mb-3
                ${isExiting ? 'translate-x-[120%] opacity-0' : 'translate-x-0 opacity-100'}
                ${theme.border}
            `}
        >
            {/* conteúdo */}
            <div className="p-4 flex gap-3 items-start">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme.bg}`}>
                    {theme.icon}
                </div>

                <div className="flex-1">
                    <h3 className="font-semibold text-surface-800 text-sm">
                        {data.title}
                    </h3>
                    <p className="text-surface-500 text-xs mt-1 leading-relaxed">
                        {data.message}
                    </p>
                </div>

                <button
                    onClick={handleRemove}
                    className="text-surface-400 hover:text-surface-700 transition"
                >
                    <X size={18} />
                </button>
            </div>

            {/* progress bar */}
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-surface-100">
                <div
                    className={`h-full ${theme.progress}`}
                    style={{
                        width: '100%',
                        animation: `progress ${data.duration}ms linear forwards`
                    }}
                />
            </div>

            <style>{`
                @keyframes progress {
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
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications((state) => [...state, { id, type, title, message, duration }]);
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications((state) => state.filter((item) => item.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ addNotification, removeNotification }}>
            {children}

            <div className="fixed top-5 right-5 z-[9999] flex flex-col items-end gap-2">
                {notifications.map((item) => (
                    <NotificationCard key={item.id} data={item} onRemove={removeNotification} />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);

    return {
        success: (title: string, message: string, duration?: number) =>
            context.addNotification('success', title, message, duration),
        error: (title: string, message: string, duration?: number) =>
            context.addNotification('error', title, message, duration),
        warning: (title: string, message: string, duration?: number) =>
            context.addNotification('warning', title, message, duration),
        info: (title: string, message: string, duration?: number) =>
            context.addNotification('info', title, message, duration),
    };
};