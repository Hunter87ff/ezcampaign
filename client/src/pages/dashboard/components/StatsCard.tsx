import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  percentage: string;
  trending: 'up' | 'down' | 'stable';
  icon: string;
  colorClass: string; // Tailwind color name (e.g., 'blue', 'green', 'violet', 'amber')
  sparklineData: number[];
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  percentage,
  trending,
  icon,
  colorClass,
  sparklineData,
}) => {
  // Generate SVG path for sparkline curve
  const generateSparklinePath = (data: number[]) => {
    if (data.length === 0) return '';
    const width = 120;
    const height = 36;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, index) => {
      const x = (index / (data.length - 1)) * width;
      // Invert Y because SVG coordinates start from top
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return { x, y };
    });

    // Generate cubic bezier curve path
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const sparklinePath = generateSparklinePath(sparklineData);

  // Status mapping
  const statusConfig = {
    up: {
      textColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/35',
      icon: 'trending_up',
    },
    down: {
      textColor: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/35',
      icon: 'trending_down',
    },
    stable: {
      textColor: 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60',
      icon: 'trending_flat',
    },
  };

  // Border hover mapping
  const hoverBorders: Record<string, string> = {
    blue: 'hover:border-blue-500/50 dark:hover:border-blue-400/35',
    green: 'hover:border-emerald-500/50 dark:hover:border-emerald-400/35',
    violet: 'hover:border-violet-500/50 dark:hover:border-violet-400/35',
    amber: 'hover:border-amber-500/50 dark:hover:border-amber-400/35',
  };

  // Text color mapping for icons
  const textColors: Record<string, string> = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20',
    green: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20',
    violet: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/20',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20',
  };

  const sparklineStroke: Record<string, string> = {
    blue: '#3b82f6',
    green: '#10b981',
    violet: '#8b5cf6',
    amber: '#f59e0b',
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 premium-shadow-hover flex flex-col justify-between ${
        hoverBorders[colorClass] || 'hover:border-primary/50'
      }`}
    >
      <div className="flex justify-between items-start mb-3 select-none">
        {/* Metric icon with color background */}
        <div className={`p-2.5 rounded-lg ${textColors[colorClass] || 'bg-slate-100'} flex items-center justify-center shrink-0`}>
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        
        {/* Trend badge */}
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold flex items-center gap-1 leading-none ${statusConfig[trending].textColor}`}>
          <span className="material-symbols-outlined text-[12px]">{statusConfig[trending].icon}</span>
          {percentage}
        </span>
      </div>

      <div className="select-none text-left">
        <p className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
          {title}
        </p>
        <div className="flex items-end justify-between">
          <h3 className="text-2xl font-sans font-bold text-slate-900 dark:text-white leading-none tracking-tight">
            {value}
          </h3>
          
          {/* Sparkline curve */}
          {sparklinePath && (
            <div className="w-[120px] h-[36px] overflow-visible pb-1.5 shrink-0 opacity-85 dark:opacity-95">
              <svg width="120" height="36" className="overflow-visible">
                {/* Curve path */}
                <path
                  d={sparklinePath}
                  fill="none"
                  stroke={sparklineStroke[colorClass] || '#10b981'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default StatsCard;
