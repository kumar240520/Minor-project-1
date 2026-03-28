-- Create OTP codes table for Supabase
CREATE TABLE IF NOT EXISTS public.otp_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(email)
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Create policy for OTP codes (allow all operations for now, adjust as needed)
CREATE POLICY "Allow all operations on otp_codes" ON public.otp_codes
    FOR ALL USING (true) WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON public.otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON public.otp_codes(expires_at);

-- Add comment
COMMENT ON TABLE public.otp_codes IS 'Table for storing OTP verification codes';
