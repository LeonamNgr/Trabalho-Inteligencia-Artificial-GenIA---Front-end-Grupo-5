import styles from './UploadProgress.module.css';

interface UploadProgressProps {
  progress: number;
}

export function UploadProgress({ progress }: UploadProgressProps) {
  return (
    <div className={styles.container}>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${progress}%` }} />
      </div>
      <div className={styles.text}>{progress}%</div>
    </div>
  );
}
