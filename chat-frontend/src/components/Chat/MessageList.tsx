import { useRef, useEffect } from 'react';
import type { Message } from '../../types/message';
import { MessageItem } from './MessageItem';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon} aria-hidden="true" />
        <span className={styles.emptyText}>Nenhuma mensagem ainda</span>
        <span className={styles.emptyHint}>Envie uma mensagem para começar</span>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      {isStreaming && <span className={styles.streaming}>IA está digitando...</span>}
      <div ref={bottomRef} />
    </div>
  );
}
