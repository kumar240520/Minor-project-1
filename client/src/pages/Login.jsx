import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Mail, Lock, LogIn, ArrowLeft, Shield, Clock, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { getAuthenticatedUserWithRole, getRedirectPathForRole, isRowLevelSecurityError, isValidInstitutionalEmail } from '../utils/auth';
import { useOTP } from '../hooks/useOTP';
import OTPInput from '../components/OTPInput';
import { generateOTPCode, sendOTPCode, verifyOTPCode } from '../utils/otpService';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState(location.state?.email || '');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(location.state?.message || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    
    // OTP states
    const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'
    const [currentStep, setCurrentStep] = useState('email'); // 'email' | 'otp' | 'password'
    const [isSendingOTP, setIsSendingOTP] = useState(false);
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
    const [isOTPVerified, setIsOTPVerified] = useState(false);
    
    // OTP hook
    const {
        otp,
        timer,
        isTimerActive,
        canResend,
        handleOtpChange,
        handleKeyDown,
        handlePaste,
        clearOtp,
        getOtpString,
        isOtpComplete,
        startTimer,
        allowResend
    } = useOTP();



    // Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setIsSendingOTP(true);

        if (!isValidInstitutionalEmail(email)) {
            setError('Only institutional emails starting with 0808 and ending in .ies@ipsacademy.org are allowed.');
            setIsSendingOTP(false);
            return;
        }

        try {
            // Use Supabase built-in OTP for Vercel deployment
            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    shouldCreateUser: true,
                }
            });

            if (error) {
                throw error;
            }

            setSuccessMsg('OTP sent successfully! Please check your email to verify your account.');
            setCurrentStep('otp');
            startTimer();
        } catch (err) {
            console.error('Send OTP Error:', err);
            
            // Provide more user-friendly error messages
            let errorMessage = err.message || 'Failed to send OTP. Please try again.';
            
            if (errorMessage.includes('Too many OTP requests')) {
                errorMessage = 'Too many OTP requests. Please wait 10 minutes before trying again.';
            } else if (errorMessage.includes('Too many requests')) {
                errorMessage = 'Please wait a moment before requesting another OTP.';
            }
            
            setError(errorMessage);
        } finally {
            setIsSendingOTP(false);
        }
    };

    // Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setIsVerifyingOTP(true);

        if (!isOtpComplete()) {
            setError('Please enter all 8 digits of the OTP.');
            setIsVerifyingOTP(false);
            return;
        }

        try {
            const enteredOTP = getOtpString();
            
            // Use Supabase built-in OTP verification for Vercel deployment
            const { data, error } = await supabase.auth.verifyOtp({
                email: email,
                token: enteredOTP,
                type: 'email'
            });

            if (error) {
                throw error;
            }

            setSuccessMsg('OTP verified! Redirecting...');
            
            // Get user role and redirect
            const { role, profile } = await getAuthenticatedUserWithRole({ initializeStudentProfile: false });
            const redirectPath = getRedirectPathForRole(role);
            
            // Only create profile if it doesn't exist and preserve existing name
            if (!profile) {
                console.log("Profile not found, creating new one...");
                try {
                    // Get the user's real name from auth metadata
                    const userName = data.user.user_metadata?.full_name || 
                                   data.user.user_metadata?.name || 
                                   null; // Keep null if no name found, don't use email fallback
                    
                    await ensureStudentProfile({
                        id: data.user.id,
                        email: data.user.email,
                        fullName: userName
                    });
                } catch (profileError) {
                    console.error('Profile creation error:', profileError);
                    // Don't fail login if profile creation fails
                }
            } else {
                console.log("Existing profile found with name:", profile.name);
            }
            
            setTimeout(() => {
                navigate(redirectPath, { replace: true });
            }, 1000);
        } catch (err) {
            console.error('Verify OTP Error:', err);
            setError(err.message || 'Failed to verify OTP. Please try again.');
            clearOtp();
        } finally {
            setIsVerifyingOTP(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        setError(null);
        setSuccessMsg(null);
        setIsSendingOTP(true);

        try {
            // Use Supabase built-in OTP resend
            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    shouldCreateUser: false, // User should already exist
                }
            });

            if (error) {
                throw error;
            }

            setSuccessMsg('OTP resent successfully! Please check your email.');
            clearOtp();
            startTimer();
        } catch (err) {
            console.error('Resend OTP Error:', err);
            let errorMessage = err.message || 'Failed to resend OTP. Please try again.';
            
            if (errorMessage.includes('Too many OTP requests')) {
                errorMessage = 'Too many OTP requests. Please wait 10 minutes before trying again.';
            } else if (errorMessage.includes('Too many requests')) {
                errorMessage = 'Please wait a moment before requesting another OTP.';
            }
            
            setError(errorMessage);
        } finally {
            setIsSendingOTP(false);
        }
    };

    // Reset to password login
    const handlePasswordLogin = () => {
        setLoginMethod('password');
        setCurrentStep('email');
        setIsOTPVerified(false);
        clearOtp();
        setError(null);
        setSuccessMsg(null);
    };

    // Reset to OTP login
    const handleOTPLogin = () => {
        setLoginMethod('otp');
        setCurrentStep('email');
        setIsOTPVerified(false);
        clearOtp();
        setError(null);
        setSuccessMsg(null);
    };

    // Go back to email step
    const handleBackToEmail = () => {
        setCurrentStep('email');
        setEmail('');
        clearOtp();
        setIsOTPVerified(false);
        setError(null);
        setSuccessMsg(null);
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        setIsGoogleLoading(true);

        try {
            const { data, error: googleError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (googleError) {
                throw googleError;
            }

            // The OAuth flow will redirect automatically, so we don't need to handle navigation here
        } catch (error) {
            setError(error.message || 'Failed to sign in with Google. Please try again.');
            setIsGoogleLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setIsSubmitting(true);

        if (!isValidInstitutionalEmail(email)) {
             setIsSubmitting(false);
             setError('Only institutional emails starting with 0808 and ending in .ies@ipsacademy.org are allowed.');
             return;
        }

        // For OTP login, user should already be logged in after OTP verification
        if (loginMethod === 'otp' && isOTPVerified) {
            // User should already be redirected after OTP verification
            // This submit handler shouldn't be called for OTP login
            navigate('/dashboard', { replace: true });
            setIsSubmitting(false);
            return;
        }

        let didAuthenticate = false;

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) {
                throw signInError;
            }

            didAuthenticate = true;

            const { role, profile } = await getAuthenticatedUserWithRole({ initializeStudentProfile: false });

            // If profile doesn't exist, create one without requiring name
            if (!profile) {
                try {
                    // Get the authenticated user to access metadata
                    const authUser = await getAuthenticatedUser();
                    
                    // Get the user's real name from auth metadata
                    const userName = authUser.user_metadata?.full_name || 
                                   authUser.user_metadata?.name || 
                                   null; // Keep null if no name found
                    
                    await ensureStudentProfile({
                        id: authUser.id,
                        email,
                        fullName: userName,
                    });
                } catch (profileError) {
                    console.error('Profile creation error during login:', profileError);
                    // Don't fail login if profile creation fails
                }
                
                // Get role again after profile creation
                const { role: newRole } = await getAuthenticatedUserWithRole({ initializeStudentProfile: false });
                navigate(getRedirectPathForRole(newRole), { replace: true });
            } else {
                navigate(getRedirectPathForRole(role), { replace: true });
            }
        } catch (loginError) {
            if (didAuthenticate) {
                await supabase.auth.signOut();
            }

            if (isRowLevelSecurityError(loginError)) {
                setError('Your account signed in, but users table is still blocked by Supabase RLS. Apply users insert policy or trigger, then try again.');
            } else if (loginError.message?.includes('Invalid login credentials')) {
                // Check if this might be an OTP-only user
                setError('Invalid login credentials. If you registered via OTP, please use the OTP login method instead.');
            } else {
                setError(loginError.message || 'Unable to sign in right now.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">

            <Link to="/" className="absolute top-6 left-6 flex items-center text-gray-500 hover:text-violet-600 transition-colors z-50">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
            </Link>

            <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">

                <div className="hidden md:flex md:w-1/2 p-12 bg-gradient-to-br from-indigo-900 to-blue-800 text-white flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative z-10"
                    >
                        <div className="flex items-center space-x-2 mb-12">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">EduSure</span>
                        </div>

                        <h2 className="text-4xl font-extrabold mb-6 leading-tight">
                            Welcome Back to Your Academic Hub
                        </h2>
                        <p className="text-indigo-100 text-lg mb-8 max-w-sm">
                            Access verified PYQs, earn rewards by sharing notes, and stay updated with your college ecosystem.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="relative z-10 flex -space-x-4 mb-8"
                    >
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-12 h-12 rounded-full border-2 border-indigo-900 bg-white shadow-xl overflow-hidden">
                                <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="Student" className="w-full h-full object-cover" />
                            </div>
                        ))}
                        <div className="w-12 h-12 rounded-full border-2 border-indigo-900 bg-blue-600 shadow-xl flex items-center justify-center text-white text-xs font-bold z-10">
                            2k+
                        </div>
                    </motion.div>
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white relative">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="md:hidden flex items-center space-x-2 mb-8 justify-center">
                            <div className="bg-gradient-to-r from-fuchsia-600 to-violet-600 p-2 rounded-lg">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">EduSure</span>
                        </div>

                        <h3 className="text-3xl font-extrabold text-gray-900 mb-2">
                            {loginMethod === 'otp' ? 'Sign In with OTP' : 'Sign In'}
                        </h3>
                        <p className="text-gray-500 mb-8">
                            {loginMethod === 'otp' 
                                ? (currentStep === 'email' ? 'Enter your email to receive a one-time password' : 
                                   currentStep === 'otp' ? 'Enter the 8-digit code sent to your email' :
                                   'Enter your password to complete login')
                                : 'Please enter your credentials to continue.'
                            }
                        </p>

                        {successMsg && (
                            <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                {successMsg}
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Email Step for OTP Login */}
                        {loginMethod === 'otp' && currentStep === 'email' && (
                            <form onSubmit={handleSendOTP} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 block w-full rounded-xl border-gray-200 shadow-sm focus:ring-violet-500 focus:border-violet-500 bg-gray-50 border py-3 transition-colors"
                                            placeholder="0808...ies@ipsacademy.org"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSendingOTP || !email}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isSendingOTP ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Sending OTP...
                                        </>
                                    ) : (
                                        'Send OTP'
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handlePasswordLogin}
                                    className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    Use Password Instead
                                </button>
                            </form>
                        )}

                        {/* OTP Step */}
                        {loginMethod === 'otp' && currentStep === 'otp' && (
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                                        Enter 8-digit code
                                    </label>
                                    <OTPInput
                                        otp={otp}
                                        onChange={handleOtpChange}
                                        onKeyDown={handleKeyDown}
                                        onPaste={handlePaste}
                                        disabled={isVerifyingOTP}
                                    />
                                </div>

                                <div className="text-center space-y-2">
                                    {isTimerActive && (
                                        <div className="flex items-center justify-center text-gray-500">
                                            <Clock className="w-4 h-4 mr-2" />
                                            <span className="text-sm">
                                                Resend OTP in {timer}s
                                            </span>
                                        </div>
                                    )}
                                    
                                    {canResend && (
                                        <button
                                            type="button"
                                            onClick={handleResendOTP}
                                            disabled={isSendingOTP}
                                            className="inline-flex items-center text-violet-600 hover:text-violet-700 text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            <RefreshCw className={`w-4 h-4 mr-2 ${isSendingOTP ? 'animate-spin' : ''}`} />
                                            {isSendingOTP ? 'Resending...' : 'Resend OTP'}
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isVerifyingOTP || !isOtpComplete()}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isVerifyingOTP ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify OTP'
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleBackToEmail}
                                    className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    Change Email
                                </button>
                            </form>
                        )}

                        {/* Password Step (after OTP verification) */}
                        {loginMethod === 'otp' && currentStep === 'password' && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                                    <div className="flex items-center">
                                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                        <span className="text-green-700 text-sm">Email verified! Enter your password to complete login.</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Password</label>
                                        <button 
                                            type="button" 
                                            onClick={() => navigate('/forgot-password')}
                                            className="text-xs font-medium text-violet-600 hover:text-fuchsia-600 transition-colors cursor-pointer"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 block w-full rounded-xl border-gray-200 shadow-sm focus:ring-violet-500 focus:border-violet-500 bg-gray-50 border py-3 transition-colors"
                                            placeholder="********"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    <LogIn className="w-5 h-5 mr-2" />
                                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleOTPLogin}
                                    className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    Start Over
                                </button>
                            </form>
                        )}

                        {/* Regular Password Login */}
                        {loginMethod === 'password' && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 block w-full rounded-xl border-gray-200 shadow-sm focus:ring-violet-500 focus:border-violet-500 bg-gray-50 border py-3 transition-colors"
                                            placeholder="0808...ies@ipsacademy.org"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Password</label>
                                        <button 
                                            type="button" 
                                            onClick={() => navigate('/forgot-password')}
                                            className="text-xs font-medium text-violet-600 hover:text-fuchsia-600 transition-colors cursor-pointer"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 block w-full rounded-xl border-gray-200 shadow-sm focus:ring-violet-500 focus:border-violet-500 bg-gray-50 border py-3 transition-colors"
                                            placeholder="********"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    <LogIn className="w-5 h-5 mr-2" />
                                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleOTPLogin}
                                    className="w-full flex justify-center items-center py-3 px-4 border-2 border-violet-100 rounded-xl shadow-sm text-sm font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors"
                                >
                                    <Shield className="w-5 h-5 mr-2" />
                                    Use OTP Instead
                                </button>
                            </form>
                        )}

                        <div className="mt-8 relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button 
                                onClick={handleGoogleSignIn}
                                disabled={isGoogleLoading}
                                className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-100 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2" />
                                {isGoogleLoading ? 'Signing in with Google...' : 'Google'}
                            </button>
                        </div>

                        <p className="mt-8 text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold text-violet-600 hover:text-fuchsia-600 transition-colors">
                                Sign up for free
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;
