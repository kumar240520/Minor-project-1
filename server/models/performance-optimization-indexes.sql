-- ==========================================
-- EDUSURE DATABASE PERFORMANCE OPTIMIZATION SCRIPT
-- Run this in Supabase SQL Editor to add performance indexes
-- ==========================================

-- ==========================================
-- 1. MATERIALS TABLE INDEXES
-- ==========================================

-- OPTIMIZATION: Index for fetching approved materials by type (most common query)
CREATE INDEX IF NOT EXISTS idx_materials_status_type_created_at 
ON public.materials (status, type, created_at DESC);

-- OPTIMIZATION: Index for pending materials (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_materials_status_pending 
ON public.materials (status, created_at DESC) 
WHERE status = 'pending';

-- OPTIMIZATION: Index for user's own materials
CREATE INDEX IF NOT EXISTS idx_materials_uploaded_by 
ON public.materials (uploaded_by, created_at DESC);

-- OPTIMIZATION: Index for user_id fallback (backward compatibility)
CREATE INDEX IF NOT EXISTS idx_materials_user_id 
ON public.materials (user_id, created_at DESC);

-- OPTIMIZATION: Index for approved_by (admin analytics)
CREATE INDEX IF NOT EXISTS idx_materials_approved_by 
ON public.materials (approved_by, approved_at DESC);

-- OPTIMIZATION: Composite index for common filtering
CREATE INDEX IF NOT EXISTS idx_materials_status_created 
ON public.materials (status, created_at DESC);

-- ==========================================
-- 2. USERS TABLE INDEXES
-- ==========================================

-- OPTIMIZATION: Index for user lookups by email (login/auth)
CREATE INDEX IF NOT EXISTS idx_users_email 
ON public.users (email);

-- OPTIMIZATION: Index for role-based queries (admin/student filtering)
CREATE INDEX IF NOT EXISTS idx_users_role 
ON public.users (role);

-- OPTIMIZATION: Composite index for role + created_at (analytics)
CREATE INDEX IF NOT EXISTS idx_users_role_created 
ON public.users (role, created_at DESC);

-- ==========================================
-- 3. TRANSACTIONS TABLE INDEXES
-- ==========================================

-- OPTIMIZATION: Index for user's transaction history
CREATE INDEX IF NOT EXISTS idx_transactions_user_id 
ON public.transactions (user_id, created_at DESC);

-- OPTIMIZATION: Index for transaction type queries (EARN/SPEND)
CREATE INDEX IF NOT EXISTS idx_transactions_type 
ON public.transactions (transaction_type, created_at DESC);

-- OPTIMIZATION: Composite index for user + type queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_type 
ON public.transactions (user_id, transaction_type, created_at DESC);

-- ==========================================
-- 4. CALENDAR EVENTS TABLE INDEXES
-- ==========================================

-- OPTIMIZATION: Index for global events (landing page, dashboard)
CREATE INDEX IF NOT EXISTS idx_calendar_events_global 
ON public.calendar_events (is_global, date DESC) 
WHERE is_global = true;

-- OPTIMIZATION: Index for user's personal events
CREATE INDEX IF NOT EXISTS idx_calendar_events_user 
ON public.calendar_events (user_id, date DESC);

-- OPTIMIZATION: Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_calendar_events_date 
ON public.calendar_events (date DESC);

-- ==========================================
-- 5. NOTIFICATIONS TABLE INDEXES
-- ==========================================

-- OPTIMIZATION: Index for user's notifications (sorted by newest)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON public.notifications (user_id, is_read, created_at DESC);

-- OPTIMIZATION: Index for unread notifications count
CREATE INDEX IF NOT EXISTS idx_notifications_unread 
ON public.notifications (user_id, is_read) 
WHERE is_read = false;

-- ==========================================
-- 6. COMMUNITY POSTS INDEXES
-- ==========================================

-- OPTIMIZATION: Index for posts by user
CREATE INDEX IF NOT EXISTS idx_community_posts_user 
ON public.community_posts (user_id, created_at DESC);

-- OPTIMIZATION: Index for engagement-based queries
CREATE INDEX IF NOT EXISTS idx_community_posts_engagement 
ON public.community_posts (likes DESC, replies DESC, created_at DESC);

-- ==========================================
-- 7. ANALYTICS / REPORTS OPTIMIZATION
-- ==========================================

-- OPTIMIZATION: Index for recent materials queries
-- Note: For dynamic date filtering, use the regular index on created_at
CREATE INDEX IF NOT EXISTS idx_materials_recent 
ON public.materials (created_at DESC);

-- OPTIMIZATION: Index for download/view counts (leaderboard queries)
CREATE INDEX IF NOT EXISTS idx_materials_downloads 
ON public.materials (downloads DESC, created_at DESC);

-- OPTIMIZATION: Index for view counts (trending materials)
CREATE INDEX IF NOT EXISTS idx_materials_views 
ON public.materials (views DESC, created_at DESC);

-- ==========================================
-- 8. VACUUM AND ANALYZE (Run periodically)
-- ==========================================

-- Update table statistics for query planner
ANALYZE public.materials;
ANALYZE public.users;
ANALYZE public.transactions;
ANALYZE public.calendar_events;
ANALYZE public.notifications;
ANALYZE public.community_posts;

-- ==========================================
-- 9. QUERY OPTIMIZATION VIEWS (Optional)
-- ==========================================

-- Create materialized view for dashboard stats (refresh periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM public.users WHERE role = 'student') as total_students,
    (SELECT COUNT(*) FROM public.materials WHERE status = 'approved') as total_materials,
    (SELECT COUNT(*) FROM public.calendar_events WHERE is_global = true) as total_events,
    (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE transaction_type = 'EARN') as total_coins;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dashboard_stats 
ON mv_dashboard_stats (total_students);

-- ==========================================
-- 10. CLEANUP: Remove unused indexes (run after verification)
-- ==========================================

-- Check for unused indexes (run this query to identify)
-- SELECT schemaname, tablename, indexname, idx_scan 
-- FROM pg_stat_user_indexes 
-- WHERE idx_scan < 10 
-- ORDER BY idx_scan ASC;

-- ==========================================
-- NOTES FOR MAINTENANCE
-- ==========================================

-- 1. Monitor index usage with:
--    SELECT indexrelname, idx_scan, idx_tup_read, idx_tup_fetch
--    FROM pg_stat_user_indexes 
--    WHERE schemaname = 'public';

-- 2. Reindex periodically if bloat occurs:
--    REINDEX INDEX idx_materials_status_type_created_at;

-- 3. Refresh materialized view periodically:
--    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_stats;

-- 4. Monitor slow queries with:
--    SELECT query, mean_exec_time, calls 
--    FROM pg_stat_statements 
--    ORDER BY mean_exec_time DESC 
--    LIMIT 10;
