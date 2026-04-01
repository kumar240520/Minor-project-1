-- ==========================================
-- EDUSURE DATABASE CLEANUP SCRIPT
-- Removes unused data, test records, and optimizes storage
-- ⚠️  REVIEW CAREFULLY BEFORE RUNNING IN PRODUCTION
-- ==========================================

-- ==========================================
-- 1. CLEANUP: Remove Test Data
-- ==========================================

-- Remove test users (identified by email pattern)
DELETE FROM public.users 
WHERE email LIKE '%test%@%' 
  OR email LIKE '%demo%@%'
  OR email LIKE '%example%@%'
  OR email LIKE '%fake%@%'
  OR name LIKE '%Test%'
  OR name LIKE '%Demo%'
  OR name = 'Test Student'
  OR created_at < NOW() - INTERVAL '1 year' AND role = 'student' AND coins = 50;

-- Remove orphaned notifications (user no longer exists)
DELETE FROM public.notifications n
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.id = n.user_id
);

-- Remove orphaned materials (uploader no longer exists)
-- First, update to a system user or delete
DELETE FROM public.materials m
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.id = m.uploaded_by OR u.id = m.user_id
)
AND m.status = 'pending'
AND m.created_at < NOW() - INTERVAL '6 months';

-- ==========================================
-- 2. CLEANUP: Remove Pending Materials Older Than 6 Months
-- ==========================================

DELETE FROM public.materials
WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '6 months'
  AND views = 0
  AND downloads = 0;

-- ==========================================
-- 3. CLEANUP: Archive Old Transactions
-- ==========================================

-- Create archive table if not exists
CREATE TABLE IF NOT EXISTS public.transactions_archive (
  LIKE public.transactions INCLUDING ALL,
  archived_at TIMESTAMP DEFAULT NOW()
);

-- Move old transactions to archive (older than 2 years)
INSERT INTO public.transactions_archive
SELECT *, NOW() as archived_at
FROM public.transactions
WHERE created_at < NOW() - INTERVAL '2 years';

-- Delete archived transactions from main table
DELETE FROM public.transactions
WHERE created_at < NOW() - INTERVAL '2 years';

-- ==========================================
-- 4. CLEANUP: Remove Old Notifications
-- ==========================================

-- Delete read notifications older than 3 months
DELETE FROM public.notifications
WHERE is_read = true
  AND created_at < NOW() - INTERVAL '3 months';

-- Delete all notifications older than 1 year (even unread)
DELETE FROM public.notifications
WHERE created_at < NOW() - INTERVAL '1 year';

-- ==========================================
-- 5. CLEANUP: Remove Deleted Storage References
-- ==========================================

-- Find materials with storage references that don't exist in storage
-- This requires running a separate script with storage admin access
-- For now, we'll mark them
UPDATE public.materials
SET status = 'deleted',
    file_url = NULL
WHERE file_url IS NOT NULL
  AND status = 'approved'
  AND created_at < NOW() - INTERVAL '1 year'
  AND downloads = 0
  AND views < 5;

-- ==========================================
-- 6. CLEANUP: Remove Duplicate Transactions
-- ==========================================

-- Find and remove duplicate transactions (same user, amount, type, within 1 second)
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, amount, transaction_type, reference_id, DATE_TRUNC('second', created_at)
           ORDER BY created_at
         ) as row_num
  FROM public.transactions
)
DELETE FROM public.transactions
WHERE id IN (SELECT id FROM duplicates WHERE row_num > 1);

-- ==========================================
-- 7. CLEANUP: Optimize Large Text Columns
-- ==========================================

-- Truncate overly long descriptions (keep first 5000 chars)
UPDATE public.materials
SET description = LEFT(description, 5000)
WHERE LENGTH(description) > 5000;

-- Truncate long titles (keep first 200 chars)
UPDATE public.materials
SET title = LEFT(title, 200)
WHERE LENGTH(title) > 200;

-- ==========================================
-- 8. CLEANUP: Remove Unused Calendar Events
-- ==========================================

-- Delete past personal events (not global)
DELETE FROM public.calendar_events
WHERE is_global = false
  AND date < CURRENT_DATE - INTERVAL '1 month';

-- Delete very old global events (older than 2 years)
DELETE FROM public.calendar_events
WHERE is_global = true
  AND date < CURRENT_DATE - INTERVAL '2 years';

-- ==========================================
-- 9. CLEANUP: Community Posts
-- ==========================================

-- Note: community_posts table has no status column
-- Only delete posts with zero engagement older than 1 year
DELETE FROM public.community_posts
WHERE likes = 0 
  AND replies = 0
  AND created_at < NOW() - INTERVAL '1 year';

-- ==========================================
-- 10. CLEANUP: Reset Unused User Sessions/Data
-- ==========================================

-- Reset coins for inactive users (optional - review before running)
-- UPDATE public.users
-- SET coins = GREATEST(coins - 50, 0)
-- WHERE last_login_reward < NOW() - INTERVAL '6 months'
--   AND coins > 1000;

-- ==========================================
-- 11. VACUUM AND ANALYZE
-- ==========================================

-- Vacuum to reclaim storage space
VACUUM ANALYZE public.materials;
VACUUM ANALYZE public.users;
VACUUM ANALYZE public.transactions;
VACUUM ANALYZE public.notifications;
VACUUM ANALYZE public.calendar_events;
VACUUM ANALYZE public.community_posts;

-- ==========================================
-- 12. STORAGE USAGE SUMMARY
-- ==========================================

-- Create view for storage monitoring
CREATE OR REPLACE VIEW public.storage_usage_summary AS
SELECT 
  'materials' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.materials')) as total_size,
  pg_size_pretty(pg_indexes_size('public.materials')) as index_size
UNION ALL
SELECT 
  'users',
  COUNT(*),
  pg_size_pretty(pg_total_relation_size('public.users')),
  pg_size_pretty(pg_indexes_size('public.users'))
UNION ALL
SELECT 
  'transactions',
  COUNT(*),
  pg_size_pretty(pg_total_relation_size('public.transactions')),
  pg_size_pretty(pg_indexes_size('public.transactions'))
UNION ALL
SELECT 
  'notifications',
  COUNT(*),
  pg_size_pretty(pg_total_relation_size('public.notifications')),
  pg_size_pretty(pg_indexes_size('public.notifications'))
UNION ALL
SELECT 
  'calendar_events',
  COUNT(*),
  pg_size_pretty(pg_total_relation_size('public.calendar_events')),
  pg_size_pretty(pg_indexes_size('public.calendar_events'))
UNION ALL
SELECT 
  'community_posts',
  COUNT(*),
  pg_size_pretty(pg_total_relation_size('public.community_posts')),
  pg_size_pretty(pg_indexes_size('public.community_posts'));

-- Grant access to summary view
GRANT SELECT ON public.storage_usage_summary TO authenticated;

-- ==========================================
-- SUMMARY REPORT
-- ==========================================

-- Show cleanup summary
SELECT 
  'Cleanup Summary' as operation,
  'Run this query before and after cleanup to see differences' as note;

-- Show current storage usage
-- SELECT * FROM public.storage_usage_summary;
