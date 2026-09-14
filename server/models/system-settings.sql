-- ==============================================================================
-- System Settings Table for EduSure Platform
-- Used to store global configurable settings such as email domain policies.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including unauthenticated visitors on login/register) to read settings
DROP POLICY IF EXISTS "Allow public read access to system_settings" ON public.system_settings;
CREATE POLICY "Allow public read access to system_settings"
    ON public.system_settings
    FOR SELECT
    USING (true);

-- Allow service role and admins to update/insert system settings
DROP POLICY IF EXISTS "Allow admin write access to system_settings" ON public.system_settings;
CREATE POLICY "Allow admin write access to system_settings"
    ON public.system_settings
    FOR ALL
    USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    )
    WITH CHECK (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Seed initial auth policy: allowing personal emails for 1st-year students by default
INSERT INTO public.system_settings (key, value, description)
VALUES (
    'auth_policy',
    '{"allow_non_college_emails": true, "allowed_domains": [".ies@ipsacademy.org"]}',
    'Controls whether registration and login allow personal custom emails (e.g. Gmail) or strictly institutional emails.'
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = now();
