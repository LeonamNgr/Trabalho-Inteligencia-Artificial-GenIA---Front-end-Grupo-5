import { useChat } from '../../hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { Loading } from '../Common/Loading';
import { ErrorMessage } from '../Common/ErrorMessage';
import styles from './ChatWindow.module.css';

export function ChatWindow() {
  const { messages, isLoading, error, sendMessage, retry } = useChat();

  return (
    <div className={styles.container}>
      {error && <ErrorMessage message={error} onRetry={retry} />}
      <MessageList messages={messages} />
      {isLoading && <Loading />}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
