import { useState, useCallback } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Message } from '../types/message';
import { useConversation } from './useConversation';
import { SessionContext } from '../contexts/SessionContext';
import { ConversationContext } from '../contexts/ConversationContext';

const mockGetHistory = vi.fn();
const mockGetConversation = vi.fn();

vi.mock('../services/chatService', () => ({
  getHistory: (...args: unknown[]) => mockGetHistory(...args),
  getConversation: (...args: unknown[]) => mockGetConversation(...args),
}));

vi.mock('../utils/withRetry', () => ({
  withRetry: <T,>(fn: () => Promise<T>) => fn(),
}));

vi.mock('../services/conversationStorage', () => ({
  loadConversations: () => [],
  saveConversations: vi.fn(),
  loadMessages: () => [],
  saveMessages: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

function createWrapper() {
  const sessionValue = { sessionId: 'test-session', isLoading: false, error: null, initialize: vi.fn(), destroy: vi.fn() };

  return function Wrapper({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeConversation, setActiveConversation] = useState<{ id: number } | null>(null);
    const addMessage = useCallback((msg: Message) => setMessages((prev) => [...prev, msg]), []);

    const updateMessage = useCallback((id: number, updates: Partial<Message>) => {
      setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)));
    }, []);

    const conversationValue = {
      activeConversation,
      messages,
      setActiveConversation,
      addMessage,
      updateMessage,
      setMessages,
      clearMessages: useCallback(() => { setMessages([]); setActiveConversation(null); }, []),
    };

    return (
      <SessionContext.Provider value={sessionValue}>
        <ConversationContext.Provider value={conversationValue}>
          {children}
        </ConversationContext.Provider>
      </SessionContext.Provider>
    );
  };
}

describe('useConversation', () => {
  it('fetches history on fetchHistory call', async () => {
    mockGetHistory.mockResolvedValue({ sessionId: 'test-session', conversations: [] });

    const { result } = renderHook(() => useConversation(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.fetchHistory();
    });

    expect(mockGetHistory).toHaveBeenCalled();
  });

  it('selects conversation on selectConversation', async () => {
    mockGetConversation.mockResolvedValue({ id: 1, messages: [{ id: 1, conversationId: 1, role: 'USER', content: 'Oi', timestamp: new Date().toISOString() }] });

    const { result } = renderHook(() => useConversation(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.selectConversation(1);
    });

    expect(mockGetConversation).toHaveBeenCalled();
  });

  it('creates new conversation', async () => {
    mockGetHistory.mockResolvedValue({ sessionId: 'test-session', conversations: [] });
    const { result } = renderHook(() => useConversation(), { wrapper: createWrapper() });
    await act(async () => {});

    act(() => {
      result.current.createNewConversation();
    });

    expect(result.current.conversations).toEqual([]);
  });

  it('handles fetch failure', async () => {
    mockGetHistory.mockRejectedValue(new Error('Erro de rede'));

    const { result } = renderHook(() => useConversation(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.fetchHistory();
    });

    expect(result.current.error).toBe('Erro de rede');
  });
});
