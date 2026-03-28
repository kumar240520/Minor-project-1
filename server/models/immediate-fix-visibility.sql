-- IMMEDIATE FIX for Test Data Visibility
-- Run this NOW to fix all visibility issues

-- ========================================
-- STEP 1: APPROVE ALL MATERIALS IMMEDIATELY
-- ========================================

-- Force approve ALL materials regardless of current status
UPDATE materials 
SET status = 'approved', 
    approved_at = timezone('utc', now())
WHERE uploaded_by IN (SELECT id FROM users WHERE email LIKE '%@test.edu');

-- ========================================
-- STEP 2: ENSURE USER ROLES ARE CORRECT
-- ========================================

-- Ensure all test users have proper student role
UPDATE users 
SET role = 'student' 
WHERE email LIKE '%@test.edu';

-- ========================================
-- STEP 3: SET DEFAULT VALUES FOR NULL FIELDS
-- ========================================

-- Fix any NULL values that might break frontend
UPDATE materials 
SET 
    downloads = COALESCE(downloads, 0),
    views = COALESCE(views, 0),
    subject = COALESCE(subject, 'General'),
    file_type = COALESCE(file_type, 'PDF')
WHERE uploaded_by IN (SELECT id FROM users WHERE email LIKE '%@test.edu');

-- Fix community posts with NULL values
UPDATE community_posts 
SET 
    likes = COALESCE(likes, 0),
    replies = COALESCE(replies, 0),
    author_name = COALESCE(author_name, 'Test Student'),
    author_role = COALESCE(author_role, 'Student')
WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.edu');

-- ========================================
-- STEP 4: CREATE SAMPLE DATA IF MISSING
-- ========================================

-- If no materials exist, create simple ones
INSERT INTO materials (id, title, description, subject, file_url, uploaded_by, status, downloads, created_at)
SELECT 
    gen_random_uuid(),
    'Test Material ' || generate_series(1, 5),
    'Test material for testing purposes',
    'Test Subject',
    'https://test-files.edu/test.pdf',
    (SELECT id FROM users WHERE email LIKE '%@test.edu' LIMIT 1),
    'approved',
    0,
    timezone('utc', now())
WHERE NOT EXISTS (
    SELECT 1 FROM materials 
    WHERE uploaded_by IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
    LIMIT 1
)
ON CONFLICT DO NOTHING;

-- If no community posts exist, create simple ones
INSERT INTO community_posts (id, user_id, title, content, created_at, author_name, tags, likes)
SELECT 
    gen_random_uuid(),
    (SELECT id FROM users WHERE email LIKE '%@test.edu' LIMIT 1),
    'Test Post ' || generate_series(1, 3),
    'This is a test post for testing purposes',
    timezone('utc', now()),
    'Test Student',
    ARRAY['test'],
    0
WHERE NOT EXISTS (
    SELECT 1 FROM community_posts 
    WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
    LIMIT 1
)
ON CONFLICT DO NOTHING;

-- ========================================
-- STEP 5: IMMEDIATE VERIFICATION
-- ========================================

-- Quick check to confirm data exists
SELECT '=== IMMEDIATE VERIFICATION ===' as info;

SELECT 'MATERIALS CHECK: ' || COUNT(*) || ' materials found' as result
FROM materials 
WHERE uploaded_by IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
AND status = 'approved';

SELECT 'COMMUNITY POSTS CHECK: ' || COUNT(*) || ' posts found' as result
FROM community_posts 
WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.edu');

SELECT 'USERS CHECK: ' || COUNT(*) || ' users found' as result
FROM users 
WHERE email LIKE '%@test.edu';

-- ========================================
-- STEP 6: REFRESH SCHEMA
-- ========================================

NOTIFY pgrst, 'reload schema';

-- ========================================
-- STEP 7: FRONTEND DEBUGGING HELP
-- ========================================

-- Show exact data structure for frontend debugging
SELECT '=== FRONTEND DEBUGGING INFO ===' as info;

SELECT 'Materials Data Structure:' as info;
SELECT 
    id,
    title,
    status,
    subject,
    downloads,
    views,
    uploaded_by,
    created_at
FROM materials 
WHERE uploaded_by IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
AND status = 'approved'
ORDER BY created_at DESC
LIMIT 3;

SELECT 'Community Posts Data Structure:' as info;
SELECT 
    id,
    title,
    author_name,
    likes,
    user_id,
    created_at
FROM community_posts 
WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
ORDER BY created_at DESC
LIMIT 3;

SELECT 'Users Data Structure:' as info;
SELECT 
    id,
    email,
    name,
    role,
    coins,
    created_at
FROM users 
WHERE email LIKE '%@test.edu'
ORDER BY created_at DESC
LIMIT 3;
