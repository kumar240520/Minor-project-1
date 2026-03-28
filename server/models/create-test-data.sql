-- Comprehensive Test Data for EduSure Platform
-- Creates 15+ students, 10-12 uploads, community posts, calendar events, and transactions
-- Run this in Supabase SQL Editor

-- ========================================
-- 1. CREATE 15+ TEST STUDENTS
-- ========================================

-- Clear existing test data (optional - comment out if you want to keep existing data)
-- DELETE FROM users WHERE email LIKE '%@test.edu';

-- Insert 15 test students with different names, emails and passwords
INSERT INTO users (id, email, name, full_name, role, coins, avatar_url, created_at, updated_at) VALUES
-- Student 1-5: Computer Science
(gen_random_uuid(), 'alice.johnson@cs.test.edu', 'Alice Johnson', 'Alice Marie Johnson', 'student', 150, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'bob.smith@cs.test.edu', 'Bob Smith', 'Bob William Smith', 'student', 120, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'charlie.brown@cs.test.edu', 'Charlie Brown', 'Charlie Michael Brown', 'student', 200, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'diana.wilson@cs.test.edu', 'Diana Wilson', 'Diana Rose Wilson', 'student', 85, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana', timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'eva.davis@cs.test.edu', 'Eva Davis', 'Eva Marie Davis', 'student', 175, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eva', timezone('utc', now()), timezone('utc', now())),

-- Student 6-10: Engineering
(gen_random_uuid(), 'frank.miller@eng.test.edu', 'Frank Miller', 'Frank Thomas Miller', 'student', 95, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frank', timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'grace.taylor@eng.test.edu', 'Grace Taylor', 'Grace Elizabeth Taylor', 'student', 160, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Grace', timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'henry.anderson@eng.test.edu', 'Henry Anderson', 'Henry James Anderson', 'student', 210, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Henry', timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'isabella.martinez@eng.test.edu', 'Isabella Martinez', 'Isabella Sofia Martinez', 'student', 130, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella', timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'jack.thomas@eng.test.edu', 'Jack Thomas', 'Jack Robert Thomas', 'student', 185, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', timezone('utc', now()), timezone('utc', now())),

-- Student 11-15: Business & Others
(gen_random_uuid(), 'kate.white@bus.test.edu', 'Kate White', 'Katherine Anne White', 'student', 140, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kate', timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'liam.harris@bus.test.edu', 'Liam Harris', 'Liam James Harris', 'student', 165, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam', timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'mia.garcia@sci.test.edu', 'Mia Garcia', 'Mia Alexandra Garcia', 'student', 195, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia', timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'noah.jackson@arts.test.edu', 'Noah Jackson', 'Noah Michael Jackson', 'student', 110, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah', timezone('utc', now()), timezone('utc', now())),

-- Student 16: Extra student
(gen_random_uuid(), 'olivia.clark@med.test.edu', 'Olivia Clark', 'Olivia Jane Clark', 'student', 125, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia', timezone('utc', now()), timezone('utc', now()))
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- 2. CREATE 12 MATERIAL UPLOADS
-- ========================================

-- Clear existing test materials (optional)
-- DELETE FROM materials WHERE title LIKE '%Test Material%';

-- Insert 12 diverse material uploads
INSERT INTO materials (id, user_id, title, description, file_url, file_type, subject, semester, status, downloads, created_at, updated_at) VALUES
-- Computer Science Materials
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), 'Data Structures Complete Guide', 'Comprehensive guide to data structures including arrays, linked lists, trees, and graphs with examples and implementations', 'https://test-files.edu/data-structures.pdf', 'PDF', 'Data Structures', '3rd Semester', 'approved', 45, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'bob.smith@cs.test.edu' LIMIT 1), 'Algorithm Design Patterns', 'Essential design patterns for software development with OOP principles and real-world applications', 'https://test-files.edu/design-patterns.pdf', 'PDF', 'Algorithms', '4th Semester', 'approved', 38, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'charlie.brown@cs.test.edu' LIMIT 1), 'Web Development Bootcamp', 'Complete web development course covering HTML, CSS, JavaScript, React, and Node.js', 'https://test-files.edu/web-bootcamp.zip', 'ZIP', 'Web Development', '2nd Semester', 'approved', 67, timezone('utc', now()), timezone('utc', now())),

