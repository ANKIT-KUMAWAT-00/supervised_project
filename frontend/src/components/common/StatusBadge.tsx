import React from 'react';

interface StatusBadgeProps {
  status: 'available' | 'occupied' | 'reserved' | 'maintenance' | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStyle = () => {
    switch (status.toLowerCase()) {
      case 'available':
      case 'optimal':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 status-glow-available';
      case 'occupied':
      case 'critical':
      case 'critical occupancy':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 status-glow-occupied';
      case 'reserved':
      case 'moderate':
      case 'moderate demand':
      case 'high demand':
        return 'bg-cyan-500/10 text-cyan border-cyan/40 status-glow-reserved';
      case 'maintenance':
      case 'temporarily unavailable':
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 status-glow-maintenance';
      default:
        return 'bg-slate-500/10 text-subtlegrey border-slate-500/30';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border uppercase tracking-wider ${getStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {status}
    </span>
  );
};
