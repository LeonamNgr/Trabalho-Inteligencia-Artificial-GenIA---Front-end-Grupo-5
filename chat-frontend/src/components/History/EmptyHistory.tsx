import styles from './EmptyHistory.module.css';

export function EmptyHistory() {
  return (
    <div className={styles.empty}>
      <div className={styles.icon} aria-hidden="true" />
      <span className={styles.text}>Nenhuma conversa ainda</span>
      <span className={styles.hint}>Crie uma nova conversa para começar</span>
    </div>
  );
}