-- Engineering Materials
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'frank.miller@eng.test.edu' LIMIT 1), 'Thermodynamics Lecture Notes', 'Complete thermodynamics notes including laws of thermodynamics, heat transfer, and practical applications', 'https://test-files.edu/thermodynamics.pdf', 'PDF', 'Thermodynamics', '3rd Semester', 'approved', 29, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'grace.taylor@eng.test.edu' LIMIT 1), 'Machine Shop CAD Drawings', 'Engineering CAD drawings and blueprints for various mechanical components and assemblies', 'https://test-files.edu/cad-drawings.dwg', 'DWG', 'Engineering Graphics', '2nd Semester', 'approved', 51, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'henry.anderson@eng.test.edu' LIMIT 1), 'Circuit Analysis Lab Manual', 'Electrical engineering laboratory manual with circuit analysis techniques and practical experiments', 'https://test-files.edu/circuits-lab.pdf', 'PDF', 'Electrical Engineering', '4th Semester', 'approved', 42, timezone('utc', now()), timezone('utc', now())),

-- Business Materials
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'kate.white@bus.test.edu' LIMIT 1), 'Marketing Strategy 2024', 'Complete marketing strategy framework including digital marketing, social media campaigns, and ROI analysis', 'https://test-files.edu/marketing-strategy.pptx', 'PPTX', 'Marketing', '3rd Semester', 'approved', 33, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'liam.harris@bus.test.edu' LIMIT 1), 'Financial Accounting Basics', 'Introduction to financial accounting principles, balance sheets, income statements, and cash flow analysis', 'https://test-files.edu/accounting-basics.xlsx', 'XLSX', 'Accounting', '1st Semester', 'approved', 28, timezone('utc', now()), timezone('utc', now())),

-- Other Materials
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'mia.garcia@sci.test.edu' LIMIT 1), 'Biology Lab Reports', 'Collection of biology laboratory experiments and reports covering cell biology, genetics, and ecology', 'https://test-files.edu/bio-labs.pdf', 'PDF', 'Biology', '2nd Semester', 'approved', 56, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'noah.jackson@arts.test.edu' LIMIT 1), 'Digital Art Portfolio', 'Digital artwork collection including illustrations, graphic designs, and multimedia projects', 'https://test-files.edu/art-portfolio.zip', 'ZIP', 'Digital Arts', '3rd Semester', 'approved', 47, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'diana.wilson@cs.test.edu' LIMIT 1), 'Database Design Principles', 'Database design fundamentals including normalization, ER diagrams, and SQL optimization techniques', 'https://test-files.edu/database-design.pdf', 'PDF', 'Database Systems', '4th Semester', 'approved', 39, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'eva.davis@cs.test.edu' LIMIT 1), 'Mobile App Development', 'Complete guide to mobile application development using React Native and Flutter', 'https://test-files.edu/mobile-dev.pdf', 'PDF', 'Mobile Development', '4th Semester', 'approved', 61, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'isabella.martinez@eng.test.edu' LIMIT 1), 'Physics Problem Sets', 'Advanced physics problems with solutions covering mechanics, electromagnetism, and quantum physics', 'https://test-files.edu/physics-problems.pdf', 'PDF', 'Physics', '3rd Semester', 'approved', 44, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'jack.thomas@eng.test.edu' LIMIT 1), 'Chemistry Lab Experiments', 'Chemistry laboratory procedures and safety guidelines for organic and inorganic chemistry', 'https://test-files.edu/chem-labs.pdf', 'PDF', 'Chemistry', '2nd Semester', 'approved', 35, timezone('utc', now()), timezone('utc', now()))
ON CONFLICT DO NOTHING;

