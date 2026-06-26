// Hook de gerenciamento de histórico de conversas
import { useState } from 'react';
import type { Conversation } from '../types/conversation';

export function useConversation() {
  const [conversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const selectConversation = (id: string) => setActiveConversationId(id);
  const deleteConversation = (_id: string) => {};
  const createConversation = () => {};

  return { conversations, activeConversationId, isLoading, error, selectConversation, deleteConversation, createConversation };
}
