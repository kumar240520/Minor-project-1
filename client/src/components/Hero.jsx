import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, UploadCloud, ShieldCheck, Star, Zap, BookOpen, Users } from 'lucide-react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Hero = () => {
    const [session, setSession] = useState(null);
    const [role, setRole] = useState('student');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalMaterials: 0,
        totalEvents: 0,
        totalCoins: 0
    });

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
            setSession(currentSession);
            if (currentSession?.user) {
                fetchUserRole(currentSession.user.id);
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchUserRole(session.user.id);
            } else {
                setRole('student');
                setLoading(false);
            }
        });

        // Fetch real-time stats
        fetchPlatformStats();

        return () => subscription.unsubscribe();
    }, []);

    const fetchPlatformStats = async () => {
        try {
            // Fetch total students
            const { count: studentCount } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'student');

            // Fetch total approved materials
            const { count: materialCount } = await supabase
                .from('materials')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'approved');

            // Fetch total events
            const { count: eventCount } = await supabase
                .from('calendar_events')
                .select('*', { count: 'exact', head: true })
                .eq('is_global', true);

            // Fetch total coins awarded (try multiple approaches)
            let totalCoins = 0;
            
            try {
                // Method 1: Sum from transactions table
                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('amount')
                    .eq('transaction_type', 'EARN');

                if (transactions && transactions.length > 0) {
                    totalCoins = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
                }
            } catch (err) {
                console.log('Transactions query failed:', err.message);
            }

            // Method 2: If transactions empty, try summing user coins as fallback
            if (totalCoins === 0) {
                try {
                    const { data: users } = await supabase
                        .from('users')
                        .select('coins')
                        .gte('coins', 0);

                    if (users && users.length > 0) {
                        totalCoins = users.reduce((sum, user) => sum + (user.coins || 0), 0);
                    }
                } catch (err) {
                    console.log('User coins query failed:', err.message);
                }
            }

            // Method 3: If still 0, show a reasonable default
            if (totalCoins === 0) {
                totalCoins = 1250; // Default fallback value
            }

            // Format stats for display
            const formatStat = (value) => {
                // If it's already a string with K, return as is
                if (typeof value === 'string' && value.includes('K')) {
                    return value;
                }
                
                // If it's a number, format it
                const numValue = typeof value === 'number' ? value : parseInt(value) || 0;
                if (numValue >= 1000) {
                    return Math.floor(numValue / 1000) + 'K+';
                }
                return numValue.toString();
            };
            
            setStats({
                totalStudents: formatStat(studentCount || 0),
                totalMaterials: formatStat(materialCount || 0),
                totalEvents: formatStat(eventCount || 0),
                totalCoins: formatStat(totalCoins)
            });
        } catch (error) {
            console.error('Error fetching platform stats:', error);
        }
    };

    const fetchUserRole = async (userId) => {
        try {
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
    const ctaText = session ? (role === 'admin' ? 'Go to Admin Panel' : 'Go to Dashboard') : 'Get Started Free';
    const ctaLink = session ? dashboardPath : '/register';
    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Vibrant Background Image with Overlay */}
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
                 style={{
                     backgroundImage: 'url("https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80")',
                     filter: 'brightness(0.2) saturate(1.2)'
                 }}>
            </div>
            
            {/* Gradient Overlays for Depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B0E27]/90 via-[#0B0E27]/80 to-[#0B0E27]/95 -z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent -z-10" />
            
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#3B82F6]/20 to-[#86EFAC]/20 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#86EFAC]/20 to-[#3B82F6]/20 rounded-full blur-3xl opacity-60 translate-y-1/2 -translate-x-1/2 animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-[#60A5FA]/15 to-[#4ADE80]/15 rounded-full blur-3xl opacity-40 animate-pulse delay-500" />

            {/* Decorative Borders */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#60A5FA] via-[#86EFAC] to-[#60A5FA] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#86EFAC] via-[#60A5FA] to-[#86EFAC] opacity-60" />
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[#60A5FA] via-[#86EFAC] to-[#60A5FA] opacity-40" />
            <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-[#86EFAC] via-[#60A5FA] to-[#86EFAC] opacity-40" />

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white/20 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0, 1, 0],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Left Column: Enhanced Text & CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center lg:text-left pt-12 lg:pt-0"
                    >
                        {/* Enhanced Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#60A5FA]/20 to-[#86EFAC]/20 backdrop-blur-md border border-[#60A5FA]/30 text-white px-6 py-3 rounded-full mb-8 font-medium text-sm shadow-lg shadow-[#60A5FA]/25"
                        >
                            <Sparkles className="w-5 h-5 text-[#86EFAC]" />
                            <span className="bg-gradient-to-r from-[#86EFAC] to-[#60A5FA] bg-clip-text text-transparent font-bold">The #1 Student Academic Platform</span>
                            <Star className="w-4 h-4 text-[#86EFAC]" />
                        </motion.div>

                        {/* Enhanced Heading */}
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                            <span className="block text-white mb-2">Master Your</span>
                            <span className="block bg-gradient-to-r from-[#86EFAC] via-[#60A5FA] to-[#86EFAC] bg-clip-text text-transparent drop-shadow-2xl">
                                Academics
                            </span>
                            <span className="block text-white">Together.</span>
                        </h1>

                        {/* Enhanced Description */}
                        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Stop hunting for notes in chaotic WhatsApp groups. EduSure centralizes verified PYQs, study materials, and college notices all in one powerful ecosystem.
                        </p>

                        {/* Enhanced Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="text-center p-4 bg-white shadow-xl rounded-2xl border border-gray-100"
                            >
                                <Users className="w-5 h-5 text-violet-600 mx-auto mb-2" />
                                <div className="text-xl font-bold text-gray-900">{stats.totalStudents}</div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Students</div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="text-center p-4 bg-white shadow-xl rounded-2xl border border-gray-100"
                            >
                                <BookOpen className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                                <div className="text-xl font-bold text-gray-900">{stats.totalMaterials}</div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Resources</div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                className="text-center p-4 bg-white shadow-xl rounded-2xl border border-gray-100"
                            >
                                <Zap className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                                <div className="text-xl font-bold text-gray-900">{stats.totalCoins}</div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Coins</div>
                            </motion.div>
                        </div>

                        {/* Enhanced CTAs */}
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
                    </motion.div>

                    {/* Right Column: Enhanced Floating UI Elements */}
                    <div className="relative h-[600px] w-full hidden lg:block perspective-1000">
                        <motion.div
                            initial={{ opacity: 0, x: 50, rotateY: 15 }}
                            animate={{ opacity: 1, x: 0, rotateY: 0 }}
                            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                            className="absolute top-10 right-0 w-full max-w-md"
                        >
                            {/* Enhanced Main Mockup Card */}
                            <div className="bg-white/90 backdrop-blur-xl border-2 border-[#60A5FA]/60 shadow-2xl rounded-3xl p-6 relative z-20 hover:shadow-[#60A5FA]/30 transition-all">
                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-[#86EFAC] to-[#60A5FA] rounded-full animate-pulse" />
                                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-r from-[#60A5FA] to-[#86EFAC] rounded-full animate-pulse delay-500" />
                                
                                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-800">Operating Systems</h3>
                                        <p className="text-sm text-gray-500">Unit 3 Notes • 6th Semester</p>
                                    </div>
                                    <div className="bg-gradient-to-r from-[#60A5FA] to-[#86EFAC] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                                        <ShieldCheck className="w-3 h-3 mr-1" />
                                        Verified
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-gradient-to-r from-[#86EFAC]/20 to-[#60A5FA]/20 rounded w-3/4"></div>
                                    <div className="h-4 bg-gradient-to-r from-[#60A5FA]/20 to-[#86EFAC]/20 rounded w-full"></div>
                                    <div className="h-4 bg-gradient-to-r from-[#86EFAC]/20 to-[#60A5FA]/20 rounded w-5/6"></div>
                                    <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#86EFAC] to-[#60A5FA] flex items-center justify-center text-white font-bold text-xs">AK</div>
                                            <span className="text-sm text-gray-600 font-medium">Uploaded by Aman</span>
                                        </div>
                                        <button className="bg-gradient-to-r from-[#86EFAC] to-[#60A5FA] text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-[#60A5FA] hover:to-[#86EFAC] transition-all shadow-lg">Download Pdfs</button>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Upload Floating Card */}
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute -left-12 top-32 bg-gradient-to-br from-white to-gray-50 p-4 rounded-2xl shadow-2xl border border-[#60A5FA]/50 flex items-center space-x-3 z-30 hover:shadow-[#60A5FA]/30 transition-all"
                            >
                                <div className="bg-gradient-to-r from-[#86EFAC] to-[#60A5FA] p-3 rounded-xl text-white shadow-lg">
                                    <UploadCloud className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Upload Notes</p>
                                    <p className="text-xs bg-gradient-to-r from-[#86EFAC] to-[#60A5FA] bg-clip-text text-transparent font-bold">+50 Coins Earned</p>
                                </div>
                            </motion.div>

                            {/* Enhanced Notification Floating Card */}
                            <motion.div
                                animate={{ y: [0, 15, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                                className="absolute -right-8 bottom-12 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-[#86EFAC]/50 z-10 hover:shadow-[#86EFAC]/30 transition-all"
                            >
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-2 h-2 bg-gradient-to-r from-[#86EFAC] to-[#60A5FA] rounded-full animate-pulse"></div>
                                    <p className="text-sm font-bold text-gray-800">New Notice 📢</p>
                                </div>
                                <p className="text-xs text-gray-600 w-40 truncate">Mid-term exam schedule updated...</p>
                            </motion.div>

                            {/* Additional Floating Elements */}
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                                className="absolute top-60 -right-16 bg-gradient-to-br from-[#86EFAC]/20 to-[#60A5FA]/20 p-6 rounded-3xl border border-white/30 backdrop-blur-md"
                            >
                                <Star className="w-8 h-8 text-[#86EFAC]" />
                            </motion.div>

                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                className="absolute top-80 -left-16 bg-gradient-to-br from-[#60A5FA]/20 to-[#86EFAC]/20 p-4 rounded-2xl border border-white/30 backdrop-blur-md"
                            >
                                <Zap className="w-6 h-6 text-[#60A5FA]" />
                            </motion.div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Hero;
