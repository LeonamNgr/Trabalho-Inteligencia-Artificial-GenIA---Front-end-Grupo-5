import { useState, useCallback } from 'react';
import type { Message } from '../types/message';
import type { ConversationSummary } from '../types/conversation';
import { useSession } from '../contexts/SessionContext';
import { useConversationContext } from '../contexts/ConversationContext';
import { postMessage } from '../services/chatService';
import { isValidMessage } from '../utils/validators';
import { saveMessages, loadConversations, saveConversations } from '../services/conversationStorage';
import { HttpError } from '../services/api';

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, attachmentId?: number | null) => Promise<void>;
  retry: () => Promise<void>;
  clearMessages: () => void;
}

export function useChat(): UseChatReturn {
  const { sessionId, error: sessionError, initialize: reinitializeSession } = useSession();
  const {
    messages,
    activeConversation,
    setActiveConversation,
    addMessage,
    clearMessages: clearCtx,
  } = useConversationContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastContent, setLastContent] = useState<string>('');
  const [lastAttachmentId, setLastAttachmentId] = useState<number | null>(null);

  const persistMessages = useCallback(
    (convId: number, msgs: Message[]) => {
      if (!sessionId) return;
      saveMessages(sessionId, convId, msgs);
    },
    [sessionId],
  );

  const ensureConversationInList = useCallback(
    (convId: number, firstMessage: string) => {
      if (!sessionId) return;
      const list = loadConversations(sessionId);
      if (!list.some((c) => c.id === convId)) {
        const entry: ConversationSummary = {
          id: convId,
          title: firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : ''),
          messageCount: 1,
          lastMessage: firstMessage,
          lastActivity: new Date().toISOString(),
        };
        saveConversations(sessionId, [entry, ...list]);
      }
    },
    [sessionId],
  );

  const updateConversationLastMessage = useCallback(
    (convId: number, msg: string) => {
      if (!sessionId) return;
      const list = loadConversations(sessionId);
      const idx = list.findIndex((c) => c.id === convId);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          lastMessage: msg,
          lastActivity: new Date().toISOString(),
          messageCount: list[idx].messageCount + 1,
        };
        saveConversations(sessionId, list);
      }
    },
    [sessionId],
  );

  const sendMessage = useCallback(
    async (content: string, attachmentId?: number | null) => {
      if (!sessionId) {
        setError(sessionError || 'Sessão não disponível. Aguarde ou recarregue a página.');
        return;
      }

      const validation = isValidMessage(content);
      if (validation !== true) {
        setError(validation);
        return;
      }

      setError(null);
      setIsLoading(true);
      setLastContent(content);
      setLastAttachmentId(attachmentId ?? null);

      try {
        const response = await postMessage({
          sessionId,
          conversationId: activeConversation?.id ?? null,
          content,
          attachmentId: attachmentId ?? null,
        });

        const backendConvId = response.conversationId;

        if (!activeConversation) {
          setActiveConversation({ id: backendConvId });
          ensureConversationInList(backendConvId, content);
        }

        addMessage(response.userMessage);
        addMessage(response.assistantMessage);
        const allMsgs = [...messages, response.userMessage, response.assistantMessage];
        persistMessages(backendConvId, allMsgs);
        updateConversationLastMessage(backendConvId, response.assistantMessage.content);
      } catch (err) {
        if (err instanceof HttpError && (err.status === 404 || err.status === 409)) {
          setError('Sessão expirada ou inválida. Criando uma nova sessão...');
          await reinitializeSession();
          return;
        }
        const message = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, sessionError, activeConversation, messages, addMessage, setActiveConversation, persistMessages, ensureConversationInList, updateConversationLastMessage, reinitializeSession],
  );

  const retry = useCallback(async () => {
    if (lastContent) {
      await sendMessage(lastContent, lastAttachmentId);
    }
  }, [lastContent, lastAttachmentId, sendMessage]);

  const clearMessages = useCallback(() => {
    setError(null);
    clearCtx();
  }, [clearCtx]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    retry,
    clearMessages,
  };
}
