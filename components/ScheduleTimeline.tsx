import React from 'react';
import { ScheduleBlock, ActivityType } from '../types';
import { useSchedule } from '../contexts/ScheduleContext';

interface ScheduleTimelineProps {
  currentBlock: ScheduleBlock | null;
  logs: Record<string, any>;
}

// Get icon for activity type
const getActivityIcon = (type?: ActivityType): string => {
  const icons: Record<string, string> = {
    'Workout': 'lucide:dumbbell',
    'Gym': 'lucide:dumbbell',
    'Yoga': 'lucide:flower-2',
    'Walk': 'lucide:footprints',
    'Running': 'lucide:activity',
    'Sports': 'lucide:trophy',
    'Class': 'lucide:book-open',
    'Lecture': 'lucide:graduation-cap',
    'Study': 'lucide:book',
    'Deep Study': 'lucide:brain',
    'Reading': 'lucide:book-open-check',
    'Homework': 'lucide:pencil',
    'Exam Prep': 'lucide:clipboard-list',
    'Online Course': 'lucide:laptop',
    'Work': 'lucide:briefcase',
    'Meeting': 'lucide:users',
    'Coding': 'lucide:code-2',
    'Writing': 'lucide:pen-tool',
    'Project': 'lucide:folder-kanban',
    'Research': 'lucide:microscope',
    'Office': 'lucide:building-2',
    'Morning Routine': 'lucide:sunrise',
    'Breakfast': 'lucide:coffee',
    'Lunch': 'lucide:utensils',
    'Dinner': 'lucide:utensils-crossed',
    'Break': 'lucide:coffee',
    'Nap': 'lucide:moon',
    'Meditation': 'lucide:sparkles',
    'Commute': 'lucide:car',
    'Music': 'lucide:music',
    'Art': 'lucide:palette',
    'Gaming': 'lucide:gamepad-2',
    'Side Project': 'lucide:rocket',
    'Family Time': 'lucide:heart',
    'Social': 'lucide:message-circle',
    'Phone Calls': 'lucide:phone',
    'Other': 'lucide:circle',
    'Custom': 'lucide:star',
  };
  return icons[type || ''] || 'lucide:circle';
};

