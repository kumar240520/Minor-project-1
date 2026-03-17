-- Check ALL triggers on materials table - fixed syntax
-- Run this in Supabase SQL Editor

-- 1. List ALL triggers on materials table
SELECT 
    tgname as trigger_name,
    tgfoid::regproc as function_name,
    tgenabled as is_enabled,
    tgtype::text as trigger_type,
    tgnargs as num_args,
    tgargs as args
FROM pg_trigger 
WHERE tgrelid = 'materials'::regclass
ORDER BY tgname;

-- 2. List ALL functions that reference 'approval' or '100'
SELECT 
    proname as function_name,
    prosrc as source_code
FROM pg_proc 
WHERE prosrc LIKE '%approval%' 
   OR prosrc LIKE '%100%'
   OR proname LIKE '%approval%'
ORDER BY proname;

-- 3. Check if there are any triggers that fire on UPDATE (fixed)
SELECT 
    tgname,
    tgfoid::regproc as function_name,
    tgtype::text,
    tgenabled
FROM pg_trigger 
WHERE tgrelid = 'materials'::regclass
AND tgtype::text LIKE '%UPDATE%'
ORDER BY tgname;
