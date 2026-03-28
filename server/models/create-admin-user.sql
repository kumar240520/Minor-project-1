-- CREATE ADMIN USER
-- This creates a new admin user for system management

-- ========================================
-- STEP 1: CREATE ADMIN USER IN AUTH
-- ========================================

-- Insert admin user into auth.users table
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    phone,
    phone_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_sso_user,
    last_sign_in_at,
    deleted_at
) VALUES (
    gen_random_uuid(),
    'admin@edusure.com',
    timezone('utc', now()),
    NULL,
    NULL,
    NULL,
    timezone('utc', now()),
    timezone('utc', now()),
    '{"name": "Admin User", "full_name": "Admin User", "role": "admin"}',
    false,
    NULL,
    NULL,
    timezone('utc', now())
);

-- ========================================
-- STEP 2: CREATE ADMIN USER IN PUBLIC USERS
-- ========================================

-- Insert admin user into public.users table
INSERT INTO users (
    id,
    email,
    name,
    full_name,
    role,
    coins,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin@edusure.com',
    'Admin User',
    'Admin User',
    'admin',
    1000,
    timezone('utc', now()),
    timezone('utc', now())
);

-- ========================================
-- STEP 3: VERIFY ADMIN USER CREATION
-- ========================================

-- Check if admin user was created in auth.users
SELECT '=== AUTH USERS CHECK ===' as info;
SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'admin@edusure.com';

-- Check if admin user was created in public.users
SELECT '=== PUBLIC USERS CHECK ===' as info;
SELECT 
    id,
    email,
    name,
    role,
    coins,
    created_at
FROM users 
WHERE email = 'admin@edusure.com';

-- Count users by role
SELECT '=== USERS BY ROLE ===' as info;
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
-- STEP 5: LOGIN INFORMATION
-- ========================================

SELECT '=== ADMIN LOGIN INFO ===' as info;
SELECT 
    'Email: admin@edusure.com' as login_email,
    'Password: (Set during first login or reset)' as login_password,
    'Role: admin' as user_role,
    'You can now log in with these credentials.' as next_step;
