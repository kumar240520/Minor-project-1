-- Fix existing users who have email prefixes instead of real names
-- Run this in Supabase SQL Editor to manually update users with their actual names

-- 1. First, identify users with email prefixes as names
SELECT 
    id,
    email,
    name,
    full_name,
    'Email prefix detected' as issue
FROM users 
WHERE 
    name = SPLIT_PART(email, '@', 1) 
    OR full_name = SPLIT_PART(email, '@', 1)
    OR name LIKE '0808%'
    OR full_name LIKE '0808%'
ORDER BY created_at DESC;

-- 2. Update specific users with their real names
-- Replace the email and actual name for each user that needs fixing

-- Example for the user from debug info:
-- UPDATE users 
-- SET name = 'John Doe', full_name = 'John Doe'
-- WHERE email = '0808ci231093.ies@ipsacademy.org';

-- Add more updates for other users as needed:
-- UPDATE users 
-- SET name = 'Jane Smith', full_name = 'Jane Smith'
-- WHERE email = 'another-student-email@ipsacademy.org';

-- 3. Update auth.users metadata for the same users
-- This requires admin access to auth.users table
-- You may need to do this through Supabase Dashboard or Admin API

-- Example:
-- UPDATE auth.users 
-- SET raw_user_meta_data = jsonb_set(
--     raw_user_meta_data, 
--     '{name}', 
--     '"John Doe"'
-- )
-- WHERE email = '0808ci231093.ies@ipsacademy.org';

-- UPDATE auth.users 
-- SET raw_user_meta_data = jsonb_set(
--     raw_user_meta_data, 
--     '{full_name}', 
--     '"John Doe"'
-- )
-- WHERE email = '0808ci231093.ies@ipsacademy.org';

-- 4. Verify the fixes
SELECT 
    u.id,
    u.email,
    u.name,
    u.full_name,
    a.raw_user_meta_data
FROM users u
LEFT JOIN auth.users a ON u.id = a.id
WHERE u.email = '0808ci231093.ies@ipsacademy.org';

-- 5. Check all users still showing email prefixes after fixes
SELECT 
    email,
    name,
    full_name,
    CASE 
        WHEN name = SPLIT_PART(email, '@', 1) THEN 'Still has email prefix in name'
        WHEN full_name = SPLIT_PART(email, '@', 1) THEN 'Still has email prefix in full_name'
        ELSE 'Fixed'
    END as status
FROM users 
ORDER BY created_at DESC;
