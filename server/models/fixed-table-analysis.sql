-- ========================================
-- COMPLETE TABLE STRUCTURE ANALYSIS
-- ========================================

-- Users table structure
SELECT 
    'users' as table_name,
    json_agg(
        json_build_object(
            'column_name', column_name,
            'data_type', data_type,
            'is_nullable', is_nullable,
            'column_default', column_default
        ) ORDER BY ordinal_position
    ) as columns
FROM information_schema.columns 
WHERE table_name = 'users' 

UNION ALL

-- Materials table structure
SELECT 
    'materials' as table_name,
    json_agg(
        json_build_object(
            'column_name', column_name,
            'data_type', data_type,
            'is_nullable', is_nullable,
            'column_default', column_default
        ) ORDER BY ordinal_position
    ) as columns
FROM information_schema.columns 
WHERE table_name = 'materials' 

UNION ALL

-- Community posts table structure
SELECT 
    'community_posts' as table_name,
    json_agg(
        json_build_object(
            'column_name', column_name,
            'data_type', data_type,
            'is_nullable', is_nullable,
            'column_default', column_default
        ) ORDER BY ordinal_position
    ) as columns
FROM information_schema.columns 
WHERE table_name = 'community_posts' 

UNION ALL

-- Calendar events table structure
SELECT 
    'calendar_events' as table_name,
    json_agg(
        json_build_object(
            'column_name', column_name,
            'data_type', data_type,
            'is_nullable', is_nullable,
            'column_default', column_default
        ) ORDER BY ordinal_position
    ) as columns
FROM information_schema.columns 
WHERE table_name = 'calendar_events' 

UNION ALL

-- Transactions table structure
SELECT 
    'transactions' as table_name,
    json_agg(
        json_build_object(
            'column_name', column_name,
            'data_type', data_type,
            'is_nullable', is_nullable,
            'column_default', column_default
        ) ORDER BY ordinal_position
    ) as columns
FROM information_schema.columns 
WHERE table_name = 'transactions' 

UNION ALL

-- Resource purchases table structure
SELECT 
    'resource_purchases' as table_name,
    json_agg(
        json_build_object(
            'column_name', column_name,
            'data_type', data_type,
            'is_nullable', is_nullable,
            'column_default', column_default
        ) ORDER BY ordinal_position
    ) as columns
FROM information_schema.columns 
WHERE table_name = 'resource_purchases' 

UNION ALL

-- Community replies table structure
SELECT 
    'community_replies' as table_name,
    json_agg(
        json_build_object(
            'column_name', column_name,
            'data_type', data_type,
            'is_nullable', is_nullable,
            'column_default', column_default
        ) ORDER BY ordinal_position
    ) as columns
FROM information_schema.columns 
WHERE table_name = 'community_replies' 

ORDER BY table_name;
