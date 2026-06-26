import { useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import styles from './Toast.module.css';

export function Toast() {
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => removeToast(toast.id), 5000),
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
          role="alert"
        >
          <span>{toast.message}</span>
          <button
            className={styles.close}
            onClick={() => removeToast(toast.id)}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
