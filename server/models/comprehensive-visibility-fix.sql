-- COMPREHENSIVE FIX for PYQ & Materials Visibility
-- This addresses API filtering, RLS policies, and data structure issues

-- ========================================
-- STEP 1: DISABLE RLS TEMPORARILY FOR DEBUGGING
-- ========================================

-- Disable RLS on materials to check if policies are blocking
ALTER TABLE materials DISABLE ROW LEVEL SECURITY;

-- Disable RLS on community posts to check if policies are blocking
ALTER TABLE community_posts DISABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 2: CREATE UNIVERSAL TEST DATA (NO FILTERING)
-- ========================================

-- Create materials that should be visible to ALL users
INSERT INTO materials (id, title, description, subject, file_url, uploaded_by, status, downloads, created_at, views) VALUES
(gen_random_uuid(), 'Universal Test Material 1', 'This material should be visible to all users regardless of filtering', 'Universal', 'https://test-files.edu/universal1.pdf', (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), 'approved', 10, timezone('utc', now()), 25),
(gen_random_uuid(), 'Universal Test Material 2', 'Another universal material for testing visibility across all user types', 'Universal', 'https://test-files.edu/universal2.pdf', (SELECT id FROM users WHERE email = 'bob.smith@cs.test.edu' LIMIT 1), 'approved', 15, timezone('utc', now()), 30),
(gen_random_uuid(), 'Universal Test Material 3', 'Third universal test material to ensure visibility', 'Universal', 'https://test-files.edu/universal3.pdf', (SELECT id FROM users WHERE email = 'charlie.brown@cs.test.edu' LIMIT 1), 'approved', 20, timezone('utc', now()), 40)
ON CONFLICT DO NOTHING;

-- Create community posts that should be visible to ALL users
INSERT INTO community_posts (id, user_id, title, content, created_at, author_name, tags, likes, replies) VALUES
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), 'Universal Test Post 1', 'This post should be visible to all users regardless of filtering', timezone('utc', now()), 'Alice Johnson', ARRAY['universal', 'test'], 5, 2),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'bob.smith@cs.test.edu' LIMIT 1), 'Universal Test Post 2', 'Another universal post for testing visibility across all user types', timezone('utc', now()), 'Bob Smith', ARRAY['universal', 'debug'], 8, 3)
ON CONFLICT DO NOTHING;

-- ========================================
-- STEP 3: FIX COMMON FRONTEND FILTERING ISSUES
-- ========================================

-- Ensure materials have all fields that frontend might expect
UPDATE materials 
SET 
    views = COALESCE(views, 0),
    downloads = COALESCE(downloads, 0),
    subject = COALESCE(subject, 'Test Subject'),
    file_type = COALESCE(file_type, 'PDF'),
    file_name = COALESCE(file_name, 'test.pdf'),
    uploader_name = COALESCE(uploader_name, (SELECT name FROM users WHERE id = materials.uploaded_by LIMIT 1)),
    material_type = COALESCE(material_type, 'document'),
    category = COALESCE(category, 'Test'),
    price = COALESCE(price, 10)
WHERE uploaded_by IN (SELECT id FROM users WHERE email LIKE '%@test.edu');

-- Ensure community posts have all fields frontend might expect
UPDATE community_posts 
SET 
    likes = COALESCE(likes, 0),
    replies = COALESCE(replies, 0),
    author_avatar = COALESCE(author_avatar, 'https://api.dicebear.com/7.x/avataaars/svg?seed=test'),
    author_role = COALESCE(author_role, 'Student')
WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.edu');

-- ========================================
-- STEP 4: CREATE PYQ SPECIFIC DATA
-- ========================================

