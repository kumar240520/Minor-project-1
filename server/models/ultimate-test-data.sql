-- Simple Test Data for EduSure Platform
-- Creates 15+ students, 10-12 uploads, community posts, calendar events, and transactions
-- Run this in Supabase SQL Editor

-- ========================================
-- STEP 1: CREATE 15+ TEST STUDENTS
-- ========================================

-- Insert 15 test students with different names, emails and passwords
-- Using only basic required fields to avoid constraints
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
-- STEP 2: CREATE 12 MATERIAL UPLOADS
-- ========================================

-- Insert 12 diverse material uploads
-- Using only basic required fields to avoid constraints
INSERT INTO materials (id, title, description, subject, file_url, uploaded_by, status, downloads, created_at) VALUES
-- Computer Science Materials
(gen_random_uuid(), 'Data Structures Complete Guide', 'Comprehensive guide to data structures including arrays, linked lists, trees, and graphs with examples and implementations', 'Data Structures', 'https://test-files.edu/data-structures.pdf', (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), 'approved', 45, timezone('utc', now())),
(gen_random_uuid(), 'Algorithm Design Patterns', 'Essential design patterns for software development with OOP principles and real-world applications', 'Algorithms', 'https://test-files.edu/design-patterns.pdf', (SELECT id FROM users WHERE email = 'bob.smith@cs.test.edu' LIMIT 1), 'approved', 38, timezone('utc', now())),
(gen_random_uuid(), 'Web Development Bootcamp', 'Complete web development course covering HTML, CSS, JavaScript, React, and Node.js', 'Web Development', 'https://test-files.edu/web-bootcamp.zip', (SELECT id FROM users WHERE email = 'charlie.brown@cs.test.edu' LIMIT 1), 'approved', 67, timezone('utc', now())),

-- Engineering Materials
(gen_random_uuid(), 'Thermodynamics Lecture Notes', 'Complete thermodynamics notes including laws of thermodynamics, heat transfer, and practical applications', 'Thermodynamics', 'https://test-files.edu/thermodynamics.pdf', (SELECT id FROM users WHERE email = 'frank.miller@eng.test.edu' LIMIT 1), 'approved', 29, timezone('utc', now())),
(gen_random_uuid(), 'Machine Shop CAD Drawings', 'Engineering CAD drawings and blueprints for various mechanical components and assemblies', 'Engineering Graphics', 'https://test-files.edu/cad-drawings.dwg', (SELECT id FROM users WHERE email = 'grace.taylor@eng.test.edu' LIMIT 1), 'approved', 51, timezone('utc', now())),
(gen_random_uuid(), 'Circuit Analysis Lab Manual', 'Electrical engineering laboratory manual with circuit analysis techniques and practical experiments', 'Electrical Engineering', 'https://test-files.edu/circuits-lab.pdf', (SELECT id FROM users WHERE email = 'henry.anderson@eng.test.edu' LIMIT 1), 'approved', 42, timezone('utc', now())),

-- Business Materials
(gen_random_uuid(), 'Marketing Strategy 2024', 'Complete marketing strategy framework including digital marketing, social media campaigns, and ROI analysis', 'Marketing', 'https://test-files.edu/marketing-strategy.pptx', (SELECT id FROM users WHERE email = 'kate.white@bus.test.edu' LIMIT 1), 'approved', 33, timezone('utc', now())),
(gen_random_uuid(), 'Financial Accounting Basics', 'Introduction to financial accounting principles, balance sheets, income statements, and cash flow analysis', 'Accounting', 'https://test-files.edu/accounting-basics.xlsx', (SELECT id FROM users WHERE email = 'liam.harris@bus.test.edu' LIMIT 1), 'approved', 28, timezone('utc', now())),

