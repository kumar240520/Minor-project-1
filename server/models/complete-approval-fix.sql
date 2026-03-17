-- COMPLETE FIX: Remove all duplicate approval logic
-- Run this in Supabase SQL Editor

-- 1. Drop ALL existing approval triggers and functions
DROP TRIGGER IF EXISTS trigger_material_approval_reward ON materials;
DROP FUNCTION IF EXISTS reward_material_approval();

-- 2. Create NEW simple trigger that only creates ONE transaction
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
        
        -- Create ONE transaction
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
            CASE 
                WHEN NEW.material_type = 'pyq' OR NEW.subject LIKE '%PYQ%' THEN 'PYQ_APPROVAL'
                ELSE 'MATERIAL_APPROVAL'
            END,
            'EARN',
            reward_amount,
            'Material approved: ' || COALESCE(NEW.title, 'Untitled material')
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
CREATE TRIGGER trigger_material_approval_reward
    AFTER UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION reward_material_approval();

-- 4. Clean up any existing duplicate transactions (optional)
-- This removes old 100-coin transactions
-- DELETE FROM transactions WHERE amount = 100 AND reference_type LIKE '%APPROVAL%';

-- 5. Refresh schema
NOTIFY pgrst, 'reload schema';

SELECT 'Approval system completely fixed!' as status;
