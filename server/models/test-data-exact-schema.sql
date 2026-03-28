-- Test Data for EduSure Platform - Based on Your ACTUAL Table Schema
-- Creates 15+ students, 10-12 uploads, community posts, calendar events, and transactions
-- Run this in Supabase SQL Editor

-- ========================================
-- STEP 1: CREATE 15+ TEST STUDENTS
-- ========================================

-- Clear existing test data (optional - comment out if you want to keep existing data)
-- DELETE FROM users WHERE email LIKE '%@test.edu';

-- Insert 15 test students with different names, emails and passwords
-- Based on your actual users table structure (no avatar_url column, but has avatar)
INSERT INTO users (id, email, name, full_name, role, coins, avatar, created_at, updated_at) VALUES
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
(gen_random_uuid(), 'olivia.clark@med.test.edu', 'Olivia Clark', 'Olivia Jane Clark', 'student', 125, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia', timezone('utc', now()), timezone('utc', now()))
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- STEP 2: CREATE 12 MATERIAL UPLOADS
-- ========================================

-- Clear existing test materials (optional)
-- DELETE FROM materials WHERE title LIKE '%Test Material%';

-- Insert 12 diverse material uploads
-- Based on your actual materials table structure
INSERT INTO materials (id, title, description, subject, file_url, uploaded_by, status, downloads, views, created_at, updated_at, type, file_name, file_type, uploader_name, material_type, icon_type, bg_color, text_color, storage_bucket, price, year, category) VALUES
-- Computer Science Materials
(gen_random_uuid(), 'Data Structures Complete Guide', 'Comprehensive guide to data structures including arrays, linked lists, trees, and graphs with examples and implementations', 'Data Structures', 'https://test-files.edu/data-structures.pdf', (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), 'approved', 45, 23, timezone('utc', now()), timezone('utc', now()), 'document', 'data-structures.pdf', 'PDF', 'Alice Johnson', 'study-material', 'document', 'blue', 'white', 'Storage', 10, '3rd', 'Computer Science'),
(gen_random_uuid(), 'Algorithm Design Patterns', 'Essential design patterns for software development with OOP principles and real-world applications', 'Algorithms', 'https://test-files.edu/design-patterns.pdf', (SELECT id FROM users WHERE email = 'bob.smith@cs.test.edu' LIMIT 1), 'approved', 38, 19, timezone('utc', now()), timezone('utc', now()), 'document', 'design-patterns.pdf', 'PDF', 'Bob Smith', 'study-material', 'document', 'green', 'white', 'Storage', 15, '4th', 'Computer Science'),
(gen_random_uuid(), 'Web Development Bootcamp', 'Complete web development course covering HTML, CSS, JavaScript, React, and Node.js', 'Web Development', 'https://test-files.edu/web-bootcamp.zip', (SELECT id FROM users WHERE email = 'charlie.brown@cs.test.edu' LIMIT 1), 'approved', 67, 31, timezone('utc', now()), timezone('utc', now()), 'archive', 'web-bootcamp.zip', 'ZIP', 'Charlie Brown', 'study-material', 'archive', 'purple', 'white', 'Storage', 25, '2nd', 'Computer Science'),

-- Engineering Materials
(gen_random_uuid(), 'Thermodynamics Lecture Notes', 'Complete thermodynamics notes including laws of thermodynamics, heat transfer, and practical applications', 'Thermodynamics', 'https://test-files.edu/thermodynamics.pdf', (SELECT id FROM users WHERE email = 'frank.miller@eng.test.edu' LIMIT 1), 'approved', 29, 15, timezone('utc', now()), timezone('utc', now()), 'document', 'thermodynamics.pdf', 'PDF', 'Frank Miller', 'study-material', 'document', 'red', 'white', 'Storage', 20, '3rd', 'Engineering'),
(gen_random_uuid(), 'Machine Shop CAD Drawings', 'Engineering CAD drawings and blueprints for various mechanical components and assemblies', 'Engineering Graphics', 'https://test-files.edu/cad-drawings.dwg', (SELECT id FROM users WHERE email = 'grace.taylor@eng.test.edu' LIMIT 1), 'approved', 51, 22, timezone('utc', now()), timezone('utc', now()), 'drawing', 'cad-drawings.dwg', 'DWG', 'Grace Taylor', 'study-material', 'drawing', 'orange', 'white', 'Storage', 18, '2nd', 'Engineering'),
(gen_random_uuid(), 'Circuit Analysis Lab Manual', 'Electrical engineering laboratory manual with circuit analysis techniques and practical experiments', 'Electrical Engineering', 'https://test-files.edu/circuits-lab.pdf', (SELECT id FROM users WHERE email = 'henry.anderson@eng.test.edu' LIMIT 1), 'approved', 42, 18, timezone('utc', now()), timezone('utc', now()), 'document', 'circuits-lab.pdf', 'PDF', 'Henry Anderson', 'study-material', 'document', 'yellow', 'white', 'Storage', 22, '4th', 'Engineering'),

-- Business Materials
(gen_random_uuid(), 'Marketing Strategy 2024', 'Complete marketing strategy framework including digital marketing, social media campaigns, and ROI analysis', 'Marketing', 'https://test-files.edu/marketing-strategy.pptx', (SELECT id FROM users WHERE email = 'kate.white@bus.test.edu' LIMIT 1), 'approved', 33, 12, timezone('utc', now()), timezone('utc', now()), 'presentation', 'marketing-strategy.pptx', 'PPTX', 'Kate White', 'study-material', 'presentation', 'pink', 'white', 'Storage', 30, '3rd', 'Business'),
(gen_random_uuid(), 'Financial Accounting Basics', 'Introduction to financial accounting principles, balance sheets, income statements, and cash flow analysis', 'Accounting', 'https://test-files.edu/accounting-basics.xlsx', (SELECT id FROM users WHERE email = 'liam.harris@bus.test.edu' LIMIT 1), 'approved', 28, 8, timezone('utc', now()), timezone('utc', now()), 'spreadsheet', 'accounting-basics.xlsx', 'XLSX', 'Liam Harris', 'study-material', 'spreadsheet', 'cyan', 'white', 'Storage', 12, '1st', 'Business'),

-- Other Materials
(gen_random_uuid(), 'Biology Lab Reports', 'Collection of biology laboratory experiments and reports covering cell biology, genetics, and ecology', 'Biology', 'https://test-files.edu/bio-labs.pdf', (SELECT id FROM users WHERE email = 'mia.garcia@sci.test.edu' LIMIT 1), 'approved', 56, 28, timezone('utc', now()), timezone('utc', now()), 'document', 'bio-labs.pdf', 'PDF', 'Mia Garcia', 'study-material', 'document', 'green', 'white', 'Storage', 15, '2nd', 'Science'),
(gen_random_uuid(), 'Digital Art Portfolio', 'Digital artwork collection including illustrations, graphic designs, and multimedia projects', 'Digital Arts', 'https://test-files.edu/art-portfolio.zip', (SELECT id FROM users WHERE email = 'noah.jackson@arts.test.edu' LIMIT 1), 'approved', 47, 16, timezone('utc', now()), timezone('utc', now()), 'archive', 'art-portfolio.zip', 'ZIP', 'Noah Jackson', 'study-material', 'archive', 'indigo', 'white', 'Storage', 20, '3rd', 'Arts'),
(gen_random_uuid(), 'Database Design Principles', 'Database design fundamentals including normalization, ER diagrams, and SQL optimization techniques', 'Database Systems', 'https://test-files.edu/database-design.pdf', (SELECT id FROM users WHERE email = 'diana.wilson@cs.test.edu' LIMIT 1), 'approved', 39, 21, timezone('utc', now()), timezone('utc', now()), 'document', 'database-design.pdf', 'PDF', 'Diana Wilson', 'study-material', 'document', 'blue', 'white', 'Storage', 18, '4th', 'Computer Science'),
(gen_random_uuid(), 'Mobile App Development', 'Complete guide to mobile application development using React Native and Flutter', 'Mobile Development', 'https://test-files.edu/mobile-dev.pdf', (SELECT id FROM users WHERE email = 'eva.davis@cs.test.edu' LIMIT 1), 'approved', 61, 25, timezone('utc', now()), timezone('utc', now()), 'document', 'mobile-dev.pdf', 'PDF', 'Eva Davis', 'study-material', 'document', 'purple', 'white', 'Storage', 28, '4th', 'Computer Science'),
(gen_random_uuid(), 'Physics Problem Sets', 'Advanced physics problems with solutions covering mechanics, electromagnetism, and quantum physics', 'Physics', 'https://test-files.edu/physics-problems.pdf', (SELECT id FROM users WHERE email = 'isabella.martinez@eng.test.edu' LIMIT 1), 'approved', 44, 17, timezone('utc', now()), timezone('utc', now()), 'document', 'physics-problems.pdf', 'PDF', 'Isabella Martinez', 'study-material', 'document', 'teal', 'white', 'Storage', 16, '3rd', 'Science'),
(gen_random_uuid(), 'Chemistry Lab Experiments', 'Chemistry laboratory procedures and safety guidelines for organic and inorganic chemistry', 'Chemistry', 'https://test-files.edu/chem-labs.pdf', (SELECT id FROM users WHERE email = 'jack.thomas@eng.test.edu' LIMIT 1), 'approved', 35, 14, timezone('utc', now()), timezone('utc', now()), 'document', 'chem-labs.pdf', 'PDF', 'Jack Thomas', 'study-material', 'document', 'brown', 'white', 'Storage', 14, '2nd', 'Science')
ON CONFLICT DO NOTHING;

-- ========================================
-- STEP 3: CREATE COMMUNITY POSTS
-- ========================================

-- Clear existing test posts (optional)
-- DELETE FROM community_posts WHERE title LIKE '%Test Post%';

-- Insert community posts with replies
-- Based on your actual community_posts table structure
INSERT INTO community_posts (id, user_id, title, content, created_at, author_avatar, author_role, author_name, tags, likes, replies) VALUES
-- Computer Science Posts
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), 'Help with Recursion Concepts', 'I am struggling with understanding recursion in programming, especially with tree traversals. Can someone explain the call stack and how to visualize recursive functions? Any examples would be helpful!', timezone('utc', now()), 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', 'Student', 'Alice Johnson', 'recursion,algorithms,programming', 12, 0),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'charlie.brown@cs.test.edu' LIMIT 1), 'Best Resources for DSA Preparation', 'I have been preparing for data structures and algorithms interviews. Here are the resources that helped me: 1. LeetCode for practice 2. GeeksforGeeks articles 3. System Design primer 4. Mock interviews with Pramp. Would love to hear what worked for others!', timezone('utc', now()), 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', 'Student', 'Charlie Brown', 'dsa,interview,preparation,algorithms', 28, 0),

