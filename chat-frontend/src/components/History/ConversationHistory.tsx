import { useConversation } from '../../hooks/useConversation';
import { ConversationItem } from './ConversationItem';
import { EmptyHistory } from './EmptyHistory';
import { Loading } from '../Common/Loading';
import { ErrorMessage } from '../Common/ErrorMessage';
import { useConversationContext } from '../../contexts/ConversationContext';
import styles from './ConversationHistory.module.css';

export function ConversationHistory() {
  const { conversations, isLoading, error, fetchHistory, selectConversation } = useConversation();
  const { activeConversation } = useConversationContext();

  return (
    <div className={styles.container}>
      {isLoading && <Loading />}
      {error && <ErrorMessage message={error} onRetry={fetchHistory} />}
      {!isLoading && !error && conversations.length === 0 && <EmptyHistory />}
      {!isLoading &&
        !error &&
        conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={conv.id === activeConversation?.id}
            onSelect={() => selectConversation(conv.id)}
          />
        ))}
    </div>
  );
}
