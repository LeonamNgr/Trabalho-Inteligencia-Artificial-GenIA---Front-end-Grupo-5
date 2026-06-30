import { useChat } from '../../hooks/useChat';
import { ErrorMessage } from '../Common/ErrorMessage';
import { Loading } from '../Common/Loading';
import { ChatInput } from './ChatInput';
import styles from './ChatWindow.module.css';
import { MessageList } from './MessageList';

export function ChatWindow() {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    sendFileMessage,
    retry,
  } = useChat();

  return (
    <div className={styles.container}>
      {error && (
        <ErrorMessage
          message={error}
          onRetry={retry}
        />
      )}

      {isLoading && messages.length === 0 ? (
        <Loading />
      ) : (
        <MessageList
          messages={messages}
          isTyping={isLoading}
          onSendSuggestion={sendMessage}
        />
      )}

      <ChatInput
        onSend={sendMessage}
        onSendFile={sendFileMessage}
        disabled={isLoading}
      />
    </div>
  );
}