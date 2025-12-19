-- ==============================================
-- SENTINEL AI - Backend Setup for Supabase
-- ==============================================
-- Run these SQL commands in your Supabase SQL Editor
-- (Dashboard > SQL Editor > New Query)
-- ==============================================

-- 1. Create the verifications table
CREATE TABLE IF NOT EXISTS verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    block_id TEXT NOT NULL,
    activity_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    task_verified BOOLEAN NOT NULL DEFAULT false,
    focus_score INTEGER NOT NULL DEFAULT 0,
    distractions_detected TEXT[] DEFAULT '{}',
    ai_critique TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_created_at ON verifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verifications_block_id ON verifications(block_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for verifications
-- Users can only see their own verifications
CREATE POLICY "Users can view own verifications" ON verifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own verifications
CREATE POLICY "Users can insert own verifications" ON verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own verifications
CREATE POLICY "Users can update own verifications" ON verifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own verifications
CREATE POLICY "Users can delete own verifications" ON verifications
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_verifications_updated_at
    BEFORE UPDATE ON verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- NOTIFICATION PREFERENCES TABLE
-- ==============================================

-- 6. Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email_reminders_enabled BOOLEAN DEFAULT true,
    reminder_minutes_before INTEGER DEFAULT 5,
    push_notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create index for notification preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- 8. Enable RLS on notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for notification_preferences
CREATE POLICY "Users can view own notification preferences" ON notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences" ON notification_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" ON notification_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- 10. Create trigger for notification_preferences updated_at
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- STORAGE BUCKET SETUP
-- ==============================================
-- Go to Storage in Supabase Dashboard and:
-- 1. Create a new bucket called "verification-uploads"
-- 2. Make it PUBLIC (or set up appropriate policies)
-- 
-- Or run this SQL (if you have storage admin permissions):
-- ==============================================

-- Create the storage bucket (run in SQL editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-uploads', 'verification-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the bucket
-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload files" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'verification-uploads' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow authenticated users to view their own files
CREATE POLICY "Users can view own files" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'verification-uploads' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow public read access (since bucket is public)
CREATE POLICY "Public read access" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'verification-uploads');

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'verification-uploads' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ==============================================
-- USER SCHEDULES TABLE (Custom Timetables)
-- ==============================================

-- 11. Create user_schedules table for custom timetables
CREATE TABLE IF NOT EXISTS user_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Create index for user_schedules
CREATE INDEX IF NOT EXISTS idx_user_schedules_user_id ON user_schedules(user_id);

-- 13. Enable RLS on user_schedules
ALTER TABLE user_schedules ENABLE ROW LEVEL SECURITY;

-- 14. Create RLS policies for user_schedules
CREATE POLICY "Users can view own schedule" ON user_schedules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedule" ON user_schedules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedule" ON user_schedules
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedule" ON user_schedules
    FOR DELETE USING (auth.uid() = user_id);

-- 15. Create trigger for user_schedules updated_at
CREATE TRIGGER update_user_schedules_updated_at
    BEFORE UPDATE ON user_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- GAMIFICATION FEATURES
-- ==============================================

-- 16. User Streaks table
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

-- 17. Create indexes for streaks
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_current ON user_streaks(current_streak DESC);

-- 18. Enable RLS on user_streaks
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- 19. Create RLS policies for user_streaks
CREATE POLICY "Users can view own streak" ON user_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak" ON user_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak" ON user_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- 20. Achievements definition table
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

-- 21. User achievements (unlocked badges)
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES achievements(id),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, achievement_id)
);

-- 22. Create indexes for user_achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned ON user_achievements(earned_at DESC);

-- 23. Enable RLS on user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- 24. Create RLS policies for user_achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 25. Insert default achievements
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

-- 26. Leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
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

-- 27. Create trigger for user_streaks updated_at
CREATE TRIGGER update_user_streaks_updated_at
    BEFORE UPDATE ON user_streaks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
