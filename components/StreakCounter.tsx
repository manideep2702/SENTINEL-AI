import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastVerificationDate: string | null;
    streakFreezesUsed: number;
}

interface StreakCounterProps {
    variant?: 'compact' | 'full';
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ variant = 'full' }) => {
    const { user } = useAuth();
    const [streak, setStreak] = useState<StreakData>({
        currentStreak: 0,
        longestStreak: 0,
        lastVerificationDate: null,
        streakFreezesUsed: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadStreak();
        }
    }, [user]);

    const loadStreak = async () => {
        if (!user) return;

        try {
            // Try to get existing streak
            const { data, error } = await supabase
                .from('user_streaks')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (data) {
                setStreak({
                    currentStreak: data.current_streak || 0,
                    longestStreak: data.longest_streak || 0,
                    lastVerificationDate: data.last_verification_date,
                    streakFreezesUsed: data.streak_freezes_used || 0
                });
            }
        } catch (error) {
            // Table might not exist yet, use local calculation
            calculateLocalStreak();
        } finally {
            setIsLoading(false);
        }
    };

    const calculateLocalStreak = async () => {
        if (!user) return;

        try {
            // Get recent verifications
            const { data: verifications } = await supabase
                .from('verifications')
                .select('created_at')
                .eq('user_id', user.id)
                .eq('task_verified', true)
                .order('created_at', { ascending: false });

            if (!verifications || verifications.length === 0) {
                setStreak({ currentStreak: 0, longestStreak: 0, lastVerificationDate: null, streakFreezesUsed: 0 });
                return;
            }

            // Calculate streak from verification dates
            const dates = [...new Set(verifications.map(v =>
                new Date(v.created_at).toDateString()
            ))];

            let currentStreak = 0;
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();

            // Check if streak is active (verified today or yesterday)
            if (dates[0] === today || dates[0] === yesterday) {
                currentStreak = 1;

                for (let i = 1; i < dates.length; i++) {
                    const currentDate = new Date(dates[i - 1]);
                    const prevDate = new Date(dates[i]);
                    const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / 86400000);

                    if (diffDays === 1) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            }

            setStreak({
                currentStreak,
                longestStreak: Math.max(currentStreak, streak.longestStreak),
                lastVerificationDate: dates[0],
                streakFreezesUsed: 0
            });
        } catch (error) {
            console.error('Error calculating streak:', error);
        }
    };

    const getStreakEmoji = () => {
        if (streak.currentStreak >= 100) return '🏆';
        if (streak.currentStreak >= 30) return '🔥';
        if (streak.currentStreak >= 7) return '⚡';
        if (streak.currentStreak >= 3) return '✨';
        return '🎯';
    };

    const getStreakColor = () => {
        if (streak.currentStreak >= 30) return 'from-orange-500 to-red-500';
        if (streak.currentStreak >= 7) return 'from-purple-500 to-pink-500';
        if (streak.currentStreak >= 3) return 'from-blue-500 to-purple-500';
        return 'from-slate-500 to-slate-400';
    };

    const getStreakMessage = () => {
        if (streak.currentStreak === 0) return "Start your streak today!";
        if (streak.currentStreak === 1) return "Great start! Keep going!";
        if (streak.currentStreak < 7) return `${7 - streak.currentStreak} days to weekly badge!`;
        if (streak.currentStreak < 30) return `${30 - streak.currentStreak} days to monthly badge!`;
        if (streak.currentStreak < 100) return `${100 - streak.currentStreak} days to legend status!`;
        return "You're a LEGEND! 🏆";
    };

    if (isLoading) {
        return (
            <div className="animate-pulse bg-white/5 rounded-xl p-4">
                <div className="h-8 w-20 bg-white/10 rounded"></div>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-lg">{getStreakEmoji()}</span>
                <span className={`text-lg font-bold bg-gradient-to-r ${getStreakColor()} bg-clip-text text-transparent`}>
                    {streak.currentStreak}
                </span>
                <span className="text-xs text-slate-500">day streak</span>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border-white/5 p-6 hover:border-orange-500/30 transition-all duration-300 relative overflow-hidden group">
            {/* Background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{getStreakEmoji()}</span>
                    <h3 className="text-sm font-medium text-slate-400">Current Streak</h3>
                </div>
                {streak.longestStreak > 0 && (
                    <div className="text-xs text-slate-500">
                        Best: <span className="text-orange-400 font-medium">{streak.longestStreak}</span> days
                    </div>
                )}
            </div>

            {/* Main counter */}
            <div className="relative z-10 mb-4">
                <div className={`text-5xl font-bold bg-gradient-to-r ${getStreakColor()} bg-clip-text text-transparent`}>
                    {streak.currentStreak}
                </div>
                <div className="text-sm text-slate-500 mt-1">consecutive days</div>
            </div>

            {/* Progress to next milestone */}
            <div className="relative z-10">
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>{getStreakMessage()}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getStreakColor()} transition-all duration-500`}
                        style={{
                            width: `${Math.min(100, (streak.currentStreak % 7) * 14.28)}%`
                        }}
                    ></div>
                </div>
            </div>

            {/* Streak calendar preview */}
            <div className="mt-4 flex gap-1 relative z-10">
                {[...Array(7)].map((_, i) => {
                    const isActive = i < (streak.currentStreak % 7) || (streak.currentStreak >= 7 && i < 7);
                    return (
                        <div
                            key={i}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-medium transition-colors ${isActive
                                    ? 'bg-gradient-to-br from-orange-500/30 to-red-500/30 text-orange-400 border border-orange-500/30'
                                    : 'bg-white/5 text-slate-600'
                                }`}
                        >
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Hook to update streak after verification
export const useUpdateStreak = () => {
    const { user } = useAuth();

    const updateStreak = async () => {
        if (!user) return;

        try {
            const today = new Date().toISOString().split('T')[0];

            // Get or create streak record
            const { data: existing } = await supabase
                .from('user_streaks')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (existing) {
                const lastDate = existing.last_verification_date;
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                let newStreak = existing.current_streak;

                if (lastDate === today) {
                    // Already verified today
                    return;
                } else if (lastDate === yesterday) {
                    // Continue streak
                    newStreak = existing.current_streak + 1;
                } else {
                    // Streak broken, start fresh
                    newStreak = 1;
                }

                await supabase
                    .from('user_streaks')
                    .update({
                        current_streak: newStreak,
                        longest_streak: Math.max(newStreak, existing.longest_streak),
                        last_verification_date: today,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id);
            } else {
                // Create new streak record
                await supabase
                    .from('user_streaks')
                    .insert({
                        user_id: user.id,
                        current_streak: 1,
                        longest_streak: 1,
                        last_verification_date: today
                    });
            }

            console.log('🔥 Streak updated!');
        } catch (error) {
            console.error('Error updating streak:', error);
        }
    };

    return { updateStreak };
};
