-- FINAL FIX: Set Correct Type Field for PYQ Materials
-- This fixes the API filtering issue

-- ========================================
-- STEP 1: UPDATE PYQ MATERIALS TO HAVE CORRECT TYPE
-- ========================================

-- Update materials with PYQ category to have correct type field
UPDATE materials 
SET type = 'pyq'
WHERE category = 'PYQ' 
OR title LIKE '%PYQ%'
OR subject = 'Previous Year Questions';

-- Update materials with PYQ in title to have correct type
UPDATE materials 
SET type = 'pyq'
WHERE title LIKE '%PYQ%'
AND type IS NULL;

-- Update materials with exam-related content to have correct type
UPDATE materials 
SET type = 'pyq'
WHERE (subject LIKE '%Previous Year%' OR description LIKE '%exam%' OR description LIKE '%question%')
AND (category = 'PYQ' OR title LIKE '%PYQ%')
AND type IS NULL;

-- ========================================
-- STEP 2: UPDATE MATERIALS TO HAVE CORRECT CATEGORY
-- ========================================

-- Ensure all materials have proper category
UPDATE materials 
SET category = CASE
    WHEN title LIKE '%PYQ%' OR subject LIKE '%Previous Year%' THEN 'PYQ'
    WHEN title LIKE '%Data Structure%' OR title LIKE '%Algorithm%' THEN 'Computer Science'
    WHEN title LIKE '%Thermodynamics%' OR title LIKE '%Circuit%' THEN 'Engineering'
    WHEN title LIKE '%Marketing%' OR title LIKE '%Accounting%' THEN 'Business'
    WHEN title LIKE '%Biology%' OR title LIKE '%Physics%' OR title LIKE '%Chemistry%' THEN 'Science'
    ELSE 'General'
END
WHERE uploaded_by IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
AND category IS NULL;

-- ========================================
-- STEP 3: VERIFICATION
-- ========================================

-- Check PYQ materials with correct type
SELECT '=== PYQ MATERIALS (TYPE = pyq) ===' as info;
SELECT 
    id,
    title,
    type,
    category,
    status,
    created_at
FROM materials 
WHERE type = 'pyq'
AND status = 'approved'
ORDER BY created_at DESC;

-- Check all materials with their types
SELECT '=== ALL MATERIALS BY TYPE ===' as info;
SELECT 
    type,
    COUNT(*) as count,
    STRING_AGG(title, ', ' LIMIT 3) as examples
FROM materials 
WHERE uploaded_by IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
GROUP BY type
ORDER BY type;

-- Check materials by category
SELECT '=== ALL MATERIALS BY CATEGORY ===' as info;
SELECT 
    category,
    COUNT(*) as count,
    STRING_AGG(title, ', ' LIMIT 3) as examples
FROM materials 
WHERE uploaded_by IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
GROUP BY category
ORDER BY category;

-- ========================================
-- STEP 4: REFRESH SCHEMA
-- ========================================

NOTIFY pgrst, 'reload schema';
