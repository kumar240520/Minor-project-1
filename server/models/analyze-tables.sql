-- ========================================
-- ANALYZE TABLE STRUCTURES FIRST
-- ========================================

-- Check users table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check materials table structure  
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'materials' 
ORDER BY ordinal_position;

-- Check community_posts table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'community_posts' 
ORDER BY ordinal_position;

-- Check calendar_events table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'calendar_events' 
ORDER BY ordinal_position;

-- Check transactions table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;

-- Check resource_purchases table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'resource_purchases' 
ORDER BY ordinal_position;
