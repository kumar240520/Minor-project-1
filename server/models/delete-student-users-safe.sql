-- DELETE ALL STUDENT USERS (KEEP ADMINS)
-- This removes all regular users but preserves admin accounts

-- ========================================
-- STEP 1: BACKUP ADMIN USERS FIRST
-- ========================================

-- Create a temporary table to backup admin users
CREATE TEMP TABLE admin_backup AS
SELECT * FROM users WHERE role = 'admin';

-- ========================================
-- STEP 2: DELETE ALL STUDENT USERS
-- ========================================

-- Delete all users who are NOT admins
DELETE FROM users 
WHERE role != 'admin' 
OR role IS NULL 
OR email NOT IN (SELECT email FROM admin_backup);

-- ========================================
-- STEP 3: DELETE AUTH USERS (EXCEPT ADMINS)
-- ========================================

-- Delete all auth users except admins
DELETE FROM auth.users 
WHERE email NOT IN (SELECT email FROM admin_backup)
AND email NOT IN (SELECT email FROM users WHERE role = 'admin');

-- ========================================
-- STEP 4: DELETE RELATED DATA FOR DELETED USERS
-- ========================================

-- Delete materials uploaded by deleted users
DELETE FROM materials 
WHERE uploaded_by NOT IN (SELECT id FROM admin_backup);

-- Delete community posts by deleted users
DELETE FROM community_posts 
WHERE user_id NOT IN (SELECT id FROM admin_backup);

-- Delete community replies by deleted users
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'community_replies' 
        AND table_schema = 'public'
    ) THEN
        DELETE FROM community_replies 
        WHERE user_id NOT IN (SELECT id FROM admin_backup);
    END IF;
END $$;

-- Delete calendar events by deleted users
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_events' 
        AND column_name = 'created_by'
    ) THEN
        DELETE FROM calendar_events 
        WHERE created_by NOT IN (SELECT id FROM admin_backup);
    END IF;
END $$;

-- Delete resource purchases by deleted users
DELETE FROM resource_purchases 
WHERE user_id NOT IN (SELECT id FROM admin_backup);

-- Delete transactions by deleted users
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'user_id'
    ) THEN
        DELETE FROM transactions 
        WHERE user_id NOT IN (SELECT id FROM admin_backup);
    END IF;
END $$;

-- ========================================
-- STEP 5: VERIFY ADMIN USERS ARE PRESERVED
-- ========================================

-- Check current users table
SELECT '=== CURRENT USERS TABLE ===' as info;
SELECT 
    id,
    email,
    name,
    role,
    created_at
FROM users 
ORDER BY role DESC, created_at ASC;

-- Count users by role
SELECT '=== USERS BY ROLE COUNT ===' as info;
SELECT 
    role,
    COUNT(*) as count
FROM users 
GROUP BY role
ORDER BY role;

-- Check auth users
SELECT '=== CURRENT AUTH USERS ===' as info;
SELECT 
    id,
    email,
    created_at,
    CASE 
        WHEN email IN (SELECT email FROM admin_backup) THEN 'PRESERVED ADMIN'
        ELSE 'SHOULD BE DELETED'
    END as status
FROM auth.users 
ORDER BY created_at ASC;

-- ========================================
-- STEP 6: CLEANUP AND REFRESH
-- ========================================

-- Drop the temporary backup table
DROP TABLE IF EXISTS admin_backup;

-- Refresh schema
NOTIFY pgrst, 'reload schema';

-- ========================================
-- STEP 7: FINAL SUMMARY
-- ========================================

SELECT '=== STUDENT USER DELETION COMPLETE ===' as info;
SELECT 
    'All student users and their data have been deleted.' as message,
    'Admin users have been preserved for system access.' as note,
    'You can now create fresh test student accounts.' as next_step;
