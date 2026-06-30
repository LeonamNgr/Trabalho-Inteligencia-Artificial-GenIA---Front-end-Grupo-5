import { useCallback, useEffect, useState } from 'react';
import { useConversationContext } from '../contexts/ConversationContext';
import { useSession } from '../contexts/SessionContext';
import { HttpError } from '../services/api';
import { getConversation, getHistory } from '../services/chatService';
import {
  loadConversations,
  loadMessages,
  saveConversations,
  saveMessages,
} from '../services/conversationStorage';
import type {
  Conversation,
  ConversationSummary,
} from '../types/conversation';

interface UseConversationReturn {
  conversations: ConversationSummary[];
  isLoading: boolean;
  error: string | null;
  fetchHistory: () => Promise<void>;
  selectConversation: (id: number) => Promise<void>;
  createNewConversation: () => void;
}

export function useConversation(): UseConversationReturn {
  const {
    sessionId,
    error: sessionError,
    initialize: reinitializeSession,
  } = useSession();

  const {
    activeConversation,
    messages,
    setActiveConversation,
    setMessages,
  } = useConversationContext();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshFromStorage = useCallback(() => {
    if (!sessionId) return;

    setConversations(loadConversations(sessionId));
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
      if (
        err instanceof HttpError &&
        (err.status === 404 || err.status === 409)
      ) {
        await reinitializeSession();
        return;
      }

      if (local.length === 0) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar histórico',
        );
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

      if (activeConversation && messages.length > 0) {
        saveMessages(
          sessionId,
          activeConversation.id,
          messages,
        );
      }

      setIsLoading(true);
      setError(null);

      const localMessages = loadMessages(sessionId, id);

      if (localMessages.length > 0) {
        setActiveConversation({ id });
        setMessages(localMessages);
      }

      try {
        const response = await getConversation(
          sessionId,
          id,
        );

        const conversation: Conversation = {
          id: response.id,
        };

        setActiveConversation(conversation);
        setMessages(response.messages);

        saveMessages(
          sessionId,
          response.id,
          response.messages,
        );
      } catch (err) {
        if (
          err instanceof HttpError &&
          (err.status === 404 || err.status === 409)
        ) {
          await reinitializeSession();
          return;
        }

        if (localMessages.length === 0) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao carregar conversa',
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      sessionId,
      sessionError,
      activeConversation,
      messages,
      setActiveConversation,
      setMessages,
      reinitializeSession,
    ],
  );

  const createNewConversation = useCallback(() => {
    if (
      sessionId &&
      activeConversation &&
      messages.length > 0
    ) {
      saveMessages(
        sessionId,
        activeConversation.id,
        messages,
      );
    }

    setActiveConversation(null);
    setMessages([]);
  }, [
    sessionId,
    activeConversation,
    messages,
    setActiveConversation,
    setMessages,
  ]);

  /**
   * Carrega histórico
   */
  useEffect(() => {
    if (sessionId) {
      fetchHistory();
    }
  }, [sessionId, fetchHistory]);

  /**
   * Restaura automaticamente a conversa aberta após F5.
   */
  useEffect(() => {
    console.log('========== RESTORE ==========');
    console.log('session:', sessionId);
    console.log('activeConversation:', activeConversation);
    console.log('messages:', messages.length);

    if (!sessionId) {
      console.log('SEM SESSION');
      return;
    }

    if (!activeConversation) {
      console.log('SEM ACTIVE CONVERSATION');
      return;
    }

    if (messages.length > 0) {
      console.log('MENSAGENS JÁ CARREGADAS');
      return;
    }

    console.log(
      'RESTAURANDO CONVERSA:',
      activeConversation.id,
    );

    void selectConversation(activeConversation.id);
  }, [
    sessionId,
    activeConversation,
    messages.length,
    selectConversation,
  ]);

  /**
   * Atualiza sidebar a partir do LocalStorage.
   */
  useEffect(() => {
    refreshFromStorage();
  }, [
    activeConversation?.id,
    messages.length,
    refreshFromStorage,
  ]);

  return {
    conversations,
    isLoading,
    error,
    fetchHistory,
    selectConversation,
    createNewConversation,
  };
}