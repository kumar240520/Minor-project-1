import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const getResetRedirectUrl = () => {
    const isDevelopment = import.meta.env.DEV;
    const baseUrl = window.location.origin;
    
    if (isDevelopment) {
        // Development uses localhost with current port
        return `${baseUrl}/reset-password`;
    }
    
    // Production uses hiteshkumar24.in
    return 'https://hiteshkumar24.in/reset-password';
};

const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setIsSubmitting(true);

        try {
            const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: getResetRedirectUrl()
            });

            if (resetError) {
                throw resetError;
            }

            setSuccess(true);
        } catch (error) {
            setError(error.message || 'Failed to send password reset email. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Link to="/login" className="absolute top-6 left-6 flex items-center text-gray-500 hover:text-violet-600 transition-colors z-50">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Sign In
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

                        <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Reset Password</h3>
                        <p className="text-gray-500 mb-8">
                            {!success 
                                ? "Enter your email address and we'll send you a link to reset your password." 
                                : "Check your email for the password reset link."
                            }
                        </p>

                        {success ? (
                            <div className="flex flex-col items-center space-y-4">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <CheckCircle className="h-12 w-12 text-green-600" />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-green-600 font-medium">
                                        Password reset email sent!
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        We've sent a password reset link to <strong>{email}</strong>
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                        Didn't receive the email? Check your spam folder or try again.
                                    </p>
                                </div>
                                <div className="space-y-3 w-full mt-6">
                                    <button
                                        onClick={() => setSuccess(false)}
                                        className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        Send Again
                                    </button>
                                    <Link
                                        to="/login"
                                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                                    >
                                        Back to Sign In
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-start space-x-2">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

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
                                            placeholder="student@college.edu"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
                                </button>
                            </form>
                        )}

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600">
                                Remember your password?{' '}
                                <Link to="/login" className="font-bold text-violet-600 hover:text-fuchsia-600 transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