-- Other Materials
(gen_random_uuid(), 'Biology Lab Reports', 'Collection of biology laboratory experiments and reports covering cell biology, genetics, and ecology', 'Biology', 'https://test-files.edu/bio-labs.pdf', (SELECT id FROM users WHERE email = 'mia.garcia@sci.test.edu' LIMIT 1), 'approved', 56, timezone('utc', now())),
(gen_random_uuid(), 'Digital Art Portfolio', 'Digital artwork collection including illustrations, graphic designs, and multimedia projects', 'Digital Arts', 'https://test-files.edu/art-portfolio.zip', (SELECT id FROM users WHERE email = 'noah.jackson@arts.test.edu' LIMIT 1), 'approved', 47, timezone('utc', now())),
(gen_random_uuid(), 'Database Design Principles', 'Database design fundamentals including normalization, ER diagrams, and SQL optimization techniques', 'Database Systems', 'https://test-files.edu/database-design.pdf', (SELECT id FROM users WHERE email = 'diana.wilson@cs.test.edu' LIMIT 1), 'approved', 39, timezone('utc', now())),
(gen_random_uuid(), 'Mobile App Development', 'Complete guide to mobile application development using React Native and Flutter', 'Mobile Development', 'https://test-files.edu/mobile-dev.pdf', (SELECT id FROM users WHERE email = 'eva.davis@cs.test.edu' LIMIT 1), 'approved', 61, timezone('utc', now())),
(gen_random_uuid(), 'Physics Problem Sets', 'Advanced physics problems with solutions covering mechanics, electromagnetism, and quantum physics', 'Physics', 'https://test-files.edu/physics-problems.pdf', (SELECT id FROM users WHERE email = 'isabella.martinez@eng.test.edu' LIMIT 1), 'approved', 44, timezone('utc', now())),
(gen_random_uuid(), 'Chemistry Lab Experiments', 'Chemistry laboratory procedures and safety guidelines for organic and inorganic chemistry', 'Chemistry', 'https://test-files.edu/chem-labs.pdf', (SELECT id FROM users WHERE email = 'jack.thomas@eng.test.edu' LIMIT 1), 'approved', 35, timezone('utc', now()))
ON CONFLICT DO NOTHING;

-- ========================================
-- STEP 3: CREATE COMMUNITY POSTS
-- ========================================

-- Insert community posts with replies
-- Using only basic required fields to avoid constraints
INSERT INTO community_posts (id, user_id, title, content, created_at, author_name, tags, likes) VALUES
-- Computer Science Posts
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), 'Help with Recursion Concepts', 'I am struggling with understanding recursion in programming, especially with tree traversals. Can someone explain the call stack and how to visualize recursive functions? Any examples would be helpful!', timezone('utc', now()), 'Alice Johnson', ARRAY['recursion', 'algorithms', 'programming'], 12),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'charlie.brown@cs.test.edu' LIMIT 1), 'Best Resources for DSA Preparation', 'I have been preparing for data structures and algorithms interviews. Here are the resources that helped me: 1. LeetCode for practice 2. GeeksforGeeks articles 3. System Design primer 4. Mock interviews with Pramp. Would love to hear what worked for others!', timezone('utc', now()), 'Charlie Brown', ARRAY['dsa', 'interview', 'preparation', 'algorithms'], 28),

-- Engineering Posts
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'frank.miller@eng.test.edu' LIMIT 1), 'CAD Software Comparison', 'Looking for recommendations on CAD software. I have used AutoCAD and SolidWorks, but wondering about alternatives like Fusion 360 or FreeCAD. What are your experiences with different CAD tools for mechanical engineering?', timezone('utc', now()), 'Frank Miller', ARRAY['cad', 'autocad', 'solidworks', 'engineering'], 8),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'grace.taylor@eng.test.edu' LIMIT 1), 'Engineering Internship Tips', 'Landed my first engineering internship! Here are my tips: 1. Ask questions early 2. Document everything 3. Network with colleagues 4. Take initiative on projects. What internship experiences do others want to share?', timezone('utc', now()), 'Grace Taylor', ARRAY['internship', 'engineering', 'career'], 19),

