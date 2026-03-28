-- Test script to verify display name functionality
-- Run this in Supabase SQL Editor to check if user names are stored correctly

-- Check the current users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check existing users and their names
SELECT 
    id, 
    email, 
    name, 
    full_name, 
    role, 
    created_at
FROM users 
ORDER BY created_at DESC;

-- Check if there are any users with null/empty names
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN name IS NULL OR name = '' THEN 1 END) as users_with_null_name,
    COUNT(CASE WHEN full_name IS NULL OR full_name = '' THEN 1 END) as users_with_null_full_name,
    COUNT(CASE WHEN (name IS NULL OR name = '') AND (full_name IS NULL OR full_name = '') THEN 1 END) as users_with_no_name
FROM users;

-- Test the getDisplayName function logic by simulating it in SQL
SELECT 
    id,
    email,
    name,
    full_name,
    COALESCE(
        NULLIF(TRIM(name), ''),
        NULLIF(TRIM(full_name), ''),
        SPLIT_PART(email, '@', 1),
        'Student'
    ) AS computed_display_name
FROM users
ORDER BY created_at DESC;
