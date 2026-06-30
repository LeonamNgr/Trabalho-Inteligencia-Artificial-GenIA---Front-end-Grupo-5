import { useEffect, useRef, useState } from 'react';
import type { Message } from '../../types/message';
import { MessageItem } from './MessageItem';
import styles from './MessageList.module.css';
import { WelcomeScreen } from './WelcomeScreen';

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
  onSendSuggestion?: (text: string) => void;
}

export function MessageList({
  messages,
  isTyping,
  onSendSuggestion,
}: MessageListProps) {

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // primeira restauração da conversa
  const firstLoadRef = useRef(true);

  // controla se o usuário está no final
  const [autoScroll, setAutoScroll] = useState(true);

  /**
   * Detecta se o usuário subiu no chat
   */
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const handleScroll = () => {

      const distance =
        container.scrollHeight -
        container.scrollTop -
        container.clientHeight;

      setAutoScroll(distance < 120);
    };

    container.addEventListener('scroll', handleScroll);

    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /**
   * Scroll da primeira restauração
   */
  useEffect(() => {

    if (!messages.length) return;

    if (!firstLoadRef.current) return;

    firstLoadRef.current = false;

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: 'auto',
      });
    });

  }, [messages]);

  /**
   * Scroll das mensagens novas
   */
  useEffect(() => {

    if (!messages.length) return;

    if (!autoScroll) return;

    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });

  }, [messages, isTyping, autoScroll]);

  if (messages.length === 0) {
    return (
      <WelcomeScreen
        onSendSuggestion={onSendSuggestion ?? (() => { })}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={styles.container}
      role="log"
      aria-live="polite"
    >
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
        />
      ))}

      {isTyping && (
        <div
          className={styles.typing}
          aria-label="Assistente está digitando"
        >
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}