import { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { BookOpen, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { fetchUserProfile, getRedirectPathForRole } from '../utils/auth';
import { useSidebar } from './Sidebar';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { isSidebarOpen } = useSidebar();
    const [session, setSession] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const syncSession = async (nextSession) => {
            if (!isMounted) return;
            setSession(nextSession);

            if (!nextSession?.user) {
                setRole(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const profile = await fetchUserProfile(nextSession.user.id);
                if (isMounted) setRole(profile.role);
            } catch (error) {
                console.error('Failed to load navbar role:', error);
                if (isMounted) setRole(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            syncSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
                ? (isSidebarOpen ? 'bg-white' : 'bg-white/95') + ' shadow-xl border-b border-violet-100 py-1.5 lg:py-2'
                : (isSidebarOpen ? 'bg-[#0B0E27]' : 'bg-[#0B0E27]/98') + ' backdrop-blur-xl border-b border-white/10 py-3 lg:py-4'
                }`}
        >
            {/* Decorative border accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 animate-pulse" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-9 sm:h-11">
                    {/* Logo Section */}
                    <div className="flex items-center space-x-1.5 sm:space-x-2 cursor-pointer group">
                        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-1 sm:p-1.5 rounded-lg border border-white/20 shadow-lg group-hover:shadow-violet-500/50 transition-all">
                            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-purple-300 drop-shadow-lg leading-none">
                            EduSure
                        </span>
                    </div>

                    {/* Navigation - Hidden on Mobile to prioritize CTAs */}
                    <div className="hidden lg:flex items-center space-x-6">
                        {navLinks.map((link) => (
                            <ScrollLink
                                key={link.name}
                                to={link.to}
                                smooth={true}
                                duration={500}
                                className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${isScrolled
                                        ? 'text-gray-600 hover:text-violet-600'
                                        : 'text-white/90 hover:text-white'
                                    }`}
                            >
                                {link.name}
                            </ScrollLink>
                        ))}
                    </div>

                    {/* Auth Buttons - PC & Mobile Compatible */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {loading ? (
                            <div className="h-9 w-20 sm:w-24 bg-white/10 animate-pulse rounded-full border border-white/20" />
                        ) : session ? (
                            <>
                                <RouterLink
                                    to={dashboardPath}
                                    className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold transition-all text-xs sm:text-base shadow-lg active:scale-95 ${isScrolled
                                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                                            : 'bg-white/10 backdrop-blur-md text-white border border-white/30 hover:bg-white/20'
                                        }`}
                                >
                                    {role === 'admin' ? 'Dashboard' : 'Dashboard'}
                                </RouterLink>
                                <button
                                    onClick={handleLogout}
                                    className={`p-2 rounded-lg transition-all ${isScrolled
                                            ? 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                                            : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <>
                                <RouterLink
                                    to="/login"
                                    className={`px-3 sm:px-4 py-2 rounded-lg font-bold transition-all text-xs sm:text-base ${isScrolled ? 'text-gray-900' : 'text-white'
                                        }`}
                                >
                                    Log In
                                </RouterLink>
                                <RouterLink
                                    to="/register"
                                    className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-indigo-600 hover:to-violet-600 text-white font-bold transition-all shadow-lg active:scale-95 text-xs sm:text-base"
                                >
                                    Join Free
                                </RouterLink>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
