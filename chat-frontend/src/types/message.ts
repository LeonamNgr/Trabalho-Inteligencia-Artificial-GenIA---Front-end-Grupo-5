import type { AttachmentResponse } from './upload';

export interface ChatRequest {
  sessionId: string;
  conversationId: number | null;
  content: string;
  attachmentId: number | null;
}

export interface Message {
  id: number;
  conversationId: number;
  role: 'USER' | 'ASSISTANT';
  content: string;
  timestamp: string;
  attachment?: AttachmentResponse | null;
}

export interface ChatResponse {
  userMessage: Message;
  assistantMessage: Message;
  conversationId: number;
}

export interface TaskStatusResponse {
  taskId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  result?: ChatResponse | null;
  errorMessage?: string | null;
  createdAt?: string | null;
  completedAt?: string | null;
}

export interface UploadAndAskResponse {
  userMessage: Message;
  assistantMessage: Message;
  conversationId: number;
}


