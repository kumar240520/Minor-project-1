-- ========================================
-- CHECK ACTIVE TABLE SCHEMA FIRST
-- ========================================

-- Run this query first to see your actual table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- ========================================
-- ALTERNATIVE: CREATE TEST DATA WITHOUT avatar_url
-- ========================================

-- If avatar_url column doesn't exist, use this version:

-- Clear existing test data (optional)
DELETE FROM users WHERE email LIKE '%@test.edu';

-- Insert 15 test students WITHOUT avatar_url
INSERT INTO users (id, email, name, full_name, role, coins, created_at, updated_at) VALUES
-- Student 1-5: Computer Science
(gen_random_uuid(), 'alice.johnson@cs.test.edu', 'Alice Johnson', 'Alice Marie Johnson', 'student', 150, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'bob.smith@cs.test.edu', 'Bob Smith', 'Bob William Smith', 'student', 120, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'charlie.brown@cs.test.edu', 'Charlie Brown', 'Charlie Michael Brown', 'student', 200, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'diana.wilson@cs.test.edu', 'Diana Wilson', 'Diana Rose Wilson', 'student', 85, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'eva.davis@cs.test.edu', 'Eva Davis', 'Eva Marie Davis', 'student', 175, timezone('utc', now()), timezone('utc', now())),

-- Student 6-10: Engineering
(gen_random_uuid(), 'frank.miller@eng.test.edu', 'Frank Miller', 'Frank Thomas Miller', 'student', 95, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'grace.taylor@eng.test.edu', 'Grace Taylor', 'Grace Elizabeth Taylor', 'student', 160, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'henry.anderson@eng.test.edu', 'Henry Anderson', 'Henry James Anderson', 'student', 210, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'isabella.martinez@eng.test.edu', 'Isabella Martinez', 'Isabella Sofia Martinez', 'student', 130, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'jack.thomas@eng.test.edu', 'Jack Thomas', 'Jack Robert Thomas', 'student', 185, timezone('utc', now()), timezone('utc', now())),

-- Student 11-15: Business & Others
(gen_random_uuid(), 'kate.white@bus.test.edu', 'Kate White', 'Katherine Anne White', 'student', 140, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'liam.harris@bus.test.edu', 'Liam Harris', 'Liam James Harris', 'student', 165, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'mia.garcia@sci.test.edu', 'Mia Garcia', 'Mia Alexandra Garcia', 'student', 195, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'noah.jackson@arts.test.edu', 'Noah Jackson', 'Noah Michael Jackson', 'student', 110, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'olivia.clark@med.test.edu', 'Olivia Clark', 'Olivia Jane Clark', 'student', 125, timezone('utc', now()), timezone('utc', now()))
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- ADD avatar_url COLUMN IF NEEDED
-- ========================================

-- If the table doesn't have avatar_url, add it:
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Then run the insert with avatar_url:
-- (Run the previous INSERT statements again after adding the column)