-- General Posts
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'kate.white@bus.test.edu' LIMIT 1), 'Study Group for Marketing', 'Forming a study group for digital marketing exam preparation. We plan to meet weekly to discuss case studies and practice presentations. Looking for 3-4 more students to join. DM me if interested!', timezone('utc', now()), 'Kate White', ARRAY['marketing', 'study', 'exam'], 15),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'mia.garcia@sci.test.edu' LIMIT 1), 'Biology Research Opportunity', 'Our professor is offering undergraduate research opportunities in molecular biology lab. Requirements: GPA 3.0+, available 10hrs/week, basic lab experience. This is great for resume building!', timezone('utc', now()), 'Mia Garcia', ARRAY['research', 'biology', 'undergraduate'], 22)
ON CONFLICT DO NOTHING;

-- ========================================
-- STEP 4: CREATE CALENDAR EVENTS
-- ========================================

-- Insert diverse calendar events
-- Using only basic required fields to avoid constraints
INSERT INTO calendar_events (id, title, description, event_date, created_at, type) VALUES
-- Academic Events
(gen_random_uuid(), 'Mid-Term Examination Week', 'Comprehensive examinations for all courses. Please prepare well and bring necessary materials. Exam schedule will be posted separately.', timezone('utc', now()) + interval '2 weeks', timezone('utc', now()), 'exam'),
(gen_random_uuid(), 'Project Submission Deadline', 'Final deadline for all semester projects and assignments. Late submissions will not be accepted except with medical documentation.', timezone('utc', now()) + interval '3 weeks', timezone('utc', now()), 'deadline'),
(gen_random_uuid(), 'Guest Lecture: AI in Education', 'Special guest lecture on the impact of artificial intelligence in modern education systems. Open to all students and faculty.', timezone('utc', now()) + interval '1 week', timezone('utc', now()), 'lecture'),

-- Career Events
(gen_random_uuid(), 'Tech Career Fair 2024', 'Major technology companies visiting campus for recruitment. Bring your resumes and dress professionally. Pre-registration required.', timezone('utc', now()) + interval '4 weeks', timezone('utc', now()), 'placement'),
(gen_random_uuid(), 'Startup Pitch Competition', 'Annual startup pitch competition with prizes for innovative ideas. Register your team and submit executive summary by deadline.', timezone('utc', now()) + interval '6 weeks', timezone('utc', now()), 'competition'),

-- Social Events
(gen_random_uuid(), 'Spring Festival 2024', 'Annual cultural festival with music, food, and activities. All students welcome. Volunteer opportunities available.', timezone('utc', now()) + interval '1 month', timezone('utc', now()), 'festival'),
(gen_random_uuid(), 'Workshop: Resume Building', 'Professional resume building workshop with industry experts. Learn how to create impactful resumes and LinkedIn profiles.', timezone('utc', now()) + interval '5 days', timezone('utc', now()), 'workshop'),

-- Workshops
(gen_random_uuid(), 'Machine Learning Workshop', 'Hands-on workshop covering neural networks, deep learning fundamentals, and practical ML applications using Python and TensorFlow.', timezone('utc', now()) + interval '2 weeks', timezone('utc', now()), 'workshop'),
(gen_random_uuid(), 'Research Paper Writing', 'Learn how to structure and write academic research papers for publication. Covering literature review, methodology, and citation management.', timezone('utc', now()) + interval '3 weeks', timezone('utc', now()), 'workshop')
ON CONFLICT DO NOTHING;

-- ========================================
-- STEP 5: CREATE TRANSACTIONS
-- ========================================

-- Insert various transactions for testing
-- Using only basic required fields to avoid constraints
INSERT INTO transactions (id, user_id, type, amount, created_at, description) VALUES
-- Daily Login Rewards
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), 'credit', 10, timezone('utc', now() - interval '1 day'), 'Daily login reward for consecutive 7 days'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'bob.smith@cs.test.edu' LIMIT 1), 'credit', 10, timezone('utc', now() - interval '2 days'), 'Daily login reward for consecutive 5 days'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'charlie.brown@cs.test.edu' LIMIT 1), 'credit', 10, timezone('utc', now() - interval '3 days'), 'Daily login reward for consecutive 14 days'),

