import { useHealth } from '../../hooks/useHealth';

const STATUS_MAP = {
  CHECKING: {
    label: 'VERIFICANDO',
    dotClass: 'bg-[#f59e0b] animate-pulse',
  },
  ONLINE: {
    label: 'ONLINE',
    dotClass: 'bg-[#22c55e]',
  },
  DEGRADED: {
    label: 'DEGRADADO',
    dotClass: 'bg-[#f59e0b]',
  },
  OFFLINE: {
    label: 'OFFLINE',
    dotClass: 'bg-[#ef4444]',
  },
} as const;

const OLLAMA_MAP: Record<string, { label: string; dotClass: string }> = {
  UP: { label: 'IA', dotClass: 'bg-[#22c55e]' },
  DOWN: { label: 'IA', dotClass: 'bg-[#ef4444]' },
  SIMULATION: { label: 'SIMULAÇÃO', dotClass: 'bg-[#f59e0b]' },
};

export function HealthStatus() {
  const { status, ollama } = useHealth();

  const current =
    status === 'UP' ? STATUS_MAP.ONLINE
    : status === 'DOWN' ? STATUS_MAP.OFFLINE
    : status === 'DEGRADED' ? STATUS_MAP.DEGRADED
    : STATUS_MAP.CHECKING;

  const ollamaStatus = ollama ? OLLAMA_MAP[ollama] : null;

  return (
    <div className="flex items-center gap-1.5" role="status">
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[#1a2d55] bg-[#0a1a3a]">
        <span className={`block w-2 h-2 rounded-full ${current.dotClass}`} />
        <span className="text-xs text-[#8899bb] uppercase tracking-wider">
          {current.label}
        </span>
      </div>
      {ollamaStatus && (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[#1a2d55] bg-[#0a1a3a]">
          <span className={`block w-2 h-2 rounded-full ${ollamaStatus.dotClass}`} />
          <span className="text-xs text-[#8899bb] uppercase tracking-wider">
            {ollamaStatus.label}
          </span>
        </div>
      )}
    </div>
  );
}
