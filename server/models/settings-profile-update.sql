-- SQL Schema Update for Settings Profile
-- Add missing profile colums to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS university TEXT,
ADD COLUMN IF NOT EXISTS major TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Notify postgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