-- Engineering Posts
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'frank.miller@eng.test.edu' LIMIT 1), 'CAD Software Comparison', 'Looking for recommendations on CAD software. I have used AutoCAD and SolidWorks, but wondering about alternatives like Fusion 360 or FreeCAD. What are your experiences with different CAD tools for mechanical engineering?', timezone('utc', now()), 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frank', 'Student', 'Frank Miller', 'cad,autocad,solidworks,engineering', 8, 0),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'grace.taylor@eng.test.edu' LIMIT 1), 'Engineering Internship Tips', 'Landed my first engineering internship! Here are my tips: 1. Ask questions early 2. Document everything 3. Network with colleagues 4. Take initiative on projects. What internship experiences do others want to share?', timezone('utc', now()), 'https://api.dicebear.com/7.x/avataaars/svg?seed=Grace', 'Student', 'Grace Taylor', 'internship,engineering,career', 19, 0),

-- General Posts
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'kate.white@bus.test.edu' LIMIT 1), 'Study Group for Marketing', 'Forming a study group for digital marketing exam preparation. We plan to meet weekly to discuss case studies and practice presentations. Looking for 3-4 more students to join. DM me if interested!', timezone('utc', now()), 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kate', 'Student', 'Kate White', 'marketing,study,exam', 15, 0),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'mia.garcia@sci.test.edu' LIMIT 1), 'Biology Research Opportunity', 'Our professor is offering undergraduate research opportunities in molecular biology lab. Requirements: GPA 3.0+, available 10hrs/week, basic lab experience. This is great for resume building!', timezone('utc', now()), 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia', 'Student', 'Mia Garcia', 'research,biology,undergraduate', 22, 0)
ON CONFLICT DO NOTHING;

