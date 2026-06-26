import { useRef, useEffect } from 'react';
import type { Message } from '../../types/message';
import { MessageItem } from './MessageItem';
import { EmptyState } from '../Common/EmptyState';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={styles.container} role="log" aria-live="polite">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      {isTyping && (
        <div className={styles.typing} aria-label="Assistente está digitando">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
