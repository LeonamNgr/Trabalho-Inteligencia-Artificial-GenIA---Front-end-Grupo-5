import { API_BASE_URL, TIMEOUTS } from '../utils/constants';

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
  errors?: { field: string; message: string }[];
}

export class HttpError extends Error {
  constructor(
    public status: number,
    public body: ErrorResponse,
  ) {
    super(body.message || 'Erro desconhecido');
    this.name = 'HttpError';
  }
}

async function request<T>(
  url: string,
  options: RequestInit = {},
  timeout = TIMEOUTS.MESSAGE,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    signal: AbortSignal.timeout(timeout),
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({
      status: response.status,
      error: response.statusText,
      message: 'Erro inesperado',
      timestamp: new Date().toISOString(),
      path: url,
    }));
    throw new HttpError(response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  get: <T>(url: string, timeout?: number) => request<T>(url, { method: 'GET' }, timeout),
  post: <T>(url: string, body?: unknown, timeout?: number) =>
    request<T>(url, { method: 'POST', body: JSON.stringify(body) }, timeout),
  delete: <T>(url: string, timeout?: number) => request<T>(url, { method: 'DELETE' }, timeout),
};
