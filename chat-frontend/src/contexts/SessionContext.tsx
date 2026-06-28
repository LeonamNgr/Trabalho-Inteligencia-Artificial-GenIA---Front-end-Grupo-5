import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { SessionResponse } from '../types/session';
import { createSession as apiCreateSession, deleteSession as apiDeleteSession } from '../services/sessionService';
import { STORAGE_KEYS, RETRY } from '../utils/constants';

interface SessionContextType {
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  destroy: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryCount = useRef(0);

  const createWithRetry = useCallback(async (): Promise<void> => {
    try {
      const response: SessionResponse = await apiCreateSession();
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, response.sessionId);
      setSessionId(response.sessionId);
      setError(null);
      retryCount.current = 0;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar sessão';
      retryCount.current++;
      if (retryCount.current < RETRY.MAX_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, RETRY.BASE_DELAY * retryCount.current));
        return createWithRetry();
      }
      setError(message);
      throw err;
    }
  }, []);

  const initialize = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const stored = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (stored) {
      setSessionId(stored);
      setIsLoading(false);
      return;
    }

    try {
      await createWithRetry();
    } catch {
      // error já definido no createWithRetry
    } finally {
      setIsLoading(false);
    }
  }, [createWithRetry]);

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
    initialize();
  }, [initialize]);

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
