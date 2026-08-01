import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useStore } from '../context/store';

export default function Notification() {
  const { notification, showNotification } = useStore();

  if (!notification) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const styles = {
    success: 'border-green-200 bg-green-50',
    error: 'border-red-200 bg-red-50',
    info: 'border-blue-200 bg-blue-50',
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-strong ${styles[notification.type]} max-w-sm`}>
        {icons[notification.type]}
        <p className="text-sm font-body text-surface-800 flex-1">{notification.message}</p>
        <button
          onClick={() => showNotification('', 'info')}
          className="text-surface-400 hover:text-surface-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
