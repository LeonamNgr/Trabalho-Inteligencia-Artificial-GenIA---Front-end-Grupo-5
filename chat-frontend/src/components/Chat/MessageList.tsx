import { useRef, useEffect } from 'react';
import type { Message } from '../../types/message';
import { MessageItem } from './MessageItem';
import { WelcomeScreen } from './WelcomeScreen';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
  onSendSuggestion?: (text: string) => void;
}

export function MessageList({ messages, isTyping, onSendSuggestion }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  if (messages.length === 0) {
    return <WelcomeScreen onSendSuggestion={onSendSuggestion ?? (() => {})} />;
  }

  return (
    <div className={styles.container} ref={containerRef} role="log" aria-live="polite">
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
