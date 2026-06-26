import { ConversationHistory } from '../History/ConversationHistory';
import styles from './Sidebar.module.css';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <nav className={`${styles.sidebar} ${open ? styles.open : ''}`}>
      <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar menu">×</button>
      <ConversationHistory />
    </nav>
  );
}
