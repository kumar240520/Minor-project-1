-- UPDATE EXISTING USER TO ADMIN ROLE
-- This changes an existing user's role to admin

-- ========================================
-- STEP 1: UPDATE USER TO ADMIN ROLE
-- ========================================

-- Update a specific user to admin role
-- Replace 'your-email@example.com' with the actual email you want to make admin
UPDATE users 
SET 
    role = 'admin',
    updated_at = timezone('utc', now())
WHERE email = 'your-email@example.com';

-- Alternative: Update first user to admin (if you don't know the email)
UPDATE users 
SET 
    role = 'admin',
    updated_at = timezone('utc', now())
WHERE id = (
    SELECT id FROM users ORDER BY created_at ASC LIMIT 1
);

-- ========================================
-- STEP 2: UPDATE AUTH USER METADATA
-- ========================================

-- Update auth user metadata to reflect admin role
UPDATE auth.users 
SET 
    raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}')::jsonb,
        '{"role": "admin"}'::jsonb,
        true
    ),
    updated_at = timezone('utc', now())
WHERE email = 'your-email@example.com';

-- Alternative: Update first auth user
UPDATE auth.users 
SET 
    raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}')::jsonb,
        '{"role": "admin"}'::jsonb,
        true
    ),
    updated_at = timezone('utc', now())
WHERE id = (
    SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1
);

-- ========================================
-- STEP 3: VERIFICATION
-- ========================================

-- Check updated user
SELECT '=== UPDATED USER CHECK ===' as info;
SELECT 
    id,
    email,
    name,
    role,
    updated_at
FROM users 
WHERE email = 'your-email@example.com';

-- Alternative: Check first user if email not found
SELECT '=== FIRST USER CHECK ===' as info;
SELECT 
    id,
    email,
    name,
    role,
    updated_at
FROM users 
WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);

-- Count users by role
SELECT '=== USERS BY ROLE COUNT ===' as info;
SELECT 
    role,
    COUNT(*) as count
FROM users 
GROUP BY role
ORDER BY role;

-- ========================================
-- STEP 4: REFRESH SCHEMA
-- ========================================

NOTIFY pgrst, 'reload schema';

-- ========================================
-- STEP 5: INSTRUCTIONS
-- ========================================

SELECT '=== ADMIN UPDATE INSTRUCTIONS ===' as info;
SELECT 
    'Replace your-email@example.com with the actual email in the script above.' as step1,
    'OR run the script as-is to make the first user admin.' as step2,
    'After running, the user will have admin privileges.' as step3,
    'Network issues should be resolved by checking your internet connection.' as step4;
