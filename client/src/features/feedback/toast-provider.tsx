import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useRef, useState, type PropsWithChildren } from 'react';

type ToastTone = 'success' | 'info' | 'warning';

type ToastItem = {
  id: number;
  title: string;
  message?: string;
  tone: ToastTone;
};

type ToastInput = {
  title: string;
  message?: string;
  tone?: ToastTone;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(0);

  const removeToast = useCallback((toastId: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }, []);

  const showToast = useCallback(
    ({ title, message, tone = 'success' }: ToastInput) => {
      const id = nextIdRef.current++;
      setToasts((current) => [...current, { id, title, message, tone }]);

      window.setTimeout(() => {
        removeToast(id);
      }, 2600);
    },
    [removeToast]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider.');
  }

  return context;
}

function ToastCard({ toast }: { toast: ToastItem; onDismiss: () => void }) {
  const toneStyles = {
    success: {
      icon: <CheckCircle2 size={18} />,
      iconClass: 'bg-success-50 text-success-600',
      accentClass: 'bg-success-500'
    },
    info: {
      icon: <Info size={18} />,
      iconClass: 'bg-info-50 text-info-600',
      accentClass: 'bg-info-500'
    },
    warning: {
      icon: <TriangleAlert size={18} />,
      iconClass: 'bg-warning-50 text-warning-600',
      accentClass: 'bg-warning-500'
    }
  }[toast.tone];

  return (
    <div className="pointer-events-auto relative overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-4 pr-5 shadow-xl backdrop-blur-md transition duration-300 animate-[page-rise_240ms_cubic-bezier(0.2,0.8,0.2,1)] dark:border-slate-700 dark:bg-slate-900/95">
      <div className={`absolute inset-y-0 left-0 w-1 ${toneStyles.accentClass}`} />
      <div className="flex items-start gap-3 pl-2">
        <div className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${toneStyles.iconClass}`}>
          {toneStyles.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{toast.title}</p>
          {toast.message ? (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{toast.message}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
