import React, { useState, useEffect, useMemo } from 'react';
import { ScheduleTimeline } from '../components/ScheduleTimeline';
import { Uploader } from '../components/Uploader';
import { Dashboard } from '../components/Dashboard';
import { useSchedule } from '../contexts/ScheduleContext';
import { ScheduleBlock, VerificationResult, DailyStats } from '../types';

interface VerifyPageProps {
  logs: Record<string, { result: VerificationResult }>;
  onVerificationComplete: (blockId: string, result: VerificationResult) => void;
}

export const VerifyPage: React.FC<VerifyPageProps> = ({ logs, onVerificationComplete }) => {
  const { schedule } = useSchedule();
  const [currentBlock, setCurrentBlock] = useState<ScheduleBlock | null>(null);
  const [lastResult, setLastResult] = useState<VerificationResult | null>(null);

  // Get current block based on time and user's schedule
  const getCurrentBlock = (): ScheduleBlock | null => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    return schedule.find(block => {
      const [startH, startM] = block.start.split(':').map(Number);
      const [endH, endM] = block.end.split(':').map(Number);
      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;
      return currentTime >= startTotal && currentTime < endTotal;
    }) || null;
  };

  const stats: DailyStats = useMemo(() => {
    const entries: { result: VerificationResult }[] = Object.values(logs);
    const totalBlocks = schedule.length;
    const completedBlocks = entries.filter(e => e.result.task_verified).length;
    const totalFocusPoints = entries.reduce((acc, curr) => acc + (curr.result.focus_score || 0), 0);
    const consistencyScore = totalBlocks > 0
      ? Math.round((completedBlocks / Math.max(1, entries.length)) * 100)
      : 0;
    return { consistencyScore, totalFocusPoints, completedBlocks, totalBlocks };
  }, [logs, schedule]);

  const history = useMemo(() => {
    return Object.entries(logs)
      .map(([blockId, entry]) => ({
        id: blockId,
        score: (entry as { result: VerificationResult }).result.focus_score
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [logs]);

  useEffect(() => {
    setCurrentBlock(getCurrentBlock());
    const interval = setInterval(() => setCurrentBlock(getCurrentBlock()), 60000);
    return () => clearInterval(interval);
  }, [schedule]);

  const handleVerificationComplete = (blockId: string, result: VerificationResult) => {
    onVerificationComplete(blockId, result);
    setLastResult(result);
  };

  return (
    <div id="verify" className="dashboard-container w-full max-w-6xl z-20 mx-auto px-4 relative">
      <div className="dashboard-ui relative w-full rounded-xl border bg-[#0a0a0c] overflow-hidden shadow-2xl border-white/10">
        <div className="scanline"></div>

        {/* Interface Header */}
        <div className="h-10 border-b bg-white/[0.02] flex items-center px-4 justify-between select-none border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 opacity-50">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            <div className="h-4 w-px mx-1 bg-white/10"></div>
            <div className="flex items-center gap-2 text-[10px] px-2 py-0.5 rounded border bg-black/40 border-white/5 text-slate-400">
              <iconify-icon icon="lucide:lock" width="10"></iconify-icon>
              <span className="font-mono">user-session-active</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
              SYSTEM OPERATIONAL
            </div>
          </div>
        </div>

        {/* Interface Body */}
        <div className="flex flex-col md:flex-row h-auto md:h-[650px]">
          {/* Sidebar / Timeline */}
          <div className="w-full md:w-64 border-r bg-white/[0.01] flex flex-col border-white/5">
            <div className="p-4 border-b border-white/5">
              <div className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-2">Schedule</div>
              <ScheduleTimeline currentBlock={currentBlock} logs={logs} />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-[#050505] flex flex-col gap-6">

            {/* Stats Row */}
            <div className="h-auto">
              <Dashboard stats={stats} lastResult={lastResult} history={history} />
            </div>

            {/* Upload Area */}
            <div className="flex-1 min-h-[250px] rounded-lg border border-white/5 bg-[#0a0a0c] relative overflow-hidden">
              <Uploader currentBlock={currentBlock} onVerificationComplete={handleVerificationComplete} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};