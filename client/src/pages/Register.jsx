import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, User, UserPlus, ArrowLeft, Clock, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { ensureStudentProfile, isRowLevelSecurityError, isValidInstitutionalEmail } from '../utils/auth';
import { useOTP } from '../hooks/useOTP';
import OTPInput from '../components/OTPInput';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    
    // OTP states
    const [currentStep, setCurrentStep] = useState('form'); // 'form' | 'otp'
    const [isSendingOTP, setIsSendingOTP] = useState(false);
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
    const [pendingUserData, setPendingUserData] = useState(null);
    
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



const handleGoogleSignUp = async () => {
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
            setError(error.message || 'Failed to sign up with Google. Please try again.');
            setIsGoogleLoading(false);
        }
    };

    // Handle form submission and send OTP
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setIsSubmitting(true);
        
        if (!isValidInstitutionalEmail(email)) {
             setError('Only institutional emails starting with 0808 and ending in .ies@ipsacademy.org are allowed.');
             setIsSubmitting(false);
             return;
        }
        
        try {
            // Send OTP for email verification
            const { error: otpError } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (otpError) {
                throw otpError;
            }

            // Store user data and move to OTP step
            setPendingUserData({ name, email, password });
            setSuccessMsg('OTP sent successfully! Please check your email to verify your account.');
            setCurrentStep('otp');
            startTimer();
        } catch (err) {
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Verify OTP and complete registration
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
            // First verify the OTP
            const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
                email: pendingUserData.email,
                token: getOtpString(),
                type: 'email'
            });

            if (verifyError) {
                throw verifyError;
            }

            // If OTP is verified, now create the account
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: pendingUserData.email,
                password: pendingUserData.password,
                options: {
                    data: {
                        name: pendingUserData.name,
                        full_name: pendingUserData.name,
                    }
                }
            });

            if (signUpError) {
                throw signUpError;
            }

            setSuccessMsg('Account created successfully! Setting up your profile...');

            // Create student profile
            try {
                if (data.user && data.session) {
                    await ensureStudentProfile({
                        id: data.user.id,
                        email: pendingUserData.email,
                        fullName: pendingUserData.name,
                    });
                }
            } catch (profileError) {
                if (isRowLevelSecurityError(profileError)) {
                    console.error('Profile creation error:', profileError);
                }
            }

            // Navigate to dashboard
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 1500);
            
        } catch (err) {
            if (err.message?.includes('Invalid OTP') || err.message?.includes('expired')) {
                setError('Invalid or expired OTP. Please request a new one.');
                clearOtp();
                allowResend();
            } else {
                setError(err.message || 'Failed to verify OTP. Please try again.');
            }
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
            const { error: resendError } = await supabase.auth.resend({
                type: 'signup',
                email: pendingUserData.email,
            });

            if (resendError) {
                throw resendError;
            }

            setSuccessMsg('OTP resent successfully! Please check your email.');
            clearOtp();
            startTimer();
        } catch (err) {
            setError(err.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setIsSendingOTP(false);
        }
    };

    // Go back to form
    const handleBackToForm = () => {
        setCurrentStep('form');
        clearOtp();
        setError(null);
        setSuccessMsg(null);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">

            <Link to="/" className="absolute top-6 left-6 flex items-center text-gray-500 hover:text-violet-600 transition-colors z-50">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
            </Link>

            <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">

                {/* Left Side: Visual / Decorative */}
                <div className="hidden md:flex md:w-1/2 p-12 bg-gradient-to-br from-indigo-900 to-blue-800 text-white flex-col justify-between relative overflow-hidden">
                    {/* Decorative Background Elements */}
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
                            Join the Smartest Student Network
                        </h2>
                        <p className="text-indigo-100 text-lg mb-8 max-w-sm">
                            Create an account to access verified PYQs, earn rewards by sharing notes, and organize your academic life.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="relative z-10 flex -space-x-4 mb-8"
                    >
                        {[5, 6, 7, 8].map((i) => (
                            <div key={i} className="w-12 h-12 rounded-full border-2 border-indigo-900 bg-white shadow-xl overflow-hidden">
                                <img src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="Student" className="w-full h-full object-cover" />
                            </div>
                        ))}
                        <div className="w-12 h-12 rounded-full border-2 border-indigo-900 bg-blue-600 shadow-xl flex items-center justify-center text-white text-xs font-bold z-10">
                            2k+
                        </div>
                    </motion.div>
                </div>

                {/* Right Side: Register Form */}
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
                            {currentStep === 'form' ? 'Create Account' : 'Verify Your Email'}
                        </h3>
                        <p className="text-gray-500 mb-8">
                            {currentStep === 'form' 
                                ? 'Sign up to get started with EduSure.' 
                                : `Enter the 8-digit code sent to ${pendingUserData?.email || email}`
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

                        {/* Registration Form */}
                        {currentStep === 'form' && (
                            <form onSubmit={handleFormSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="pl-10 block w-full rounded-xl border-gray-200 shadow-sm focus:ring-violet-500 focus:border-violet-500 bg-gray-50 border py-3 transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

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
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Sending OTP...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5 mr-2" />
                                            Create Account
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* OTP Verification Form */}
                        {currentStep === 'otp' && (
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
                                        <>
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            Sign Up
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleBackToForm}
                                    className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    Back to Form
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
                                onClick={handleGoogleSignUp}
                                disabled={isGoogleLoading}
                                className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-100 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2" />
                                {isGoogleLoading ? 'Signing up with Google...' : 'Google'}
                            </button>
                        </div>

                        <p className="mt-8 text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-violet-600 hover:text-fuchsia-600 transition-colors">
                                Sign in instead
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Register;
