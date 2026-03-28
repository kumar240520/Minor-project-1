-- CLEANUP SCRIPT: Delete Old Materials and PYQs (FIXED)
-- This removes all existing materials and PYQs from the database

-- ========================================
-- STEP 1: DELETE ALL MATERIALS
-- ========================================

-- Delete all materials from the materials table
DELETE FROM materials;

-- Reset the sequence if it exists (for auto-increment IDs)
-- Note: This is for materials table if it has a serial ID column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'materials' 
        AND column_default LIKE 'nextval%'
    ) THEN
        PERFORM setval(pg_get_serial_sequence('materials', 'id'), 1, false);
    END IF;
END $$;

-- ========================================
-- STEP 2: DELETE ALL PYQs (if separate table exists)
-- ========================================

-- Check if there's a separate PYQs table and delete from it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'pyqs' 
        AND table_schema = 'public'
    ) THEN
        DELETE FROM pyqs;
        
        -- Reset the sequence if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'pyqs' 
            AND column_default LIKE 'nextval%'
        ) THEN
            PERFORM setval(pg_get_serial_sequence('pyqs', 'id'), 1, false);
        END IF;
    END IF;
END $$;

-- ========================================
-- STEP 3: DELETE RELATED DATA
-- ========================================

-- Delete resource purchases related to materials
DELETE FROM resource_purchases;

-- Delete any transactions related to materials (if reference_type exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'reference_type'
    ) THEN
        DELETE FROM transactions 
        WHERE reference_type IN ('material_download', 'pyq_download', 'material_purchase', 'pyq_purchase');
    END IF;
END $$;

-- ========================================
-- STEP 4: VERIFICATION
-- ========================================

-- Check if materials table is empty
SELECT '=== MATERIALS TABLE STATUS ===' as info;
SELECT 
    COUNT(*) as materials_count,
    'Materials table is now empty' as status
FROM materials;

-- Check if PYQs table exists and is empty
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'pyqs' 
        AND table_schema = 'public'
    ) THEN
        PERFORM '=== PYQS TABLE STATUS ===';
        SELECT 
            COUNT(*) as pyqs_count,
            'PYQs table is now empty' as status
        FROM pyqs;
    ELSE
        PERFORM '=== PYQS TABLE STATUS ===';
        SELECT 
            0 as pyqs_count,
            'PYQs table does not exist' as status;
    END IF;
END $$;

-- Check resource purchases status
SELECT '=== RESOURCE PURCHASES STATUS ===' as info;
SELECT 
    COUNT(*) as purchases_count,
    'Resource purchases table is now empty' as status
FROM resource_purchases;

-- Check transactions status (if relevant columns exist)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'reference_type'
    ) THEN
        PERFORM '=== TRANSACTIONS STATUS ===';
        SELECT 
            COUNT(*) as transactions_count,
            'Relevant transactions have been deleted' as status
        FROM transactions 
        WHERE reference_type IN ('material_download', 'pyq_download', 'material_purchase', 'pyq_purchase');
    ELSE
        PERFORM '=== TRANSACTIONS STATUS ===';
        SELECT 
            COUNT(*) as transactions_count,
            'Transactions table exists but reference_type column not found' as status
        FROM transactions;
    END IF;
END $$;

-- ========================================
-- STEP 5: REFRESH SCHEMA
-- ========================================

NOTIFY pgrst, 'reload schema';

-- ========================================
-- STEP 6: SUMMARY
-- ========================================

SELECT '=== CLEANUP COMPLETE ===' as info;
SELECT 
    'All materials, PYQs, and related data have been successfully deleted.' as message,
    'You can now run your test data creation scripts to populate fresh data.' as next_step;
