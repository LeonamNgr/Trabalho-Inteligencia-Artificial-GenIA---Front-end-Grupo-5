import styles from './AttachmentBadge.module.css';

interface AttachmentBadgeProps {
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
  );
}
