// Hook injetado: useConversation
import { useConversation } from '../../hooks/useConversation';
import { ConversationItem } from './ConversationItem';
import { EmptyHistory } from './EmptyHistory';
import styles from './ConversationHistory.module.css';

export function ConversationHistory() {
  const {
    conversations,
    activeConversationId,
    isLoading,
    error,
    selectConversation,
    deleteConversation,
    createConversation,
  } = useConversation();

  if (isLoading) {
    return (
      <aside className={styles.history}>
        <div className={styles.header}>
          <h2 className={styles.title}>Histórico</h2>
        </div>
        <span className={styles.loading}>Carregando...</span>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className={styles.history}>
        <div className={styles.header}>
          <h2 className={styles.title}>Histórico</h2>
        </div>
        <span className={styles.error}>{error}</span>
      </aside>
    );
  }

  return (
    <aside className={styles.history}>
      <div className={styles.header}>
        <h2 className={styles.title}>Histórico</h2>
        <button className={styles.newChat} onClick={createConversation} type="button">
          + Nova conversa
        </button>
      </div>

      {conversations.length === 0 ? (
        <EmptyHistory />
      ) : (
        <nav className={styles.list} aria-label="Histórico de conversas">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onSelect={selectConversation}
              onDelete={deleteConversation}
            />
          ))}
        </nav>
      )}
    </aside>
  );
}
