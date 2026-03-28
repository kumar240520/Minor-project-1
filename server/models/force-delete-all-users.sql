-- FORCE DELETE ALL USERS (DEBUG VERSION)
-- This will forcefully delete all users and provide detailed debugging

-- ========================================
-- STEP 1: CHECK CURRENT USERS TABLE
-- ========================================

-- Show current users before deletion
SELECT '=== USERS BEFORE DELETION ===' as info;
SELECT 
    id,
    email,
    role,
    created_at
FROM users 
ORDER BY created_at DESC;

SELECT '=== TOTAL USERS COUNT ===' as info;
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as student_count,
    COUNT(CASE WHEN role IS NULL THEN 1 END) as null_role_count
FROM users;

-- ========================================
-- STEP 2: DISABLE FOREIGN KEY CONSTRAINTS (TEMPORARY)
-- ========================================

-- Drop foreign key constraints temporarily (if they exist)
DO $$
BEGIN
    -- Check and drop transactions foreign key
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'transactions' 
        AND constraint_name LIKE '%user_id%'
    ) THEN
        ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
        RAISE NOTICE 'Dropped transactions foreign key constraint';
    END IF;
    
    -- Check and drop resource_purchases foreign key
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'resource_purchases' 
        AND constraint_name LIKE '%user_id%'
    ) THEN
        ALTER TABLE resource_purchases DROP CONSTRAINT IF EXISTS resource_purchases_user_id_fkey;
        RAISE NOTICE 'Dropped resource_purchases foreign key constraint';
    END IF;
    
    -- Check and drop materials foreign key
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'materials' 
        AND constraint_name LIKE '%uploaded_by%'
    ) THEN
        ALTER TABLE materials DROP CONSTRAINT IF EXISTS materials_uploaded_by_fkey;
        RAISE NOTICE 'Dropped materials foreign key constraint';
    END IF;
END $$;

-- ========================================
-- STEP 3: DELETE ALL USERS (FORCE)
-- ========================================

-- Force delete all users
DELETE FROM users;

-- ========================================
-- STEP 4: DELETE AUTH USERS
-- ========================================

-- Delete all auth users
DELETE FROM auth.users;

-- ========================================
-- STEP 5: DELETE ALL RELATED DATA
-- ========================================

-- Delete all materials (now no foreign key constraints)
DELETE FROM materials;

-- Delete all community posts
DELETE FROM community_posts;

-- Delete all community replies
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'community_replies' 
        AND table_schema = 'public'
    ) THEN
        DELETE FROM community_replies;
    END IF;
END $$;

-- Delete all calendar events
DELETE FROM calendar_events;

-- Delete all resource purchases
DELETE FROM resource_purchases;

-- Delete all transactions
DELETE FROM transactions;

-- ========================================
-- STEP 6: VERIFY COMPLETE DELETION
-- ========================================

-- Verify users table is empty
SELECT '=== USERS AFTER DELETION ===' as info;
SELECT 
    COUNT(*) as users_count,
    CASE WHEN COUNT(*) = 0 THEN 'SUCCESS: Users table is empty' ELSE 'FAILED: Users still exist' END as status
FROM users;

-- Verify auth users table is empty
SELECT '=== AUTH USERS AFTER DELETION ===' as info;
SELECT 
    COUNT(*) as auth_users_count,
    CASE WHEN COUNT(*) = 0 THEN 'SUCCESS: Auth users table is empty' ELSE 'FAILED: Auth users still exist' END as status
FROM auth.users;

-- Verify materials table is empty
SELECT '=== MATERIALS AFTER DELETION ===' as info;
SELECT 
    COUNT(*) as materials_count,
    CASE WHEN COUNT(*) = 0 THEN 'SUCCESS: Materials table is empty' ELSE 'FAILED: Materials still exist' END as status
FROM materials;

-- Verify community posts table is empty
SELECT '=== COMMUNITY POSTS AFTER DELETION ===' as info;
SELECT 
    COUNT(*) as posts_count,
    CASE WHEN COUNT(*) = 0 THEN 'SUCCESS: Community posts table is empty' ELSE 'FAILED: Community posts still exist' END as status
FROM community_posts;

-- ========================================
-- STEP 7: RECREATE FOREIGN KEY CONSTRAINTS
-- ========================================

-- Recreate the foreign key constraints
DO $$
BEGIN
    -- Recreate materials foreign key
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'materials' 
        AND column_name = 'uploaded_by'
    ) THEN
        ALTER TABLE materials 
        ADD CONSTRAINT materials_uploaded_by_fkey 
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Recreated materials foreign key constraint';
    END IF;
    
    -- Recreate resource_purchases foreign key
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'resource_purchases' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE resource_purchases 
        ADD CONSTRAINT resource_purchases_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Recreated resource_purchases foreign key constraint';
    END IF;
    
    -- Recreate transactions foreign key
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE transactions 
        ADD CONSTRAINT transactions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Recreated transactions foreign key constraint';
    END IF;
END $$;

-- ========================================
-- STEP 8: REFRESH SCHEMA
-- ========================================

NOTIFY pgrst, 'reload schema';

-- ========================================
-- STEP 9: FINAL SUMMARY
-- ========================================

SELECT '=== FORCE DELETE COMPLETE ===' as info;
SELECT 
    'All users, auth users, and related data have been forcefully deleted.' as message,
    'Foreign key constraints were temporarily dropped and recreated.' as detail,
    'You can now create fresh test data without any conflicts.' as next_step;
