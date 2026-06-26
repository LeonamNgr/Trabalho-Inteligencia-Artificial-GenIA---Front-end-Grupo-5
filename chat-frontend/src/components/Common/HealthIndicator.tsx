import { useHealth } from '../../hooks/useHealth';
import styles from './HealthIndicator.module.css';

export function HealthIndicator() {
  const { status } = useHealth();

  const statusClass =
    status === 'UP' ? styles.up : status === 'DOWN' ? styles.down : styles.checking;
  const label = status === 'UP' ? 'UP' : status === 'DOWN' ? 'DOWN' : 'CHECKING';

  return (
    <div className={styles.indicator} role="status">
      <span className={`${styles.dot} ${statusClass}`} />
      <span>{label}</span>
    </div>
  );
}