-- ========================================
-- STEP 4: CREATE CALENDAR EVENTS
-- ========================================

-- Clear existing test events (optional)
-- DELETE FROM calendar_events WHERE title LIKE '%Test Event%';

-- Insert diverse calendar events
-- Based on your actual calendar_events table structure
INSERT INTO calendar_events (id, title, description, event_date, created_at, user_id, is_global, location, time, color, date, type) VALUES
-- Academic Events
(gen_random_uuid(), 'Mid-Term Examination Week', 'Comprehensive examinations for all courses. Please prepare well and bring necessary materials. Exam schedule will be posted separately.', timezone('utc', now()) + interval '2 weeks', timezone('utc', now()), NULL, false, 'Main Campus', '9:00 AM', 'bg-violet-500', '2024-04-15', 'exam'),
(gen_random_uuid(), 'Project Submission Deadline', 'Final deadline for all semester projects and assignments. Late submissions will not be accepted except with medical documentation.', timezone('utc', now()) + interval '3 weeks', timezone('utc', now()), NULL, false, 'Online Portal', '11:59 PM', 'bg-red-500', '2024-04-30', 'deadline'),
(gen_random_uuid(), 'Guest Lecture: AI in Education', 'Special guest lecture on the impact of artificial intelligence in modern education systems. Open to all students and faculty.', timezone('utc', now()) + interval '1 week', timezone('utc', now()), NULL, false, 'Auditorium A', '2:00 PM', 'bg-blue-500', '2024-04-08', 'lecture'),

