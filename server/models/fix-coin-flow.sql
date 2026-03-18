-- ════════════════════════════════════════════════════════════════════════════
-- COIN FLOW FIX (CORRECTED) — Run this ENTIRE file in the Supabase SQL Editor
-- Fixes: RLS blocking student transactions + race condition in uploader credit
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Add price column to materials (safe to re-run)
ALTER TABLE materials ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 5;

-- 2. Drop all conflicting transaction INSERT policies
DROP POLICY IF EXISTS "Admins can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;

-- 3. Allow authenticated users to insert transactions for themselves only
CREATE POLICY "Users can insert own transactions"
ON transactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 4. Drop old process_material_download if it exists
DROP FUNCTION IF EXISTS process_material_download(UUID, UUID, UUID, INTEGER) CASCADE;

-- 5. Create the new atomic download processing function
CREATE OR REPLACE FUNCTION process_material_download(
    p_material_id   UUID,
    p_buyer_id      UUID,
    p_uploader_id   UUID,
    p_price         INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_buyer_coins   INTEGER;
    v_uploader_rew  INTEGER;
    v_mat_title     TEXT;
    v_already_bought BOOLEAN;
BEGIN
    -- Safety check: ensure the caller IS the buyer
    IF p_buyer_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    -- Check if already purchased
    SELECT EXISTS(
        SELECT 1 FROM resource_purchases
        WHERE user_id = p_buyer_id AND resource_id = p_material_id
    ) INTO v_already_bought;

    IF v_already_bought THEN
        RETURN jsonb_build_object('success', true, 'already_purchased', true, 'uploader_reward', 0);
    END IF;

    -- Fetch material title
    SELECT COALESCE(title, 'Material') INTO v_mat_title
    FROM materials WHERE id = p_material_id;

    -- Lock and check buyer balance
    SELECT coins INTO v_buyer_coins
    FROM users WHERE id = p_buyer_id FOR UPDATE;

    IF v_buyer_coins IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Buyer account not found');
    END IF;

    IF v_buyer_coins < p_price THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Insufficient coins. You have %s but this material costs %s.', v_buyer_coins, p_price)
        );
    END IF;

    -- ── Atomic Operations ─────────────────────────────────────────────────

    -- a) Deduct price from buyer
    UPDATE users SET coins = coins - p_price WHERE id = p_buyer_id;

    -- b) Credit 80% to uploader (if different user)
    v_uploader_rew := FLOOR(p_price * 0.8);
    IF v_uploader_rew > 0 AND p_uploader_id IS NOT NULL AND p_uploader_id != p_buyer_id THEN
        UPDATE users SET coins = coins + v_uploader_rew WHERE id = p_uploader_id;

        -- EARN transaction for uploader
        INSERT INTO transactions (user_id, reference_id, reference_type, transaction_type, amount, description)
        VALUES (p_uploader_id, p_material_id, 'resource_sale', 'EARN', v_uploader_rew,
                'Sale reward: ' || v_mat_title);
    END IF;

    -- c) Record purchase
    INSERT INTO resource_purchases (user_id, resource_id)
    VALUES (p_buyer_id, p_material_id)
    ON CONFLICT DO NOTHING;

    -- d) Increment download count
    UPDATE materials SET downloads = COALESCE(downloads, 0) + 1 WHERE id = p_material_id;

    -- e) SPEND transaction for buyer
    INSERT INTO transactions (user_id, reference_id, reference_type, transaction_type, amount, description)
    VALUES (p_buyer_id, p_material_id, 'resource_purchase', 'SPEND', p_price,
            'Purchased: ' || v_mat_title);

    RETURN jsonb_build_object(
        'success', true,
        'already_purchased', false,
        'uploader_reward', v_uploader_rew,
        'buyer_new_balance', v_buyer_coins - p_price
    );
END;
$$; -- Fixed: language specified once above

-- 6. Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION process_material_download(UUID, UUID, UUID, INTEGER) TO authenticated;

-- 7. Refresh schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'Coin flow fix (corrected) applied!' AS status;
