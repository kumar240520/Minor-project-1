const { supabase, isSupabaseConfigured, getSupabaseConfigError } = require('../supabaseClient');

const OTP_LENGTH = 6;

// @desc    Trigger Supabase Auth OTP
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        if (!isSupabaseConfigured()) {
            return res.status(500).json({
                success: false,
                message: getSupabaseConfigError()
            });
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
            note: `The OTP should be ${OTP_LENGTH} digits. If you receive a different length, update Supabase Auth OTP settings to match.`
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
        const { email } = req.body;
        const otp = req.body.otp || req.body.otpCode;
        const otpLength = OTP_LENGTH;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        if (!isSupabaseConfigured()) {
            return res.status(500).json({
                success: false,
                message: getSupabaseConfigError()
            });
        }

        // Validate OTP length to match Supabase project settings.
        if (!new RegExp(`^\\d{${otpLength}}$`).test(otp)) {
            return res.status(400).json({ 
                success: false, 
                message: `Invalid OTP format. OTP must be exactly ${otpLength} digits.` 
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