-- Career Events
(gen_random_uuid(), 'Tech Career Fair 2024', 'Major technology companies visiting campus for recruitment. Bring your resumes and dress professionally. Pre-registration required.', timezone('utc', now()) + interval '4 weeks', timezone('utc', now()), NULL, false, 'Career Center', '10:00 AM', 'bg-green-500', '2024-05-15', 'placement'),
(gen_random_uuid(), 'Startup Pitch Competition', 'Annual startup pitch competition with prizes for innovative ideas. Register your team and submit executive summary by deadline.', timezone('utc', now()) + interval '6 weeks', timezone('utc', now()), NULL, false, 'Innovation Hub', '3:00 PM', 'bg-orange-500', '2024-06-20', 'competition'),

-- Social Events
(gen_random_uuid(), 'Spring Festival 2024', 'Annual cultural festival with music, food, and activities. All students welcome. Volunteer opportunities available.', timezone('utc', now()) + interval '1 month', timezone('utc', now()), NULL, false, 'Main Campus Grounds', '6:00 PM', 'bg-pink-500', '2024-05-10', 'festival'),
(gen_random_uuid(), 'Workshop: Resume Building', 'Professional resume building workshop with industry experts. Learn how to create impactful resumes and LinkedIn profiles.', timezone('utc', now()) + interval '5 days', timezone('utc', now()), NULL, false, 'Room 201', '2:00 PM', 'bg-indigo-500', '2024-04-05', 'workshop'),

