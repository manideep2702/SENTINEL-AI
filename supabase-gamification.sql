-- ==============================================
-- SENTINEL AI - Gamification Tables Setup
-- ==============================================
-- Run this SQL in your Supabase SQL Editor
-- This adds streak tracking, achievements, and leaderboard
-- ==============================================

-- 1. User Streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_verification_date DATE,
    streak_freezes_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create indexes for streaks
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_current ON user_streaks(current_streak DESC);

-- 3. Enable RLS on user_streaks
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for user_streaks (drop first if exists)
DROP POLICY IF EXISTS "Users can view own streak" ON user_streaks;
DROP POLICY IF EXISTS "Users can insert own streak" ON user_streaks;
DROP POLICY IF EXISTS "Users can update own streak" ON user_streaks;

CREATE POLICY "Users can view own streak" ON user_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak" ON user_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak" ON user_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. Achievements definition table
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT,
    requirement_type TEXT,
    requirement_value INTEGER,
    points INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. User achievements (unlocked badges)
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES achievements(id),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, achievement_id)
);

-- 7. Create indexes for user_achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned ON user_achievements(earned_at DESC);

-- 8. Enable RLS on user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for user_achievements (drop first if exists)
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;

CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. Insert default achievements
INSERT INTO achievements (id, name, description, icon, category, requirement_value, points) VALUES
    ('streak_3', 'Getting Started', 'Complete a 3-day streak', '🌱', 'streak', 3, 10),
    ('streak_7', 'Week Warrior', 'Complete a 7-day streak', '⚡', 'streak', 7, 25),
    ('streak_30', 'Monthly Master', 'Complete a 30-day streak', '🔥', 'streak', 30, 100),
    ('streak_100', 'Century Legend', 'Complete a 100-day streak', '🏆', 'streak', 100, 500),
    ('focus_perfect', 'Perfect Focus', 'Get a 10/10 focus score', '🎯', 'focus', 10, 15),
    ('focus_50', 'Focus Apprentice', 'Earn 50 total focus points', '💎', 'focus', 50, 20),
    ('focus_200', 'Focus Master', 'Earn 200 total focus points', '💠', 'focus', 200, 75),
    ('focus_1000', 'Focus Legend', 'Earn 1000 total focus points', '✨', 'focus', 1000, 300),
    ('verify_1', 'First Step', 'Complete your first verification', '👋', 'verify', 1, 5),
    ('verify_10', 'Getting Serious', 'Complete 10 verifications', '📸', 'verify', 10, 15),
    ('verify_50', 'Verification Pro', 'Complete 50 verifications', '📷', 'verify', 50, 50),
    ('verify_100', 'Accountability King', 'Complete 100 verifications', '👑', 'verify', 100, 150),
    ('early_bird', 'Early Bird', 'Verify a task before 6 AM', '🌅', 'time', 6, 20),
    ('night_owl', 'Night Owl', 'Verify a task after 10 PM', '🦉', 'time', 22, 20),
    ('all_tasks', 'Perfect Day', 'Complete all scheduled tasks in a day', '⭐', 'special', 1, 50)
ON CONFLICT (id) DO NOTHING;

-- 11. Create updated_at trigger for user_streaks
DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON user_streaks;
CREATE TRIGGER update_user_streaks_updated_at
    BEFORE UPDATE ON user_streaks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12. Leaderboard view (drop and recreate)
DROP VIEW IF EXISTS leaderboard;
CREATE VIEW leaderboard AS
SELECT 
    u.id as user_id,
    u.raw_user_meta_data->>'full_name' as name,
    u.raw_user_meta_data->>'avatar_url' as avatar,
    COALESCE(s.current_streak, 0) as current_streak,
    COALESCE(s.longest_streak, 0) as longest_streak,
    COALESCE(v.total_focus, 0) as total_focus,
    COALESCE(v.total_verifications, 0) as total_verifications,
    COALESCE(a.total_points, 0) as achievement_points,
    ROW_NUMBER() OVER (ORDER BY COALESCE(v.total_focus, 0) DESC) as rank
FROM auth.users u
LEFT JOIN user_streaks s ON u.id = s.user_id
LEFT JOIN (
    SELECT user_id, SUM(focus_score) as total_focus, COUNT(*) as total_verifications
    FROM verifications
    WHERE task_verified = true
    GROUP BY user_id
) v ON u.id = v.user_id
LEFT JOIN (
    SELECT ua.user_id, SUM(a.points) as total_points
    FROM user_achievements ua
    JOIN achievements a ON ua.achievement_id = a.id
    GROUP BY ua.user_id
) a ON u.id = a.user_id
ORDER BY total_focus DESC;

-- Done! 🎉
-- Tables created:
--   - user_streaks: Track daily verification streaks
--   - achievements: Badge definitions
--   - user_achievements: Unlocked badges per user
--   - leaderboard: View for rankings
