-- Complete search for ANY function that creates 100 coin transactions
-- Run this in Supabase SQL Editor

-- 1. Search ALL functions for '100'
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_definition LIKE '%100%'
AND routine_schema = 'public';

-- 2. Search ALL functions for amount = 100 or coins = 100
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_definition ~ '(amount|coins)\s*=\s*100'
AND routine_schema = 'public';

-- 3. Check if there are any remaining triggers on materials
SELECT trigger_name, action_statement, action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'materials'
AND trigger_schema = 'public';

-- 4. Check recent transactions to see the pattern
SELECT user_id, amount, reference_type, description, created_at
FROM transactions 
WHERE amount = 100 
ORDER BY created_at DESC LIMIT 10;

-- 5. Drop ALL triggers on materials table completely
DROP TRIGGER IF EXISTS trigger_material_approval_reward ON materials;
DROP TRIGGER IF EXISTS material_reward_trigger ON materials;
DROP TRIGGER IF EXISTS handle_approval_trigger ON materials;
DROP TRIGGER IF EXISTS on_material_update ON materials;
DROP TRIGGER IF EXISTS update_material_status ON materials;

-- 6. Drop ALL approval functions
DROP FUNCTION IF EXISTS handle_approval() CASCADE;
DROP FUNCTION IF EXISTS reward_material_approval() CASCADE;
DROP FUNCTION IF EXISTS approve_material_reward() CASCADE;
DROP FUNCTION IF EXISTS process_approval() CASCADE;

-- 7. Create a completely NEW function with different name
CREATE OR REPLACE FUNCTION single_coin_approval_reward()
RETURNS TRIGGER AS $$
DECLARE
    uploader_id UUID;
BEGIN
    -- Only trigger when status changes TO 'approved'
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        uploader_id := NEW.user_id;
        
        -- Add exactly 1 coin
        UPDATE users
        SET coins = coins + 1,
            updated_at = timezone('utc', now())
        WHERE id = uploader_id;
        
        -- Create exactly ONE transaction
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
            1,
            'Material approved: ' || COALESCE(NEW.title, 'Untitled material')
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create the trigger with new name
CREATE TRIGGER single_approval_trigger
    AFTER UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION single_coin_approval_reward();

-- 9. Refresh schema
NOTIFY pgrst, 'reload schema';

SELECT 'Complete reset done - only new function exists!' as status;
