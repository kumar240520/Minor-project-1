-- EMERGENCY FIX: Disable ALL triggers and start completely fresh
-- Run this in Supabase SQL Editor

-- 1. DISABLE ALL triggers on materials table
ALTER TABLE materials DISABLE TRIGGER ALL;

-- 2. List all triggers to see what exists
SELECT trigger_name, event_object_table, action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- 3. Drop ALL functions that might be related to approval
DROP FUNCTION IF EXISTS handle_approval() CASCADE;
DROP FUNCTION IF EXISTS reward_material_approval() CASCADE;
DROP FUNCTION IF EXISTS approve_material_reward() CASCADE;
DROP FUNCTION IF EXISTS process_approval() CASCADE;
DROP FUNCTION IF EXISTS single_coin_approval_reward() CASCADE;

-- 4. Test if approval still creates transactions (it shouldn't now)
-- After running this, try approving a material - it should NOT create any transactions

-- 5. If that works, create ONE simple function
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

-- 6. Create ONE trigger
CREATE TRIGGER simple_approval_trigger
    AFTER UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION simple_approval_reward();

-- 7. Re-enable triggers
ALTER TABLE materials ENABLE TRIGGER simple_approval_trigger;

-- 8. Refresh schema
NOTIFY pgrst, 'reload schema';

SELECT 'All triggers disabled and recreated with only one function!' as status;
