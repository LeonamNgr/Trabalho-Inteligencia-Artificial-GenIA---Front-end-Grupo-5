import { useState, useCallback } from 'react';
import type { Message } from '../types/message';
import type { ConversationSummary } from '../types/conversation';
import { useSession } from '../contexts/SessionContext';
import { useConversationContext } from '../contexts/ConversationContext';
import { postMessage } from '../services/chatService';
import { isValidMessage } from '../utils/validators';
import { saveMessages, loadConversations, saveConversations } from '../services/conversationStorage';

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  retry: () => Promise<void>;
  clearMessages: () => void;
}

const ASSISTANT_REPLIES = [
  'Interessante! Conte-me mais sobre isso.',
  'Entendo. Como posso ajudar com isso?',
  'Ótimo ponto! Vou investigar essa questão.',
  'Sim, faz sentido. O que mais você gostaria de saber?',
  'Deixe-me pensar sobre isso... Baseado no que você disse, sugiro explorarmos algumas opções.',
];

function pickReply(): string {
  return ASSISTANT_REPLIES[Math.floor(Math.random() * ASSISTANT_REPLIES.length)];
}

export function useChat(): UseChatReturn {
  const { sessionId } = useSession();
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
          title: firstMessage.slice(0, 60) + (firstMessage.length > 60 ? '...' : ''),
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
    async (content: string) => {
      if (!sessionId) return;

      const validation = isValidMessage(content);
      if (validation !== true) {
        setError(validation);
        return;
      }

      setError(null);
      setIsLoading(true);
      setLastContent(content);

      let convId = activeConversation?.id ?? 0;
      const isNewConversation = convId === 0;

      if (isNewConversation) {
        convId = Date.now();
        setActiveConversation({ id: convId });
      }

      const tempUserMessage: Message = {
        id: Date.now() + 1,
        conversationId: convId,
        role: 'USER',
        content,
        timestamp: new Date().toISOString(),
      };
      addMessage(tempUserMessage);

      if (isNewConversation) {
        ensureConversationInList(convId, content);
      }

      try {
        const response = await postMessage({
          sessionId,
          conversationId: convId,
          content,
        });
        addMessage(response.assistantMessage);
        const allMsgs = [...messages, tempUserMessage, response.assistantMessage];
        persistMessages(convId, allMsgs);
        updateConversationLastMessage(convId, response.assistantMessage.content);
      } catch {
        const simulated: Message = {
          id: Date.now() + 2,
          conversationId: convId,
          role: 'ASSISTANT',
          content: pickReply(),
          timestamp: new Date().toISOString(),
        };
        addMessage(simulated);
        const allMsgs = [...messages, tempUserMessage, simulated];
        persistMessages(convId, allMsgs);
        updateConversationLastMessage(convId, simulated.content);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, activeConversation, messages, addMessage, setActiveConversation, persistMessages, ensureConversationInList, updateConversationLastMessage],
  );

  const retry = useCallback(async () => {
    if (lastContent) {
      await sendMessage(lastContent);
    }
  }, [lastContent, sendMessage]);

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
