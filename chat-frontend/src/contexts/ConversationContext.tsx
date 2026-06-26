import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Message } from '../types/message';

interface ConversationContextType {
  activeConversationId: number | null;
  messages: Message[];
  setActiveConversation: (id: number | null) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  clearMessages: () => void;
}

const ConversationContext = createContext<ConversationContextType | null>(null);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [activeConversationId, setActiveConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setActiveConversation(null);
  }, []);

  return (
    <ConversationContext.Provider
      value={{
        activeConversationId,
        messages,
        setActiveConversation,
        addMessage,
        setMessages,
        clearMessages,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversationContext(): ConversationContextType {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversationContext deve ser usado dentro de ConversationProvider');
  }
  return context;
}