-- Workshops
(gen_random_uuid(), 'Machine Learning Workshop', 'Hands-on workshop covering neural networks, deep learning fundamentals, and practical ML applications using Python and TensorFlow.', timezone('utc', now()) + interval '2 weeks', timezone('utc', now()), NULL, false, 'Lab Building 301', '10:00 AM', 'bg-purple-500', '2024-04-22', 'workshop'),
(gen_random_uuid(), 'Research Paper Writing', 'Learn how to structure and write academic research papers for publication. Covering literature review, methodology, and citation management.', timezone('utc', now()) + interval '3 weeks', timezone('utc', now()), NULL, false, 'Library Room 102', '3:00 PM', 'bg-teal-500', '2024-04-29', 'workshop')
ON CONFLICT DO NOTHING;

-- ========================================
-- STEP 5: CREATE TRANSACTIONS
-- ========================================

-- Clear existing test transactions (optional)
-- DELETE FROM transactions WHERE description LIKE '%Test Transaction%';

-- Insert various transactions for testing
-- Based on your actual transactions table structure
INSERT INTO transactions (id, user_id, type, source, amount, resource_id, created_at, reference_id, reference_type, status, description) VALUES
-- Daily Login Rewards
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), 'credit', 'daily_login', 10, NULL, timezone('utc', now() - interval '1 day'), NULL, NULL, 'completed', 'Daily login reward for consecutive 7 days'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'bob.smith@cs.test.edu' LIMIT 1), 'credit', 'daily_login', 10, NULL, timezone('utc', now() - interval '2 days'), NULL, NULL, 'completed', 'Daily login reward for consecutive 5 days'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'charlie.brown@cs.test.edu' LIMIT 1), 'credit', 'daily_login', 10, NULL, timezone('utc', now() - interval '3 days'), NULL, NULL, 'completed', 'Daily login reward for consecutive 14 days'),

-- Resource Downloads (SPEND)
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), 'debit', 'material_download', -20, (SELECT id FROM materials WHERE title = 'Algorithm Design Patterns' LIMIT 1), timezone('utc', now() - interval '5 days'), (SELECT id FROM materials WHERE title = 'Algorithm Design Patterns' LIMIT 1), 'material_download', 'completed', 'Downloaded Algorithm Design Patterns by Bob Smith'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'diana.wilson@cs.test.edu' LIMIT 1), 'debit', 'material_download', -25, (SELECT id FROM materials WHERE title = 'Web Development Bootcamp' LIMIT 1), timezone('utc', now() - interval '1 week'), (SELECT id FROM materials WHERE title = 'Web Development Bootcamp' LIMIT 1), 'material_download', 'completed', 'Downloaded Web Development Bootcamp by Charlie Brown'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'eva.davis@cs.test.edu' LIMIT 1), 'debit', 'material_download', -15, (SELECT id FROM materials WHERE title = 'Thermodynamics Lecture Notes' LIMIT 1), timezone('utc', now() - interval '3 days'), (SELECT id FROM materials WHERE title = 'Thermodynamics Lecture Notes' LIMIT 1), 'material_download', 'completed', 'Downloaded Thermodynamics Lecture Notes by Frank Miller'),

-- Answer Acceptance Rewards (EARN)
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'charlie.brown@cs.test.edu' LIMIT 1), 'credit', 'answer_accept', 50, NULL, timezone('utc', now() - interval '2 days'), NULL, 'answer_accept', 'completed', 'Accepted answer for helping with recursion concepts'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'henry.anderson@eng.test.edu' LIMIT 1), 'credit', 'answer_accept', 50, NULL, timezone('utc', now() - interval '4 days'), NULL, 'answer_accept', 'completed', 'Accepted answer for engineering internship tips'),

-- Event Attendance Rewards (EARN)
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'frank.miller@eng.test.edu' LIMIT 1), 'credit', 'event_attendance', 30, NULL, timezone('utc', now() - interval '1 day'), (SELECT id FROM calendar_events WHERE title = 'Machine Learning Workshop' LIMIT 1), 'event_attendance', 'completed', 'Attended Machine Learning Workshop'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'kate.white@bus.test.edu' LIMIT 1), 'credit', 'event_attendance', 25, NULL, timezone('utc', now() - interval '2 weeks'), (SELECT id FROM calendar_events WHERE title = 'Tech Career Fair 2024' LIMIT 1), 'event_attendance', 'completed', 'Attended Tech Career Fair 2024'),

