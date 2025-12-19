import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Achievement definitions
export const ACHIEVEMENTS = [
    // Streak achievements
    { id: 'streak_3', name: 'Getting Started', description: 'Complete a 3-day streak', icon: '🌱', category: 'streak', requirement: 3, points: 10 },
    { id: 'streak_7', name: 'Week Warrior', description: 'Complete a 7-day streak', icon: '⚡', category: 'streak', requirement: 7, points: 25 },
    { id: 'streak_30', name: 'Monthly Master', description: 'Complete a 30-day streak', icon: '🔥', category: 'streak', requirement: 30, points: 100 },
    { id: 'streak_100', name: 'Century Legend', description: 'Complete a 100-day streak', icon: '🏆', category: 'streak', requirement: 100, points: 500 },

    // Focus achievements
    { id: 'focus_perfect', name: 'Perfect Focus', description: 'Get a 10/10 focus score', icon: '🎯', category: 'focus', requirement: 10, points: 15 },
    { id: 'focus_50', name: 'Focus Apprentice', description: 'Earn 50 total focus points', icon: '💎', category: 'focus', requirement: 50, points: 20 },
    { id: 'focus_200', name: 'Focus Master', description: 'Earn 200 total focus points', icon: '💠', category: 'focus', requirement: 200, points: 75 },
    { id: 'focus_1000', name: 'Focus Legend', description: 'Earn 1000 total focus points', icon: '✨', category: 'focus', requirement: 1000, points: 300 },

    // Verification achievements
    { id: 'verify_1', name: 'First Step', description: 'Complete your first verification', icon: '👋', category: 'verify', requirement: 1, points: 5 },
    { id: 'verify_10', name: 'Getting Serious', description: 'Complete 10 verifications', icon: '📸', category: 'verify', requirement: 10, points: 15 },
    { id: 'verify_50', name: 'Verification Pro', description: 'Complete 50 verifications', icon: '📷', category: 'verify', requirement: 50, points: 50 },
    { id: 'verify_100', name: 'Accountability King', description: 'Complete 100 verifications', icon: '👑', category: 'verify', requirement: 100, points: 150 },

    // Time-based achievements
    { id: 'early_bird', name: 'Early Bird', description: 'Verify a task before 6 AM', icon: '🌅', category: 'time', requirement: 6, points: 20 },
    { id: 'night_owl', name: 'Night Owl', description: 'Verify a task after 10 PM', icon: '🦉', category: 'time', requirement: 22, points: 20 },
    { id: 'weekend_warrior', name: 'Weekend Warrior', description: 'Verify tasks on 4 weekends', icon: '🎉', category: 'time', requirement: 4, points: 30 },

    // Special achievements
    { id: 'all_tasks', name: 'Perfect Day', description: 'Complete all scheduled tasks in a day', icon: '⭐', category: 'special', requirement: 1, points: 50 },
    { id: 'comeback', name: 'Comeback Kid', description: 'Return after 7+ days inactive', icon: '🔄', category: 'special', requirement: 7, points: 25 },
];

interface UserAchievement {
    id: string;
    earnedAt: string;
}

interface AchievementBadgeProps {
    achievement: typeof ACHIEVEMENTS[0];
    earned?: boolean;
    earnedAt?: string;
    showDetails?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
    achievement,
    earned = false,
    earnedAt,
    showDetails = false
}) => {
    return (
        <div className={`
            relative p-4 rounded-xl border transition-all duration-300
            ${earned
                ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50'
                : 'bg-white/5 border-white/10 opacity-50 grayscale'
            }
        `}>
            {/* Badge icon */}
            <div className={`
                text-4xl mb-2 
                ${earned ? '' : 'filter blur-[2px]'}
            `}>
                {achievement.icon}
            </div>

            {/* Name */}
            <h4 className={`font-semibold text-sm ${earned ? 'text-white' : 'text-slate-500'}`}>
                {achievement.name}
            </h4>

            {/* Description */}
            {showDetails && (
                <p className="text-xs text-slate-500 mt-1">{achievement.description}</p>
            )}

            {/* Points */}
            <div className={`text-xs mt-2 ${earned ? 'text-purple-400' : 'text-slate-600'}`}>
                +{achievement.points} pts
            </div>

            {/* Earned indicator */}
            {earned && (
                <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <iconify-icon icon="lucide:check" width="12" className="text-white"></iconify-icon>
                    </div>
                </div>
            )}

            {/* Earned date */}
            {earned && earnedAt && showDetails && (
                <div className="text-[10px] text-slate-600 mt-2">
                    Earned {new Date(earnedAt).toLocaleDateString()}
                </div>
            )}
        </div>
    );
};

interface AchievementsGridProps {
    category?: string;
    showLocked?: boolean;
}

