import React from 'react';
import { CheckCircle, AlertTriangle, X, Info } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  title?: string;
}

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  const typeStyles = {
    success: 'border-brand-success/20 bg-brand-success/10 text-brand-success',
    warning: 'border-brand-warning/20 bg-brand-warning/10 text-brand-warning',
    danger: 'border-brand-danger/20 bg-brand-danger/10 text-brand-danger',
    info: 'border-brand-info/20 bg-brand-info/10 text-brand-info',
  };

  const typeIcons = {
    success: <CheckCircle className="w-4 h-4 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 shrink-0" />,
    danger: <AlertTriangle className="w-4 h-4 shrink-0" />,
    info: <Info className="w-4 h-4 shrink-0" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const style = typeStyles[toast.type];
        const icon = typeIcons[toast.type];

        return (
          <div
            key={toast.id}
            className={`
              p-3.5 px-4 rounded-xl border backdrop-blur-md flex items-start justify-between gap-3
              shadow-lg shadow-black/40 pointer-events-auto animate-slide-in ${style}
            `}
          >
            <div className="flex gap-2.5 items-start">
              <span className="mt-0.5">{icon}</span>
              <div className="text-xs">
                {toast.title && <p className="font-bold text-white">{toast.title}</p>}
                <p className="text-white/80 leading-relaxed mt-0.5">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};