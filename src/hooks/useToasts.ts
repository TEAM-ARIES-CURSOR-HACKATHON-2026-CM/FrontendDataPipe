import { useCallback, useRef, useState } from 'react';

export type ToastVariant = 'error' | 'success' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  leaving?: boolean;
}

const DEFAULT_DURATION_MS = 6000;
const LEAVE_ANIMATION_MS = 320;

export function useToasts(durationMs = DEFAULT_DURATION_MS) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>[]>>(new Map());

  const clearTimers = useCallback((id: string) => {
    const timers = timersRef.current.get(id);
    if (timers) {
      timers.forEach(clearTimeout);
      timersRef.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      clearTimers(id);
      setToasts((list) => list.filter((t) => t.id !== id));
    },
    [clearTimers],
  );

  const push = useCallback(
    (message: string, variant: ToastVariant = 'error') => {
      const id = crypto.randomUUID();
      setToasts((list) => [...list, { id, message, variant }]);

      const leaveTimer = setTimeout(() => {
        setToasts((list) =>
          list.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
        );
      }, durationMs - LEAVE_ANIMATION_MS);

      const removeTimer = setTimeout(() => dismiss(id), durationMs);
      timersRef.current.set(id, [leaveTimer, removeTimer]);

      return id;
    },
    [dismiss, durationMs],
  );

  const showError = useCallback((message: string) => push(message, 'error'), [push]);
  const showSuccess = useCallback((message: string) => push(message, 'success'), [push]);
  const showInfo = useCallback((message: string) => push(message, 'info'), [push]);

  return { toasts, push, showError, showSuccess, showInfo, dismiss };
}
