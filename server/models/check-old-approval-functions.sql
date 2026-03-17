-- Check for old approval functions and triggers
-- Run this in Supabase SQL Editor

-- List all functions related to approval
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name LIKE '%approval%' OR routine_name LIKE '%reward%'
AND routine_schema = 'public';

-- List all triggers on materials table
SELECT trigger_name, event_manipulation, action_statement, action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'materials'
AND trigger_schema = 'public';

-- Check if there are multiple triggers on materials
SELECT * FROM pg_trigger 
WHERE tgrelid = 'materials'::regclass;

-- Check for any old approval transactions with 100 coins
SELECT * FROM transactions 
WHERE amount = 100 
AND (reference_type LIKE '%APPROVAL%' OR description LIKE '%approved%')
ORDER BY created_at DESC LIMIT 5;
