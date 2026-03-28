import { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { Menu, X, BookOpen, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { fetchUserProfile, getRedirectPathForRole } from '../utils/auth';
import { useSidebar } from './Sidebar';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const [session, setSession] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const syncSession = async (nextSession) => {
            if (!isMounted) {
                return;
            }

            setSession(nextSession);

            if (!nextSession?.user) {
                setRole(null);
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const profile = await fetchUserProfile(nextSession.user.id);

                if (isMounted) {
                    setRole(profile.role);
                }
            } catch (error) {
                console.error('Failed to load navbar role:', error);

                if (isMounted) {
                    setRole(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            syncSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            syncSession(session);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', to: 'home' },
        { name: 'Features', to: 'features' },
        { name: 'How it Works', to: 'how-it-works' },
        { name: 'Events', to: 'events' },
    ];

    const dashboardPath = getRedirectPathForRole(role);

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white shadow-xl border-b border-violet-100 py-3 lg:py-4'
                : 'bg-[#0B0E27]/98 lg:bg-[#0B0E27]/90 backdrop-blur-xl border-b border-white/10 py-5 lg:py-6'
                }`}
        >
            {/* Decorative border accents */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#60A5FA] via-[#86EFAC] to-[#60A5FA] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#86EFAC] via-[#60A5FA] to-[#86EFAC] opacity-60" />
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[#60A5FA] via-[#86EFAC] to-[#60A5FA] opacity-40" />
            <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-[#86EFAC] via-[#60A5FA] to-[#86EFAC] opacity-40" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Enhanced Logo */}
                    <div className="flex items-center space-x-3 cursor-pointer group">
                        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-2.5 rounded-xl border border-white/20 shadow-lg group-hover:shadow-violet-500/50 transition-all">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-purple-300 drop-shadow-lg">
                            EduSure
                        </span>
                    </div>

                    {/* Enhanced Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <div className="flex space-x-6">
                            {navLinks.map((link) => (
                                <ScrollLink
                                    key={link.name}
                                    to={link.to}
                                    smooth={true}
                                    duration={500}
                                    className={`relative px-4 py-2 rounded-lg font-medium transition-all group ${
                                        isScrolled 
                                            ? 'text-gray-600 hover:text-[#60A5FA] hover:bg-[#60A5FA]/10'
                                            : 'text-white/90 hover:text-[#86EFAC] hover:bg-white/10'
                                    }`}
                                >
                                    {link.name}
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#60A5FA] to-[#86EFAC] scale-x-0 group-hover:scale-x-100 transition-transform" />
                                </ScrollLink>
                            ))}
                        </div>
                        <div className="flex items-center space-x-4 min-w-[160px] justify-end">
                            {loading ? (
                                <div className="h-10 w-24 bg-gradient-to-r from-[#60A5FA]/20 to-[#86EFAC]/20 animate-pulse rounded-full border border-white/30"></div>
                            ) : session ? (
                                <>
                                    <RouterLink
                                        to={dashboardPath}
                                        className={`px-5 py-2.5 rounded-full font-semibold transition-all border ${
                                            isScrolled
                                                ? 'bg-gradient-to-r from-[#60A5FA] to-[#86EFAC] text-white border-[#60A5FA]/30 shadow-lg hover:shadow-[#60A5FA]/50 hover:scale-105'
                                                : 'bg-white/10 backdrop-blur-md text-white border-white/30 hover:bg-white/20 hover:scale-105'
                                        }`}
                                    >
                                        {role === 'admin' ? 'Open Admin Panel' : 'Go to Dashboard'}
                                    </RouterLink>
                                    <button
                                        onClick={handleLogout}
                                        className={`p-2 rounded-lg transition-all ${
                                            isScrolled
                                                ? 'text-gray-500 hover:text-red-500 hover:bg-red-50/50 border border-transparent hover:border-red-200'
                                                : 'text-white/70 hover:text-red-300 hover:bg-red-500/20 border border-transparent hover:border-red-400/30'
                                        }`}
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <RouterLink
                                        to="/login"
                                        className={`px-4 py-2 rounded-lg font-semibold transition-all border ${
                                            isScrolled
                                                ? 'text-[#60A5FA] hover:text-[#86EFAC] hover:bg-[#60A5FA]/10 border-transparent hover:border-[#60A5FA]/30'
                                                : 'text-white/90 hover:text-[#86EFAC] hover:bg-white/10 border border-transparent hover:border-white/30'
                                        }`}
                                    >
                                        Log In
                                    </RouterLink>
                                    <RouterLink
                                        to="/register"
                                        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#60A5FA] to-[#86EFAC] hover:from-[#86EFAC] hover:to-[#60A5FA] text-white font-semibold transition-all shadow-lg hover:shadow-[#60A5FA]/50 border border-[#60A5FA]/30 hover:scale-105"
                                    >
                                        Sign Up
                                    </RouterLink>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Enhanced Mobile Menu Button */}
                    <button
                        onClick={toggleSidebar}
                        className={`md:hidden p-2 rounded-lg transition-all z-50 ${
                            isScrolled
                                ? 'text-gray-600 hover:text-[#60A5FA] hover:bg-[#60A5FA]/10 border border-gray-200 hover:border-[#60A5FA]/30'
                                : 'text-white hover:text-[#86EFAC] hover:bg-white/10 border border-white/30 hover:border-[#60A5FA]/30'
                        }`}
                    >
                        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleSidebar}
                            className="fixed inset-0 bg-[#0B0E27]/80 backdrop-blur-md z-40 md:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[400px] bg-[#0F172A] z-40 md:hidden p-8 pt-24 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col border-l border-white/5"
                        >
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-violet-600/10 to-transparent pointer-events-none" />

                            <div className="flex flex-col space-y-6 relative z-10">
                                {navLinks.map((link) => (
                                    <ScrollLink
                                        key={link.name}
                                        to={link.to}
                                        smooth={true}
                                        duration={500}
                                        onClick={toggleSidebar}
                                        className="text-xl font-bold text-white hover:text-[#86EFAC] transition-colors flex items-center group"
                                    >
                                        <div className="w-2 h-2 bg-violet-600 rounded-full mr-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {link.name}
                                    </ScrollLink>
                                ))}
                                
                                <div className="pt-10 border-t border-white/10 flex flex-col space-y-5">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Member Access</div>
                                    {loading ? (
                                        <div className="h-14 w-full bg-white/5 animate-pulse rounded-2xl" />
                                    ) : session ? (
                                        <>
                                            <RouterLink
                                                to={dashboardPath}
                                                onClick={toggleSidebar}
                                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-center shadow-lg shadow-violet-900/20 active:scale-95 transition-transform"
                                            >
                                                {role === 'admin' ? 'Admin Panel' : 'Go to Dashboard'}
                                            </RouterLink>
                                            <button
                                                onClick={() => { handleLogout(); toggleSidebar(); }}
                                                className="w-full py-4 rounded-2xl bg-white/5 text-red-400 font-black text-center border border-white/10 active:scale-95 transition-transform"
                                            >
                                                Log Out
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <RouterLink
                                                to="/login"
                                                onClick={toggleSidebar}
                                                className="w-full py-4 rounded-2xl bg-white/5 text-white font-black text-center border border-white/10 active:scale-95 transition-transform"
                                            >
                                                Sign In
                                            </RouterLink>
                                            <RouterLink
                                                to="/register"
                                                onClick={toggleSidebar}
                                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#60A5FA] to-[#86EFAC] text-white font-black text-center shadow-lg active:scale-95 transition-transform"
                                            >
                                                Get Started
                                            </RouterLink>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Mobile drawer footer */}
                            <div className="mt-auto pt-8 flex items-center justify-between text-gray-500 text-sm">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-violet-600/20 rounded-lg flex items-center justify-center">
                                        <BookOpen className="w-4 h-4 text-violet-400" />
                                    </div>
                                    <span className="font-bold text-gray-400">EduSure</span>
                                </div>
                                <span className="text-[10px] uppercase font-bold tracking-tighter">&copy; 2026</span>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
