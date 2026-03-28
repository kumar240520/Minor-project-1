import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { getAuthenticatedUserWithRole, getRedirectPathForRole, ensureStudentProfile, isRowLevelSecurityError } from '../utils/auth';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleAuthCallback = async () => {
            const accessToken = searchParams.get('access_token');
            const refreshToken = searchParams.get('refresh_token');
            const code = searchParams.get('code');
            const error = searchParams.get('error');
            const provider = searchParams.get('provider'); // This will be 'google' for Google OAuth

            if (error) {
                setStatus('error');
                setMessage(`Authentication failed: ${error}`);
                return;
            }

            // Handle OAuth code flow (Google OAuth)
            if (code && !accessToken) {
                try {
                    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                    
                    if (exchangeError) {
                        throw exchangeError;
                    }

                    if (data?.session) {
                        // Successfully exchanged code for session
                        const user = data.session.user;
                        
                        // For OAuth users (Google), ensure they have a student profile
                        try {
                            await ensureStudentProfile({
                                id: user.id,
                                email: user.email,
                                fullName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Google User',
                            });
                        } catch (profileError) {
                            if (isRowLevelSecurityError(profileError)) {
                                setError('Your account was created, but the users table blocked profile creation. Contact support to finish setup.');
                            } else {
                                setError(profileError.message || 'Your account was created, but your student profile could not be initialized.');
                            }
                        }

                        // Get user role and redirect
                        try {
                            const { role } = await getAuthenticatedUserWithRole({ initializeStudentProfile: true });
                            const redirectPath = getRedirectPathForRole(role);
                            
                            setStatus('success');
                            setMessage('Authentication successful! Redirecting to your dashboard...');
                            
                            // Redirect after a short delay
                            setTimeout(() => {
                                navigate(redirectPath, { replace: true });
                            }, 1500);
                        } catch (roleError) {
                            setStatus('success');
                            setMessage('Authentication successful! Please sign in to complete setup.');
                            
                            setTimeout(() => {
                                navigate('/login', { replace: true });
                            }, 1500);
                        }
                    } else {
                        throw new Error('No session received after code exchange');
                    }
                } catch (error) {
                    console.error('Code exchange error:', error);
                    setStatus('error');
                    setMessage('Failed to complete authentication. Please try again.');
                }
                return;
            }

            // Handle direct token flow
            if (!accessToken || !refreshToken) {
                setStatus('error');
                setMessage('Invalid authentication callback. Please try again.');
                return;
            }

            try {
                // Set the session from the URL parameters
                const { data, error: sessionError } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });

                if (sessionError) {
                    throw sessionError;
                }

                // Get the current user
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                
                if (userError) {
                    throw userError;
                }

                if (!user) {
                    throw new Error('No user found after authentication');
                }

                // For OAuth users (Google), ensure they have a student profile
                if (provider === 'google') {
                    try {
                        await ensureStudentProfile({
                            id: user.id,
                            email: user.email,
                            fullName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Google User',
                        });
                    } catch (profileError) {
                        if (isRowLevelSecurityError(profileError)) {
                            setError('Your account was created, but the users table blocked profile creation. Contact support to finish setup.');
                        } else {
                            setError(profileError.message || 'Your account was created, but your student profile could not be initialized.');
                        }
                        // Don't throw here - let the user continue to login
                    }
                }

                // Get user role and redirect
                try {
                    const { role } = await getAuthenticatedUserWithRole({ initializeStudentProfile: true });
                    const redirectPath = getRedirectPathForRole(role);
                    
                    setStatus('success');
                    setMessage('Authentication successful! Redirecting to your dashboard...');
                    
                    // Redirect after a short delay
                    setTimeout(() => {
                        navigate(redirectPath, { replace: true });
                    }, 1500);
                } catch (roleError) {
                    // If role fetching fails, still consider it a success but redirect to login
                    setStatus('success');
                    setMessage('Authentication successful! Please sign in to complete setup.');
                    
                    setTimeout(() => {
                        navigate('/login', { replace: true });
                    }, 1500);
                }
            } catch (error) {
                console.error('Auth callback error:', error);
                setStatus('error');
                setMessage(error.message || 'An error occurred during authentication. Please try again.');
            }
        };

        handleAuthCallback();
    }, [searchParams, navigate]);

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

                        <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Authentication</h3>
                        
                        {status === 'loading' && (
                            <div className="flex flex-col items-center space-y-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                                <p className="text-gray-600">Completing authentication...</p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="flex flex-col items-center space-y-4">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <CheckCircle className="h-12 w-12 text-green-600" />
                                </div>
                                <p className="text-green-600 font-medium">{message}</p>
                                {error && (
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-xl">
                                        {error}
                                    </div>
                                )}
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex flex-col items-center space-y-4">
                                <div className="bg-red-100 p-3 rounded-full">
                                    <AlertCircle className="h-12 w-12 text-red-600" />
                                </div>
                                <p className="text-red-600 font-medium">{message}</p>
                                <div className="space-y-3 w-full">
                                    <Link
                                        to="/login"
                                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                                    >
                                        Back to Sign In
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        Create New Account
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

export default AuthCallback;
