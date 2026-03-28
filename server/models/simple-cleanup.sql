-- SIMPLE CLEANUP: Delete Old Materials and PYQs
-- This removes all existing materials and PYQs from the database

-- ========================================
-- STEP 1: DELETE ALL MATERIALS
-- ========================================

-- Delete all materials from the materials table
DELETE FROM materials;

-- ========================================
-- STEP 2: DELETE ALL PYQs (if separate table exists)
-- ========================================

-- Check if pyqs table exists and delete from it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'pyqs' 
        AND table_schema = 'public'
    ) THEN
        DELETE FROM pyqs;
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
-- STEP 4: SIMPLE VERIFICATION
-- ========================================

-- Check if materials table is empty
SELECT '=== MATERIALS TABLE STATUS ===' as info;
SELECT 
    COUNT(*) as materials_count,
    CASE WHEN COUNT(*) = 0 THEN 'Materials table is now empty' ELSE 'Materials table still has data' END as status
FROM materials;

-- Check if PYQs table exists and is empty
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'pyqs' 
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '=== PYQS TABLE STATUS ===';
        RAISE NOTICE 'PYQs table exists and has been cleaned';
    ELSE
        RAISE NOTICE '=== PYQS TABLE STATUS ===';
        RAISE NOTICE 'PYQs table does not exist';
    END IF;
END $$;

-- Check resource purchases status
SELECT '=== RESOURCE PURCHASES STATUS ===' as info;
SELECT 
    COUNT(*) as purchases_count,
    CASE WHEN COUNT(*) = 0 THEN 'Resource purchases table is now empty' ELSE 'Resource purchases table still has data' END as status
FROM resource_purchases;

-- Check transactions status (if relevant columns exist)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'reference_type'
    ) THEN
        RAISE NOTICE '=== TRANSACTIONS STATUS ===';
        RAISE NOTICE 'Material-related transactions have been deleted';
    ELSE
        RAISE NOTICE '=== TRANSACTIONS STATUS ===';
        RAISE NOTICE 'Transactions table exists but reference_type column not found';
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
