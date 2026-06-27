import type { Message } from '../../types/message';
import { formatTime } from '../../utils/formatters';
import { AttachmentBadge } from './AttachmentBadge';
import { SourcePanel } from '../Common/SourcePanel';
import styles from './MessageItem.module.css';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'USER';

  return (
    <div className={`${styles.message} ${isUser ? styles.user : styles.assistant}`}>
      <div>{message.content}</div>
      {message.attachment && (
        <AttachmentBadge fileName={message.attachment.fileName} />
      )}
      {!isUser && message.sources && message.sources.length > 0 && (
        <SourcePanel sources={message.sources} />
      )}
      <div className={styles.timestamp}>{formatTime(message.timestamp)}</div>
    </div>
  );
}
