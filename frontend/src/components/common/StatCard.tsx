import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  accentColor?: 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'cyan',
  className = '',
}) => {
  const borderColors = {
    cyan: 'border-cyan/20 hover:border-cyan/50 hover:shadow-cyan-glow',
    violet: 'border-violet/20 hover:border-violet/50 hover:shadow-violet-glow',
    emerald: 'border-emerald-500/20 hover:border-emerald-500/50',
    amber: 'border-amber-500/20 hover:border-amber-500/50',
    rose: 'border-rose-500/20 hover:border-rose-500/50',
  };

  const textColors = {
    cyan: 'text-cyan',
    violet: 'text-violet',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
  };

  return (
    <div
      className={`glass-panel p-5 rounded-xl border ${borderColors[accentColor]} transition-all duration-300 relative overflow-hidden group ${className}`}
    >
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan/5 rounded-full blur-2xl group-hover:bg-cyan/10 transition-colors pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-widest text-subtlegrey font-medium">
          {title}
        </span>
        {icon && (
          <div className={`p-2 rounded-lg bg-navy/80 border border-white/5 ${textColors[accentColor]}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-3">
        <div className="text-3xl font-display font-bold tracking-tight text-softwhite">
          {value}
        </div>
        {trend && (
          <span
            className={`text-xs font-mono font-medium flex items-center ${
              trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {(subtitle || trend?.label) && (
        <div className="mt-2 text-xs text-subtlegrey font-sans">
          {subtitle || trend?.label}
        </div>
      )}
    </div>
  );
};
