-- SQL Schema Update for Calendar Events
-- Add user_id and is_global columns if they don't exist
ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS time TEXT,
ADD COLUMN IF NOT EXISTS date TEXT,
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'bg-violet-500';

-- Enable RLS if not already enabled
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to recreate them
DROP POLICY IF EXISTS "Everyone can view calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can view global and personal events" ON calendar_events;
DROP POLICY IF EXISTS "Users can insert personal events" ON calendar_events;
DROP POLICY IF EXISTS "Users can update personal events" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete personal events" ON calendar_events;
DROP POLICY IF EXISTS "Admins can manage all events" ON calendar_events;

-- Policy: Users can view their personal events or any global events
CREATE POLICY "Users can view global and personal events" 
ON calendar_events 
FOR SELECT 
USING (is_global = true OR user_id = auth.uid() OR public.is_admin());

-- Policy: Users can insert their own events, but cannot set is_global=true
CREATE POLICY "Users can insert personal events" 
ON calendar_events 
FOR INSERT 
WITH CHECK (
    user_id = auth.uid() 
    AND is_global = false
);

-- Policy: Users can update their own personal events
CREATE POLICY "Users can update personal events" 
ON calendar_events 
FOR UPDATE 
USING (user_id = auth.uid() AND is_global = false)
WITH CHECK (user_id = auth.uid() AND is_global = false);

-- Policy: Users can delete their own personal events
CREATE POLICY "Users can delete personal events" 
ON calendar_events 
FOR DELETE 
USING (user_id = auth.uid() AND is_global = false);

-- Policy: Admins can manage all events (insert, update, delete)
CREATE POLICY "Admins can manage all events" 
ON calendar_events 
FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Notify postgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
