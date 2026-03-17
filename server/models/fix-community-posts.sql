-- Fix missing columns in community_posts table
-- Run this script in Supabase SQL Editor to add missing columns

-- First, let's check if the table exists and add missing columns
ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS author_name TEXT NOT NULL DEFAULT 'Anonymous Student';

ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS author_role TEXT DEFAULT 'Student';

ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS author_avatar TEXT;

ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS replies INTEGER DEFAULT 0;

-- If you need to update existing rows that might have NULL values
UPDATE community_posts 
SET author_name = 'Anonymous Student' 
WHERE author_name IS NULL;

UPDATE community_posts 
SET author_role = 'Student' 
WHERE author_role IS NULL;

UPDATE community_posts 
SET tags = '{}' 
WHERE tags IS NULL;

UPDATE community_posts 
SET likes = 0 
WHERE likes IS NULL;

UPDATE community_posts 
SET replies = 0 
WHERE replies IS NULL;

-- Refresh the schema cache (this helps Supabase recognize new columns)
NOTIFY pgrst, 'reload schema';
