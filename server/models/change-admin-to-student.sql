-- Change User Role from Admin to Student
-- Use this to update a specific user's role from 'admin' to 'student'

-- Method 1: Update by email (recommended)
UPDATE users 
SET role = 'student',
    updated_at = timezone('utc', now())
WHERE email = 'your-admin-email@example.com';

-- Method 2: Update by user ID
UPDATE users 
SET role = 'student',
    updated_at = timezone('utc', now())
WHERE id = 'your-user-uuid-here';

-- Method 3: Update all admin users to student (use with caution)
UPDATE users 
SET role = 'student',
    updated_at = timezone('utc', now())
WHERE role = 'admin';

-- Method 4: Update specific admin users by email list
UPDATE users 
SET role = 'student',
    updated_at = timezone('utc', now())
WHERE email IN (
    'admin1@example.com',
    'admin2@example.com',
    'admin3@example.com'
);

-- Verification query to check the change
SELECT 
    id,
    email,
    name,
    role,
    updated_at
FROM users 
WHERE email = 'your-admin-email@example.com';

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
