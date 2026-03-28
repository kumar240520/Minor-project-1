import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ProtectedRoute = ({ children }) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        // Initial session check with retry for OAuth
        const checkSession = async () => {
            try {
                // Try multiple times to get session (for OAuth flows)
                let attempts = 0;
                let sessionData = null;
                
                while (attempts < 3 && !sessionData) {
                    const { data: { session } } = await supabase.auth.getSession();
                    sessionData = session;
                    
                    if (!sessionData) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                        attempts++;
                    }
                }
                
                setSession(sessionData);
            } catch (error) {
                console.error('Session check error:', error);
                setSession(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('Auth state change:', _event, session?.user?.email);
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying authentication...</p>
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

    return children;
};

export default ProtectedRoute;
