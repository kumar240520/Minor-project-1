-- Check if handle_material_approval_reward is being called by any trigger
-- Run this in Supabase SQL Editor

-- 1. Check ALL triggers that call handle_material_approval_reward
SELECT 
    tgname as trigger_name,
    tgfoid::regproc as function_name,
    tgenabled as is_enabled,
    tgtype::text as trigger_type
FROM pg_trigger 
WHERE tgfoid::regproc::text = 'handle_material_approval_reward';

-- 2. Check if there are any INACTIVE triggers that might be re-enabled
SELECT 
    tgname as trigger_name,
    tgfoid::regproc as function_name,
    tgenabled as is_enabled
FROM pg_trigger 
WHERE tgrelid = 'materials'::regclass
AND tgenabled = false;

-- 3. Check if the function is being called from JavaScript (look for recent transactions)
SELECT 
    user_id,
    amount,
    reference_type,
    description,
    created_at
FROM transactions 
WHERE amount = 100 
AND reference_type LIKE '%APPROVAL%'
ORDER BY created_at DESC LIMIT 3;

-- 4. Check if there are any other approval-related functions we missed
SELECT 
    proname as function_name,
    prosrc as source_code
FROM pg_proc 
WHERE prosrc LIKE '%100%'
AND proname NOT LIKE '%storage%'
AND proname NOT LIKE '%search%'
ORDER BY proname;
