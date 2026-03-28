import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, User, UserPlus, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { ensureStudentProfile, isRowLevelSecurityError, isValidInstitutionalEmail } from '../utils/auth';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const navigate = useNavigate();



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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!isValidInstitutionalEmail(email)) {
             setError('Only institutional emails starting with 0808 and ending in .ies@ipsacademy.org are allowed.');
             return;
        }
        
        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    full_name: name,
                }
            }
        });

        if (signUpError) {
            setError(signUpError.message);
            return;
        }

        try {
            if (data.user && data.session) {
                await ensureStudentProfile({
                    id: data.user.id,
                    email,
                    fullName: name,
                });
            }
        } catch (profileError) {
            if (isRowLevelSecurityError(profileError)) {
                setError('Your account was created, but the users table blocked profile creation. Apply the Supabase users insert policy or trigger, then sign in once to finish setup.');
            } else {
                setError(profileError.message || 'Your account was created, but your student profile could not be initialized.');
            }
            return;
        }

        if (!data.session) {
            navigate('/login', { 
                state: { 
                    email: email, 
                    message: "Your account has been created. Please check your email, verify your address, and then sign in once to finish profile setup." 
                } 
            });
        } else {
            navigate('/dashboard', { replace: true });
        }
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

                        <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Create Account</h3>
                        <p className="text-gray-500 mb-8">Sign up to get started with EduSure.</p>

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
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
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-2"
                            >
                                <UserPlus className="w-5 h-5 mr-2" />
                                Create Account
                            </button>
                        </form>

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
