import type { SessionResponse } from '../types/session';
import { TIMEOUTS } from '../utils/constants';
import { api, HttpError } from './api';

export async function createSession(): Promise<SessionResponse> {
  return api.get<SessionResponse>('/api/session', TIMEOUTS.SESSION);
}

export async function validateSession(sessionId: string): Promise<SessionResponse | null> {
  try {
    return await api.get<SessionResponse>(`/api/session/${sessionId}`, TIMEOUTS.SESSION);
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  return api.delete<void>(`/api/session/${sessionId}`, TIMEOUTS.SESSION);
}
