import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Conversation } from '../types/conversation';
import type { Message } from '../types/message';
import { STORAGE_KEYS } from '../utils/constants';

interface ConversationContextType {
  activeConversation: Conversation | null;
  messages: Message[];
  setActiveConversation: (conversation: Conversation | null) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: number, updates: Partial<Message>) => void;
  setMessages: (messages: Message[]) => void;
  clearMessages: () => void;
}

export const ConversationContext = createContext<ConversationContextType | null>(null);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [activeConversation, setActiveConversationState] =
    useState<Conversation | null>(null);

  const setActiveConversation = useCallback(
    (conversation: Conversation | null) => {

      setActiveConversationState(conversation);

      if (conversation) {
        localStorage.setItem(
          STORAGE_KEYS.ACTIVE_CONVERSATION,
          JSON.stringify(conversation),
        );
      } else {
        localStorage.removeItem(
          STORAGE_KEYS.ACTIVE_CONVERSATION,
        );
      }

    },
    [],
  );
  const [messages, setMessages] = useState<Message[]>([]);
  useEffect(() => {

    const stored =
      localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION);

    if (!stored) return;

    try {

      const conversation: Conversation =
        JSON.parse(stored);

      setActiveConversationState(conversation);

    } catch {

      localStorage.removeItem(
        STORAGE_KEYS.ACTIVE_CONVERSATION,
      );

    }

  }, []);
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateMessage = useCallback((id: number, updates: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
    );
  }, []);

  const clearMessages = useCallback(() => {

    setMessages([]);

    setActiveConversation(null);

  }, [setActiveConversation]);

  return (
    <ConversationContext.Provider
      value={{
        activeConversation,
        messages,
        setActiveConversation,
        addMessage,
        updateMessage,
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