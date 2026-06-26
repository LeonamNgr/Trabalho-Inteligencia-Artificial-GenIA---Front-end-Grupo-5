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
    </div>
  );
}
