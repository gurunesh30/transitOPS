import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  title?: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const typeStyles = {
  success: 'border-brand-success/20 bg-brand-success/10 text-brand-success',
  warning: 'border-brand-warning/20 bg-brand-warning/10 text-brand-warning',
  danger: 'border-brand-danger/20 bg-brand-danger/10 text-brand-danger',
  info: 'border-brand-info/20 bg-brand-info/10 text-brand-info',
};

const typeIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  danger: AlertTriangle,
  info: Info,
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(true);
  const Icon = typeIcons[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 200);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  if (!visible) return null;

  return (
    <div
      className={`
        p-4 rounded-xl border backdrop-blur-md flex items-start justify-between gap-3
        shadow-lg shadow-black/40 animate-slide-in
        ${typeStyles[toast.type]}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex gap-3 items-start flex-1 min-w-0">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-sm min-w-0">
          {toast.title && <p className="font-bold text-text-primary">{toast.title}</p>}
          <p className="text-text-secondary leading-relaxed mt-0.5">{toast.message}</p>
        </div>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onRemove(toast.id), 200);
        }}
        className="text-text-muted hover:text-text-primary transition-colors shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = React.useCallback((message: string, type: Toast['type'], title?: string, duration?: number) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newToast: Toast = { id, message, type, title, duration };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};