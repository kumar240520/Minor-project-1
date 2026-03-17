-- FIRST: Check what triggers are calling which functions
-- Run this in Supabase SQL Editor BEFORE dropping anything

-- 1. List ALL triggers on materials table and which functions they call
SELECT 
    tgname as trigger_name,
    tgfoid::regproc as function_name,
    tgenabled as is_enabled,
    tgtype::text as trigger_type
FROM pg_trigger 
WHERE tgrelid = 'materials'::regclass
AND tgname NOT LIKE 'RI_%'  -- Exclude referential integrity triggers
ORDER BY tgname;

-- 2. Check if handle_material_approval_reward is actually being used
SELECT 
    tgname as trigger_name,
    tgfoid::regproc as function_name
FROM pg_trigger 
WHERE tgrelid = 'materials'::regclass
AND tgfoid::regproc::text = 'handle_material_approval_reward';

-- 3. Check if simple_approval_reward is being used
SELECT 
    tgname as trigger_name,
    tgfoid::regproc as function_name
FROM pg_trigger 
WHERE tgrelid = 'materials'::regclass
AND tgfoid::regproc::text = 'simple_approval_reward';