export const AchievementsGrid: React.FC<AchievementsGridProps> = ({
    category,
    showLocked = true
}) => {
    const { user } = useAuth();
    const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadAchievements();
        }
    }, [user]);

    const loadAchievements = async () => {
        if (!user) return;

        try {
            const { data } = await supabase
                .from('user_achievements')
                .select('achievement_id, earned_at')
                .eq('user_id', user.id);

            if (data) {
                setUserAchievements(data.map(a => ({
                    id: a.achievement_id,
                    earnedAt: a.earned_at
                })));
            }
        } catch (error) {
            console.error('Error loading achievements:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAchievements = category
        ? ACHIEVEMENTS.filter(a => a.category === category)
        : ACHIEVEMENTS;

    const earnedCount = userAchievements.length;
    const totalPoints = userAchievements.reduce((sum, ua) => {
        const achievement = ACHIEVEMENTS.find(a => a.id === ua.id);
        return sum + (achievement?.points || 0);
    }, 0);

    if (isLoading) {
        return (
            <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
                ))}
            </div>
        );
    }

    return (
        <div>
            {/* Stats header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-400">
                        <span className="text-white font-bold">{earnedCount}</span>/{ACHIEVEMENTS.length} unlocked
                    </div>
                    <div className="text-sm text-purple-400">
                        <iconify-icon icon="lucide:star" width="14" className="inline mr-1"></iconify-icon>
                        {totalPoints} points
                    </div>
                </div>

                {/* Category filter */}
                <div className="flex gap-2">
                    {['all', 'streak', 'focus', 'verify', 'special'].map(cat => (
                        <button
                            key={cat}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${(category || 'all') === cat
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Achievements grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredAchievements.map(achievement => {
                    const userAchievement = userAchievements.find(ua => ua.id === achievement.id);
                    const earned = !!userAchievement;

                    if (!showLocked && !earned) return null;

                    return (
                        <AchievementBadge
                            key={achievement.id}
                            achievement={achievement}
                            earned={earned}
                            earnedAt={userAchievement?.earnedAt}
                            showDetails
                        />
                    );
                })}
            </div>
        </div>
    );
};

// Hook to check and award achievements
export const useCheckAchievements = () => {
    const { user } = useAuth();

    const checkAndAward = async (stats: {
        currentStreak?: number;
        totalFocusPoints?: number;
        highestFocusScore?: number;
        totalVerifications?: number;
        verificationHour?: number;
        isWeekend?: boolean;
        allTasksComplete?: boolean;
    }) => {
        if (!user) return [];

        const newAchievements: typeof ACHIEVEMENTS[0][] = [];

        try {
            // Get existing achievements
            const { data: existing } = await supabase
                .from('user_achievements')
                .select('achievement_id')
                .eq('user_id', user.id);

            const earnedIds = new Set(existing?.map(e => e.achievement_id) || []);

            // Check each achievement
            for (const achievement of ACHIEVEMENTS) {
                if (earnedIds.has(achievement.id)) continue;

                let earned = false;

                switch (achievement.category) {
                    case 'streak':
                        earned = (stats.currentStreak || 0) >= achievement.requirement;
                        break;
                    case 'focus':
                        if (achievement.id === 'focus_perfect') {
                            earned = (stats.highestFocusScore || 0) >= 10;
                        } else {
                            earned = (stats.totalFocusPoints || 0) >= achievement.requirement;
                        }
                        break;
                    case 'verify':
                        earned = (stats.totalVerifications || 0) >= achievement.requirement;
                        break;
                    case 'time':
                        if (achievement.id === 'early_bird') {
                            earned = (stats.verificationHour || 12) < 6;
                        } else if (achievement.id === 'night_owl') {
                            earned = (stats.verificationHour || 12) >= 22;
                        }
                        break;
                    case 'special':
                        if (achievement.id === 'all_tasks') {
                            earned = stats.allTasksComplete || false;
                        }
                        break;
                }

                if (earned) {
                    // Award achievement
                    await supabase
                        .from('user_achievements')
                        .insert({
                            user_id: user.id,
                            achievement_id: achievement.id
                        });

                    newAchievements.push(achievement);
                    console.log(`🏆 Achievement unlocked: ${achievement.name}!`);
                }
            }
        } catch (error) {
            console.error('Error checking achievements:', error);
        }

        return newAchievements;
    };

    return { checkAndAward };
};

// Achievement notification popup
export const AchievementPopup: React.FC<{
    achievement: typeof ACHIEVEMENTS[0];
    onClose: () => void;
}> = ({ achievement, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4 shadow-2xl max-w-sm">
                <div className="flex items-center gap-4">
                    <div className="text-5xl animate-bounce">{achievement.icon}</div>
                    <div>
                        <div className="text-xs text-purple-300 uppercase tracking-wide mb-1">
                            Achievement Unlocked!
                        </div>
                        <div className="text-lg font-bold text-white">{achievement.name}</div>
                        <div className="text-sm text-purple-200">+{achievement.points} points</div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-slate-400 hover:text-white"
                >
                    <iconify-icon icon="lucide:x" width="16"></iconify-icon>
                </button>
            </div>
        </div>
    );
};
