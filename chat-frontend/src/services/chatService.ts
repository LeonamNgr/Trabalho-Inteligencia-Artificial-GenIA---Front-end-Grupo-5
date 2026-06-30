import type { ChatRequest, ChatResponse, UploadAndAskResponse, TaskStatusResponse } from '../types/message';
import type { HistoryResponse, ConversationResponse } from '../types/conversation';
import { API_BASE_URL, TIMEOUTS, POLLING } from '../utils/constants';
import { api, HttpError } from './api';

export async function postMessage(request: ChatRequest): Promise<ChatResponse> {
  return api.post<ChatResponse>('/api/chat/message', request, TIMEOUTS.MESSAGE);
}

export async function postMessageAsync(
  request: ChatRequest,
  totalTimeoutMs?: number,
): Promise<ChatResponse> {
  const startTime = Date.now();
  const maxTotalMs = totalTimeoutMs ?? POLLING.MAX_TOTAL_MS;

  const response = await fetch(`${API_BASE_URL}/api/chat/message/async`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(TIMEOUTS.ASYNC_START),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new HttpError(response.status, body);
  }

  const task: TaskStatusResponse = await response.json();
  const taskId = task.taskId;

  while (true) {
    const elapsed = Date.now() - startTime;
    if (elapsed >= maxTotalMs) {
      throw new Error('Tempo limite excedido. O Ollama pode estar ocupado carregando o modelo.');
    }

    const remaining = Math.min(POLLING.INTERVAL_MS, maxTotalMs - elapsed);
    await new Promise((resolve) => setTimeout(resolve, remaining));

    const statusResponse = await fetch(`${API_BASE_URL}/api/chat/message/async/${taskId}`, {
      signal: AbortSignal.timeout(TIMEOUTS.ASYNC_POLL),
    });

    if (!statusResponse.ok) continue;

    const status: TaskStatusResponse = await statusResponse.json();

    if (status.status === 'COMPLETED' && status.result) {
      return status.result;
    }

    if (status.status === 'FAILED') {
      throw new Error(status.errorMessage || 'Erro ao processar mensagem');
    }
  }
}

export async function uploadAndAsk(
  file: File,
  sessionId: string,
  conversationId: number | null,
  content?: string,
): Promise<UploadAndAskResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sessionId', sessionId);
  if (conversationId != null) {
    formData.append('conversationId', String(conversationId));
  }
  if (content) {
    formData.append('content', content);
  }

  const response = await fetch(`${API_BASE_URL}/api/chat/upload-and-ask`, {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(TIMEOUTS.UPLOAD),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({
      status: response.status,
      error: response.statusText,
      message: 'Erro no upload-and-ask',
      timestamp: new Date().toISOString(),
      path: '/api/chat/upload-and-ask',
    }));
    throw new HttpError(response.status, body);
  }

  return response.json();
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
