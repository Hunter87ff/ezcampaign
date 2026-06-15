import React, { useState } from 'react';

interface DailyBarChartProps {
  messagesPerDay: Record<string, number>;
}

export const DailyBarChart: React.FC<DailyBarChartProps> = ({ messagesPerDay }) => {
  const [timeframe, setTimeframe] = useState('7_days');
  const messagesArray = Object.entries(messagesPerDay);
  const maxMessages = Math.max(...messagesArray.map(([, val]) => val), 1);

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-full select-none text-left">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="font-sans font-bold text-sm text-slate-800 dark:text-slate-200">
            Messages per Day
          </h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Daily outbound campaign logs
          </p>
        </div>
        
        {/* Dropdown Selector */}
        <div className="relative">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="appearance-none bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 font-sans text-[11px] font-bold text-slate-600 dark:text-slate-300 focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            <option value="7_days">Last 7 Days</option>
            <option value="30_days">Last 30 Days</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[14px]">
            expand_more
          </span>
        </div>
      </div>

      {/* Grid lines and Bars container */}
      <div className="flex-1 flex flex-col justify-between relative mt-4 h-48">
        
        {/* Horizontal Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.06] dark:opacity-[0.04]">
          <div className="border-t border-slate-700 w-full h-0" />
          <div className="border-t border-slate-700 w-full h-0" />
          <div className="border-t border-slate-700 w-full h-0" />
          <div className="border-t border-slate-700 w-full h-0" />
        </div>

        {/* Bars row */}
        <div className="relative h-40 flex items-end justify-between gap-3 px-2 z-10">
          {messagesArray.map(([day, count]) => {
            const heightPct = Math.max((count / maxMessages) * 100, 8);
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative">
                
                {/* Interactive Tooltip on Hover */}
                <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-150 bg-slate-950/90 dark:bg-slate-800/95 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-[10px] font-bold shadow-md z-30 pointer-events-none mb-1 text-center whitespace-nowrap">
                  <span className="block">{count} messages</span>
                  {/* Tooltip Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[4px] border-transparent border-t-slate-950/90 dark:border-t-slate-800/95" />
                </div>

                {/* Vertical Bar with Gradient and Glow */}
                <div
                  className="w-full relative rounded-t-md overflow-hidden transition-all duration-300 ease-out"
                  style={{ height: `${heightPct}%` }}
                >
                  {/* Gradient Fill */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-primary dark:from-emerald-600 dark:to-emerald-400 group-hover:opacity-90 transition-opacity" />
                  
                  {/* Subtle Top Cap Light */}
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-white/40" />
                </div>

                {/* Day Label */}
                <span className="font-sans text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default DailyBarChart;
