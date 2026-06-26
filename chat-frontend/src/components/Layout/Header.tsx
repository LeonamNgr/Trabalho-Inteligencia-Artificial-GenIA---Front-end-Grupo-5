import { Logo } from '../Common/Logo';
import { HealthIndicator } from '../Common/HealthIndicator';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <Logo />
      <HealthIndicator />
    </header>
  );
}
