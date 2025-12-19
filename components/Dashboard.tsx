import React from 'react';
import { DailyStats, VerificationResult } from '../types';
import { useSchedule } from '../contexts/ScheduleContext';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardProps {
  stats: DailyStats;
  lastResult: VerificationResult | null;
  history: { id: string; score: number }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#050505] border border-white/10 p-2 rounded shadow-xl">
        <p className="text-[10px] text-slate-400 font-mono">Score: <span className="text-purple-400">{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
};

// Activity type colors
const getActivityColor = (type?: string): string => {
  const colors: Record<string, string> = {
    'Workout': '#10b981',
    'Gym': '#10b981',
    'Yoga': '#14b8a6',
    'Walk': '#ec4899',
    'Running': '#f97316',
    'Sports': '#22c55e',
    'Class': '#3b82f6',
    'Lecture': '#6366f1',
    'Study': '#f59e0b',
    'Deep Study': '#a855f7',
    'Reading': '#8b5cf6',
    'Work': '#0ea5e9',
    'Meeting': '#06b6d4',
    'Coding': '#84cc16',
    'Morning Routine': '#fbbf24',
    'Breakfast': '#fb923c',
    'Lunch': '#f97316',
    'Dinner': '#ef4444',
    'Break': '#94a3b8',
    'Meditation': '#8b5cf6',
  };
  return colors[type || ''] || '#a855f7';
};

export const Dashboard: React.FC<DashboardProps> = ({ stats, lastResult, history }) => {
  const { schedule } = useSchedule();

  const data = [
    { name: 'Success', value: stats.consistencyScore },
    { name: 'Remaining', value: 100 - stats.consistencyScore }
  ];

  // Create chart data from actual history, with activity names from schedule
  const chartData = history.map(h => {
    const block = schedule.find(s => s.id === h.id);
    return {
      id: h.id,
      score: h.score,
      name: block?.activity?.substring(0, 12) || h.id,
      color: getActivityColor(block?.type)
    };
  });

  // Fill with placeholders if needed
  while (chartData.length < 4) {
    chartData.push({ id: `placeholder-${chartData.length}`, score: 0, name: '-', color: '#333' });
  }

  // Calculate progress based on completed vs total tasks
  const completionRate = schedule.length > 0
    ? Math.round((stats.completedBlocks / schedule.length) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Progress Ring Card */}
        <div className="rounded-xl border bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border-white/5 p-4 flex flex-col justify-between group hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Today's Progress</div>
              <div className="text-2xl font-bold text-white">{stats.completedBlocks}<span className="text-slate-500 text-sm font-normal">/{schedule.length}</span></div>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <iconify-icon icon="lucide:target" width="18" className="text-purple-400"></iconify-icon>
            </div>
          </div>

          <div className="mt-4 relative z-10">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>Completion</span>
              <span className="text-purple-400 font-medium">{completionRate}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Focus Score Card */}
        <div className="rounded-xl border bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border-white/5 p-4 flex flex-col justify-between group hover:border-green-500/30 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Avg Focus Score</div>
              <div className="text-2xl font-bold text-white">
                {stats.totalFocusPoints > 0 ? (stats.totalFocusPoints / Math.max(1, stats.completedBlocks)).toFixed(1) : '0.0'}
                <span className="text-slate-500 text-sm font-normal">/10</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <iconify-icon icon="lucide:brain" width="18" className="text-green-400"></iconify-icon>
            </div>
          </div>

          <div className="mt-4 relative z-10 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <Bar
                  dataKey="score"
                  radius={[3, 3, 0, 0]}
                  background={{ fill: '#ffffff08' }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Total Focus Points Card */}
        <div className="rounded-xl border bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border-white/5 p-4 flex flex-col justify-between group hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Total Focus Points</div>
              <div className="text-2xl font-bold text-white">{stats.totalFocusPoints}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <iconify-icon icon="lucide:zap" width="18" className="text-amber-400"></iconify-icon>
            </div>
          </div>

          <div className="mt-4 relative z-10">
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <iconify-icon icon="lucide:trending-up" width="12" className="text-green-400"></iconify-icon>
              <span>
                {stats.completedBlocks > 0
                  ? `${stats.completedBlocks} task${stats.completedBlocks > 1 ? 's' : ''} verified today`
                  : 'Start verifying tasks!'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Critique Card */}
      <div className="rounded-xl border bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border-white/5 p-4 flex flex-col relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.05),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>

        <div className="flex items-center gap-2 mb-3 relative z-10">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
          <h3 className="text-[10px] text-slate-500 uppercase tracking-wide">SENTINEL AI Analysis</h3>
        </div>

        {lastResult ? (
          <div className="flex-1 flex flex-col justify-between relative z-10">
            <p className={`text-sm font-medium leading-relaxed italic font-serif ${lastResult.task_verified ? 'text-slate-200' : 'text-red-300'}`}>
              "{lastResult.ai_critique}"
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-[10px] text-slate-500 font-mono">Focus Score</span>
                  <span className="text-sm font-mono font-medium text-white">{lastResult.focus_score}/10</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${lastResult.focus_score >= 8 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                        lastResult.focus_score >= 5 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                          'bg-gradient-to-r from-red-500 to-rose-400'
                      }`}
                    style={{ width: `${lastResult.focus_score * 10}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-[10px] text-slate-500 font-mono">Status</span>
                  <span className={`text-xs font-medium ${lastResult.task_verified ? 'text-green-400' : 'text-red-400'}`}>
                    {lastResult.task_verified ? '✓ Verified' : '✗ Failed'}
                  </span>
                </div>
                <div className="text-[9px] text-slate-500">
                  {lastResult.distractions_detected?.length > 0
                    ? `${lastResult.distractions_detected.length} distraction${lastResult.distractions_detected.length > 1 ? 's' : ''} noted`
                    : 'No distractions detected'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center py-6 relative z-10">
            <div className="text-center">
              <iconify-icon icon="lucide:sparkles" width="24" className="text-purple-500/30 mb-2"></iconify-icon>
              <p className="text-xs font-mono text-slate-500">Complete a task to see AI analysis</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};