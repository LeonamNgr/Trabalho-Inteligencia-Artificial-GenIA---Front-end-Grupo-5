<<<<<<< HEAD
import type { Message } from '../../types/message';
import { formatTime } from '../../utils/formatters';
import { AttachmentBadge } from './AttachmentBadge';
=======
import { useMemo } from 'react';
import type { Message } from '../../types/message';
>>>>>>> 4df804c529dd6aa90a9fe0970b1be1d05e0f43b1
import styles from './MessageItem.module.css';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
<<<<<<< HEAD
  const isUser = message.role === 'USER';

  return (
    <div className={`${styles.message} ${isUser ? styles.user : styles.assistant}`}>
      <div>{message.content}</div>
      {message.attachment && (
        <AttachmentBadge fileName={message.attachment.fileName} />
      )}
      <div className={styles.timestamp}>{formatTime(message.timestamp)}</div>
=======
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
>>>>>>> 4df804c529dd6aa90a9fe0970b1be1d05e0f43b1
    </div>
  );
}
