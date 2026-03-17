-- Check if handle_material_approval_reward is being called by any trigger (fixed)
-- Run this in Supabase SQL Editor

-- 1. Check ALL triggers that call handle_material_approval_reward
SELECT 
    tgname as trigger_name,
    tgfoid::regproc as function_name,
    tgenabled::text as is_enabled,
    tgtype::text as trigger_type
FROM pg_trigger 
WHERE tgfoid::regproc::text = 'handle_material_approval_reward';

-- 2. Check if there are any INACTIVE triggers that might be re-enabled (fixed)
SELECT 
    tgname as trigger_name,
    tgfoid::regproc as function_name,
    tgenabled::text as is_enabled
FROM pg_trigger 
WHERE tgrelid = 'materials'::regclass'
AND tgenabled::text = 'false';

-- 3. Check if there are any other approval-related functions we missed
SELECT 
    proname as function_name,
    prosrc as source_code
FROM pg_proc 
WHERE prosrc LIKE '%100%'
AND proname NOT LIKE '%storage%'
AND proname NOT LIKE '%search%'
ORDER BY proname;
