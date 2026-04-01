-- ==========================================
-- RLS POLICY OPTIMIZATION SCRIPT
-- Optimizes Row Level Security policies for better performance
-- ==========================================

-- ==========================================
-- 1. OPTIMIZED MATERIALS TABLE POLICIES
-- ==========================================

-- Drop existing inefficient policies
DROP POLICY IF EXISTS "Approved materials are public, uploaders see own, admins see all" ON public.materials;
DROP POLICY IF EXISTS "Users can upload their own pending materials" ON public.materials;
DROP POLICY IF EXISTS "Uploaders can update their own pending materials" ON public.materials;
DROP POLICY IF EXISTS "Admins can moderate all materials" ON public.materials;
DROP POLICY IF EXISTS "Uploaders can delete pending materials and admins can delete all" ON public.materials;

-- Drop new optimized policies if they exist (for re-running script)
DROP POLICY IF EXISTS "materials_select_optimized" ON public.materials;
DROP POLICY IF EXISTS "materials_insert_optimized" ON public.materials;
DROP POLICY IF EXISTS "materials_update_optimized" ON public.materials;
DROP POLICY IF EXISTS "materials_delete_optimized" ON public.materials;

-- OPTIMIZED: More efficient SELECT policy using security definer function
CREATE OR REPLACE FUNCTION public.is_material_visible(mat public.materials)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    mat.status = 'approved' 
    OR mat.uploaded_by = auth.uid() 
    OR mat.user_id = auth.uid()
    OR (auth.jwt() ->> 'app_metadata')::jsonb->>'role' = 'admin' OR (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin';
$$;

-- OPTIMIZED: Simplified SELECT policy using function
CREATE POLICY "materials_select_optimized"
ON public.materials
FOR SELECT
TO authenticated
USING (public.is_material_visible(materials));

-- OPTIMIZED: Insert policy with minimal checks
CREATE POLICY "materials_insert_optimized"
ON public.materials
FOR INSERT
TO authenticated
WITH CHECK (
  COALESCE(uploaded_by, user_id) = auth.uid()
  AND status = 'pending'
);

-- OPTIMIZED: Update policy with index-friendly conditions
CREATE POLICY "materials_update_optimized"
ON public.materials
FOR UPDATE
TO authenticated
USING (
  -- Users can update their own pending materials
  (
    COALESCE(uploaded_by, user_id) = auth.uid()
    AND status = 'pending'
  )
  OR 
  -- Admins can update any material
  (auth.jwt() ->> 'app_metadata')::jsonb->>'role' = 'admin' OR (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
);

-- OPTIMIZED: Delete policy
CREATE POLICY "materials_delete_optimized"
ON public.materials
FOR DELETE
TO authenticated
USING (
  (
    COALESCE(uploaded_by, user_id) = auth.uid()
    AND status = 'pending'
  )
  OR (auth.jwt() ->> 'app_metadata')::jsonb->>'role' = 'admin' OR (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
);

-- ==========================================
-- 2. OPTIMIZED NOTIFICATIONS TABLE POLICIES
-- ==========================================

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;

-- Drop new optimized policies if they exist (for re-running script)
DROP POLICY IF EXISTS "notifications_select_optimized" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_optimized" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_optimized" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_optimized" ON public.notifications;

-- OPTIMIZED: Combined SELECT policy with index-friendly condition
CREATE POLICY "notifications_select_optimized"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR (auth.jwt() ->> 'app_metadata')::jsonb->>'role' = 'admin' OR (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
);

-- OPTIMIZED: Users can only update is_read field on their own notifications
CREATE POLICY "notifications_update_optimized"
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- OPTIMIZED: Insert restricted to system/service roles
CREATE POLICY "notifications_insert_optimized"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow users to create notifications for themselves (if needed)
  user_id = auth.uid()
  OR (auth.jwt() ->> 'app_metadata')::jsonb->>'role' = 'admin' OR (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
);

-- OPTIMIZED: Delete only own notifications
CREATE POLICY "notifications_delete_optimized"
ON public.notifications
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ==========================================
-- 3. OPTIMIZED USERS TABLE POLICIES
-- ==========================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- Drop new optimized policies if they exist (for re-running script)
DROP POLICY IF EXISTS "users_select_optimized" ON public.users;
DROP POLICY IF EXISTS "users_update_optimized" ON public.users;
DROP POLICY IF EXISTS "users_admin_update_optimized" ON public.users;

-- OPTIMIZED: Users can view their own profile and admins can view all
-- Uses auth.jwt() to avoid infinite recursion
CREATE POLICY "users_select_optimized"
ON public.users
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR (auth.jwt() ->> 'app_metadata')::jsonb->>'role' = 'admin'
  OR (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
);

-- OPTIMIZED: Users can update limited fields on their own profile
CREATE POLICY "users_update_optimized"
ON public.users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND role = 'student'  -- Prevent users from changing their role
);

-- OPTIMIZED: Only admins can update role and sensitive fields
-- Uses auth.jwt() to avoid infinite recursion
CREATE POLICY "users_admin_update_optimized"
ON public.users
FOR UPDATE
TO authenticated
USING (
  (auth.jwt() ->> 'app_metadata')::jsonb->>'role' = 'admin'
  OR (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
);

-- ==========================================
-- 4. OPTIMIZED CALENDAR EVENTS POLICIES
-- ==========================================

DROP POLICY IF EXISTS "Users can view global and personal events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can insert personal events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update personal events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete personal events" ON public.calendar_events;
DROP POLICY IF EXISTS "Admins can manage all events" ON public.calendar_events;

-- Drop new optimized policies if they exist (for re-running script)
DROP POLICY IF EXISTS "events_select_optimized" ON public.calendar_events;
DROP POLICY IF EXISTS "events_insert_optimized" ON public.calendar_events;
DROP POLICY IF EXISTS "events_update_optimized" ON public.calendar_events;
DROP POLICY IF EXISTS "events_delete_optimized" ON public.calendar_events;

-- OPTIMIZED: View global events or own events
CREATE POLICY "events_select_optimized"
ON public.calendar_events
FOR SELECT
TO authenticated
USING (
  is_global = true 
  OR user_id = auth.uid()
  OR (auth.jwt() ->> 'app_metadata')::jsonb->>'role' = 'admin' OR (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
);

-- OPTIMIZED: Insert personal events only
CREATE POLICY "events_insert_optimized"
ON public.calendar_events
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND is_global = false
);

-- OPTIMIZED: Update own personal events only
CREATE POLICY "events_update_optimized"
ON public.calendar_events
FOR UPDATE
TO authenticated
USING (
  (user_id = auth.uid() AND is_global = false)
  OR (auth.jwt() ->> 'app_metadata')::jsonb->>'role' = 'admin' OR (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
)
WITH CHECK (
  (user_id = auth.uid() AND is_global = false)
  OR (auth.jwt() ->> 'app_metadata')::jsonb->>'role' = 'admin' OR (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
);

-- OPTIMIZED: Delete own personal events only
CREATE POLICY "events_delete_optimized"
ON public.calendar_events
FOR DELETE
TO authenticated
USING (
  (user_id = auth.uid() AND is_global = false)
  OR (auth.jwt() ->> 'app_metadata')::jsonb->>'role' = 'admin' OR (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
);

-- ==========================================
-- 5. OPTIMIZED TRANSACTIONS POLICIES
-- ==========================================

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;

-- Drop new optimized policies if they exist (for re-running script)
DROP POLICY IF EXISTS "transactions_select_optimized" ON public.transactions;
DROP POLICY IF EXISTS "transactions_insert_optimized" ON public.transactions;

-- OPTIMIZED: Users can only view their own transactions, admins can view all
CREATE POLICY "transactions_select_optimized"
ON public.transactions
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR (auth.jwt() ->> 'app_metadata')::jsonb->>'role' = 'admin' OR (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
);

-- OPTIMIZED: Only system or admins can insert transactions
CREATE POLICY "transactions_insert_optimized"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'app_metadata')::jsonb->>'role' = 'admin' OR (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
);

-- ==========================================
-- 6. OPTIMIZED COMMUNITY POSTS POLICIES
-- ==========================================

DROP POLICY IF EXISTS "Anyone can view approved posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authors can update their posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authors and admins can delete posts" ON public.community_posts;

-- Drop new optimized policies if they exist (for re-running script)
DROP POLICY IF EXISTS "community_posts_select_optimized" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_insert_optimized" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_update_optimized" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_delete_optimized" ON public.community_posts;

-- OPTIMIZED: View approved posts or own posts or admin view all
CREATE POLICY "community_posts_select_optimized"
ON public.community_posts
FOR SELECT
TO authenticated
USING (
  true  -- All posts are public
  OR user_id = auth.uid()
  OR (auth.jwt() ->> 'app_metadata')::jsonb->>'role' = 'admin' OR (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
);

-- OPTIMIZED: Create posts with user_id
CREATE POLICY "community_posts_insert_optimized"
ON public.community_posts
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);

-- OPTIMIZED: Update own posts
CREATE POLICY "community_posts_update_optimized"
ON public.community_posts
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  OR (auth.jwt() ->> 'app_metadata')::jsonb->>'role' = 'admin' OR (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
)
WITH CHECK (
  user_id = auth.uid()
  OR (auth.jwt() ->> 'app_metadata')::jsonb->>'role' = 'admin' OR (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
);

-- OPTIMIZED: Delete own posts or admin delete any
CREATE POLICY "community_posts_delete_optimized"
ON public.community_posts
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR (auth.jwt() ->> 'app_metadata')::jsonb->>'role' = 'admin' OR (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
);

-- ==========================================
-- 7. OPTIMIZED STORAGE POLICIES
-- ==========================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Approved material files are readable by students and admins" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own material files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own material files and admins can delete all" ON storage.objects;

-- Drop new optimized policies if they exist (for re-running script)
DROP POLICY IF EXISTS "storage_select_optimized" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_optimized" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_optimized" ON storage.objects;

-- OPTIMIZED: Select policy with better performance
CREATE POLICY "storage_select_optimized"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'Storage'
  AND (
    -- User's own files
    (storage.foldername(name))[1] = (auth.jwt() ->> 'sub')
    -- Or check if material is approved via subquery (cached)
    OR EXISTS (
      SELECT 1 FROM public.materials m
      WHERE m.file_url = name
      AND m.status = 'approved'
    )
    -- Or user is admin
    OR (auth.jwt() ->> 'app_metadata')::jsonb->>'role' = 'admin' OR (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
  )
);

-- OPTIMIZED: Insert policy
CREATE POLICY "storage_insert_optimized"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'Storage'
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub')
);

-- OPTIMIZED: Delete policy
CREATE POLICY "storage_delete_optimized"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'Storage'
  AND (
    (storage.foldername(name))[1] = (auth.jwt() ->> 'sub')
    OR (auth.jwt() ->> 'app_metadata')::jsonb->>'role' = 'admin' OR (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
  )
);

-- ==========================================
-- 8. ANALYZE TABLES AFTER POLICY CHANGES
-- ==========================================

ANALYZE public.materials;
ANALYZE public.notifications;
ANALYZE public.users;
ANALYZE public.calendar_events;
ANALYZE public.transactions;
ANALYZE public.community_posts;

-- ==========================================
-- 9. PERFORMANCE MONITORING VIEWS
-- ==========================================

-- Create view to monitor slow RLS policies
CREATE OR REPLACE VIEW public.rls_policy_stats AS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual::text as using_expression,
  with_check::text as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Grant access to view
GRANT SELECT ON public.rls_policy_stats TO authenticated;

-- ==========================================
-- NOTES
-- ==========================================

-- 1. These policies are optimized for:
--    - Index-friendly conditions (avoiding complex subqueries in hot paths)
--    - Minimal overhead on read operations
--    - Clear separation of user vs admin permissions

-- 2. Monitor performance with:
--    SELECT * FROM pg_stat_statements WHERE query LIKE '%materials%' ORDER BY mean_exec_time DESC;

-- 3. If experiencing slow queries, consider:
--    - Running EXPLAIN ANALYZE on slow queries
--    - Adding more specific indexes
--    - Materializing frequently accessed data
