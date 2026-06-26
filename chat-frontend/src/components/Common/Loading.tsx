import styles from './Loading.module.css';

export function Loading() {
  return (
    <div className={styles.container} role="status" aria-label="Carregando">
      <div className={styles.spinner} />
      <span>Processando...</span>
    </div>
  );
}
