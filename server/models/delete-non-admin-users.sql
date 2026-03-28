-- DELETE ALL USERS (EXCEPT ADMINS)
-- This removes all student users but keeps admin users

-- ========================================
-- STEP 1: DELETE ALL NON-ADMIN USERS
-- ========================================

-- Delete all users except those with admin role
DELETE FROM users 
WHERE role != 'admin' OR role IS NULL;

-- ========================================
-- STEP 2: DELETE AUTH USERS (EXCEPT ADMINS)
-- ========================================

-- Delete auth.users entries for non-admin users
-- This removes authentication but keeps admin accounts
DELETE FROM auth.users 
WHERE email NOT IN (
    SELECT email FROM users WHERE role = 'admin'
);

-- ========================================
-- STEP 3: DELETE RELATED DATA FOR DELETED USERS
-- ========================================

-- Delete materials uploaded by deleted users
DELETE FROM materials 
WHERE uploaded_by NOT IN (
    SELECT id FROM users WHERE role = 'admin'
);

-- Delete community posts by deleted users
DELETE FROM community_posts 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE role = 'admin'
);

-- Delete community replies by deleted users
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'community_replies' 
        AND table_schema = 'public'
    ) THEN
        DELETE FROM community_replies 
        WHERE user_id NOT IN (
            SELECT id FROM users WHERE role = 'admin'
        );
    END IF;
END $$;

-- Delete calendar events by deleted users
DELETE FROM calendar_events 
WHERE created_by NOT IN (
    SELECT id FROM users WHERE role = 'admin'
);

-- Delete resource purchases by deleted users
DELETE FROM resource_purchases 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE role = 'admin'
);

-- Delete transactions by deleted users
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'user_id'
    ) THEN
        DELETE FROM transactions 
        WHERE user_id NOT IN (
            SELECT id FROM users WHERE role = 'admin'
        );
    END IF;
END $$;

-- ========================================
-- STEP 4: VERIFICATION
-- ========================================

-- Check remaining users
SELECT '=== USERS TABLE STATUS ===' as info;
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as student_users,
    COUNT(CASE WHEN role IS NULL THEN 1 END) as null_role_users
FROM users;

-- Check remaining auth users
SELECT '=== AUTH USERS STATUS ===' as info;
SELECT 
    COUNT(*) as total_auth_users,
    COUNT(CASE 
        WHEN email IN (SELECT email FROM users WHERE role = 'admin') 
        THEN 1 
    END) as admin_auth_users
FROM auth.users;

-- Check materials status
SELECT '=== MATERIALS STATUS ===' as info;
SELECT 
    COUNT(*) as materials_count,
    CASE WHEN COUNT(*) = 0 THEN 'Only admin materials remain' ELSE 'Some materials still exist' END as status
FROM materials;

-- Check community posts status
SELECT '=== COMMUNITY POSTS STATUS ===' as info;
SELECT 
    COUNT(*) as posts_count,
    CASE WHEN COUNT(*) = 0 THEN 'Only admin posts remain' ELSE 'Some posts still exist' END as status
FROM community_posts;

-- Check calendar events status
SELECT '=== CALENDAR EVENTS STATUS ===' as info;
SELECT 
    COUNT(*) as events_count,
    CASE WHEN COUNT(*) = 0 THEN 'Only admin events remain' ELSE 'Some events still exist' END as status
FROM calendar_events;

-- ========================================
-- STEP 5: REFRESH SCHEMA
-- ========================================

NOTIFY pgrst, 'reload schema';

-- ========================================
-- STEP 6: SUMMARY
-- ========================================

SELECT '=== USER CLEANUP COMPLETE ===' as info;
SELECT 
    'All non-admin users and their data have been successfully deleted.' as message,
    'Admin users have been preserved for system management.' as note,
    'You can now create fresh test data with new student accounts.' as next_step;