// Get gradient colors for activity type
const getActivityGradient = (type?: ActivityType): { from: string; to: string; glow: string } => {
  const gradients: Record<string, { from: string; to: string; glow: string }> = {
    'Workout': { from: 'from-emerald-500', to: 'to-green-400', glow: 'shadow-emerald-500/30' },
    'Gym': { from: 'from-emerald-500', to: 'to-green-400', glow: 'shadow-emerald-500/30' },
    'Yoga': { from: 'from-teal-500', to: 'to-cyan-400', glow: 'shadow-teal-500/30' },
    'Walk': { from: 'from-pink-500', to: 'to-rose-400', glow: 'shadow-pink-500/30' },
    'Running': { from: 'from-orange-500', to: 'to-amber-400', glow: 'shadow-orange-500/30' },
    'Sports': { from: 'from-green-500', to: 'to-lime-400', glow: 'shadow-green-500/30' },
    'Class': { from: 'from-blue-500', to: 'to-cyan-400', glow: 'shadow-blue-500/30' },
    'Lecture': { from: 'from-indigo-500', to: 'to-blue-400', glow: 'shadow-indigo-500/30' },
    'Study': { from: 'from-amber-500', to: 'to-yellow-400', glow: 'shadow-amber-500/30' },
    'Deep Study': { from: 'from-purple-500', to: 'to-violet-400', glow: 'shadow-purple-500/30' },
    'Reading': { from: 'from-violet-500', to: 'to-purple-400', glow: 'shadow-violet-500/30' },
    'Work': { from: 'from-sky-500', to: 'to-blue-400', glow: 'shadow-sky-500/30' },
    'Meeting': { from: 'from-cyan-500', to: 'to-teal-400', glow: 'shadow-cyan-500/30' },
    'Coding': { from: 'from-lime-500', to: 'to-green-400', glow: 'shadow-lime-500/30' },
    'Morning Routine': { from: 'from-yellow-500', to: 'to-amber-400', glow: 'shadow-yellow-500/30' },
    'Breakfast': { from: 'from-orange-500', to: 'to-yellow-400', glow: 'shadow-orange-500/30' },
    'Lunch': { from: 'from-orange-500', to: 'to-red-400', glow: 'shadow-orange-500/30' },
    'Dinner': { from: 'from-red-500', to: 'to-rose-400', glow: 'shadow-red-500/30' },
    'Break': { from: 'from-slate-500', to: 'to-gray-400', glow: 'shadow-slate-500/30' },
    'Meditation': { from: 'from-violet-500', to: 'to-indigo-400', glow: 'shadow-violet-500/30' },
  };
  return gradients[type || ''] || { from: 'from-purple-500', to: 'to-violet-400', glow: 'shadow-purple-500/30' };
};

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({ currentBlock, logs }) => {
  const { schedule } = useSchedule();
  const isCurrent = (block: ScheduleBlock) => currentBlock?.id === block.id;

  if (schedule.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <iconify-icon icon="lucide:calendar-x" width="32" className="mb-2 opacity-50"></iconify-icon>
        <p className="text-xs">No schedule set up yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical Timeline Line */}
      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-purple-500/50 via-blue-500/30 to-transparent"></div>

      <div className="flex flex-col gap-3">
        {schedule.map((block, index) => {
          const active = isCurrent(block);
          const log = logs[block.id];
          const isVerified = log?.result?.task_verified;
          const isFailed = log?.result?.task_verified === false;
          const gradient = getActivityGradient(block.type);
          const icon = getActivityIcon(block.type);

          return (
            <div
              key={block.id}
              className={`
                relative flex items-start gap-3 p-3 rounded-lg transition-all duration-300 cursor-default
                ${active ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5'}
                ${isVerified ? 'border border-green-500/30 bg-green-500/5' : ''}
                ${isFailed ? 'border border-red-500/30 bg-red-500/5' : ''}
              `}
            >
              {/* Activity Icon */}
              <div className={`
                relative z-10 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                ${isVerified
                  ? 'bg-green-500/20'
                  : isFailed
                    ? 'bg-red-500/20'
                    : active
                      ? `bg-gradient-to-br ${gradient.from} ${gradient.to} shadow-lg ${gradient.glow}`
                      : 'bg-white/10'
                }
              `}>
                {isVerified ? (
                  <iconify-icon icon="lucide:check" width="16" className="text-green-400"></iconify-icon>
                ) : isFailed ? (
                  <iconify-icon icon="lucide:x" width="16" className="text-red-400"></iconify-icon>
                ) : (
                  <iconify-icon
                    icon={icon}
                    width="14"
                    className={active ? 'text-white' : 'text-slate-400'}
                  ></iconify-icon>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`text-sm font-medium truncate ${isVerified ? 'text-green-300' :
                      isFailed ? 'text-red-300' :
                        active ? 'text-white' :
                          'text-slate-300'
                    }`}>
                    {block.activity}
                  </h4>

                  {/* Status Badge */}
                  {isVerified && (
                    <span className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 bg-green-500/20 rounded text-[9px] text-green-400 font-medium uppercase">
                      <iconify-icon icon="lucide:badge-check" width="10"></iconify-icon>
                      Done
                    </span>
                  )}
                  {active && !isVerified && !isFailed && (
                    <span className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 bg-purple-500/20 rounded text-[9px] text-purple-400 font-medium uppercase animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      Active
                    </span>
                  )}
                </div>

                {/* Time */}
                <div className="flex items-center gap-2 mt-1">
                  <iconify-icon icon="lucide:clock" width="10" className="text-slate-500"></iconify-icon>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {block.start} - {block.end}
                  </span>

                  {/* Focus Score (if verified) */}
                  {isVerified && log?.result?.focus_score && (
                    <span className="text-[10px] text-green-400 font-mono">
                      • {log.result.focus_score}/10 focus
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
        <span>{schedule.length} activities</span>
        <span className="text-green-400">
          {Object.values(logs).filter((l: any) => l?.result?.task_verified).length} completed
        </span>
      </div>
    </div>
  );
};