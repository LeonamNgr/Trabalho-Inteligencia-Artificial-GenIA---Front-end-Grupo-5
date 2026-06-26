<<<<<<< HEAD
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
=======
// Hook injetado: useChat
import { useState, useCallback } from 'react';
import { useChat } from '../../hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import styles from './ChatWindow.module.css';

export function ChatWindow() {
  const { messages, isStreaming, error, activeAttachment, sendMessage, cancelStream, clearAttachment } = useChat();
  const [draft, setDraft] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed || isStreaming) return;
    sendMessage(trimmed);
    setDraft('');
  }, [draft, isStreaming, sendMessage]);

  const handleCancel = useCallback(() => {
    cancelStream();
  }, [cancelStream]);

  return (
    <div className={styles.chatWindow}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chat IA</h1>
      </div>

      <MessageList messages={messages} isStreaming={isStreaming} />

      {error && <span className={styles.error}>{error}</span>}

      <ChatInput
        draft={draft}
        onDraftChange={setDraft}
        onSend={handleSend}
        onCancel={handleCancel}
        isStreaming={isStreaming}
        attachment={activeAttachment}
        onClearAttachment={clearAttachment}
      />
>>>>>>> 4df804c529dd6aa90a9fe0970b1be1d05e0f43b1
    </div>
  );
}
