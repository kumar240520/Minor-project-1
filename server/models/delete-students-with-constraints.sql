-- DELETE STUDENT USERS (FIX FOREIGN KEY CONSTRAINTS)
-- This removes all student users while respecting foreign key constraints

-- ========================================
-- STEP 1: BACKUP ADMIN USERS FIRST
-- ========================================

-- Create a temporary table to backup admin users
CREATE TEMP TABLE admin_backup AS
SELECT * FROM users WHERE role = 'admin';

-- ========================================
-- STEP 2: DELETE RELATED DATA FIRST (RESPECTING FOREIGN KEYS)
-- ========================================

-- Delete resource purchases by student users first
DELETE FROM resource_purchases 
WHERE user_id IN (
    SELECT id FROM users WHERE role != 'admin' OR role IS NULL
);

-- Delete transactions by student users first
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'user_id'
    ) THEN
        DELETE FROM transactions 
        WHERE user_id IN (
            SELECT id FROM users WHERE role != 'admin' OR role IS NULL
        );
    END IF;
END $$;

-- Delete materials uploaded by student users first
DELETE FROM materials 
WHERE uploaded_by IN (
    SELECT id FROM users WHERE role != 'admin' OR role IS NULL
);

-- Delete community posts by student users first
DELETE FROM community_posts 
WHERE user_id IN (
    SELECT id FROM users WHERE role != 'admin' OR role IS NULL
);

-- Delete community replies by student users first
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'community_replies' 
        AND table_schema = 'public'
    ) THEN
        DELETE FROM community_replies 
        WHERE user_id IN (
            SELECT id FROM users WHERE role != 'admin' OR role IS NULL
        );
    END IF;
END $$;

-- Delete calendar events by student users first
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_events' 
        AND column_name = 'created_by'
    ) THEN
        DELETE FROM calendar_events 
        WHERE created_by IN (
            SELECT id FROM users WHERE role != 'admin' OR role IS NULL
        );
    END IF;
END $$;

-- ========================================
-- STEP 3: NOW DELETE STUDENT USERS
-- ========================================

-- Delete all users who are NOT admins (after related data is deleted)
DELETE FROM users 
WHERE role != 'admin' 
OR role IS NULL 
OR email NOT IN (SELECT email FROM admin_backup);

-- ========================================
-- STEP 4: DELETE AUTH USERS (EXCEPT ADMINS)
-- ========================================

-- Delete all auth users except admins
DELETE FROM auth.users 
WHERE email NOT IN (SELECT email FROM admin_backup)
AND email NOT IN (SELECT email FROM users WHERE role = 'admin');

-- ========================================
-- STEP 5: VERIFY DELETION
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
    'All student users and their data have been safely deleted.' as message,
    'Admin users have been preserved for system access.' as note,
    'Foreign key constraints were respected during deletion.' as detail,
    'You can now create fresh test student accounts.' as next_step;
