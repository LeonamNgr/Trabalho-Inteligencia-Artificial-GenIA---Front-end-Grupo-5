<<<<<<< HEAD
import { EmptyState } from '../Common/EmptyState';
=======
>>>>>>> 4df804c529dd6aa90a9fe0970b1be1d05e0f43b1
import styles from './EmptyHistory.module.css';

export function EmptyHistory() {
  return (
<<<<<<< HEAD
    <div className={styles.container}>
      <EmptyState message="Nenhuma conversa ainda." />
=======
    <div className={styles.empty}>
      <div className={styles.icon} aria-hidden="true" />
      <span className={styles.text}>Nenhuma conversa ainda</span>
      <span className={styles.hint}>Crie uma nova conversa para começar</span>
>>>>>>> 4df804c529dd6aa90a9fe0970b1be1d05e0f43b1
    </div>
  );
}
