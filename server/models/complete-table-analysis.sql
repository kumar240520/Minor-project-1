-- ========================================
-- COMPLETE TABLE STRUCTURE ANALYSIS
-- ========================================

-- Get ALL table structures in one query
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
GROUP BY 'users'

UNION ALL

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
GROUP BY 'materials'

UNION ALL

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
GROUP BY 'community_posts'

UNION ALL

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
GROUP BY 'calendar_events'

UNION ALL

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
GROUP BY 'transactions'

UNION ALL

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
GROUP BY 'resource_purchases'

UNION ALL

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
GROUP BY 'community_replies'

ORDER BY table_name;
