import type { ConversationSummary } from '../../types/conversation';
import { formatRelativeTime } from '../../utils/formatters';
import styles from './ConversationItem.module.css';

interface ConversationItemProps {
  conversation: ConversationSummary;
  isActive: boolean;
  onSelect: () => void;
}

export function ConversationItem({ conversation, isActive, onSelect }: ConversationItemProps) {
  return (
    <div
      className={`${styles.item} ${isActive ? styles.active : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect();
        }
      }}
    >
      <div className={styles.title}>{conversation.title}</div>
      <div className={styles.date}>{formatRelativeTime(conversation.lastActivity)}</div>
    </div>
  );
}
