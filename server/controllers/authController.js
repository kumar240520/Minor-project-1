const { supabase, isSupabaseConfigured, getSupabaseConfigError } = require('../supabaseClient');
const sendEmail = require('../utils/sendEmail');
const { getAuthPolicySetting } = require('../utils/systemSettings');

const OTP_LENGTH = 6;

// @desc    Get current authentication & registration policy
// @route   GET /api/auth/policy
// @access  Public
exports.getAuthPolicy = async (req, res) => {
    try {
        const policy = await getAuthPolicySetting();
        res.status(200).json({
            success: true,
            allow_non_college_emails: Boolean(policy.allow_non_college_emails),
            allowed_domains: policy.allowed_domains || ['.ies@ipsacademy.org'],
            updated_at: policy.updated_at
        });
    } catch (error) {
        console.error('Error fetching auth policy:', error);
        res.status(200).json({
            success: true,
            allow_non_college_emails: true,
            allowed_domains: ['.ies@ipsacademy.org']
        });
    }
};

// @desc    Send Registration OTP via Nodemailer (Zero Supabase email quota used)
// @route   POST /api/auth/send-registration-otp
// @access  Public
exports.sendRegistrationOTP = async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email address is required.' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const policy = await getAuthPolicySetting();

        // Enforce domain policy if non-college emails are disallowed
        if (!policy.allow_non_college_emails && !cleanEmail.endsWith('.ies@ipsacademy.org')) {
            return res.status(400).json({
                success: false,
                message: 'Registration is currently restricted to institutional emails ending in .ies@ipsacademy.org.'
            });
        }

        // Basic email syntax check
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
        }

        // Check if user already exists in public.users table
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', cleanEmail)
            .maybeSingle();

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email address already exists. Please log in instead.'
            });
        }

        // Generate secure 6-digit OTP code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes expiry

        // Store OTP in public.otp_codes table
        const { error: dbError } = await supabase
            .from('otp_codes')
            .upsert({
                email: cleanEmail,
                code: otpCode,
                expires_at: expiresAt,
                created_at: new Date().toISOString()
            }, {
                onConflict: 'email'
            });

        if (dbError) {
            console.error('Error saving OTP to database:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Failed to record OTP verification session. Please try again.'
            });
        }

        // Dispatch OTP email via Nodemailer SMTP
        await sendEmail({
            email: cleanEmail,
            subject: 'EduSure Registration Verification Code',
            otp: otpCode
        });

        res.status(200).json({
            success: true,
            message: `Verification code sent to ${cleanEmail}. Please enter the 6-digit code to complete registration.`
        });

    } catch (error) {
        console.error('Send registration OTP error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send verification code. Please try again.'
        });
    }
};

// @desc    Verify Registration OTP and Create Account
// @route   POST /api/auth/verify-registration-otp
// @access  Public
exports.verifyRegistrationOTP = async (req, res) => {
    try {
        const { email, otp, password, name } = req.body;

        if (!email || !otp || !password || !name) {
            return res.status(400).json({
                success: false,
                message: 'All fields (name, email, password, and OTP) are required.'
            });
        }

        const cleanEmail = email.toLowerCase().trim();
        const cleanOTP = otp.trim();

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.'
            });
        }

        // 1. Verify OTP from public.otp_codes
        const { data: otpRecord, error: otpError } = await supabase
            .from('otp_codes')
            .select('*')
            .eq('email', cleanEmail)
            .maybeSingle();

        if (otpError || !otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'No OTP request found for this email. Please request a new code.'
            });
        }

        if (otpRecord.code !== cleanOTP) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP code. Please check your email and enter the 6 digits correctly.'
            });
        }

        if (new Date(otpRecord.expires_at) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'This OTP verification code has expired. Please request a new code.'
            });
        }

        // 2. Remove OTP code once used
        await supabase
            .from('otp_codes')
            .delete()
            .eq('email', cleanEmail);

        // 3. Create auth user in Supabase Auth via Admin API
        let authUserId = null;

        const { data: newAuthUser, error: authCreateError } = await supabase.auth.admin.createUser({
            email: cleanEmail,
            password: password,
            email_confirm: true, // Mark email as verified immediately
            user_metadata: {
                name: name.trim(),
                full_name: name.trim()
            }
        });

        if (authCreateError) {
            // If user already exists in auth, check if we can update password
            if (authCreateError.message?.includes('already registered')) {
                return res.status(400).json({
                    success: false,
                    message: 'An account with this email is already registered. Please log in directly.'
                });
            }
            throw authCreateError;
        }

        authUserId = newAuthUser.user.id;

        // 4. Create student profile in public.users
        const { error: profileError } = await supabase
            .from('users')
            .upsert({
                id: authUserId,
                email: cleanEmail,
                name: name.trim(),
                full_name: name.trim(),
                role: 'student',
                coins: 50,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (profileError) {
            console.error('Failed to create users profile row:', profileError);
        }

        res.status(200).json({
            success: true,
            message: 'Account successfully registered and verified! You can now sign in with your email and password.',
            userId: authUserId
        });

    } catch (error) {
        console.error('Verify registration OTP error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to complete registration. Please try again.'
        });
    }
};

// @desc    Trigger Supabase Auth OTP (legacy fallback)
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        await supabase.from('otp_codes').upsert({
            email: cleanEmail,
            code: otpCode,
            expires_at: expiresAt,
            created_at: new Date().toISOString()
        }, { onConflict: 'email' });

        await sendEmail({
            email: cleanEmail,
            subject: 'EduSure Verification Code',
            otp: otpCode
        });

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully! Please check your email.'
        });
    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

// @desc    Verify Supabase Auth OTP (legacy fallback)
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const otp = req.body.otp || req.body.otpCode;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const cleanOTP = otp.trim();

        const { data: record } = await supabase
            .from('otp_codes')
            .select('*')
            .eq('email', cleanEmail)
            .maybeSingle();

        if (!record || record.code !== cleanOTP || new Date(record.expires_at) < new Date()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        await supabase.from('otp_codes').delete().eq('email', cleanEmail);

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully!'
        });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
