-- Find and remove ALL approval functions and triggers
-- Run this in Supabase SQL Editor

-- 1. List all functions that might be creating approval transactions
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_definition LIKE '%approval%' 
   OR routine_definition LIKE '%100%'
   OR routine_name LIKE '%approval%'
   OR routine_name LIKE '%reward%'
AND routine_schema = 'public';

-- 2. List all triggers on materials table
SELECT trigger_name, action_statement, action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'materials'
AND trigger_schema = 'public';

-- 3. Drop ALL triggers on materials table
DROP TRIGGER IF EXISTS trigger_material_approval_reward ON materials;
DROP TRIGGER IF EXISTS material_reward_trigger ON materials;
DROP TRIGGER IF EXISTS ANY OTHER TRIGGER NAME ON materials;

-- 4. Drop ALL approval-related functions with CASCADE
DROP FUNCTION IF EXISTS reward_material_approval() CASCADE;
DROP FUNCTION IF EXISTS ANY OTHER APPROVAL FUNCTION() CASCADE;

-- 5. Create the ONE and ONLY approval function
CREATE OR REPLACE FUNCTION reward_material_approval()
RETURNS TRIGGER AS $$
DECLARE
    uploader_id UUID;
    reward_amount INTEGER := 1;
BEGIN
    -- Only trigger when status changes TO 'approved'
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        uploader_id := NEW.user_id;
        
        -- Add 1 coin to uploader
        UPDATE users
        SET coins = coins + reward_amount,
            updated_at = timezone('utc', now())
        WHERE id = uploader_id;
        
        -- Create ONE transaction with 1 coin
        INSERT INTO transactions (
            user_id,
            reference_id,
            reference_type,
            transaction_type,
            amount,
            description
        ) VALUES (
            uploader_id,
            NEW.id,
            'MATERIAL_APPROVAL',
            'EARN',
            reward_amount,
            'Material approved: ' || COALESCE(NEW.title, 'Untitled material')
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create the ONE and ONLY trigger
CREATE TRIGGER trigger_material_approval_reward
    AFTER UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION reward_material_approval();

-- 7. Refresh schema
NOTIFY pgrst, 'reload schema';

SELECT 'All approval functions cleaned and recreated!' as status;
