import type { Message } from '../../types/message';
import { MessageItem } from './MessageItem';
import { EmptyState } from '../Common/EmptyState';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={styles.container} role="log" aria-live="polite">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}
