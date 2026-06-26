import { NewChatButton } from '../History/NewChatButton';
import { ConversationHistory } from '../History/ConversationHistory';
import styles from './Sidebar.module.css';

export function Sidebar() {
  return (
    <nav className={styles.sidebar}>
      <NewChatButton />
      <ConversationHistory />
    </nav>
  );
}
