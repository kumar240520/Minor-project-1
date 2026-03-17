-- Fix: Disable only user triggers, not system triggers
-- Run this in Supabase SQL Editor

-- 1. Drop all user-defined triggers on materials table
DROP TRIGGER IF EXISTS trigger_material_approval_reward ON materials;
DROP TRIGGER IF EXISTS material_reward_trigger ON materials;
DROP TRIGGER IF EXISTS handle_approval_trigger ON materials;
DROP TRIGGER IF EXISTS on_material_update ON materials;
DROP TRIGGER IF EXISTS update_material_status ON materials;
DROP TRIGGER IF EXISTS single_approval_trigger ON materials;
DROP TRIGGER IF EXISTS simple_approval_trigger ON materials;

-- 2. Drop ALL approval functions
DROP FUNCTION IF EXISTS handle_approval() CASCADE;
DROP FUNCTION IF EXISTS reward_material_approval() CASCADE;
DROP FUNCTION IF EXISTS approve_material_reward() CASCADE;
DROP FUNCTION IF EXISTS process_approval() CASCADE;
DROP FUNCTION IF EXISTS single_coin_approval_reward() CASCADE;
DROP FUNCTION IF EXISTS simple_approval_reward() CASCADE;

-- 3. Create ONE simple function
CREATE OR REPLACE FUNCTION simple_approval_reward()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger when status changes TO 'approved'
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        -- Add exactly 1 coin
        UPDATE users
        SET coins = coins + 1,
            updated_at = timezone('utc', now())
        WHERE id = NEW.user_id;
        
        -- Create exactly ONE transaction
        INSERT INTO transactions (
            user_id,
            reference_id,
            reference_type,
            transaction_type,
            amount,
            description
        ) VALUES (
            NEW.user_id,
            NEW.id,
            'MATERIAL_APPROVAL',
            'EARN',
            1,
            'Material approved: ' || COALESCE(NEW.title, 'Untitled material')
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create ONE trigger
CREATE TRIGGER simple_approval_trigger
    AFTER UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION simple_approval_reward();

-- 5. Refresh schema
NOTIFY pgrst, 'reload schema';

SELECT 'All user triggers dropped and only one created!' as status;
