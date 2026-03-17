-- Find the function with 100 coins hardcoded
-- Run this in Supabase SQL Editor

-- Search for any function that contains '100'
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_definition LIKE '%100%'
AND routine_schema = 'public';

-- Also search for any function that mentions coins and approval together
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_definition LIKE '%coins%' 
AND routine_definition LIKE '%approval%'
AND routine_schema = 'public';

-- Check all triggers on materials table
SELECT trigger_name, action_statement, action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'materials'
AND trigger_schema = 'public';

-- Check if there are any triggers on users table that might be adding coins
SELECT trigger_name, action_statement, action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users'
AND trigger_schema = 'public';
