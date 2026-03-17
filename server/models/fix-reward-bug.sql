-- FIX REWARD ALLOCATION BUG (Hundreds of coins + missing updated_at)
-- Run this ENTIRE file in the Supabase SQL Editor

-- 1. FIX MISSING updated_at COLUMN
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc', now());

-- 2. COMPLETE CLEANUP: Remove ALL approval functions and triggers
DROP TRIGGER IF EXISTS trigger_material_approval_reward ON materials;
DROP TRIGGER IF EXISTS material_reward_trigger ON materials;
DROP TRIGGER IF EXISTS on_material_update ON materials;
DROP TRIGGER IF EXISTS update_material_status ON materials;

DROP FUNCTION IF EXISTS reward_material_approval() CASCADE;
DROP FUNCTION IF EXISTS approve_material_reward() CASCADE;
DROP FUNCTION IF EXISTS handle_material_approval() CASCADE;
DROP FUNCTION IF EXISTS process_approval() CASCADE;

-- 3. Create the correct ONE and ONLY approval function
CREATE OR REPLACE FUNCTION reward_material_approval()
RETURNS TRIGGER AS $$
DECLARE
    uploader_id UUID;
    reward_amount INTEGER := 1;
BEGIN
    -- Only trigger when status changes TO 'approved'
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        uploader_id := COALESCE(NEW.uploaded_by, NEW.user_id);
        
        IF uploader_id IS NOT NULL THEN
            -- Add 1 coin to uploader
            UPDATE users
            SET coins = COALESCE(coins, 0) + reward_amount,
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

SELECT 'Fix applied: updated_at added, all old triggers dropped, and correct 1-coin reward function created!' as status;
