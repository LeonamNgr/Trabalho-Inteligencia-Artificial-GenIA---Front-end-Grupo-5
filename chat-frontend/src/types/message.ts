import type { UploadResponse } from './upload';

export interface ChatRequest {
  sessionId: string;
  conversationId: number | null;
  content: string;
  attachmentId?: number | null;
}

export interface Message {
  id: number;
  conversationId: number;
  role: 'USER' | 'ASSISTANT';
  content: string;
  timestamp: string;
  attachment?: UploadResponse | null;
}

export interface ChatResponse {
  userMessage: Message;
  assistantMessage: Message;
  conversationId: number;
}