-- ========================================
-- 3. CREATE COMMUNITY POSTS
-- ========================================

-- Clear existing test posts (optional)
-- DELETE FROM community_posts WHERE title LIKE '%Test Post%';

-- Insert community posts with replies
INSERT INTO community_posts (id, user_id, title, content, category, tags, likes_count, created_at, updated_at) VALUES
-- Computer Science Posts
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), 'Help with Recursion Concepts', 'I am struggling with understanding recursion in programming, especially with tree traversals. Can someone explain the call stack and how to visualize recursive functions? Any examples would be helpful!', 'doubts', 'recursion,algorithms,programming', 12, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'charlie.brown@cs.test.edu' LIMIT 1), 'Best Resources for DSA Preparation', 'I have been preparing for data structures and algorithms interviews. Here are the resources that helped me: 1. LeetCode for practice 2. GeeksforGeeks articles 3. System Design primer 4. Mock interviews with Pramp. Would love to hear what worked for others!', 'resources', 'dsa,interview,preparation,algorithms', 28, timezone('utc', now()), timezone('utc', now())),

-- Engineering Posts
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'frank.miller@eng.test.edu' LIMIT 1), 'CAD Software Comparison', 'Looking for recommendations on CAD software. I have used AutoCAD and SolidWorks, but wondering about alternatives like Fusion 360 or FreeCAD. What are your experiences with different CAD tools for mechanical engineering?', 'discussion', 'cad,autocad,solidworks,engineering', 8, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'grace.taylor@eng.test.edu' LIMIT 1), 'Engineering Internship Tips', 'Landed my first engineering internship! Here are my tips: 1. Ask questions early 2. Document everything 3. Network with colleagues 4. Take initiative on projects. What internship experiences do others want to share?', 'experiences', 'internship,engineering,career', 19, timezone('utc', now()), timezone('utc', now())),

-- General Posts
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'kate.white@bus.test.edu' LIMIT 1), 'Study Group for Marketing', 'Forming a study group for digital marketing exam preparation. We plan to meet weekly to discuss case studies and practice presentations. Looking for 3-4 more students to join. DM me if interested!', 'study_groups', 'marketing,study,exam', 15, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'mia.garcia@sci.test.edu' LIMIT 1), 'Biology Research Opportunity', 'Our professor is offering undergraduate research opportunities in molecular biology lab. Requirements: GPA 3.0+, available 10hrs/week, basic lab experience. This is great for resume building!', 'opportunities', 'research,biology,undergraduate', 22, timezone('utc', now()), timezone('utc', now()))
ON CONFLICT DO NOTHING;

-- ========================================
-- 4. CREATE COMMUNITY REPLIES
-- ========================================

-- Insert replies to community posts
INSERT INTO community_replies (id, post_id, user_id, content, is_accepted, created_at, updated_at) VALUES
-- Replies to Alice's recursion post
(gen_random_uuid(), (SELECT id FROM community_posts WHERE title = 'Help with Recursion Concepts' LIMIT 1), (SELECT id FROM users WHERE email = 'charlie.brown@cs.test.edu' LIMIT 1), 'Recursion is all about breaking down problems into smaller versions of themselves! Think of it like a function that calls itself with a simpler input until it reaches a base case. The call stack is like a stack of papers - each recursive call adds a new paper on top. For tree traversal, imagine you are exploring a maze - you keep track of where you have been and where you need to go next. Check out recursionvisualization.org for interactive visualizations!', false, timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), (SELECT id FROM community_posts WHERE title = 'Help with Recursion Concepts' LIMIT 1), (SELECT id FROM users WHERE email = 'bob.smith@cs.test.edu' LIMIT 1), 'I struggled with recursion too! What helped me was practicing with simple examples first: factorial(5), then fibonacci(10), then tree traversal. Also, drawing the call stack on paper really helps visualize what is happening. Good luck!', false, timezone('utc', now()), timezone('utc', now())),

