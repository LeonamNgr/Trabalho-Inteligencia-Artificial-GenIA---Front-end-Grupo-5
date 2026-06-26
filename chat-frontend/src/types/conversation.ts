import type { Message } from './message';

export interface Conversation {
  id: number;
  title?: string;
}

export interface ConversationSummary {
  id: number;
  title: string;
  messageCount: number;
  lastMessage: string;
  lastActivity: string;
}

export interface HistoryResponse {
  sessionId: string;
  conversations: ConversationSummary[];
}

export interface ConversationResponse {
  conversationId: number;
  messages: Message[];
}
