import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://acobfukuvqrehbrqnyxx.supabase.co';
const SUPABASE_PUBLIC_KEY = 'sb_publishable_riQhamrU4Pwjay2fdMMkmw_ymryt0zi';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

async function createNotificationsTable() {
    console.log('Creating notifications table...');
    
    try {
        // First, let's check if the table already exists
        console.log('Checking if notifications table exists...');
        const { data: testData, error: testError } = await supabase
            .from('notifications')
            .select('*')
            .limit(1);
            
        if (!testError) {
            console.log('✅ Notifications table already exists!');
            return;
        }
        
        if (testError.code !== 'PGRST116') {
            console.error('❌ Unexpected error checking table:', testError);
            return;
        }
        
        console.log('Table does not exist. Creating it...');
        console.log('');
        console.log('⚠️  AUTOMATIC TABLE CREATION FAILED');
        console.log('Please run this SQL manually in your Supabase SQL Editor:');
        console.log('');
        console.log('```sql');
        console.log(`-- Notifications Table Setup
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY IF NOT EXISTS "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only update their own notifications
CREATE POLICY IF NOT EXISTS "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can manage all notifications
CREATE POLICY IF NOT EXISTS "Admins can manage all notifications" ON notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );`);
        console.log('```');
        console.log('');
        console.log('Steps to fix the 404 error:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Paste and run the SQL above');
        console.log('4. Refresh your application');
        
    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

createNotificationsTable();
