-- Quick Fix for Test Data Display
-- Approve materials and check data visibility

-- ========================================
-- STEP 1: APPROVE ALL MATERIALS
-- ========================================

-- Approve all materials that are in pending status
UPDATE materials 
SET status = 'approved', 
    approved_at = timezone('utc', now())
WHERE status = 'pending' 
AND uploaded_by IN (SELECT id FROM users WHERE email LIKE '%@test.edu');

-- ========================================
-- STEP 2: CHECK DATA VISIBILITY
-- ========================================

-- Check if materials are visible
SELECT 'Materials Status Check:' as info;
SELECT 
    title,
    status,
    downloads,
    created_at
FROM materials 
WHERE uploaded_by IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
ORDER BY created_at DESC;

-- Check if community posts are visible
SELECT 'Community Posts Status Check:' as info;
SELECT 
    title,
    author_name,
    likes,
    created_at
FROM community_posts 
WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
ORDER BY created_at DESC;

-- Check if calendar events are visible
SELECT 'Calendar Events Status Check:' as info;
SELECT 
    title,
    type,
    event_date,
    created_at
FROM calendar_events 
WHERE type IN ('exam', 'deadline', 'lecture', 'placement', 'competition', 'festival', 'workshop')
ORDER BY created_at DESC;

-- Check if users are visible
SELECT 'Users Status Check:' as info;
SELECT 
    email,
    name,
    role,
    coins,
    created_at
FROM users 
WHERE email LIKE '%@test.edu'
ORDER BY created_at DESC;

-- Check if transactions are visible
SELECT 'Transactions Status Check:' as info;
SELECT 
    type,
    amount,
    description,
    created_at
FROM transactions 
WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
ORDER BY created_at DESC;

-- Check if purchases are visible
SELECT 'Purchases Status Check:' as info;
SELECT 
    purchased_at
FROM resource_purchases 
WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
ORDER BY purchased_at DESC;