-- Reply to Grace's internship post
(gen_random_uuid(), (SELECT id FROM community_posts WHERE title = 'Engineering Internship Tips' LIMIT 1), (SELECT id FROM users WHERE email = 'henry.anderson@eng.test.edu' LIMIT 1), 'Great tips Grace! I would add: 5. Keep a daily log of your work 6. Ask for feedback regularly 7. Volunteer for challenging tasks 8. Build relationships with your team. Congratulations on the internship!', true, timezone('utc', now()), timezone('utc', now())),

-- Reply to CAD software post
(gen_random_uuid(), (SELECT id FROM community_posts WHERE title = 'CAD Software Comparison' LIMIT 1), (SELECT id FROM users WHERE email = 'jack.thomas@eng.test.edu' LIMIT 1), 'I have used all three! AutoCAD is industry standard but expensive. SolidWorks has better simulation tools. Fusion 360 is great for collaboration and cloud-based work. FreeCAD is powerful but steeper learning curve. For student projects, I recommend Fusion 360 (free for students) or SolidWorks (educational license available).', false, timezone('utc', now()), timezone('utc', now()))
ON CONFLICT DO NOTHING;

-- ========================================
-- 5. CREATE CALENDAR EVENTS
-- ========================================

-- Clear existing test events (optional)
-- DELETE FROM calendar_events WHERE title LIKE '%Test Event%';

-- Insert diverse calendar events
INSERT INTO calendar_events (id, title, description, date, type, created_at, updated_at) VALUES
-- Academic Events
(gen_random_uuid(), 'Mid-Term Examination Week', 'Comprehensive examinations for all courses. Please prepare well and bring necessary materials. Exam schedule will be posted separately.', timezone('utc', now()) + interval '2 weeks', 'exam', timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'Project Submission Deadline', 'Final deadline for all semester projects and assignments. Late submissions will not be accepted except with medical documentation.', timezone('utc', now()) + interval '3 weeks', 'deadline', timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'Guest Lecture: AI in Education', 'Special guest lecture on the impact of artificial intelligence in modern education systems. Open to all students and faculty.', timezone('utc', now()) + interval '1 week', 'lecture', timezone('utc', now()), timezone('utc', now())),

-- Career Events
(gen_random_uuid(), 'Tech Career Fair 2024', 'Major technology companies visiting campus for recruitment. Bring your resumes and dress professionally. Pre-registration required.', timezone('utc', now()) + interval '4 weeks', 'placement', timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'Startup Pitch Competition', 'Annual startup pitch competition with prizes for innovative ideas. Register your team and submit executive summary by deadline.', timezone('utc', now()) + interval '6 weeks', 'competition', timezone('utc', now()), timezone('utc', now())),

-- Social Events
(gen_random_uuid(), 'Spring Festival 2024', 'Annual cultural festival with music, food, and activities. All students welcome. Volunteer opportunities available.', timezone('utc', now()) + interval '1 month', 'festival', timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'Workshop: Resume Building', 'Professional resume building workshop with industry experts. Learn how to create impactful resumes and LinkedIn profiles.', timezone('utc', now()) + interval '5 days', 'workshop', timezone('utc', now()), timezone('utc', now())),

-- Workshops
(gen_random_uuid(), 'Machine Learning Workshop', 'Hands-on workshop covering neural networks, deep learning fundamentals, and practical ML applications using Python and TensorFlow.', timezone('utc', now()) + interval '2 weeks', 'workshop', timezone('utc', now()), timezone('utc', now())),
(gen_random_uuid(), 'Research Paper Writing', 'Learn how to structure and write academic research papers for publication. Covering literature review, methodology, and citation management.', timezone('utc', now()) + interval '3 weeks', 'workshop', timezone('utc', now()), timezone('utc', now()))
ON CONFLICT DO NOTHING;

