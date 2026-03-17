import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
    import.meta.env.VITE_SUPABASE_URL || 'https://acobfukuvqrehbrqnyxx.supabase.co';
export const SUPABASE_PUBLIC_KEY =
    import.meta.env.VITE_SUPABASE_PUBLIC_KEY || 'sb_publishable_riQhamrU4Pwjay2fdMMkmw_ymryt0zi';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

export const createAuthenticatedSupabaseClient = (accessToken) =>
    createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
        global: accessToken
            ? {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
            : undefined,
    });
