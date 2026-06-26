import { API_BASE_URL, TIMEOUTS } from '../utils/constants';

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
  errors?: { field: string; message: string }[];
}

export class AppError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

export class HttpError extends AppError {
  status: number;
  body: ErrorResponse;

  constructor(status: number, body: ErrorResponse) {
    super(body.message || 'Erro desconhecido', `HTTP_${status}`);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

export class NetworkError extends AppError {
  constructor() {
    super('Sem conexão com o servidor.', 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

const errorMessages: Record<number, string> = {
  400: 'Verifique os dados enviados.',
  404: 'Recurso não encontrado.',
  413: 'O arquivo excede o limite de 10 MB.',
  415: 'Formato de arquivo não suportado.',
  422: 'Os dados enviados são inválidos.',
  500: 'Erro no servidor. Tente novamente mais tarde.',
};

export function getErrorMessage(status: number, body?: ErrorResponse): string {
  if (body?.errors?.length) {
    return body.errors[0].message;
  }
  if (body?.message) {
    return body.message;
  }
  return errorMessages[status] ?? 'Ocorreu um erro inesperado.';
}

async function request<T>(
  url: string,
  options: RequestInit = {},
  timeout: number = TIMEOUTS.MESSAGE,
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
