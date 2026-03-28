import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Mail, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';

const EmailVerification = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            const accessToken = searchParams.get('access_token');
            const refreshToken = searchParams.get('refresh_token');

            if (!accessToken || !refreshToken) {
                setStatus('error');
                setMessage('Invalid verification link. Please try signing up again.');
                return;
            }

            try {
                // Set the session from the URL parameters
                const { data, error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });

                if (error) {
                    throw error;
                }

                // Get the current user to confirm verification
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                
                if (userError) {
                    throw userError;
                }

                if (user && user.email_confirmed_at) {
                    setStatus('success');
                    setMessage('Your email has been successfully verified! You can now sign in to your account.');
                } else {
                    setStatus('error');
                    setMessage('Email verification failed. Please try again or contact support.');
                }
            } catch (error) {
                console.error('Email verification error:', error);
                setStatus('error');
                setMessage(error.message || 'An error occurred during email verification. Please try again.');
            }
        };

        verifyEmail();
    }, [searchParams]);

    const handleResendVerification = async () => {
        // This would need to be implemented based on your flow
        // For now, redirect to login
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Link to="/" className="absolute top-6 left-6 flex items-center text-gray-500 hover:text-violet-600 transition-colors z-50">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
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

                        <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Email Verification</h3>
                        
                        {status === 'loading' && (
                            <div className="flex flex-col items-center space-y-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                                <p className="text-gray-600">Verifying your email address...</p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="flex flex-col items-center space-y-4">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <CheckCircle className="h-12 w-12 text-green-600" />
                                </div>
                                <p className="text-green-600 font-medium">{message}</p>
                                <Link
                                    to="/login"
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    Sign In to Your Account
                                </Link>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex flex-col items-center space-y-4">
                                <div className="bg-red-100 p-3 rounded-full">
                                    <Mail className="h-12 w-12 text-red-600" />
                                </div>
                                <p className="text-red-600 font-medium">{message}</p>
                                <div className="space-y-3 w-full">
                                    <button
                                        onClick={handleResendVerification}
                                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                                    >
                                        <RefreshCw className="w-5 h-5 mr-2" />
                                        Try Again
                                    </button>
                                    <Link
                                        to="/login"
                                        className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        Back to Sign In
                                    </Link>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;
