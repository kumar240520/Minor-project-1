const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://acobfukuvqrehbrqnyxx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || 'sb_service_role_key_here';

const isSupabaseConfigured = () =>
    Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY));

const getSupabaseConfigError = () => {
    const missing = [];
    if (!process.env.SUPABASE_URL) missing.push('SUPABASE_URL');
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_KEY) {
        missing.push('SUPABASE_SERVICE_ROLE_KEY');
    }

    return missing.length ? `Missing required server environment variables: ${missing.join(', ')}` : null;
};

// Uses service role key to verify JWT tokens and bypass RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

module.exports = { supabase, isSupabaseConfigured, getSupabaseConfigError };
