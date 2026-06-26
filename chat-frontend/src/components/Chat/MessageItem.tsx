import { useMemo } from 'react';
import type { Message } from '../../types/message';
import styles from './MessageItem.module.css';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';
  const className = `${styles.item} ${isUser ? styles.itemUser : styles.itemAssistant}`;

  const formattedTime = useMemo(
    () =>
      new Date(message.timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    [message.timestamp],
  );

  return (
    <div className={className}>
      <div className={styles.bubble}>
        <p className={styles.content}>{message.content}</p>
        {message.attachment && (
          <div className={styles.attachment}>
            <span className={styles.attachmentIcon} aria-hidden="true" />
            <span className={styles.attachmentName}>{message.attachment.fileName}</span>
          </div>
        )}
      </div>
      <span className={styles.time}>{formattedTime}</span>
    </div>
  );
}
