import type { ToastItem } from '../hooks/useToasts';

interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

function toastLabel(variant: ToastItem['variant']): string {
  if (variant === 'error') return 'Erreur';
  if (variant === 'success') return 'Succès';
  return 'Information';
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (!toasts.length) return null;

  return (
    <div className="toast-stack" aria-live="assertive" aria-relevant="additions">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={[
            'toast',
            `toast--${toast.variant}`,
            toast.leaving && 'toast--leave',
          ]
            .filter(Boolean)
            .join(' ')}
          role="alert"
        >
          <span className="toast__badge" aria-hidden>
            {toast.variant === 'error' ? '!' : toast.variant === 'success' ? '✓' : 'i'}
          </span>
          <div className="toast__content">
            <span className="toast__label">{toastLabel(toast.variant)}</span>
            <p className="toast__message">{toast.message}</p>
          </div>
          <button
            type="button"
            className="toast__close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Fermer la notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