-- Create PYQ materials with specific naming
INSERT INTO materials (id, title, description, subject, file_url, uploaded_by, status, downloads, created_at, views, category) VALUES
(gen_random_uuid(), 'PYQ - Computer Science 2023', 'Previous Year Questions for Computer Science 2023 exam', 'Computer Science', 'https://test-files.edu/pyq-cs-2023.pdf', (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), 'approved', 50, timezone('utc', now()), 100, 'PYQ'),
(gen_random_uuid(), 'PYQ - Mathematics 2023', 'Previous Year Questions for Mathematics 2023 exam', 'Mathematics', 'https://test-files.edu/pyq-math-2023.pdf', (SELECT id FROM users WHERE email = 'bob.smith@cs.test.edu' LIMIT 1), 'approved', 45, timezone('utc', now()), 90, 'PYQ'),
(gen_random_uuid(), 'PYQ - Physics 2023', 'Previous Year Questions for Physics 2023 exam', 'Physics', 'https://test-files.edu/pyq-physics-2023.pdf', (SELECT id FROM users WHERE email = 'charlie.brown@cs.test.edu' LIMIT 1), 'approved', 40, timezone('utc', now()), 80, 'PYQ')
ON CONFLICT DO NOTHING;

-- ========================================
-- STEP 5: COMPREHENSIVE VERIFICATION
-- ========================================

-- Show ALL materials without any filtering
SELECT '=== ALL MATERIALS (NO FILTERING) ===' as info;
SELECT 
    id,
    title,
    status,
    subject,
    category,
    downloads,
    views,
    uploaded_by,
    created_at
FROM materials 
ORDER BY created_at DESC;

-- Show ALL community posts without any filtering
SELECT '=== ALL COMMUNITY POSTS (NO FILTERING) ===' as info;
SELECT 
    id,
    title,
    author_name,
    likes,
    replies,
    user_id,
    created_at
FROM community_posts 
ORDER BY created_at DESC;

-- Show test users
SELECT '=== TEST USERS ===' as info;
SELECT 
    id,
    email,
    name,
    role,
    coins,
    created_at
FROM users 
WHERE email LIKE '%@test.edu'
ORDER BY created_at DESC;

-- ========================================
-- STEP 6: RE-ENABLE RLS WITH PERMISSIVE POLICIES
-- ========================================

-- Re-enable RLS
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Create permissive RLS policies (allow all authenticated users)
DROP POLICY IF EXISTS "materials_select_policy" ON materials;
CREATE POLICY "materials_select_policy" ON materials
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "community_posts_select_policy" ON community_posts;
CREATE POLICY "community_posts_select_policy" ON community_posts
    FOR SELECT USING (auth.role() = 'authenticated');

-- ========================================
-- STEP 7: API ENDPOINT TESTING
-- ========================================

-- Create view that matches typical API responses
CREATE OR REPLACE VIEW api_materials AS
SELECT 
    m.id,
    m.title,
    m.description,
    m.subject,
    m.file_url,
    m.downloads,
    m.views,
    m.created_at,
    m.status,
    u.name as uploader_name,
    u.email as uploader_email,
    u.role as uploader_role
FROM materials m
LEFT JOIN users u ON m.uploaded_by = u.id
WHERE m.status = 'approved'
ORDER BY m.created_at DESC;

CREATE OR REPLACE VIEW api_community_posts AS
SELECT 
    cp.id,
    cp.title,
    cp.content,
    cp.author_name,
    cp.likes,
    cp.replies,
    cp.created_at,
    u.email as author_email,
    u.role as author_role
FROM community_posts cp
LEFT JOIN users u ON cp.user_id = u.id
ORDER BY cp.created_at DESC;

-- ========================================
-- STEP 8: FINAL VERIFICATION
-- ========================================

-- Test the views
SELECT '=== API VIEW TEST ===' as info;
SELECT 'Materials in API View: ' || COUNT(*) as result FROM api_materials;
SELECT 'Community Posts in API View: ' || COUNT(*) as result FROM api_community_posts;

-- ========================================
-- STEP 9: REFRESH SCHEMA
-- ========================================

NOTIFY pgrst, 'reload schema';
