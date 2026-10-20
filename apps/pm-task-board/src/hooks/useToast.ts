import { useCallback, useEffect, useState } from 'react';

export interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const show = useCallback(
    (message: string, type: ToastState['type'] = 'info', durationMs = 2500) => {
      const id = Date.now();
      setToast({ message, type, id });
      window.setTimeout(() => {
        setToast((cur) => (cur && cur.id === id ? null : cur));
      }, durationMs);
    },
    [],
  );

  // 组件卸载时清理
  useEffect(() => () => setToast(null), []);

  return { toast, show };
}
