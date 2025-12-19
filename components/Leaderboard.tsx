import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LeaderboardEntry {
    user_id: string;
    name: string;
    avatar: string | null;
    current_streak: number;
    longest_streak: number;
    total_focus: number;
    total_verifications: number;
    achievement_points: number;
    rank: number;
}

type LeaderboardType = 'focus' | 'streak' | 'verifications' | 'points';
type TimeRange = 'daily' | 'weekly' | 'monthly' | 'alltime';

interface LeaderboardProps {
    type?: LeaderboardType;
    limit?: number;
    showCurrentUser?: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
    type = 'focus',
    limit = 10,
    showCurrentUser = true
}) => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [selectedType, setSelectedType] = useState<LeaderboardType>(type);
    const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null);

    useEffect(() => {
        loadLeaderboard();
    }, [selectedType, timeRange]);

    const loadLeaderboard = async () => {
        setIsLoading(true);
        try {
            // Try to fetch from leaderboard view
            const { data, error } = await supabase
                .from('leaderboard')
                .select('*')
                .limit(limit);

            if (data && !error) {
                // Sort based on selected type
                const sorted = [...data].sort((a, b) => {
                    switch (selectedType) {
                        case 'focus':
                            return b.total_focus - a.total_focus;
                        case 'streak':
                            return b.current_streak - a.current_streak;
                        case 'verifications':
                            return b.total_verifications - a.total_verifications;
                        case 'points':
                            return b.achievement_points - a.achievement_points;
                        default:
                            return 0;
                    }
                });

                // Add ranks
                const ranked = sorted.map((entry, i) => ({
                    ...entry,
                    rank: i + 1
                }));

                setEntries(ranked);

                // Find current user
                if (user) {
                    const userEntry = ranked.find(e => e.user_id === user.id);
                    setCurrentUserRank(userEntry || null);
                }
            } else {
                // Fallback to mock data
                setEntries(generateMockData());
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            setEntries(generateMockData());
        } finally {
            setIsLoading(false);
        }
    };

    const generateMockData = (): LeaderboardEntry[] => {
        const names = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'Phoenix'];
        return names.map((name, i) => ({
            user_id: `mock-${i}`,
            name,
            avatar: null,
            current_streak: Math.floor(Math.random() * 30) + 1,
            longest_streak: Math.floor(Math.random() * 50) + 10,
            total_focus: Math.floor(Math.random() * 500) + 100,
            total_verifications: Math.floor(Math.random() * 100) + 20,
            achievement_points: Math.floor(Math.random() * 300) + 50,
            rank: i + 1
        })).sort((a, b) => {
            switch (selectedType) {
                case 'focus': return b.total_focus - a.total_focus;
                case 'streak': return b.current_streak - a.current_streak;
                case 'verifications': return b.total_verifications - a.total_verifications;
                case 'points': return b.achievement_points - a.achievement_points;
                default: return 0;
            }
        }).map((e, i) => ({ ...e, rank: i + 1 }));
    };

    const getMetricValue = (entry: LeaderboardEntry) => {
        switch (selectedType) {
            case 'focus': return entry.total_focus;
            case 'streak': return entry.current_streak;
            case 'verifications': return entry.total_verifications;
            case 'points': return entry.achievement_points;
        }
    };

    const getMetricLabel = () => {
        switch (selectedType) {
            case 'focus': return 'Focus Points';
            case 'streak': return 'Day Streak';
            case 'verifications': return 'Verifications';
            case 'points': return 'Achievement Pts';
        }
    };

    const getRankStyle = (rank: number) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/40';
        if (rank === 2) return 'bg-gradient-to-r from-slate-400/20 to-slate-300/20 border-slate-400/40';
        if (rank === 3) return 'bg-gradient-to-r from-orange-600/20 to-orange-500/20 border-orange-600/40';
        return 'bg-white/5 border-white/10';
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank.toString();
    };

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-white/5 rounded-lg"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-[#0a0a0c] border-white/5 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <iconify-icon icon="lucide:trophy" width="20" className="text-yellow-400"></iconify-icon>
                        <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
                    </div>

                    {/* Time range filter */}
                    <div className="flex gap-1">
                        {(['daily', 'weekly', 'monthly', 'alltime'] as TimeRange[]).map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${timeRange === range
                                        ? 'bg-purple-500/20 text-purple-400'
                                        : 'text-slate-500 hover:text-slate-400'
                                    }`}
                            >
                                {range === 'alltime' ? 'All' : range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Type filter */}
                <div className="flex gap-2">
                    {([
                        { type: 'focus' as LeaderboardType, label: 'Focus', icon: 'lucide:zap' },
                        { type: 'streak' as LeaderboardType, label: 'Streak', icon: 'lucide:flame' },
                        { type: 'verifications' as LeaderboardType, label: 'Verified', icon: 'lucide:check-circle' },
                        { type: 'points' as LeaderboardType, label: 'Points', icon: 'lucide:star' },
                    ]).map(({ type: t, label, icon }) => (
                        <button
                            key={t}
                            onClick={() => setSelectedType(t)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedType === t
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            <iconify-icon icon={icon} width="12"></iconify-icon>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leaderboard entries */}
            <div className="divide-y divide-white/5">
                {entries.map((entry, index) => {
                    const isCurrentUser = user && entry.user_id === user.id;

                    return (
                        <div
                            key={entry.user_id}
                            className={`p-4 flex items-center gap-4 transition-colors ${isCurrentUser ? 'bg-purple-500/10' : 'hover:bg-white/5'
                                } ${getRankStyle(entry.rank)}`}
                        >
                            {/* Rank */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold ${entry.rank <= 3 ? '' : 'bg-white/5 text-slate-500'
                                }`}>
                                {getRankIcon(entry.rank)}
                            </div>

                            {/* Avatar */}
                            <div className="relative">
                                {entry.avatar ? (
                                    <img
                                        src={entry.avatar}
                                        alt={entry.name}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-white/10"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                        {entry.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                )}
                                {isCurrentUser && (
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a0c] flex items-center justify-center">
                                        <iconify-icon icon="lucide:user" width="10" className="text-white"></iconify-icon>
                                    </div>
                                )}
                            </div>

                            {/* Name & stats */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`font-semibold truncate ${isCurrentUser ? 'text-purple-300' : 'text-white'}`}>
                                        {entry.name || 'Anonymous'}
                                    </span>
                                    {isCurrentUser && (
                                        <span className="text-[9px] bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded uppercase font-medium">
                                            You
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                    <span>🔥 {entry.current_streak}d</span>
                                    <span>•</span>
                                    <span>✓ {entry.total_verifications}</span>
                                </div>
                            </div>

                            {/* Metric */}
                            <div className="text-right">
                                <div className={`text-lg font-bold ${entry.rank === 1 ? 'text-yellow-400' :
                                        entry.rank === 2 ? 'text-slate-300' :
                                            entry.rank === 3 ? 'text-orange-400' :
                                                'text-white'
                                    }`}>
                                    {getMetricValue(entry).toLocaleString()}
                                </div>
                                <div className="text-[10px] text-slate-500">{getMetricLabel()}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Current user (if not in top list) */}
            {showCurrentUser && currentUserRank && currentUserRank.rank > limit && (
                <div className="border-t border-white/10 p-4 bg-purple-500/5">
                    <div className="text-[10px] text-slate-500 mb-2">Your Position</div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/20 text-purple-400 font-bold">
                            #{currentUserRank.rank}
                        </div>
                        <div className="flex-1">
                            <span className="text-white font-medium">{currentUserRank.name}</span>
                        </div>
                        <div className="text-purple-400 font-bold">
                            {getMetricValue(currentUserRank).toLocaleString()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Compact leaderboard widget for homepage
export const LeaderboardWidget: React.FC = () => {
    const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTopUsers();
    }, []);

    const loadTopUsers = async () => {
        try {
            const { data } = await supabase
                .from('leaderboard')
                .select('*')
                .order('total_focus', { ascending: false })
                .limit(3);

            if (data) {
                setTopUsers(data.map((e, i) => ({ ...e, rank: i + 1 })));
            }
        } catch (error) {
            console.error('Error loading top users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="animate-pulse h-16 bg-white/5 rounded-lg"></div>;
    }

    return (
        <div className="rounded-xl border bg-[#0a0a0c] border-white/5 p-4">
            <div className="flex items-center gap-2 mb-4">
                <iconify-icon icon="lucide:trophy" width="16" className="text-yellow-400"></iconify-icon>
                <span className="text-sm font-medium text-white">Top Performers</span>
            </div>

            <div className="space-y-2">
                {topUsers.map((user, i) => (
                    <div key={user.user_id} className="flex items-center gap-3">
                        <span className="text-lg">{['🥇', '🥈', '🥉'][i]}</span>
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] text-white font-bold">
                            {user.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm text-slate-300 flex-1 truncate">{user.name}</span>
                        <span className="text-xs text-purple-400 font-medium">{user.total_focus} pts</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
