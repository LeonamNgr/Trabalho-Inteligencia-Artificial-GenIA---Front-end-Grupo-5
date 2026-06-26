// Hook de gerenciamento do chat e envio de mensagens
import { useState } from 'react';
import type { Message } from '../types/message';
import type { UploadResponse } from '../types/upload';

<<<<<<< HEAD
interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  retry: () => Promise<void>;
  clearMessages: () => void;
}

export function useChat(): UseChatReturn {
  const { sessionId } = useSession();
  const {
    messages,
    activeConversation,
    addMessage,
    clearMessages: clearCtx,
  } = useConversationContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastContent, setLastContent] = useState<string>('');

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

      const conversationId = activeConversation?.id ?? null;

      const tempUserMessage: Message = {
        id: Date.now(),
        conversationId: conversationId ?? 0,
        role: 'USER',
        content,
        timestamp: new Date().toISOString(),
      };
      addMessage(tempUserMessage);

      try {
        const response = await postMessage({
          sessionId,
          conversationId,
          content,
        });

        if (response.conversationId && !conversationId) {
          // usar id da nova conversa se necessário
        }

        addMessage(response.assistantMessage);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, activeConversation, addMessage],
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
=======
export function useChat() {
  const [messages] = useState<Message[]>([]);
  const [isStreaming] = useState(false);
  const [error] = useState<string | null>(null);
  const [activeAttachment] = useState<UploadResponse | null>(null);

  const sendMessage = (_content: string) => {};
  const cancelStream = () => {};
  const clearAttachment = () => {};

  return { messages, isStreaming, error, activeAttachment, sendMessage, cancelStream, clearAttachment };
>>>>>>> 4df804c529dd6aa90a9fe0970b1be1d05e0f43b1
}
