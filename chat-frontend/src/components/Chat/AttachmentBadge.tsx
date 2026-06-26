import styles from './AttachmentBadge.module.css';

interface AttachmentBadgeProps {
<<<<<<< HEAD
  fileName?: string;
}

export function AttachmentBadge({ fileName }: AttachmentBadgeProps) {
  return (
    <span className={styles.badge}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
      </svg>
      {fileName}
    </span>
=======
  fileName: string;
  onRemove: () => void;
}

export function AttachmentBadge({ fileName, onRemove }: AttachmentBadgeProps) {
  return (
    <div className={styles.badge}>
      <div className={styles.icon} aria-hidden="true" />
      <span className={styles.name}>{fileName}</span>
      <button className={styles.remove} onClick={onRemove} type="button" aria-label="Remover anexo">
        &times;
      </button>
    </div>
>>>>>>> 4df804c529dd6aa90a9fe0970b1be1d05e0f43b1
  );
}
