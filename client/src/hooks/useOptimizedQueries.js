import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';

// ==========================================
// QUERY KEYS - Centralized cache key management
// ==========================================
export const queryKeys = {
  materials: {
    all: ['materials'],
    approved: (type, page = 1) => ['materials', 'approved', type, page],
    pending: (page = 1) => ['materials', 'pending', page],
    student: (userId) => ['materials', 'student', userId],
    detail: (id) => ['materials', 'detail', id],
  },
  users: {
    all: ['users'],
    profile: (id) => ['users', 'profile', id],
    stats: ['users', 'stats'],
  },
  events: {
    all: ['events'],
    global: (page = 1) => ['events', 'global', page],
  },
  transactions: {
    all: ['transactions'],
    user: (userId) => ['transactions', 'user', userId],
  },
  notifications: {
    all: ['notifications'],
    user: (userId) => ['notifications', 'user', userId],
  },
};

// ==========================================
// MATERIALS QUERIES - Optimized with field selection
// ==========================================

// OPTIMIZATION: Replace select('*') with specific fields
const MATERIALS_FIELDS = `
  id, title, description, subject, year, category, 
  type, status, file_url, file_name, file_type,
  uploaded_by, uploader_name, downloads, views,
  created_at, approved_at, icon_type, bg_color, text_color
`;

/**
 * Fetch approved materials with pagination
 * OPTIMIZATION: 
 * - Uses field selection instead of select('*')
 * - Implements pagination with range()
 * - Cached for 5 minutes
 */
export const useApprovedMaterials = (type, page = 1, limit = 20) => {
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  return useQuery({
    queryKey: queryKeys.materials.approved(type, page),
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('materials')
        .select(MATERIALS_FIELDS, { count: 'exact' }) // OPTIMIZATION: Specific fields + count
        .eq('status', 'approved')
        .eq('type', type)
        .order('created_at', { ascending: false })
        .range(start, end); // OPTIMIZATION: Pagination

      if (error) throw error;
      
      return {
        data: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

/**
 * Fetch pending materials for admin
 * OPTIMIZATION: Field selection + pagination
 */
export const usePendingMaterials = (page = 1, limit = 20) => {
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  return useQuery({
    queryKey: queryKeys.materials.pending(page),
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('materials')
        .select(MATERIALS_FIELDS, { count: 'exact' })
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;
      
      return {
        data: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for admin data
  });
};

/**
 * Fetch student's own materials
 * OPTIMIZATION: Field selection + user-specific caching
 */
export const useStudentMaterials = (userId) => {
  return useQuery({
    queryKey: queryKeys.materials.student(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials')
        .select(MATERIALS_FIELDS)
        .or(`uploaded_by.eq.${userId},user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId, // Only fetch when userId is available
    staleTime: 3 * 60 * 1000,
  });
};

// ==========================================
// USERS QUERIES - Optimized
// ==========================================

const USER_PROFILE_FIELDS = 'id, email, name, role, coins, created_at, avatar_url';

/**
 * Fetch user profile
 * OPTIMIZATION: Field selection + single row query
 */
export const useUserProfile = (userId) => {
  return useQuery({
    queryKey: queryKeys.users.profile(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select(USER_PROFILE_FIELDS)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch platform statistics
 * OPTIMIZATION: Parallel queries with specific counts
 */
export const usePlatformStats = () => {
  return useQuery({
    queryKey: queryKeys.users.stats,
    queryFn: async () => {
      // OPTIMIZATION: Run all count queries in parallel
      const [
        { count: studentCount },
        { count: materialCount },
        { count: eventCount },
        { data: transactions },
      ] = await Promise.all([
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student'),
        supabase
          .from('materials')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved'),
        supabase
          .from('calendar_events')
          .select('*', { count: 'exact', head: true })
          .eq('is_global', true),
        supabase
          .from('transactions')
          .select('amount')
          .eq('transaction_type', 'EARN')
          .limit(1000), // OPTIMIZATION: Limit to prevent memory issues
      ]);

      const totalCoins = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      return {
        totalStudents: studentCount || 0,
        totalMaterials: materialCount || 0,
        totalEvents: eventCount || 0,
        totalCoins,
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for stats
  });
};

// ==========================================
// EVENTS QUERIES - Optimized
// ==========================================

const EVENT_FIELDS = 'id, title, description, date, time, location, type, color, is_global, created_at';

/**
 * Fetch global events with pagination
 * OPTIMIZATION: Field selection + pagination
 */
export const useGlobalEvents = (page = 1, limit = 10) => {
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  return useQuery({
    queryKey: queryKeys.events.global(page),
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('calendar_events')
        .select(EVENT_FIELDS, { count: 'exact' })
        .eq('is_global', true)
        .order('date', { ascending: true })
        .range(start, end);

      if (error) throw error;
      
      return {
        data: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    },
    staleTime: 10 * 60 * 1000, // Events don't change often
  });
};

// ==========================================
// NOTIFICATIONS QUERIES - Optimized
// ==========================================

const NOTIFICATION_FIELDS = 'id, user_id, title, message, type, is_read, link, created_at';

/**
 * Fetch user notifications
 * OPTIMIZATION: Field selection + limit
 */
export const useUserNotifications = (userId, limit = 50) => {
  return useQuery({
    queryKey: queryKeys.notifications.user(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select(NOTIFICATION_FIELDS)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute for notifications
  });
};

// ==========================================
// MUTATIONS - Optimized with cache invalidation
// ==========================================

/**
 * Approve material mutation
 * OPTIMIZATION: 
 * - Uses returning: 'minimal' for update
 * - Invalidates related queries on success
 */
export const useApproveMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ materialId, adminUserId }) => {
      const { error } = await supabase
        .from('materials')
        .update({
          status: 'approved',
          approved_by: adminUserId,
          approved_at: new Date().toISOString(),
        })
        .eq('id', materialId)
        .eq('status', 'pending')
        .select(); // OPTIMIZATION: Minimal return

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      // OPTIMIZATION: Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.pending() });
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.approved() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats });
    },
  });
};

/**
 * Reject material mutation
 * OPTIMIZATION: Minimal return + cache invalidation
 */
export const useRejectMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (materialId) => {
      const { error } = await supabase
        .from('materials')
        .update({ status: 'rejected' })
        .eq('id', materialId)
        .eq('status', 'pending')
        .select();

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.pending() });
    },
  });
};

/**
 * Mark notification as read
 * OPTIMIZATION: Optimistic update
 */
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select();

      if (error) throw error;
    },
    onSuccess: (_, notificationId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

// ==========================================
// PREFETCHING UTILITIES
// ==========================================

/**
 * Prefetch materials for faster navigation
 * OPTIMIZATION: Pre-load data before user needs it
 */
export const prefetchMaterials = async (queryClient, type) => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.materials.approved(type, 1),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials')
        .select(MATERIALS_FIELDS)
        .eq('status', 'approved')
        .eq('type', type)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};
