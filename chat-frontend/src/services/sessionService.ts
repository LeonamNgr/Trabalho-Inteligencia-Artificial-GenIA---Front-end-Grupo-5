import type { SessionResponse } from '../types/session';
import { TIMEOUTS } from '../utils/constants';
import { api } from './api';

export async function createSession(): Promise<SessionResponse> {
  return api.get<SessionResponse>('/api/session', TIMEOUTS.SESSION);
}

export async function validateSession(sessionId: string): Promise<SessionResponse> {
  return api.get<SessionResponse>(`/api/session/${sessionId}`, TIMEOUTS.SESSION);
}

export async function deleteSession(sessionId: string): Promise<void> {
  return api.delete<void>(`/api/session/${sessionId}`, TIMEOUTS.SESSION);
}
