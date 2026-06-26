import { EmptyState } from '../Common/EmptyState';
import styles from './EmptyHistory.module.css';

export function EmptyHistory() {
  return (
    <div className={styles.container}>
      <EmptyState message="Nenhuma conversa ainda." />
    </div>
  );
}
