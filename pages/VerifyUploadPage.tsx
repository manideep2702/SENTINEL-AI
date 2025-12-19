import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScheduleTimeline } from '../components/ScheduleTimeline';
import { Uploader } from '../components/Uploader';
import { Dashboard } from '../components/Dashboard';
import { useSchedule } from '../contexts/ScheduleContext';
import { ScheduleBlock, VerificationResult, DailyStats } from '../types';

interface VerifyUploadPageProps {
    logs: Record<string, { result: VerificationResult }>;
    onVerificationComplete: (blockId: string, result: VerificationResult) => void;
}

export const VerifyUploadPage: React.FC<VerifyUploadPageProps> = ({ logs, onVerificationComplete }) => {
    const navigate = useNavigate();
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
        <div className="min-h-screen bg-[#020204] text-slate-400">
            {/* Navigation Header */}
            <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 border-b bg-[#020204]/70 backdrop-blur-xl border-white/5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 cursor-pointer group"
                    >
                        <div className="relative flex items-center justify-center w-6 h-6 transition-transform group-active:scale-95">
                            <div className="absolute inset-0 bg-purple-500 blur opacity-40 rounded-full group-hover:opacity-60 transition-opacity"></div>
                            <img src="/Sentinellogo.jpg" alt="Sentinel AI" className="relative z-10 text-white" width="18" />
                        </div>
                        <span className="text-sm tracking-tight font-semibold text-white">SENTINEL AI</span>
                    </button>
                    <div className="h-4 w-px bg-white/10"></div>
                    <h1 className="text-sm font-medium text-slate-300">Verification Center</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/analytics')}
                        className="flex items-center gap-2 text-xs font-medium bg-[#0a0a0c] border px-4 py-2 rounded-md transition-all hover:border-purple-500/50 text-white border-white/10 active:scale-95"
                    >
                        <iconify-icon icon="lucide:bar-chart-3" width="14"></iconify-icon>
                        View Analytics
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-xs font-medium bg-[#0a0a0c] border px-4 py-2 rounded-md transition-all hover:border-purple-500/50 text-white border-white/10 active:scale-95"
                    >
                        <iconify-icon icon="lucide:home" width="14"></iconify-icon>
                        Home
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">

                {/* Page Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-medium tracking-tight mb-2 font-serif text-white">
                        Activity Verification
                    </h2>
                    <p className="text-slate-400">Upload proof of your work and get instant AI analysis using SENTINEL AI</p>
                </div>

                {/* Main Verification Interface */}
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
                                <span className="font-mono">verification-session-active</span>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-6">
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                                SENTINEL AI READY
                            </div>
                        </div>
                    </div>

                    {/* Interface Body */}
                    <div className="flex flex-col md:flex-row h-auto md:h-[650px]">
                        {/* Sidebar / Timeline - Scrollable */}
                        <div className="w-full md:w-72 border-r bg-white/[0.01] flex flex-col border-white/5 md:max-h-[650px]">
                            <div className="p-4 border-b border-white/5 flex-shrink-0">
                                <div className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">Today's Schedule</div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                <ScheduleTimeline currentBlock={currentBlock} logs={logs} />
                            </div>
                        </div>

                        {/* Main Upload Area */}
                        <div className="flex-1 p-6 overflow-y-auto bg-[#050505] flex flex-col gap-6">

                            {/* Current Activity Info */}
                            {currentBlock && (
                                <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                                        <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Active Protocol</span>
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-1">{currentBlock.activity}</h3>
                                    <p className="text-xs text-slate-400">
                                        {currentBlock.start} - {currentBlock.end} • Upload evidence to verify completion
                                    </p>
                                </div>
                            )}

                            {/* Upload Area */}
                            <div className="flex-1 min-h-[400px] rounded-lg border border-white/5 bg-[#0a0a0c] relative overflow-hidden">
                                <Uploader currentBlock={currentBlock} onVerificationComplete={handleVerificationComplete} />
                            </div>

                            {/* Instructions */}
                            <div className="rounded-lg border border-white/5 bg-[#0a0a0c] p-4">
                                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                                    <iconify-icon icon="lucide:info" width="16" className="text-blue-400"></iconify-icon>
                                    How It Works
                                </h4>
                                <ul className="space-y-2 text-xs text-slate-400">
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-400 mt-0.5">1.</span>
                                        <span>Upload a photo or video showing you performing the scheduled activity</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-400 mt-0.5">2.</span>
                                        <span>SENTINEL AI analyzes your submission for authenticity and focus</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-400 mt-0.5">3.</span>
                                        <span>Receive instant feedback with a focus score (0-10) and AI critique</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-400 mt-0.5">4.</span>
                                        <span>Task automatically marked as complete and reflected in analytics</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-400 mt-0.5">⚠️</span>
                                        <span className="text-red-300">Trash/irrelevant images will be rejected automatically</span>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};
