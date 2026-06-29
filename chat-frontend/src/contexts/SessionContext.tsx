import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { SessionResponse } from '../types/session';
<<<<<<< Updated upstream
import { createSession as apiCreateSession, validateSession as apiValidateSession, deleteSession as apiDeleteSession } from '../services/sessionService';
import { STORAGE_KEYS, RETRY } from '../utils/constants';
import { isValidSessionId } from '../utils/validators';
=======
import { createSession as apiCreateSession, deleteSession as apiDeleteSession } from '../services/sessionService';
import { getHistory } from '../services/chatService';
import { HttpError } from '../services/api';
import { STORAGE_KEYS } from '../utils/constants';
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
  const clearStoredSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    setSessionId(null);
  }, []);
=======
  const initialize = useCallback(async () => {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (stored) {
      try {
        await getHistory(stored);
        setSessionId(stored);
        return;
      } catch (err) {
        if (err instanceof HttpError) {
          localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
        } else {
          setSessionId(stored);
          return;
        }
      }
    }
>>>>>>> Stashed changes

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
    if (stored && isValidSessionId(stored)) {
      try {
        const valid = await apiValidateSession(stored);
        if (valid && !valid.expired) {
          setSessionId(stored);
          setIsLoading(false);
          return;
        }
      } catch {
        // network error — try creating a new session
      }
      clearStoredSession();
    }

    if (stored && !isValidSessionId(stored)) {
      clearStoredSession();
    }

    try {
      await createWithRetry();
    } catch {
      // error already set in createWithRetry
    } finally {
      setIsLoading(false);
    }
  }, [createWithRetry, clearStoredSession]);

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
