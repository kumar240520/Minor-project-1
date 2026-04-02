import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, Shield, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useOTP } from '../hooks/useOTP';
import OTPInput from '../components/OTPInput';

const ResetPasswordOTP = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState('otp'); // 'otp' | 'password'
    const [isOTPVerified, setIsOTPVerified] = useState(false);
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
    const [isSendingOTP, setIsSendingOTP] = useState(false);
    
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
            
            // Verify the OTP with Supabase
            const { data, error } = await supabase.auth.verifyOtp({
                email: email,
                token: enteredOTP,
                type: 'email'
            });

            if (error) {
                throw error;
            }

            setSuccessMsg('OTP verified! Please set your new password.');
            setIsOTPVerified(true);
            setCurrentStep('password');
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
            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/reset-password-otp`,
                    shouldCreateUser: false,
                    data: {
                        isPasswordReset: true
                    }
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

    // Reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setIsSubmitting(true);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setIsSubmitting(false);
            return;
        }

        // Validate password strength
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setIsSubmitting(false);
            return;
        }

        try {
            const { data, error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                throw updateError;
            }

            setSuccessMsg('Password reset successful! Redirecting to login...');
            
            setTimeout(() => {
                navigate('/login', { 
                    state: { message: 'Password reset successful! Please sign in with your new password.' },
                    replace: true 
                });
            }, 2000);
        } catch (error) {
            setError(error.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Email Required</h2>
                    <p className="text-gray-600 mb-4">Please go back and enter your email address.</p>
                    <Link
                        to="/forgot-password"
                        className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                    >
                        Back to Forgot Password
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Link to="/forgot-password" className="absolute top-6 left-6 flex items-center text-gray-500 hover:text-violet-600 transition-colors z-50">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Forgot Password
            </Link>

            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-8 md:p-12 flex flex-col justify-center bg-white relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="flex justify-center mb-8">
                            <div className="bg-gradient-to-r from-fuchsia-600 to-violet-600 p-3 rounded-full">
                                <BookOpen className="h-8 w-8 text-white" />
                            </div>
                        </div>

                        <h3 className="text-3xl font-extrabold text-gray-900 mb-2">
                            {currentStep === 'otp' ? 'Verify Your Email' : 'Set New Password'}
                        </h3>
                        <p className="text-gray-500 mb-8">
                            {currentStep === 'otp' 
                                ? `Enter the 8-digit code sent to ${email}`
                                : 'Create your new password below'
                            }
                        </p>

                        {successMsg && (
                            <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                {successMsg}
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-start space-x-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* OTP Step */}
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
                                        'Verify Code'
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Password Step */}
                        {currentStep === 'password' && (
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 pr-10 block w-full rounded-xl border-gray-200 shadow-sm focus:ring-violet-500 focus:border-violet-500 bg-gray-50 border py-3 transition-colors"
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-10 pr-10 block w-full rounded-xl border-gray-200 shadow-sm focus:ring-violet-500 focus:border-violet-500 bg-gray-50 border py-3 transition-colors"
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordOTP;
