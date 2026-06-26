import { useState, useEffect, useCallback } from 'react';
import type { HealthStatus } from '../types/health';
import { getHealth } from '../services/healthService';
import { HEALTH_CHECK_INTERVAL } from '../utils/constants';

interface UseHealthReturn {
  status: HealthStatus | 'CHECKING';
  lastCheck: Date | null;
  checkHealth: () => Promise<void>;
}

export function useHealth(): UseHealthReturn {
  const [status, setStatus] = useState<HealthStatus | 'CHECKING'>('CHECKING');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    setStatus('CHECKING');
    try {
      const response = await getHealth();
      setStatus(response.status);
    } catch {
      setStatus('DOWN');
    }
    setLastCheck(new Date());
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return { status, lastCheck, checkHealth };
}
