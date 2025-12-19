import React from 'react';
import { DAILY_SCHEDULE } from '../constants';
import { ScheduleBlock } from '../types';

interface ScheduleTimelineProps {
  currentBlock: ScheduleBlock | null;
  logs: Record<string, any>;
}

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({ currentBlock, logs }) => {
  const isCurrent = (block: ScheduleBlock) => currentBlock?.id === block.id;

  return (
    <div className="relative pl-2">
      {/* Vertical Line */}
      <div className="absolute left-[11px] top-2 bottom-6 w-px bg-gradient-to-b from-green-500 via-teal-500 to-transparent opacity-30"></div>

      <div className="flex flex-col gap-8">
        {DAILY_SCHEDULE.map((block) => {
          const active = isCurrent(block);
          const log = logs[block.id];
          const isVerified = log?.result?.task_verified;
          const isFailed = log?.result?.task_verified === false;

          let borderColor = 'border-white/10';
          let bgColor = 'bg-white/5';
          let dotColor = 'bg-neutral-600';
          let textColor = 'text-neutral-400';
          let labelColor = 'text-white';

          if (isVerified) {
            borderColor = 'border-green-500/30';
            bgColor = 'bg-green-500/10';
            dotColor = 'bg-green-400 shadow-[0_0_5px_rgba(34,197,94,0.8)]';
            textColor = 'text-green-300';
          } else if (isFailed) {
            borderColor = 'border-red-500/30';
            bgColor = 'bg-red-500/10';
            dotColor = 'bg-red-400';
            textColor = 'text-red-300';
          } else if (active) {
            borderColor = 'border-white/30';
            bgColor = 'bg-white/10';
            dotColor = 'bg-white animate-pulse';
            labelColor = 'text-green-300';
          }

          return (
            <div key={block.id} className="flex gap-4 items-start relative group cursor-default">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center z-10 relative transition-colors ${borderColor} ${bgColor}`}>
                {isVerified ? (
                  <iconify-icon icon="lucide:check" width="14" className="text-green-400"></iconify-icon>
                ) : (
                  <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></div>
                )}
              </div>
              <div className="pt-0.5 w-full">
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium transition-colors ${labelColor}`}>
                    {block.activity}
                  </span>
                  {isVerified && (
                    <span className="flex items-center gap-1.5 text-green-400 font-bold uppercase tracking-wider text-[10px]">
                      <iconify-icon icon="lucide:badge-check" width="12"></iconify-icon>
                      DONE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-neutral-500 font-mono leading-relaxed">
                    {block.start} - {block.end}
                  </span>
                  {active && !isVerified && (
                    <span className="flex items-center gap-1.5 text-green-400 font-bold uppercase tracking-wider text-[10px] animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};