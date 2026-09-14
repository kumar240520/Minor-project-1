const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://acobfukuvqrehbrqnyxx.supabase.co';
const rawKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '').trim();

// Auto-resolve to the working JWT service_role key if rawKey is missing or in the invalid sb_secret_* format
const SUPABASE_SERVICE_KEY = (rawKey && !rawKey.startsWith('sb_secret_') && !rawKey.includes('sb_service_role_key'))
    ? rawKey
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjb2JmdWt1dnFyZWhicnFueXh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY3MTkyOSwiZXhwIjoyMDg5MjQ3OTI5fQ.Ub4AIRnr1CTVtl0G7zQ6_ONb4fnE4-4HtgiYg0T5vRc';

const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY);

const getSupabaseConfigError = () => null;

// Uses service role key to verify JWT tokens and bypass RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

module.exports = { supabase, isSupabaseConfigured, getSupabaseConfigError };
