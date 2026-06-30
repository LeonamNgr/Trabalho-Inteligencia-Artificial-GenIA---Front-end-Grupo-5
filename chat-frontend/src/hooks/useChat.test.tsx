import { useState, useCallback } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Message } from '../types/message';
import { useChat } from './useChat';
import { SessionContext } from '../contexts/SessionContext';
import { ConversationContext } from '../contexts/ConversationContext';

const mockPostMessage = vi.fn();

vi.mock('../services/chatService', () => ({
  postMessage: (...args: unknown[]) => mockPostMessage(...args),
}));

vi.mock('../utils/withRetry', () => ({
  withRetry: <T,>(fn: () => Promise<T>) => fn(),
}));

vi.mock('../services/conversationStorage', () => ({
  saveMessages: vi.fn(),
  loadConversations: () => [],
  saveConversations: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
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

describe('useChat', () => {
  it('sends message and calls postMessage with user + assistant from API', async () => {
    mockPostMessage.mockResolvedValue({ userMessage: { id: 1, conversationId: 1, role: 'USER' as const, content: 'Oi', timestamp: new Date().toISOString(), attachment: null }, assistantMessage: { id: 2, conversationId: 1, role: 'ASSISTANT' as const, content: 'Resposta', timestamp: new Date().toISOString(), attachment: null }, conversationId: 1 });

    const { result } = renderHook(() => useChat(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.sendMessage('Oi');
    });

    expect(mockPostMessage).toHaveBeenCalled();
    expect(result.current.messages.length).toBe(2);
    expect(result.current.messages[0].role).toBe('USER');
    expect(result.current.messages[1].role).toBe('ASSISTANT');
  });

  it('sets error on send failure without adding messages', async () => {
    mockPostMessage.mockRejectedValue(new Error('Erro de rede'));

    const { result } = renderHook(() => useChat(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.sendMessage('Oi');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Erro de rede');
    expect(result.current.messages.length).toBe(0);
  });

  it('does not send empty message', async () => {
    const { result } = renderHook(() => useChat(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.sendMessage('');
    });

    expect(mockPostMessage).not.toHaveBeenCalled();
  });

  it('clears messages', () => {
    const { result } = renderHook(() => useChat(), { wrapper: createWrapper() });

    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.messages).toEqual([]);
  });

  it('retries last message with same content', async () => {
    mockPostMessage.mockResolvedValue({ userMessage: { id: 1, conversationId: 1, role: 'USER' as const, content: 'Oi', timestamp: new Date().toISOString(), attachment: null }, assistantMessage: { id: 2, conversationId: 1, role: 'ASSISTANT' as const, content: 'Resposta', timestamp: new Date().toISOString(), attachment: null }, conversationId: 1 });

    const { result } = renderHook(() => useChat(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.sendMessage('Oi');
    });

    expect(mockPostMessage).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.retry();
    });

    expect(mockPostMessage).toHaveBeenCalledTimes(2);
    expect(mockPostMessage).toHaveBeenLastCalledWith(expect.objectContaining({ content: 'Oi' }));
  });
});
