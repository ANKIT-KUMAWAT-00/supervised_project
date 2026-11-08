import React from 'react';

interface HeatmapCell {
  day: string;
  hour: string;
  density: number; // 0 to 100
}

interface OccupancyHeatmapProps {
  data: HeatmapCell[];
}

export const OccupancyHeatmap: React.FC<OccupancyHeatmapProps> = ({ data }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 13 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

  const getColor = (density: number) => {
    if (density >= 85) return 'bg-rose-500/80 border-rose-500 text-white';
    if (density >= 65) return 'bg-amber-500/70 border-amber-500 text-white';
    if (density >= 45) return 'bg-cyan-500/50 border-cyan text-white';
    if (density >= 25) return 'bg-cyan-500/25 border-cyan/40 text-ice';
    return 'bg-navy/40 border-white/5 text-subtlegrey';
  };

  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-[620px]">
        {/* Hours Header */}
        <div className="grid grid-cols-[60px_repeat(13,1fr)] gap-1 mb-1 text-[10px] font-mono text-subtlegrey text-center">
          <div></div>
          {hours.map((h) => (
            <div key={h}>{h.slice(0, 2)}h</div>
          ))}
        </div>

        {/* Rows by Day */}
        {days.map((day) => (
          <div key={day} className="grid grid-cols-[60px_repeat(13,1fr)] gap-1 mb-1 items-center">
            <span className="text-xs font-mono text-subtlegrey">{day}</span>
            {hours.map((hour) => {
              const cell = data.find((c) => c.day === day && c.hour === hour);
              const density = cell ? cell.density : 30;
              return (
                <div
                  key={`${day}-${hour}`}
                  className={`h-7 rounded border flex items-center justify-center text-[10px] font-mono font-bold transition-all hover:scale-110 cursor-pointer ${getColor(
                    density
                  )}`}
                  title={`${day} at ${hour}: ${density}% occupancy density`}
                >
                  {density}%
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
