-- ACCOUNT CREATION FIX: Column Mismatch Resolution
-- This fixes the users table schema mismatch between frontend and database

-- ========================================
-- STEP 1: CHECK CURRENT USERS TABLE STRUCTURE
-- ========================================

-- Show current users table structure
SELECT '=== CURRENT USERS TABLE STRUCTURE ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- STEP 2: ADD MISSING COLUMNS FOR FRONTEND COMPATIBILITY
-- ========================================

-- Add missing columns that frontend expects
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student';
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add coins column if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS coins INT DEFAULT 50 CHECK (coins >= 0);

-- ========================================
-- STEP 3: SYNC COLUMN VALUES
-- ========================================

-- Sync name and full_name columns
UPDATE users 
SET name = COALESCE(full_name, email)
WHERE name IS NULL OR name = '';

UPDATE users 
SET full_name = COALESCE(name, email)
WHERE full_name IS NULL OR full_name = '';

-- Set default role for users without role
UPDATE users 
SET role = 'student'
WHERE role IS NULL OR role = '';

-- Set default coins for users without coins
UPDATE users 
SET coins = 50
WHERE coins IS NULL;

-- ========================================
-- STEP 4: CREATE PROPER RLS POLICIES
-- ========================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create proper RLS policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- ========================================
-- STEP 5: CREATE TRIGGER FOR NEW USER SETUP
-- ========================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert user profile with default values
    INSERT INTO public.users (id, email, full_name, name, role, coins)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'student',
        50
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========================================
-- STEP 6: VERIFICATION
-- ========================================

-- Check if users table is properly structured
SELECT '=== USERS TABLE VERIFICATION ===' as info;
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN full_name IS NOT NULL THEN 1 END) as users_with_full_name,
    COUNT(CASE WHEN name IS NOT NULL THEN 1 END) as users_with_name,
    COUNT(CASE WHEN coins IS NOT NULL THEN 1 END) as users_with_coins
FROM users;

-- Show sample users
SELECT '=== SAMPLE USERS ===' as info;
SELECT 
    id,
    email,
    name,
    full_name,
    role,
    coins,
    created_at,
    updated_at
FROM users 
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- STEP 7: REFRESH SCHEMA
-- ========================================

NOTIFY pgrst, 'reload schema';
