import { useChat } from '../../hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ErrorMessage } from '../Common/ErrorMessage';
import styles from './ChatWindow.module.css';

export function ChatWindow() {
  const { messages, isLoading, error, sendMessage, retry } = useChat();

  return (
    <div className={styles.container}>
      {error && <ErrorMessage message={error} onRetry={retry} />}
      <MessageList messages={messages} isTyping={isLoading && messages.length > 0} />
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
