import { Logo } from '../Common/Logo';
import { HealthStatus } from '../Common/HealthStatus';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar: _onToggleSidebar }: HeaderProps) {
  return (
    <header className="flex items-center justify-between w-full h-14 px-4 border-b border-[#1a2d55] bg-[#020817]/80 backdrop-blur-sm">
      <Logo />
      <HealthStatus />
    </header>
  );
}
