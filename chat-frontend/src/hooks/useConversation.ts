import { useState, useCallback } from 'react';
import type { ConversationSummary } from '../types/conversation';
import type { Conversation } from '../types/conversation';
import { useSession } from '../contexts/SessionContext';
import { useConversationContext } from '../contexts/ConversationContext';
import { getHistory, getConversation } from '../services/chatService';

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
        const conversation: Conversation = { id: response.conversationId };
        setActiveConversation(conversation);
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
}