-- Fiat Purchases
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.johnson@cs.test.edu' LIMIT 1), 'credit', 'fiat_purchase', 100, NULL, timezone('utc', now() - interval '1 week'), NULL, 'fiat_purchase', 'completed', 'Purchased 100 coins via payment gateway'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'bob.smith@cs.test.edu' LIMIT 1), 'credit', 'fiat_purchase', 50, NULL, timezone('utc', now() - interval '3 days'), NULL, 'fiat_purchase', 'completed', 'Purchased 50 coins via payment gateway')
ON CONFLICT DO NOTHING;

-- ========================================
-- STEP 6: CREATE SAMPLE PURCHASES
-- ========================================

-- Insert sample purchases to test purchase functionality
-- Based on your actual resource_purchases table structure
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
-- STEP 7: CREATE COMMUNITY REPLIES
-- ========================================

-- Insert community replies for testing
-- Based on your actual community_replies table structure
INSERT INTO community_replies (id, post_id, user_id, author_name, author_role, author_avatar, content, likes, created_at, updated_at) VALUES
-- Replies to Alice's recursion post
(gen_random_uuid(), (SELECT id FROM community_posts WHERE title = 'Help with Recursion Concepts' LIMIT 1), (SELECT id FROM users WHERE email = 'charlie.brown@cs.test.edu' LIMIT 1), 'Charlie Brown', 'Student', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', 'Recursion is all about breaking down problems into smaller versions of themselves! Think of it like a function that calls itself with a simpler input until it reaches a base case. The call stack is like a stack of papers - each recursive call adds a new paper on top. For tree traversal, imagine you are exploring a maze - you keep track of where you have been and where you need to go next. Check out recursionvisualization.org for interactive visualizations!', 12, timezone('utc', now() - interval '2 days'), timezone('utc', now() - interval '2 days')),
(gen_random_uuid(), (SELECT id FROM community_posts WHERE title = 'Help with Recursion Concepts' LIMIT 1), (SELECT id FROM users WHERE email = 'bob.smith@cs.test.edu' LIMIT 1), 'Bob Smith', 'Student', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', 'I struggled with recursion too! What helped me was practicing with simple examples first: factorial(5), then fibonacci(10), then tree traversal. Also, drawing the call stack on paper really helps visualize what is happening. Good luck!', 8, timezone('utc', now() - interval '1 day'), timezone('utc', now() - interval '1 day')),

-- Reply to Grace's internship post
(gen_random_uuid(), (SELECT id FROM community_posts WHERE title = 'Engineering Internship Tips' LIMIT 1), (SELECT id FROM users WHERE email = 'henry.anderson@eng.test.edu' LIMIT 1), 'Henry Anderson', 'Student', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Henry', 'Great tips Grace! I would add: 5. Keep a daily log of your work 6. Ask for feedback regularly 7. Build relationships with your team 8. Volunteer for challenging tasks. Congratulations on the internship!', 15, timezone('utc', now() - interval '4 days'), timezone('utc', now() - interval '4 days'))
ON CONFLICT DO NOTHING;

-- ========================================
-- STEP 8: VERIFICATION QUERIES
-- ========================================

-- Verify data Creation
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
WHERE title LIKE '%Test%' OR uploaded_by IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
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
    'Community Replies' as data_type,
    COUNT(*) as count,
    STRING_AGG(content, ', ') as details
FROM community_replies 
WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.edu')
GROUP BY 'Community Replies'

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
    STRING_AGG(type, ', ') as details
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
-- STEP 9: REFRESH SCHEMA
-- ========================================

NOTIFY pgrst, 'reload schema';
