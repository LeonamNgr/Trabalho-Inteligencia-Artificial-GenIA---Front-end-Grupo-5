export type HealthStatus = 'UP' | 'DOWN';

export interface HealthResponse {
  status: HealthStatus;
  database: string;
  diskSpace: string;
  timestamp: string;
  version: string;
}
