import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { SessionResponse } from '../types/session';
import { createSession as apiCreateSession, deleteSession as apiDeleteSession } from '../services/sessionService';
import { STORAGE_KEYS } from '../utils/constants';

interface SessionContextType {
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  destroy: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEYS.SESSION_ID),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (stored) {
      setSessionId(stored);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response: SessionResponse = await apiCreateSession();
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, response.sessionId);
      setSessionId(response.sessionId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar sessão';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const destroy = useCallback(async () => {
    if (!sessionId) return;
    try {
      await apiDeleteSession(sessionId);
    } catch {
      // fallback: remove local mesmo com erro
    } finally {
      localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
      setSessionId(null);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      initialize();
    }
  }, [sessionId, initialize]);

  return (
    <SessionContext.Provider value={{ sessionId, isLoading, error, initialize, destroy }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession deve ser usado dentro de SessionProvider');
  }
  return context;
}
