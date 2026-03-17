-- Check ALL triggers on ALL tables that might call handle_material_approval_reward
-- Run this in Supabase SQL Editor

-- 1. Check ALL triggers in the database that call this function
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgfoid::regproc as function_name,
    tgenabled::text as is_enabled
FROM pg_trigger 
WHERE tgfoid::regproc::text = 'handle_material_approval_reward';

-- 2. Check if there are any triggers on materials that we missed (including system triggers)
SELECT 
    tgname as trigger_name,
    tgfoid::regproc as function_name,
    tgenabled::text as is_enabled,
    tgtype::text as trigger_type
FROM pg_trigger 
WHERE tgrelid = 'materials'::regclass
ORDER BY tgname;

-- 3. Check if the function is being called directly from JavaScript (search client code)
-- This would require searching the client codebase for calls to handle_material_approval_reward
