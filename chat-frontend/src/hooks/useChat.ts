import { useState, useCallback, useRef } from 'react';
import type { Message } from '../types/message';
import type { ConversationSummary } from '../types/conversation';
import { useSession } from '../contexts/SessionContext';
import { useConversationContext } from '../contexts/ConversationContext';
import { postMessageAsync, uploadAndAsk } from '../services/chatService';
import { isValidMessage, isAllowedFileType, isAllowedExtension, isWithinFileSizeLimit } from '../utils/validators';
import { saveMessages, loadConversations, saveConversations } from '../services/conversationStorage';
import { HttpError } from '../services/api';

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, attachmentId?: number | null) => Promise<void>;
  sendFileMessage: (content: string, file: File) => Promise<void>;
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
    updateMessage,
    clearMessages: clearCtx,
  } = useConversationContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastContentRef = useRef('');
  const lastAttachmentIdRef = useRef<number | null>(null);
  const lastFileRef = useRef<File | null>(null);

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
      lastContentRef.current = content;
      lastAttachmentIdRef.current = attachmentId ?? null;
      lastFileRef.current = null;

      const tempUserId = -Date.now();
      let backendConvId: number | null = null;

      try {
        const tempUser: Message = {
          id: tempUserId,
          conversationId: activeConversation?.id ?? 0,
          role: 'USER',
          content,
          timestamp: new Date().toISOString(),
        };
        addMessage(tempUser);

        const response = await postMessageAsync({
          sessionId,
          conversationId: activeConversation?.id ?? null,
          content,
          attachmentId: attachmentId ?? null,
        });

        backendConvId = response.conversationId;

        if (!activeConversation) {
          setActiveConversation({ id: backendConvId });
          ensureConversationInList(backendConvId, content);
        }

        updateMessage(tempUserId, {
          id: response.userMessage.id,
          conversationId: backendConvId,
          content: response.userMessage.content,
          timestamp: response.userMessage.timestamp,
        });

        const assistantMsg: Message = {
          id: response.assistantMessage.id,
          conversationId: backendConvId,
          role: 'ASSISTANT',
          content: response.assistantMessage.content,
          timestamp: response.assistantMessage.timestamp,
        };
        addMessage(assistantMsg);

        const allMsgs = [...messages, response.userMessage, assistantMsg];
        persistMessages(backendConvId, allMsgs);
        updateConversationLastMessage(backendConvId, assistantMsg.content);
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
    [sessionId, sessionError, activeConversation, addMessage, updateMessage, setActiveConversation, persistMessages, ensureConversationInList, updateConversationLastMessage, reinitializeSession],
  );

  const sendFileMessage = useCallback(
    async (content: string, file: File) => {
      if (!sessionId) {
        setError(sessionError || 'Sessão não disponível. Aguarde ou recarregue a página.');
        return;
      }

      if (!isAllowedFileType(file.type) && !isAllowedExtension(file.name)) {
        setError('Formato de arquivo não suportado.');
        return;
      }

      if (!isWithinFileSizeLimit(file.size)) {
        setError('O arquivo excede o limite de 50 MB.');
        return;
      }

      setError(null);
      setIsLoading(true);
      lastContentRef.current = content;
      lastAttachmentIdRef.current = null;
      lastFileRef.current = file;

      try {
        const response = await uploadAndAsk(
          file,
          sessionId,
          activeConversation?.id ?? null,
          content || undefined,
        );

        const backendConvId = response.conversationId;

        if (!activeConversation) {
          setActiveConversation({ id: backendConvId });
        }

        addMessage(response.userMessage);

        const assistantMsg: Message = {
          id: response.assistantMessage.id,
          conversationId: backendConvId,
          role: 'ASSISTANT',
          content: response.assistantMessage.content,
          timestamp: response.assistantMessage.timestamp,
        };

        if (!activeConversation) {
          ensureConversationInList(backendConvId, response.userMessage.content);
        }

        addMessage(assistantMsg);
        const allMsgs = [...messages, response.userMessage, assistantMsg];
        persistMessages(backendConvId, allMsgs);
        updateConversationLastMessage(backendConvId, assistantMsg.content);
      } catch (err) {
        if (err instanceof HttpError && err.status === 409) {
          setError('Sessão expirada. Criando uma nova sessão...');
          await reinitializeSession();
          return;
        }
        const message = err instanceof Error ? err.message : 'Erro ao enviar arquivo';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, sessionError, activeConversation, messages, addMessage, setActiveConversation, persistMessages, ensureConversationInList, updateConversationLastMessage, reinitializeSession],
  );

  const retry = useCallback(async () => {
    const file = lastFileRef.current;
    const content = lastContentRef.current;
    if (file) {
      await sendFileMessage(content, file);
    } else if (content) {
      await sendMessage(content, lastAttachmentIdRef.current);
    }
  }, [sendMessage, sendFileMessage]);

  const clearMessages = useCallback(() => {
    setError(null);
    clearCtx();
  }, [clearCtx]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    sendFileMessage,
    retry,
    clearMessages,
  };
}
