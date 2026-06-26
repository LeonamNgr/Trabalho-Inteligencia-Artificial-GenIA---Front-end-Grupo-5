import type { ChatRequest, ChatResponse } from '../types/message';
import type { HistoryResponse, ConversationResponse } from '../types/conversation';
import { TIMEOUTS } from '../utils/constants';
import { api } from './api';

export async function postMessage(request: ChatRequest): Promise<ChatResponse> {
  return api.post<ChatResponse>('/api/chat/message', request, TIMEOUTS.MESSAGE);
}

export async function getHistory(sessionId: string): Promise<HistoryResponse> {
  return api.get<HistoryResponse>(`/api/chat/history/${sessionId}`, TIMEOUTS.HISTORY);
}

export async function getConversation(
  sessionId: string,
  conversationId: number,
): Promise<ConversationResponse> {
  return api.get<ConversationResponse>(
    `/api/chat/history/${sessionId}/${conversationId}`,
    TIMEOUTS.HISTORY,
  );
}
