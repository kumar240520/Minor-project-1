-- Community Posts Table for EduSure
-- Run this script in Supabase SQL Editor to create the community_posts table

CREATE TABLE IF NOT EXISTS community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_role TEXT DEFAULT 'Student',
    author_avatar TEXT,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    likes INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Enable Row Level Security
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for community_posts
-- 1. Users can view all posts
CREATE POLICY "Allow public read access to community posts" ON community_posts
    FOR SELECT USING (true);

-- 2. Users can insert their own posts
CREATE POLICY "Allow users to create posts" ON community_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own posts
CREATE POLICY "Allow users to update own posts" ON community_posts
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. Users can delete their own posts
CREATE POLICY "Allow users to delete own posts" ON community_posts
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Admins can do everything
CREATE POLICY "Admins have full access to community posts" ON community_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_community_posts_updated_at 
    BEFORE UPDATE ON community_posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
