# Community Posts Setup Guide

## Problem
The "Failed to submit post." error occurs because the `community_posts` table doesn't exist in your Supabase database.

## Solution

### Step 1: Run SQL Scripts in Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the following scripts in order:

#### Script 1: Create Community Posts Table
Copy and paste the contents of `server/models/community-posts.sql` into the SQL Editor and run it.

#### Script 2: Create Community Replies Table  
Copy and paste the contents of `server/models/community-replies.sql` into the SQL Editor and run it.

### Step 2: Verify Setup

After running the scripts, verify the tables were created:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('community_posts', 'community_replies');
```

### Step 3: Test the Community Feature

1. Start your development servers:
   ```bash
   # Terminal 1 - Frontend
   npm run client
   
   # Terminal 2 - Backend  
   npm run server
   ```

2. Log in to the application
3. Navigate to the Community page
4. Try creating a new post

## What the Scripts Do

### community-posts.sql
- Creates `community_posts` table with proper UUID relationships
- Enables Row Level Security (RLS)
- Sets up policies for:
  - Public read access
  - User can create/update/delete own posts
  - Admins have full access
- Adds indexes for performance
- Includes automatic timestamp updates

### community-replies.sql
- Creates `community_replies` table for threaded discussions
- Sets up RLS policies similar to posts
- Creates triggers to automatically update reply counts
- Adds proper foreign key constraints

## Troubleshooting

### Error: "relation 'community_posts' does not exist"
- **Cause**: Database tables not created
- **Solution**: Run the SQL scripts as described above

### Error: "permission denied"
- **Cause**: RLS policies not properly configured
- **Solution**: Ensure you ran the complete SQL scripts including policy creation

### Error: "User not authenticated"
- **Cause**: User session expired
- **Solution**: Log out and log back in

## Additional Features

The setup includes:
- Real-time updates via Supabase subscriptions
- Automatic reply counting
- Like functionality
- User permissions (students can manage own posts, admins can manage all)
- Proper timezone handling

## Next Steps

After the basic setup is working, you can:
1. Add image attachments functionality
2. Implement hashtag system for tags
3. Add search functionality
4. Create notification system for replies and likes
