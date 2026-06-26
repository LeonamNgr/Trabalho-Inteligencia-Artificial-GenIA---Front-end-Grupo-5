import styles from './SkeletonLoader.module.css';

interface SkeletonLoaderProps {
  lines?: number;
}

export function SkeletonLoader({ lines = 3 }: SkeletonLoaderProps) {
  return (
    <div className={styles.container} aria-label="Carregando...">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={styles.line} style={{ width: `${Math.max(40, 100 - i * 20)}%` }} />
      ))}
    </div>
  );
}
