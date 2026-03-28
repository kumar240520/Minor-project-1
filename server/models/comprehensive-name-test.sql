-- Comprehensive test script for name storage and retrieval
-- Run this in Supabase SQL Editor to debug the name display issues

-- 1. Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Show all users with their current name storage
SELECT 
    id,
    email,
    name,
    full_name,
    role,
    created_at,
    updated_at,
    -- Simulate the getDisplayName function logic
    CASE 
        WHEN name IS NOT NULL AND TRIM(name) != '' THEN TRIM(name)
        WHEN full_name IS NOT NULL AND TRIM(full_name) != '' THEN TRIM(full_name)
        ELSE 'Student'
    END as computed_display_name
FROM users 
ORDER BY created_at DESC;

-- 3. Check for users with problematic name storage
SELECT 
    id,
    email,
    name,
    full_name,
    CASE 
        WHEN name IS NULL THEN 'name is NULL'
        WHEN TRIM(name) = '' THEN 'name is empty'
        WHEN full_name IS NULL THEN 'full_name is NULL'
        WHEN TRIM(full_name) = '' THEN 'full_name is empty'
        ELSE 'Both names seem OK'
    END as issue_description
FROM users 
WHERE name IS NULL 
   OR TRIM(name) = ''
   OR full_name IS NULL 
   OR TRIM(full_name) = ''
ORDER BY created_at DESC;

-- 4. Test update operation to see if we can fix existing users
-- This is a test - uncomment to run
-- UPDATE users 
-- SET name = 'Test User', full_name = 'Test User'
-- WHERE email = 'test@example.com';

-- 5. Check if there are any RLS policies that might be blocking updates
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 6. Check current auth.users metadata (if accessible)
-- This might not work due to permissions, but worth trying
SELECT 
    id,
    email,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;

-- 7. Sample query to test what the frontend would see
SELECT 
    u.id,
    u.email,
    u.name,
    u.full_name,
    -- This simulates what getDisplayName would return
    COALESCE(
        NULLIF(TRIM(u.name), ''),
        NULLIF(TRIM(u.full_name), ''),
        'Student'
    ) as frontend_display_name
FROM users u
WHERE u.email = 'your-test-email@example.com'; -- Replace with actual email

-- 8. Check for any triggers that might be affecting name storage
SELECT 
    event_object_table,
    trigger_name,
    action_timing,
    action_condition,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users'
ORDER BY trigger_name;