-- ========================================
-- 6. CREATE TRANSACTIONS
-- ========================================

-- Clear existing test transactions (optional)
-- DELETE FROM transactions WHERE description LIKE '%Test Transaction%';

-- Insert various transactions for testing
INSERT INTO transactions (id, user_id, reference_id, reference_type, transaction_type, amount, description, created_at) VALUES
-- Daily Login Rewards
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), NULL, 'daily_login', 'EARN', 10, 'Daily login reward for consecutive 7 days', timezone('utc', now() - interval '1 day')),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'bob.smith@cs.test.edu' LIMIT 1), NULL, 'daily_login', 'EARN', 10, 'Daily login reward for consecutive 5 days', timezone('utc', now() - interval '2 days')),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'charlie.brown@cs.test.edu' LIMIT 1), NULL, 'daily_login', 'EARN', 10, 'Daily login reward for consecutive 14 days', timezone('utc', now() - interval '3 days')),

-- Resource Downloads (SPEND)
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), (SELECT id FROM materials WHERE title = 'Algorithm Design Patterns' LIMIT 1), 'material_download', 'SPEND', -20, 'Downloaded Algorithm Design Patterns by Bob Smith', timezone('utc', now() - interval '5 days')),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'diana.wilson@cs.test.edu' LIMIT 1), (SELECT id FROM materials WHERE title = 'Web Development Bootcamp' LIMIT 1), 'material_download', 'SPEND', -25, 'Downloaded Web Development Bootcamp by Charlie Brown', timezone('utc', now() - interval '1 week')),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'eva.davis@cs.test.edu' LIMIT 1), (SELECT id FROM materials WHERE title = 'Thermodynamics Lecture Notes' LIMIT 1), 'material_download', 'SPEND', -15, 'Downloaded Thermodynamics Lecture Notes by Frank Miller', timezone('utc', now() - interval '3 days')),

-- Answer Acceptance Rewards (EARN)
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'charlie.brown@cs.test.edu' LIMIT 1), (SELECT id FROM community_replies WHERE content LIKE 'Recursion is all about breaking down%' LIMIT 1), 'answer_accept', 'EARN', 50, 'Accepted answer for helping with recursion concepts', timezone('utc', now() - interval '2 days')),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'henry.anderson@eng.test.edu' LIMIT 1), (SELECT id FROM community_replies WHERE content LIKE 'Great tips Grace!%' LIMIT 1), 'answer_accept', 'EARN', 50, 'Accepted answer for engineering internship tips', timezone('utc', now() - interval '4 days')),

-- Event Attendance Rewards (EARN)
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'frank.miller@eng.test.edu' LIMIT 1), (SELECT id FROM calendar_events WHERE title = 'Machine Learning Workshop' LIMIT 1), 'event_attendance', 'EARN', 30, 'Attended Machine Learning Workshop', timezone('utc', now() - interval '1 day')),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'kate.white@bus.test.edu' LIMIT 1), (SELECT id FROM calendar_events WHERE title = 'Tech Career Fair 2024' LIMIT 1), 'event_attendance', 'EARN', 25, 'Attended Tech Career Fair 2024', timezone('utc', now() - interval '2 weeks')),

-- Fiat Purchases
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), 'pay_001', 'fiat_purchase', 'EARN', 100, 'Purchased 100 coins via payment gateway', timezone('utc', now() - interval '1 week')),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'bob.smith@cs.test.edu' LIMIT 1), 'pay_002', 'fiat_purchase', 'EARN', 50, 'Purchased 50 coins via payment gateway', timezone('utc', now() - interval '3 days'))
ON CONFLICT DO NOTHING;

-- ========================================
-- 7. UPDATE USER COINS BASED ON TRANSACTIONS
-- ========================================

