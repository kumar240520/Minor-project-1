import { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { Menu, X, BookOpen, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { fetchUserProfile, getRedirectPathForRole } from '../utils/auth';
const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
                ? 'bg-white/80 backdrop-blur-md shadow-sm py-4'
                : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center space-x-2 cursor-pointer">
                        <div className="bg-gradient-to-r from-fuchsia-600 to-violet-600 p-2 rounded-lg">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-violet-600">
                            EduSure
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <div className="flex space-x-6">
                            {navLinks.map((link) => (
                                <ScrollLink
                                    key={link.name}
                                    to={link.to}
                                    smooth={true}
                                    duration={500}
                                    className="text-gray-600 hover:text-violet-600 cursor-pointer font-medium transition-colors"
                                >
                                    {link.name}
                                </ScrollLink>
                            ))}
                        </div>
                        <div className="flex items-center space-x-4 min-w-[160px] justify-end">
                            {loading ? (
                                <div className="h-10 w-24 bg-gray-100 animate-pulse rounded-full"></div>
                            ) : session ? (
                                <>
                                    <RouterLink
                                        to={dashboardPath}
                                        className="bg-gray-100 text-gray-800 px-5 py-2.5 rounded-full font-semibold hover:bg-gray-200 transition"
                                    >
                                        {role === 'admin' ? 'Open Admin Panel' : 'Go to Dashboard'}
                                    </RouterLink>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-500 hover:text-red-500 transition-colors p-2"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <RouterLink
                                        to="/login"
                                        className="text-violet-600 font-semibold hover:text-violet-700 transition"
                                    >
                                        Log In
                                    </RouterLink>
                                    <RouterLink
                                        to="/register"
                                        className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-violet-700 transition shadow-lg shadow-violet-600/20 hover:-translate-y-0.5 transform duration-200"
                                    >
                                        Register
                                    </RouterLink>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-600 hover:text-violet-600 focus:outline-none"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        {navLinks.map((link) => (
                            <ScrollLink
                                key={link.name}
                                to={link.to}
                                smooth={true}
                                duration={500}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-violet-600 hover:bg-violet-50 rounded-md"
                            >
                                {link.name}
                            </ScrollLink>
                        ))}
                        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col space-y-3 px-3">
                            {loading ? (
                                <div className="h-10 bg-gray-100 animate-pulse rounded-lg w-full"></div>
                            ) : session ? (
                                <>
                                    <RouterLink
                                        to={dashboardPath}
                                        className="w-full text-center bg-violet-50 text-violet-700 font-semibold py-3 rounded-lg block"
                                    >
                                        {role === 'admin' ? 'Open Admin Panel' : 'Go to Dashboard'}
                                    </RouterLink>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center text-red-500 font-semibold py-3 border border-red-100 rounded-lg"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <RouterLink
                                        to="/login"
                                        className="w-full text-center text-violet-600 font-semibold py-3 border border-violet-200 rounded-lg block"
                                    >
                                        Log In
                                    </RouterLink>
                                    <RouterLink
                                        to="/register"
                                        className="w-full text-center bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white font-semibold py-3 rounded-lg shadow-md block"
                                    >
                                        Register
                                    </RouterLink>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
