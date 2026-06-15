import React from 'react';

interface StatusDonutProps {
  leadStatusBreakdown: Record<string, number>;
  totalLeads: number;
}

export const StatusDonut: React.FC<StatusDonutProps> = ({ leadStatusBreakdown, totalLeads }) => {
  const statusValues = Object.entries(leadStatusBreakdown);
  const totalCount = totalLeads || statusValues.reduce((sum, [, val]) => sum + val, 0);

  const statusColors: Record<string, string> = {
    new: '#3B82F6',        // blue
    contacted: '#8B5CF6',  // violet
    responded: '#F59E0B',  // amber
    converted: '#22C55E',  // green
    closed: '#64748B',     // slate
  };

  const statusBgColors: Record<string, string> = {
    new: 'bg-blue-500',
    contacted: 'bg-violet-500',
    responded: 'bg-amber-500',
    converted: 'bg-emerald-500',
    closed: 'bg-slate-500',
  };

  // SVG parameters
  const radius = 50;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius; // ~314.16
  const center = 60; // center coordinate of the SVG box (120x120)

  // Calculate accumulated offsets for SVG stroke dasharray
  let accumulatedPercent = 0;
  const slices = statusValues.map(([key, value]) => {
    const percentage = totalCount > 0 ? value / totalCount : 0;
    const strokeLength = percentage * circumference;
    const strokeOffset = circumference - strokeLength;
    const rotation = (accumulatedPercent * 360) - 90; // Rotate starting from top (-90deg)
    
    accumulatedPercent += percentage;

    return {
      key,
      value,
      percentage: Math.round(percentage * 100),
      strokeLength,
      strokeOffset,
      rotation,
      color: statusColors[key] || '#e2e8f0',
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full select-none text-left">
      <div>
        <h4 className="font-sans font-bold text-sm text-slate-800 dark:text-slate-200">
          Lead Status
        </h4>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          Breakdown of lead conversion stages
        </p>
      </div>

      {/* SVG Donut Circle and Center Count */}
      <div className="flex-1 flex items-center justify-center relative my-6 py-2">
        <div className="w-[120px] h-[120px] relative select-none">
          <svg width="120" height="120" viewBox="0 0 120 120" className="overflow-visible">
            {/* Background Circle if 0 leads */}
            {totalCount === 0 && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={strokeWidth}
              />
            )}

            {/* Render each status slice circle */}
            {totalCount > 0 &&
              slices.map((slice) => {
                if (slice.value === 0) return null;
                return (
                  <circle
                    key={slice.key}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={slice.strokeOffset}
                    transform={`rotate(${slice.rotation} ${center} ${center})`}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out origin-center"
                    style={{
                      // Adding a tiny gap between segments
                      strokeDasharray: `${slice.strokeLength - 2} ${circumference - slice.strokeLength + 2}`,
                    }}
                  />
                );
              })}
          </svg>

          {/* Absolute Centered Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-xl font-sans font-bold text-slate-900 dark:text-white leading-none tracking-tight">
              {totalCount}
            </p>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Leads
            </p>
          </div>
        </div>
      </div>

      {/* Legends list */}
      <div className="space-y-2.5 mt-2">
        {slices.map((slice) => (
          <div key={slice.key} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${statusBgColors[slice.key] || 'bg-slate-300'}`} />
              <span className="capitalize text-slate-600 dark:text-slate-400 font-semibold">
                {slice.key}
              </span>
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {slice.value} <span className="text-slate-400 dark:text-slate-500 font-normal">({slice.percentage}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default StatusDonut;
