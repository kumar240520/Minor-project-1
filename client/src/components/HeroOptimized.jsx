import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, UploadCloud, ShieldCheck, Star, Zap, BookOpen, Users } from 'lucide-react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabaseClient';
// OPTIMIZATION: Use React Query for efficient data fetching with caching
import { usePlatformStats } from '../hooks/useOptimizedQueries';

/**
 * OPTIMIZED Hero Component
 * 
 * BEFORE:
 * - Multiple separate Supabase queries on every mount
 * - No caching - refetched every time
 * - Used select('*') fetching all columns
 * 
 * AFTER:
 * - Single consolidated query via React Query
 * - Cached for 10 minutes (staleTime)
 * - Uses specific field selection
 * - Automatic background refetching disabled
 */

const Hero = () => {
    const [session, setSession] = useState(null);
    const [role, setRole] = useState('student');
    const [loading, setLoading] = useState(true);

    // OPTIMIZATION: Use React Query for platform stats with caching
    const { 
        data: stats, 
        isLoading: statsLoading,
        error: statsError 
    } = usePlatformStats();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
            setSession(currentSession);
            if (currentSession?.user) fetchUserRole(currentSession.user.id);
            else setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) fetchUserRole(session.user.id);
            else {
                setRole('student');
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserRole = async (userId) => {
        try {
            // OPTIMIZATION: Select only the role field, not all columns
            const { data } = await supabase
                .from('users')
                .select('role')
                .eq('id', userId)
                .single();
            if (data) setRole(data.role);
        } finally {
            setLoading(false);
        }
    };

    const dashboardPath = role === 'admin' ? '/admin/dashboard' : '/dashboard';
    const ctaLink = session ? dashboardPath : '/register';
    const ctaText = session ? 'Go to Dashboard' : 'Get Started for Free';

    // OPTIMIZATION: Memoized stat formatter
    const formatStat = useCallback((value) => {
        if (typeof value === 'string' && value.includes('K')) return value;
        const numValue = typeof value === 'number' ? value : parseInt(value) || 0;
        if (numValue >= 1000) return Math.floor(numValue / 1000) + 'K+';
        return numValue.toString();
    }, []);

    // Default stats while loading
    const displayStats = stats || {
        totalStudents: 0,
        totalMaterials: 0,
        totalEvents: 0,
        totalCoins: 0,
    };

    return (
        <section
            id="home"
            className="relative min-h-screen flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-[#86EFAC] via-[#60A5FA] to-[#A78BFA]"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#86EFAC]/30 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative max-w-7xl mx-auto w-full">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center lg:text-left"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-full mb-6"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span className="font-medium text-sm">Trusted by 10,000+ Students</span>
                        </motion.div>

                        {/* Heading */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6"
                        >
                            Share Notes. <br />
                            <span className="text-white/90">Earn Rewards.</span> <br />
                            <span className="text-[#86EFAC]">Ace Exams.</span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto lg:mx-0"
                        >
                            The ultimate platform for students to upload study materials, 
                            access previous year questions, and collaborate with peers.
                        </motion.p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="text-center p-4 bg-white shadow-xl rounded-2xl border border-gray-100"
                            >
                                <Users className="w-5 h-5 text-violet-600 mx-auto mb-2" />
                                <div className="text-xl font-bold text-gray-900">
                                    {statsLoading ? '...' : formatStat(displayStats.totalStudents)}
                                </div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Students</div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="text-center p-4 bg-white shadow-xl rounded-2xl border border-gray-100"
                            >
                                <BookOpen className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                                <div className="text-xl font-bold text-gray-900">
                                    {statsLoading ? '...' : formatStat(displayStats.totalMaterials)}
                                </div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Resources</div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                className="text-center p-4 bg-white shadow-xl rounded-2xl border border-gray-100"
                            >
                                <Zap className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                                <div className="text-xl font-bold text-gray-900">
                                    {statsLoading ? '...' : formatStat(displayStats.totalCoins)}
                                </div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Coins</div>
                            </motion.div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                            <RouterLink
                                to={ctaLink}
                                className="group w-full sm:w-auto flex items-center justify-center space-x-3 bg-gradient-to-r from-[#86EFAC] to-[#60A5FA] hover:from-[#60A5FA] hover:to-[#86EFAC] text-white px-8 py-4 rounded-full font-semibold transition-all shadow-2xl shadow-[#86EFAC]/30 transform hover:-translate-y-1 hover:scale-105 border border-[#86EFAC]/30"
                            >
                                <Zap className="w-5 h-5" />
                                <span>{ctaText}</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </RouterLink>

                            <ScrollLink
                                to="features"
                                smooth={true}
                                className="group w-full sm:w-auto flex items-center justify-center bg-white/10 backdrop-blur-md border border-[#60A5FA]/30 hover:bg-white/20 text-white hover:text-[#86EFAC] px-8 py-4 rounded-full font-semibold transition-all transform hover:-translate-y-1 hover:scale-105"
                            >
                                <BookOpen className="w-5 h-5 mr-2" />
                                Explore Resources
                            </ScrollLink>
                        </div>

                        {statsError && (
                            <p className="text-sm text-red-200 mt-2">
                                Failed to load stats. Please refresh.
                            </p>
                        )}
                    </motion.div>

                    {/* Hero Image / Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="hidden lg:block relative"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-pink-500 rounded-3xl blur-2xl opacity-20 transform rotate-3" />
                            <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/80 rounded-2xl p-4 shadow-lg">
                                        <UploadCloud className="w-8 h-8 text-violet-600 mb-2" />
                                        <p className="font-semibold text-gray-900">Upload Notes</p>
                                        <p className="text-sm text-gray-600">Share your knowledge</p>
                                    </div>
                                    <div className="bg-white/80 rounded-2xl p-4 shadow-lg">
                                        <ShieldCheck className="w-8 h-8 text-emerald-600 mb-2" />
                                        <p className="font-semibold text-gray-900">Verified</p>
                                        <p className="text-sm text-gray-600">Quality assured</p>
                                    </div>
                                    <div className="bg-white/80 rounded-2xl p-4 shadow-lg">
                                        <Star className="w-8 h-8 text-amber-500 mb-2" />
                                        <p className="font-semibold text-gray-900">Earn Coins</p>
                                        <p className="text-sm text-gray-600">Get rewarded</p>
                                    </div>
                                    <div className="bg-white/80 rounded-2xl p-4 shadow-lg">
                                        <Zap className="w-8 h-8 text-blue-600 mb-2" />
                                        <p className="font-semibold text-gray-900">Fast Access</p>
                                        <p className="text-sm text-gray-600">Instant downloads</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
