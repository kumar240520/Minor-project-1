-- IMMEDIATE FIX for the specific user from debug info
-- Run this in Supabase SQL Editor right now

-- Update the existing user with their actual name
-- Replace 'Your Actual Name' with the real name of this user
UPDATE users 
SET 
    name = 'Your Actual Name',
    full_name = 'Your Actual Name',
    updated_at = NOW()
WHERE email = '0808ci231093.ies@ipsacademy.org';

-- Also update the auth.users metadata if you have access
-- This may need to be done through Supabase Dashboard Admin API
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data, 
    '{name}', 
    '"Your Actual Name"'
)
WHERE email = '0808ci231093.ies@ipsacademy.org';

UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data, 
    '{full_name}', 
    '"Your Actual Name"'
)
WHERE email = '0808ci231093.ies@ipsacademy.org';

-- Verify the fix
SELECT 
    u.id,
    u.email,
    u.name,
    u.full_name,
    a.raw_user_meta_data
FROM users u
LEFT JOIN auth.users a ON u.id = a.id
WHERE u.email = '0808ci231093.ies@ipsacademy.org';
