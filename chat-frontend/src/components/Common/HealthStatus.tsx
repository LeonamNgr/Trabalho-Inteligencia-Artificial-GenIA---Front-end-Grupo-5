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

export function HealthStatus() {
  const { status } = useHealth();

  const current =
    status === 'UP' ? STATUS_MAP.ONLINE
    : status === 'DOWN' ? STATUS_MAP.OFFLINE
    : status === 'DEGRADED' ? STATUS_MAP.DEGRADED
    : STATUS_MAP.CHECKING;

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[#1a2d55] bg-[#0a1a3a]"
      role="status"
    >
      <span className={`block w-2 h-2 rounded-full ${current.dotClass}`} />
      <span className="text-xs text-[#8899bb] uppercase tracking-wider">
        {current.label}
      </span>
    </div>
  );
}
