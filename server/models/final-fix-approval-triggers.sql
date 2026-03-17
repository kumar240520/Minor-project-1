-- FINAL FIX: Remove the problematic trigger and keep only the 1-coin trigger
-- Run this in Supabase SQL Editor

-- 1. Drop the problematic trigger that creates 100/40 coins
DROP TRIGGER IF EXISTS on_material_approved ON materials;

-- 2. Keep only the simple_approval_trigger (already exists and gives 1 coin)
-- No need to recreate it since it's already active

-- 3. Drop the problematic function (optional, but good for cleanup)
DROP FUNCTION IF EXISTS handle_material_approval_reward() CASCADE;

-- 4. Refresh schema
NOTIFY pgrst, 'reload schema';

SELECT 'Fixed! Only simple_approval_trigger remains - will give exactly 1 coin per approval.' as status;
