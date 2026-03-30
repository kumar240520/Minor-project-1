import { supabase } from './client/src/supabaseClient.js';

async function createNotificationsTable() {
    console.log('Creating notifications table...');
    
    try {
        // Execute the SQL from notifications.sql
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: `
                -- Notifications Table Setup
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
                    );
            `
        });

        if (error) {
            console.error('Error creating table:', error);
            console.log('Trying direct SQL execution...');
            
            // Alternative: Try using raw SQL if RPC fails
            const { error: directError } = await supabase
                .from('notifications')
                .select('*')
                .limit(1);
                
            if (directError && directError.code === 'PGRST116') {
                console.log('Table does not exist. Please run the SQL manually in Supabase SQL Editor:');
                console.log(`
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

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Admins can manage all notifications" ON notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );
                `);
            } else {
                console.log('Table might already exist!');
            }
        } else {
            console.log('✅ Notifications table created successfully!');
        }
        
        // Test the table
        console.log('Testing notifications table access...');
        const { data: testData, error: testError } = await supabase
            .from('notifications')
            .select('*')
            .limit(1);
            
        if (testError) {
            console.error('❌ Table test failed:', testError);
        } else {
            console.log('✅ Notifications table is accessible!');
        }
        
    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

createNotificationsTable();
