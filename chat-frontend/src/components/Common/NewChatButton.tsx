import { useConversation } from '../../hooks/useConversation';
import styles from './NewChatButton.module.css';

export function NewChatButton() {
  const { createNewConversation } = useConversation();

  return (
    <button className={styles.button} onClick={createNewConversation} type="button">
      Novo Chat
    </button>
  );
}
