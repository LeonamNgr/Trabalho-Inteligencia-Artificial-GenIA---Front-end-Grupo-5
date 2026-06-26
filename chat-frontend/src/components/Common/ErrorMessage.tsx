import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className={styles.container} role="alert">
      <span>{message}</span>
      {onRetry && (
        <button className={styles.retryButton} onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}
