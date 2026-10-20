import type { ToastState } from '../hooks/useToast';

interface ToastProps {
  toast: ToastState | null;
}

export function Toast({ toast }: ToastProps) {
  if (!toast) return null;
  const color =
    toast.type === 'success'
      ? 'bg-emerald-600'
      : toast.type === 'error'
      ? 'bg-rose-600'
      : 'bg-slate-800';
  return (
    <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2" role="status" aria-live="polite">
      <div className={`${color} text-white text-sm rounded-lg px-4 py-2 shadow-lg`}>
        {toast.message}
      </div>
    </div>
  );
}
