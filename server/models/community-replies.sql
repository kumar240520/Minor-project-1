-- Community Replies Table for EduSure
-- Run this script in Supabase SQL Editor to create the community_replies table

CREATE TABLE IF NOT EXISTS community_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_role TEXT DEFAULT 'Student',
    author_avatar TEXT,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Enable Row Level Security
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;

-- Create policies for community_replies
-- 1. Users can view all replies
CREATE POLICY "Allow public read access to community replies" ON community_replies
    FOR SELECT USING (true);

-- 2. Users can insert their own replies
CREATE POLICY "Allow users to create replies" ON community_replies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own replies
CREATE POLICY "Allow users to update own replies" ON community_replies
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. Users can delete their own replies
CREATE POLICY "Allow users to delete own replies" ON community_replies
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Admins can do everything
CREATE POLICY "Admins have full access to community replies" ON community_replies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_replies_post_id ON community_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_community_replies_user_id ON community_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_community_replies_created_at ON community_replies(created_at);

-- Function to update reply count when a reply is added
CREATE OR REPLACE FUNCTION update_post_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts 
        SET replies = (SELECT COUNT(*) FROM community_replies WHERE post_id = NEW.post_id)
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts 
        SET replies = (SELECT COUNT(*) FROM community_replies WHERE post_id = OLD.post_id)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update reply count
CREATE TRIGGER update_reply_count_on_insert
    AFTER INSERT ON community_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_post_reply_count();

CREATE TRIGGER update_reply_count_on_delete
    AFTER DELETE ON community_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_post_reply_count();

-- Trigger to automatically update updated_at
CREATE TRIGGER update_community_replies_updated_at 
    BEFORE UPDATE ON community_replies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
