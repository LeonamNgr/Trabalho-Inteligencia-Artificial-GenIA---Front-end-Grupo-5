export type HealthStatus = 'UP' | 'DOWN' | 'DEGRADED';

export interface HealthResponse {
  status: HealthStatus;
  database: string;
  ollama: string;
  diskSpace: string;
  timestamp: string;
  version: string;
}
