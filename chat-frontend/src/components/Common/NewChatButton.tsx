import { useConversationContext } from '../../contexts/ConversationContext';
import styles from './NewChatButton.module.css';

export function NewChatButton() {
  const { setActiveConversation } = useConversationContext();

  const handleClick = () => {
    setActiveConversation(null);
  };

  return (
    <button className={styles.button} onClick={handleClick} type="button">
      Novo Chat
    </button>
  );
}
