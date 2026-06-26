<<<<<<< HEAD
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
=======
import { useMemo, useCallback } from 'react';
import type { Conversation } from '../../types/conversation';
import styles from './ConversationItem.module.css';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationItem({ conversation, isActive, onSelect, onDelete }: ConversationItemProps) {
  const handleSelect = useCallback(() => onSelect(conversation.id), [conversation.id, onSelect]);
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(conversation.id);
  }, [conversation.id, onDelete]);

  const formattedDate = useMemo(
    () =>
      new Date(conversation.updatedAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    [conversation.updatedAt],
  );

  const className = `${styles.item}${isActive ? ` ${styles.itemActive}` : ''}`;

  return (
    <div
      className={className}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-current={isActive ? 'true' : undefined}
    >
      <span className={styles.title}>{conversation.title}</span>
      <span className={styles.meta}>
        <span className={styles.preview}>{conversation.lastMessage}</span>
        <span className={styles.date}>{formattedDate}</span>
      </span>
      <button className={styles.delete} onClick={handleDelete} type="button" aria-label="Excluir conversa">
        &times;
      </button>
>>>>>>> 4df804c529dd6aa90a9fe0970b1be1d05e0f43b1
    </div>
  );
}
