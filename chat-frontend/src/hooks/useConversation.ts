// Hook de gerenciamento de histórico de conversas
import { useState } from 'react';
import type { Conversation } from '../types/conversation';

<<<<<<< HEAD
interface UseConversationReturn {
  conversations: ConversationSummary[];
  isLoading: boolean;
  error: string | null;
  fetchHistory: () => Promise<void>;
  selectConversation: (id: number) => Promise<void>;
  createNewConversation: () => void;
}

export function useConversation(): UseConversationReturn {
  const { sessionId } = useSession();
  const { setActiveConversation, setMessages } = useConversationContext();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await getHistory(sessionId);
      setConversations(response.conversations);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar histórico';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const selectConversation = useCallback(
    async (id: number) => {
      if (!sessionId) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await getConversation(sessionId, id);
        setActiveConversation({ id: response.conversationId });
        setMessages(response.messages);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar conversa';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, setActiveConversation, setMessages],
  );

  const createNewConversation = useCallback(() => {
    setActiveConversation(null);
    setMessages([]);
  }, [setActiveConversation, setMessages]);

  return {
    conversations,
    isLoading,
    error,
    fetchHistory,
    selectConversation,
    createNewConversation,
  };
=======
export function useConversation() {
  const [conversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const selectConversation = (id: string) => setActiveConversationId(id);
  const deleteConversation = (_id: string) => {};
  const createConversation = () => {};

  return { conversations, activeConversationId, isLoading, error, selectConversation, deleteConversation, createConversation };
>>>>>>> 4df804c529dd6aa90a9fe0970b1be1d05e0f43b1
}
