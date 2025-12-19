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