-- Update user coins based on transactions
UPDATE users SET coins = (
    SELECT coins + COALESCE(SUM(
        CASE 
            WHEN transaction_type = 'EARN' THEN amount 
            WHEN transaction_type = 'SPEND' THEN -amount 
            ELSE 0 
        END
    ), 0) 
    FROM transactions 
    WHERE user_id = users.id
) WHERE email IN (
    'alice.johnson@cs.test.edu',
    'bob.smith@cs.test.edu', 
    'charlie.brown@cs.test.edu',
    'diana.wilson@cs.test.edu',
    'eva.davis@cs.test.edu',
    'frank.miller@eng.test.edu',
    'grace.taylor@eng.test.edu',
    'henry.anderson@eng.test.edu',
    'isabella.martinez@eng.test.edu',
    'jack.thomas@eng.test.edu',
    'kate.white@bus.test.edu',
    'liam.harris@bus.test.edu',
    'mia.garcia@sci.test.edu',
    'noah.jackson@arts.test.edu',
    'olivia.clark@med.test.edu'
);

-- ========================================
-- 8. CREATE SAMPLE PURCHASES
-- ========================================

-- Insert sample purchases to test purchase functionality
INSERT INTO resource_purchases (user_id, resource_id, purchased_at) VALUES
-- Alice's purchases
((SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), (SELECT id FROM materials WHERE title = 'Data Structures Complete Guide' LIMIT 1), timezone('utc', now() - interval '2 days')),
((SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), (SELECT id FROM materials WHERE title = 'Mobile App Development' LIMIT 1), timezone('utc', now() - interval '1 day')),

-- Bob's purchases
((SELECT id FROM users WHERE email = 'bob.smith@cs.test.edu' LIMIT 1), (SELECT id FROM materials WHERE title = 'Thermodynamics Lecture Notes' LIMIT 1), timezone('utc', now() - interval '4 days')),

-- Charlie's purchases
((SELECT id FROM users WHERE email = 'charlie.brown@cs.test.edu' LIMIT 1), (SELECT id FROM materials WHERE title = 'Circuit Analysis Lab Manual' LIMIT 1), timezone('utc', now() - interval '1 week'))
ON CONFLICT DO NOTHING;

-- ========================================
-- 9. VERIFICATION QUERIES
-- ========================================

-- Verify data creation
SELECT 'Test Data Creation Summary:' as info;

SELECT 
    'Students' as data_type,
    COUNT(*) as count,
    STRING_AGG(email, ', ') as details
FROM users 
WHERE email LIKE '%@test.edu'
GROUP BY 'Students'

UNION ALL

SELECT 
    'Materials' as data_type,
    COUNT(*) as count,
    STRING_AGG(title, ', ') as details
FROM materials 
WHERE title LIKE '%Test%' OR user_id IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
GROUP BY 'Materials'

UNION ALL

SELECT 
    'Community Posts' as data_type,
    COUNT(*) as count,
    STRING_AGG(title, ', ') as details
FROM community_posts 
WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
GROUP BY 'Community Posts'

UNION ALL

SELECT 
    'Calendar Events' as data_type,
    COUNT(*) as count,
    STRING_AGG(title, ', ') as details
FROM calendar_events 
WHERE title LIKE '%Test%' OR type IN ('exam', 'deadline', 'lecture', 'placement', 'competition', 'festival', 'workshop')
GROUP BY 'Calendar Events'

UNION ALL

SELECT 
    'Transactions' as data_type,
    COUNT(*) as count,
    STRING_AGG(transaction_type, ', ') as details
FROM transactions 
WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
GROUP BY 'Transactions'

UNION ALL

SELECT 
    'Purchases' as data_type,
    COUNT(*) as count,
    'Resource downloads and purchases' as details
FROM resource_purchases 
WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
GROUP BY 'Purchases';

-- ========================================
-- 10. REFRESH SCHEMA
-- ========================================

NOTIFY pgrst, 'reload schema';
