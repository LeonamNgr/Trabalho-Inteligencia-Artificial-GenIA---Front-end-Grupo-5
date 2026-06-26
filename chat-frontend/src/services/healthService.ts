import type { HealthResponse } from '../types/health';
import { TIMEOUTS } from '../utils/constants';
import { api } from './api';

export async function getHealth(): Promise<HealthResponse> {
  return api.get<HealthResponse>('/api/health', TIMEOUTS.HEALTH);
}
