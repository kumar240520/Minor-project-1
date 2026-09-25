import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ProtectedRoute = ({ children }) => {
    const [session, setSession] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        let mounted = true;

        // Session & Profile check
        const checkSessionAndProfile = async () => {
            try {
                let attempts = 0;
                let sessionData = null;
                
                while (attempts < 3 && !sessionData) {
                    const { data: { session } } = await supabase.auth.getSession();
                    sessionData = session;
                    
                    if (!sessionData) {
                        await new Promise(resolve => setTimeout(resolve, 300));
                        attempts++;
                    }
                }
                
                if (!mounted) return;
                setSession(sessionData);

                if (sessionData?.user) {
                    const { data: profile, error } = await supabase
                        .from('users')
                        .select('id, role, onboarding_completed, is_profile_complete')
                        .eq('id', sessionData.user.id)
                        .maybeSingle();

                    if (!mounted) return;

                    if (profile) {
                        setUserProfile(profile);
                    } else {
                        // If record doesn't exist yet, check if admin before defaulting to pending student
                        const isSessionAdmin = sessionData.user.email === 'admin.ies@ipsacademy.org' || 
                                               sessionData.user.email === 'myadmin.ies@ipsacademy.org' ||
                                               sessionData.user.app_metadata?.role === 'admin' ||
                                               sessionData.user.user_metadata?.role === 'admin';
                        setUserProfile({
                            id: sessionData.user.id,
                            role: isSessionAdmin ? 'admin' : 'student',
                            onboarding_completed: isSessionAdmin,
                            is_profile_complete: isSessionAdmin
                        });
                    }
                } else {
                    setUserProfile(null);
                }
            } catch (error) {
                console.error('ProtectedRoute check error:', error);
                if (mounted) {
                    setSession(null);
                    setUserProfile(null);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        checkSessionAndProfile();

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) return;
            setSession(session);
            if (!session) {
                setUserProfile(null);
                setLoading(false);
            } else {
                checkSessionAndProfile();
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [location.pathname]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Verifying authentication...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        // Don't redirect if we're already on login page or coming from OAuth
        if (location.pathname === '/login' || location.search.includes('code=')) {
            return children;
        }
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Admin check: any user with role 'admin' in database or metadata, or system root admin emails
    const isAdmin = userProfile?.role === 'admin' ||
                    session?.user?.app_metadata?.role === 'admin' ||
                    session?.user?.user_metadata?.role === 'admin' ||
                    session?.user?.email === 'admin.ies@ipsacademy.org' || 
                    session?.user?.email === 'myadmin.ies@ipsacademy.org';
    const isOnboardingComplete = Boolean(userProfile?.onboarding_completed);

    if (isAdmin) {
        // Admin level users bypass student onboarding completely.
        // If an admin attempts to visit /onboarding, send them to admin dashboard.
        if (location.pathname === '/onboarding') {
            return <Navigate to="/admin/dashboard" replace />;
        }
    } else {
        // UNAVOIDABLE ONBOARDING FOR STUDENTS:
        // Any student who has not completed onboarding CANNOT access any protected pages
        if (!isOnboardingComplete && location.pathname !== '/onboarding') {
            return <Navigate to="/onboarding" replace />;
        }

        // Once onboarding is completed, prevent revisiting onboarding wizard
        if (isOnboardingComplete && location.pathname === '/onboarding') {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
