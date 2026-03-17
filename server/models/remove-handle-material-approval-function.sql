-- Remove the problematic function that creates 100/40 coin transactions
-- Run this in Supabase SQL Editor

-- 1. Drop the problematic function and its trigger
DROP FUNCTION IF EXISTS handle_material_approval_reward() CASCADE;

-- 2. Also drop any triggers that might be using it
DROP TRIGGER IF EXISTS handle_material_approval_reward_trigger ON materials;

-- 3. Keep only the simple_approval_reward function
-- (This should already exist and gives exactly 1 coin)

-- 4. Make sure the simple trigger exists
DROP TRIGGER IF EXISTS simple_approval_trigger ON materials;
CREATE TRIGGER simple_approval_trigger
    AFTER UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION simple_approval_reward();

-- 5. Refresh schema
NOTIFY pgrst, 'reload schema';

SELECT 'handle_material_approval_reward function removed - only 1 coin will be given now!' as status;
