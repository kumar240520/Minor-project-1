-- EduSure Coin Reward System
-- Execute this entire file in Supabase SQL Editor

-- =============================================================================
-- 1. APPROVAL REWARD SYSTEM (+1 Coin to uploader when status changes to 'approved')
-- =============================================================================

-- Function to handle approval rewards
CREATE OR REPLACE FUNCTION reward_material_approval()
RETURNS TRIGGER AS $$
DECLARE
    uploader_id UUID;
    reward_amount INTEGER := 1;
BEGIN
    -- Only trigger when status changes TO 'approved' (not from approved to something else)
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        -- Get the uploader's ID
        uploader_id := NEW.user_id;

        -- Give +1 coin to uploader (same for all materials)
        UPDATE users
        SET coins = coins + reward_amount,
            updated_at = timezone('utc', now())
        WHERE id = uploader_id;

        -- Insert transaction record
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

        -- Log the approval reward (optional)
        RAISE NOTICE 'Awarded % coins to user % for material approval: %', reward_amount, uploader_id, NEW.title;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for approval rewards
DROP TRIGGER IF EXISTS trigger_material_approval_reward ON materials;
CREATE TRIGGER trigger_material_approval_reward
    AFTER UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION reward_material_approval();

-- =============================================================================
-- 2. DOWNLOAD REWARD SYSTEM (80/20 Split)
-- =============================================================================

-- Function to process material downloads with rewards
CREATE OR REPLACE FUNCTION process_material_download(
    p_resource_id UUID,
    p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    material_record RECORD;
    buyer_coins INTEGER;
    download_price INTEGER;
    uploader_reward INTEGER;
    platform_fee INTEGER;
    result JSON;
BEGIN
    -- Get material details
    SELECT * INTO material_record
    FROM materials
    WHERE id = p_resource_id;

    -- Validate material exists and is approved
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Material not found');
    END IF;

    IF material_record.status != 'approved' THEN
        RETURN json_build_object('error', 'Material is not approved for download');
    END IF;

    -- Prevent self-download
    IF material_record.user_id = p_user_id THEN
        RETURN json_build_object('error', 'You cannot download your own material');
    END IF;

    -- Check if already purchased
    IF EXISTS (
        SELECT 1 FROM resource_purchases
        WHERE user_id = p_user_id AND resource_id = p_resource_id
    ) THEN
        -- Return file URL for already purchased material
        RETURN json_build_object(
            'file_url', material_record.file_url,
            'remaining_coins', (SELECT coins FROM users WHERE id = p_user_id),
            'reward_earned', 0
        );
    END IF;

    -- Get buyer coins
    SELECT coins INTO buyer_coins
    FROM users
    WHERE id = p_user_id;

    -- Set download price (assuming materials table has price column)
    download_price := COALESCE(material_record.price, 0);

    -- Validate buyer has enough coins
    IF buyer_coins < download_price THEN
        RETURN json_build_object('error', 'Insufficient coins');
    END IF;

    -- Calculate rewards (80/20 split)
    uploader_reward := FLOOR(download_price * 0.8)::INTEGER;
    platform_fee := download_price - uploader_reward;

    -- Start transaction
    BEGIN
        -- 1. Deduct coins from buyer
        UPDATE users
        SET coins = coins - download_price,
            updated_at = timezone('utc', now())
        WHERE id = p_user_id;

        -- 2. Give 80% reward to uploader
        UPDATE users
        SET coins = coins + uploader_reward,
            updated_at = timezone('utc', now())
        WHERE id = material_record.user_id;

        -- 3. Record purchase
        INSERT INTO resource_purchases (user_id, resource_id)
        VALUES (p_user_id, p_resource_id);

        -- 4. Update download count
        UPDATE materials
        SET downloads = downloads + 1,
            updated_at = timezone('utc', now())
        WHERE id = p_resource_id;

        -- 5. Insert transaction records
        -- Buyer transaction
        INSERT INTO transactions (
            user_id,
            reference_id,
            reference_type,
            transaction_type,
            amount,
            description
        ) VALUES (
            p_user_id,
            p_resource_id,
            'MATERIAL_PURCHASE',
            'SPEND',
            download_price,
            'Purchased material: ' || material_record.title
        );

        -- Uploader transaction
        INSERT INTO transactions (
            user_id,
            reference_id,
            reference_type,
            transaction_type,
            amount,
            description
        ) VALUES (
            material_record.user_id,
            p_resource_id,
            'MATERIAL_SALE',
            'EARN',
            uploader_reward,
            'Sale of material: ' || material_record.title
        );

        -- Get updated buyer coins
        SELECT coins INTO buyer_coins
        FROM users
        WHERE id = p_user_id;

        -- Return success result
        result := json_build_object(
            'file_url', material_record.file_url,
            'remaining_coins', buyer_coins,
            'reward_earned', uploader_reward,
            'price_paid', download_price,
            'platform_fee', platform_fee
        );

        RETURN result;

    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback transaction on error
            RETURN json_build_object('error', 'Transaction failed: ' || SQLERRM);
    END;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 3. ENSURE REQUIRED TABLES EXIST
-- =============================================================================

-- Ensure materials table has price column
ALTER TABLE materials
ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 5;

-- Ensure materials table has downloads column
ALTER TABLE materials
ADD COLUMN IF NOT EXISTS downloads INTEGER DEFAULT 0;

-- Create resource_purchases table if it doesn't exist
CREATE TABLE IF NOT EXISTS resource_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    purchased_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    UNIQUE(user_id, resource_id)
);

-- Enable RLS on resource_purchases
ALTER TABLE resource_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for resource_purchases
CREATE POLICY "Users can view their own purchases"
ON resource_purchases FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases"
ON resource_purchases FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 4. TEST DATA (Optional - remove in production)
-- =============================================================================

-- NOTE: Insert test materials manually after creating test users
-- Example:
-- INSERT INTO materials (user_id, title, description, file_url, subject, status, price)
-- VALUES ('your-valid-user-id', 'Test Material', 'Description', '/files/test.pdf', 'CSE', 'approved', 5);

-- =============================================================================
-- 5. REFRESH SCHEMA CACHE
-- =============================================================================

-- Notify Supabase to reload schema
NOTIFY pgrst, 'reload schema';

-- Success message
SELECT 'Coin reward system successfully implemented!' as status;
