import type {
  Document,
  DocumentListResponse,
  DocumentIngestResponse,
  DocumentChunk,
  DocumentSearchResponse,
} from '../types/document';
import { API_BASE_URL, TIMEOUTS } from '../utils/constants';
import { api, HttpError } from './api';

export async function ingestDocument(
  file: File,
  sourceType?: string,
): Promise<DocumentIngestResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (sourceType) formData.append('sourceType', sourceType);

  const response = await fetch(`${API_BASE_URL}/api/documents/ingest`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({
      status: response.status,
      error: response.statusText,
      message: 'Erro ao ingerir documento',
      timestamp: new Date().toISOString(),
      path: '/api/documents/ingest',
    }));
    throw new HttpError(response.status, body);
  }

  return response.json();
}

export async function ingestUrl(url: string): Promise<DocumentIngestResponse> {
  return api.post<DocumentIngestResponse>(
    '/api/documents/ingest/url',
    { url },
    TIMEOUTS.HISTORY,
  );
}

export async function listDocuments(): Promise<DocumentListResponse> {
  return api.get<DocumentListResponse>('/api/documents', TIMEOUTS.HISTORY);
}

export async function getDocument(id: number): Promise<Document> {
  return api.get<Document>(
    `/api/documents/${id}`,
    TIMEOUTS.HISTORY,
  );
}

export async function deleteDocument(id: number): Promise<void> {
  return api.delete<void>(`/api/documents/${id}`, TIMEOUTS.HISTORY);
}

export async function getDocumentChunks(id: number): Promise<DocumentChunk[]> {
  return api.get<DocumentChunk[]>(
    `/api/documents/${id}/chunks`,
    TIMEOUTS.HISTORY,
  );
}

export async function searchDocuments(
  query: string,
  topK = 5,
): Promise<DocumentSearchResponse> {
  return api.post<DocumentSearchResponse>(
    '/api/documents/search',
    { query, topK },
    TIMEOUTS.MESSAGE,
  );
}
