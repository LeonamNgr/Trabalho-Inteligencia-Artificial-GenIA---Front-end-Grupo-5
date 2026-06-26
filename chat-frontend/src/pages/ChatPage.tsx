import { ChatWindow } from '../components/Chat/ChatWindow';
import styles from './ChatPage.module.css';

export function ChatPage() {
  return (
    <div className={styles.container}>
      <ChatWindow />
    </div>
  );
}
