import { useState, useCallback, useEffect } from 'react';
import type { ConversationSummary } from '../types/conversation';
import type { Conversation } from '../types/conversation';
import { useSession } from '../contexts/SessionContext';
import { useConversationContext } from '../contexts/ConversationContext';
import { getHistory, getConversation } from '../services/chatService';
import { loadConversations, saveConversations, loadMessages, saveMessages } from '../services/conversationStorage';
import { HttpError } from '../services/api';

interface UseConversationReturn {
  conversations: ConversationSummary[];
  isLoading: boolean;
  error: string | null;
  fetchHistory: () => Promise<void>;
  selectConversation: (id: number) => Promise<void>;
  createNewConversation: () => void;
}

export function useConversation(): UseConversationReturn {
  const { sessionId, error: sessionError, initialize: reinitializeSession } = useSession();
  const { activeConversation, messages, setActiveConversation, setMessages } = useConversationContext();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshFromStorage = useCallback(() => {
    if (!sessionId) return;
    const local = loadConversations(sessionId);
    setConversations(local);
  }, [sessionId]);

  const fetchHistory = useCallback(async () => {
    if (!sessionId) {
      setError(sessionError || 'Sessão não disponível.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const local = loadConversations(sessionId);
    if (local.length > 0) {
      setConversations(local);
    }

    try {
      const response = await getHistory(sessionId);
      setConversations(response.conversations);
      saveConversations(sessionId, response.conversations);
    } catch (err) {
      if (err instanceof HttpError && (err.status === 404 || err.status === 409)) {
        await reinitializeSession();
        return;
      }
      if (local.length === 0) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar histórico';
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, sessionError, reinitializeSession]);

  const selectConversation = useCallback(
    async (id: number) => {
      if (!sessionId) {
        setError(sessionError || 'Sessão não disponível.');
        return;
      }

      setIsLoading(true);
      setError(null);

      const localMessages = loadMessages(sessionId, id);
      if (localMessages.length > 0) {
        const conversation: Conversation = { id };
        setActiveConversation(conversation);
        setMessages(localMessages);
      }

      try {
        const response = await getConversation(sessionId, id);
        const conversation: Conversation = { id: response.id };
        setActiveConversation(conversation);
        setMessages(response.messages);
        saveMessages(sessionId, response.id, response.messages);
      } catch (err) {
      if (err instanceof HttpError && (err.status === 404 || err.status === 409)) {
        await reinitializeSession();
        return;
      }
      if (localMessages.length === 0) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar conversa';
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
    },
    [sessionId, sessionError, setActiveConversation, setMessages, reinitializeSession],
  );

  const createNewConversation = useCallback(() => {
    if (sessionId && activeConversation && messages.length > 0) {
      saveMessages(sessionId, activeConversation.id, messages);
    }
    setActiveConversation(null);
    setMessages([]);
  }, [sessionId, activeConversation, messages, setActiveConversation, setMessages]);

  useEffect(() => {
    if (sessionId) {
      fetchHistory();
    }
  }, [sessionId, fetchHistory]);

  useEffect(() => {
    refreshFromStorage();
  }, [activeConversation?.id, messages.length, refreshFromStorage]);

  return {
    conversations,
    isLoading,
    error,
    fetchHistory,
    selectConversation,
    createNewConversation,
  };
}
