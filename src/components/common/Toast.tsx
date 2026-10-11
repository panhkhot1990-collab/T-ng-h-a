import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const bgStyles = {
    success: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100',
    error: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/80 text-red-900 dark:text-red-100',
    info: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/80 text-blue-900 dark:text-blue-100',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all animate-in slide-in-from-right-5 duration-200 ${bgStyles[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 text-xs">
        <p className="font-semibold">{toast.title}</p>
        {toast.message && <p className="mt-0.5 opacity-90">{toast.message}</p>}
      </div>
      <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity p-0.5">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
