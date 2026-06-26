import { useMemo } from 'react';
import styles from './UploadProgress.module.css';

interface UploadProgressProps {
  progress: number;
  fileName: string;
  error: string | null;
  isComplete: boolean;
  onReset: () => void;
}

export function UploadProgress({ progress, fileName, error, isComplete, onReset }: UploadProgressProps) {
  const barClassName = useMemo(() => {
    if (error) return `${styles.barFill} ${styles.barFillError}`;
    if (isComplete) return `${styles.barFill} ${styles.barFillComplete}`;
    return styles.barFill;
  }, [error, isComplete]);

  return (
    <div
      className={styles.progress}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={styles.header}>
        {error ? (
          <span className={styles.errorText}>{error}</span>
        ) : (
          <span className={styles.label}>{fileName}</span>
        )}
        <button
          className={styles.dismiss}
          onClick={onReset}
          aria-label="Fechar"
          type="button"
        >
          &times;
        </button>
      </div>

      <div className={styles.bar}>
        <div className={barClassName} style={{ width: `${progress}%` }} />
      </div>

      <span className={styles.percent}>
        {isComplete ? 'Concluido' : `${Math.round(progress)}%`}
      </span>
    </div>
  );
}
