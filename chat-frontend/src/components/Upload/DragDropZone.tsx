import styles from './DragDropZone.module.css';

interface DragDropZoneProps {
  isDragOver: boolean;
  onClick: () => void;
}

export function DragDropZone({ isDragOver, onClick }: DragDropZoneProps) {
  const className = `${styles.dragDropZone}${isDragOver ? ` ${styles.dragDropZoneActive}` : ''}`;

  return (
    <div
      className={className}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.icon} aria-hidden="true" />
      <span className={styles.text}>Arraste arquivo ou clique para selecionar</span>
      <span className={styles.hint}>.txt ou .pdf (max. 10 MB)</span>
    </div>
  );
}
