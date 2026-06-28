import { useState, useEffect, useCallback } from 'react';
import type { HealthStatus } from '../types/health';
import { getHealth } from '../services/healthService';
import { HEALTH_CHECK_INTERVAL } from '../utils/constants';

interface UseHealthReturn {
  status: HealthStatus | 'CHECKING';
  ollama: string | null;
  version: string | null;
  lastCheck: Date | null;
  checkHealth: () => Promise<void>;
}

export function useHealth(): UseHealthReturn {
  const [status, setStatus] = useState<HealthStatus | 'CHECKING'>('CHECKING');
  const [ollama, setOllama] = useState<string | null>(null);
  const [version, setVersion] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    setStatus('CHECKING');
    try {
      const response = await getHealth();
      setStatus(response.status);
      setOllama(response.ollama);
      setVersion(response.version);
    } catch {
      setStatus('DOWN');
      setOllama(null);
    }
    setLastCheck(new Date());
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return { status, ollama, version, lastCheck, checkHealth };
}
