export interface AttachmentSummary {
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface Message {
  id: number;
  conversationId: number;
  role: 'USER' | 'ASSISTANT';
  content: string;
  timestamp: string;
  attachment?: AttachmentSummary | null;
}

export interface ChatRequest {
  sessionId: string;
  conversationId: number | null;
  content: string;
  attachmentId?: number | null;
}

export interface ChatResponse {
  userMessage: Message;
  assistantMessage: Message;
  conversationId: number;
}
