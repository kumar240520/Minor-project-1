-- SIMPLE AND EFFECTIVE FIX: Set All Required Fields for Test Data
-- This ensures ALL test data has correct type and category fields

-- ========================================
-- STEP 1: UPDATE MATERIALS TYPE FIELD
-- ========================================

-- Update ALL test materials to have correct type based on content
UPDATE materials 
SET type = CASE
    WHEN title LIKE '%PYQ%' OR subject LIKE '%Previous Year%' OR category = 'PYQ' THEN 'pyq'
    WHEN title LIKE '%Data Structure%' OR title LIKE '%Algorithm%' OR subject LIKE '%Data Structure%' OR subject LIKE '%Algorithm%' THEN 'material'
    WHEN title LIKE '%Thermodynamics%' OR title LIKE '%Circuit%' OR subject LIKE '%Thermodynamics%' OR subject LIKE '%Circuit%' THEN 'material'
    WHEN title LIKE '%Marketing%' OR title LIKE '%Accounting%' OR subject LIKE '%Marketing%' OR subject LIKE '%Accounting%' THEN 'material'
    WHEN title LIKE '%Biology%' OR title LIKE '%Physics%' OR title LIKE '%Chemistry%' OR subject LIKE '%Biology%' OR subject LIKE '%Physics%' OR subject LIKE '%Chemistry%' THEN 'material'
    WHEN title LIKE '%Digital Art%' OR subject LIKE '%Digital%' THEN 'material'
    ELSE 'material'
END
WHERE uploaded_by IN (SELECT id FROM users WHERE email LIKE '%@test.edu');

-- ========================================
-- STEP 2: UPDATE MATERIALS CATEGORY FIELD
-- ========================================

-- Update categories for better organization
UPDATE materials 
SET category = CASE
    WHEN title LIKE '%PYQ%' OR subject LIKE '%Previous Year%' THEN 'PYQ'
    WHEN title LIKE '%Data Structure%' OR title LIKE '%Algorithm%' OR subject LIKE '%Data Structure%' OR subject LIKE '%Algorithm%' THEN 'Computer Science'
    WHEN title LIKE '%Thermodynamics%' OR title LIKE '%Circuit%' OR subject LIKE '%Thermodynamics%' OR subject LIKE '%Circuit%' THEN 'Engineering'
    WHEN title LIKE '%Marketing%' OR title LIKE '%Accounting%' OR subject LIKE '%Marketing%' OR subject LIKE '%Accounting%' THEN 'Business'
    WHEN title LIKE '%Biology%' OR title LIKE '%Physics%' OR title LIKE '%Chemistry%' OR subject LIKE '%Biology%' OR subject LIKE '%Physics%' OR subject LIKE '%Chemistry%' THEN 'Science'
    WHEN title LIKE '%Digital Art%' OR subject LIKE '%Digital%' THEN 'Arts'
    ELSE 'General'
END
WHERE uploaded_by IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
AND category IS NULL;

-- ========================================
-- STEP 3: CREATE PYQ MATERIALS IF NEEDED
-- ========================================

-- Insert PYQ materials if they don't exist
INSERT INTO materials (id, title, description, subject, file_url, uploaded_by, status, downloads, created_at, views, type, category) VALUES
(gen_random_uuid(), 'PYQ - Computer Science 2023', 'Previous Year Questions for Computer Science 2023 exam with detailed solutions', 'Computer Science', 'https://test-files.edu/pyq-cs-2023.pdf', (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), 'approved', 25, timezone('utc', now()), 50, 'pyq', 'PYQ'),
(gen_random_uuid(), 'PYQ - Mathematics 2023', 'Previous Year Questions for Mathematics 2023 exam with step-by-step solutions', 'Mathematics', 'https://test-files.edu/pyq-math-2023.pdf', (SELECT id FROM users WHERE email = 'bob.smith@cs.test.edu' LIMIT 1), 'approved', 30, timezone('utc', now()), 60, 'pyq', 'PYQ'),
(gen_random_uuid(), 'PYQ - Physics 2023', 'Previous Year Questions for Physics 2023 exam with numerical problems and solutions', 'Physics', 'https://test-files.edu/pyq-physics-2023.pdf', (SELECT id FROM users WHERE email = 'charlie.brown@cs.test.edu' LIMIT 1), 'approved', 35, timezone('utc', now()), 45, 'pyq', 'PYQ')
ON CONFLICT DO NOTHING;

-- ========================================
-- STEP 4: CREATE REGULAR MATERIALS IF NEEDED
-- ========================================

-- Insert regular materials if they don't exist
INSERT INTO materials (id, title, description, subject, file_url, uploaded_by, status, downloads, created_at, views, type, category) VALUES
(gen_random_uuid(), 'Web Development Complete Guide', 'Complete web development guide with HTML, CSS, JavaScript, React, and Node.js tutorials', 'Web Development', 'https://test-files.edu/web-dev-complete.pdf', (SELECT id FROM users WHERE email = 'eva.davis@cs.test.edu' LIMIT 1), 'approved', 55, timezone('utc', now()), 70, 'material', 'Computer Science'),
(gen_random_uuid(), 'Engineering Mathematics', 'Mathematical concepts for engineering students including calculus, linear algebra, and differential equations', 'Mathematics', 'https://test-files.edu/eng-math.pdf', (SELECT id FROM users WHERE email = 'frank.miller@eng.test.edu' LIMIT 1), 'approved', 40, timezone('utc', now()), 65, 'material', 'Engineering'),
(gen_random_uuid(), 'Business Communication', 'Professional business communication skills and presentation techniques', 'Business', 'https://test-files.edu/business-comm.pdf', (SELECT id FROM users WHERE email = 'kate.white@bus.test.edu' LIMIT 1), 'approved', 32, timezone('utc', now()), 48, 'material', 'Business')
ON CONFLICT DO NOTHING;

-- ========================================
-- STEP 5: SIMPLE VERIFICATION
-- ========================================

-- Check PYQ materials specifically
SELECT '=== PYQ MATERIALS CHECK ===' as info;
SELECT 
    COUNT(*) as pyq_count
FROM materials 
WHERE type = 'pyq' 
AND status = 'approved'
AND uploaded_by IN (SELECT id FROM users WHERE email LIKE '%@test.edu');

-- Check regular materials specifically
SELECT '=== REGULAR MATERIALS CHECK ===' as info;
SELECT 
    COUNT(*) as material_count
FROM materials 
WHERE type = 'material' 
AND status = 'approved'
AND uploaded_by IN (SELECT id FROM users WHERE email LIKE '%@test.edu');

-- Check community posts
SELECT '=== COMMUNITY POSTS CHECK ===' as info;
SELECT 
    COUNT(*) as post_count
FROM community_posts 
WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.edu');

-- Show sample materials for debugging
SELECT '=== SAMPLE MATERIALS ===' as info;
SELECT 
    id,
    title,
    type,
    category,
    status,
    created_at
FROM materials 
WHERE uploaded_by IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- STEP 6: REFRESH SCHEMA
-- ========================================

NOTIFY pgrst, 'reload schema';