-- Resource Downloads (SPEND)
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), 'debit', -20, timezone('utc', now() - interval '5 days'), 'Downloaded Algorithm Design Patterns by Bob Smith'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'diana.wilson@cs.test.edu' LIMIT 1), 'debit', -25, timezone('utc', now() - interval '1 week'), 'Downloaded Web Development Bootcamp by Charlie Brown'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'eva.davis@cs.test.edu' LIMIT 1), 'debit', -15, timezone('utc', now() - interval '3 days'), 'Downloaded Thermodynamics Lecture Notes by Frank Miller'),

-- Answer Acceptance Rewards (EARN)
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'charlie.brown@cs.test.edu' LIMIT 1), 'credit', 50, timezone('utc', now() - interval '2 days'), 'Accepted answer for helping with recursion concepts'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'henry.anderson@eng.test.edu' LIMIT 1), 'credit', 50, timezone('utc', now() - interval '4 days'), 'Accepted answer for engineering internship tips'),

-- Event Attendance Rewards (EARN)
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'frank.miller@eng.test.edu' LIMIT 1), 'credit', 30, timezone('utc', now() - interval '1 day'), 'Attended Machine Learning Workshop'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'kate.white@bus.test.edu' LIMIT 1), 'credit', 25, timezone('utc', now() - interval '2 weeks'), 'Attended Tech Career Fair 2024'),

-- Fiat Purchases
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), 'credit', 100, timezone('utc', now() - interval '1 week'), 'Purchased 100 coins via payment gateway'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'bob.smith@cs.test.edu' LIMIT 1), 'credit', 50, timezone('utc', now() - interval '3 days'), 'Purchased 50 coins via payment gateway')
ON CONFLICT DO NOTHING;

-- ========================================
-- STEP 6: CREATE SAMPLE PURCHASES
-- ========================================

-- Insert sample purchases to test purchase functionality
-- Using only basic required fields to avoid constraints
INSERT INTO resource_purchases (id, user_id, resource_id, purchased_at) VALUES
-- Alice's purchases
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), (SELECT id FROM materials WHERE title = 'Data Structures Complete Guide' LIMIT 1), timezone('utc', now() - interval '2 days')),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), (SELECT id FROM materials WHERE title = 'Mobile App Development' LIMIT 1), timezone('utc', now() - interval '1 day')),

-- Bob's purchases
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'bob.smith@cs.test.edu' LIMIT 1), (SELECT id FROM materials WHERE title = 'Thermodynamics Lecture Notes' LIMIT 1), timezone('utc', now() - interval '4 days')),

-- Charlie's purchases
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'charlie.brown@cs.test.edu' LIMIT 1), (SELECT id FROM materials WHERE title = 'Circuit Analysis Lab Manual' LIMIT 1), timezone('utc', now() - interval '1 week'))
ON CONFLICT DO NOTHING;

-- ========================================
-- STEP 7: SIMPLE VERIFICATION
-- ========================================

-- Simple verification without GROUP BY
SELECT 'Test Data Creation Summary:' as info;

SELECT 'Students Created: ' || COUNT(*) || ' students' as result
FROM users 
WHERE email LIKE '%@test.edu';

SELECT 'Materials Created: ' || COUNT(*) || ' materials' as result
FROM materials 
WHERE title LIKE '%Test%' OR uploaded_by IN (SELECT id FROM users WHERE email LIKE '%@test.edu');

SELECT 'Community Posts Created: ' || COUNT(*) || ' posts' as result
FROM community_posts 
WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.edu');

SELECT 'Calendar Events Created: ' || COUNT(*) || ' events' as result
FROM calendar_events 
WHERE title LIKE '%Test%' OR type IN ('exam', 'deadline', 'lecture', 'placement', 'competition', 'festival', 'workshop');

SELECT 'Transactions Created: ' || COUNT(*) || ' transactions' as result
FROM transactions 
WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.edu');

SELECT 'Purchases Created: ' || COUNT(*) || ' purchases' as result
FROM resource_purchases 
WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.edu');

-- ========================================
-- STEP 8: REFRESH SCHEMA
-- ========================================

NOTIFY pgrst, 'reload schema';
