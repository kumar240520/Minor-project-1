-- Remove the handle_approval function that creates 100 coin transactions
-- Run this in Supabase SQL Editor

-- 1. Drop the problematic function and its trigger
DROP TRIGGER IF EXISTS handle_approval_trigger ON materials;
DROP FUNCTION IF EXISTS handle_approval() CASCADE;

-- 2. Also drop any other approval functions to be safe
DROP TRIGGER IF EXISTS trigger_material_approval_reward ON materials;
DROP TRIGGER IF EXISTS material_reward_trigger ON materials;
DROP FUNCTION IF EXISTS reward_material_approval() CASCADE;

-- 3. Create the ONE and ONLY approval function
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

-- 4. Create the ONE and ONLY trigger
CREATE TRIGGER trigger_material_approval_reward
    AFTER UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION reward_material_approval();

-- 5. Refresh schema
NOTIFY pgrst, 'reload schema';

SELECT 'handle_approval function removed - only 1 coin will be given now!' as status;
