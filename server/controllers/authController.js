const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// @desc    Trigger Supabase Auth OTP
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Use Supabase built-in OTP functionality
        // This will automatically handle generation, storage, and sending (via your Resend integration)
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                // You can add a redirect URL here if it was a magic link, 
                // but for 6-digit OTP, Supabase handles it.
                shouldCreateUser: true,
                // Ensure we get a 6-digit OTP (Supabase default)
                // This might need to be configured in Supabase dashboard
            }
        });

        if (error) {
            console.error('Supabase Auth error:', error.message);
            return res.status(500).json({ success: false, message: error.message });
        }

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully via Supabase! Please check your email.',
            note: 'The OTP should be 8 digits. If you receive a different length, please check Supabase project settings.'
        });
    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// @desc    Verify Supabase Auth OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        // Validate OTP length - should be exactly 8 digits
        if (!/^\d{8}$/.test(otp)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid OTP format. OTP must be exactly 8 digits.' 
            });
        }

        // Verify the OTP directly with Supabase Identity
        // 'type' can be 'signup', 'invite', 'magiclink', 'recovery', 'email_change', or 'email'
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email' // Standard for OTP login
        });

        if (error) {
            console.error('Supabase Verify error:', error.message);
            return res.status(401).json({ success: false, message: error.message });
        }

        // data.session and data.user will be returned on success
        res.status(200).json({
            success: true,
            message: 'OTP verified successfully!',
            user: data.user,
            session: data.session
        });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
