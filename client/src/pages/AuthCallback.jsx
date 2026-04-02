import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getAuthenticatedUserWithRole, getRedirectPathForRole, isValidInstitutionalEmail } from '../utils/auth';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        let mounted = true;
        
        // Handle immediate URL errors from Google/OAuth
        const urlError = searchParams.get('error') || searchParams.get('error_description');
        if (urlError) {
            if (mounted) setErrorMsg(urlError);
            setTimeout(() => {
                if (mounted) navigate('/login', { state: { error: urlError }, replace: true });
            }, 3000);
            return;
        }

        console.log('AuthCallback - Full URL:', window.location.href);
        console.log('AuthCallback - Search params:', Object.fromEntries(searchParams.entries()));

        // Check if this is a password reset flow from Supabase verification
        const type = searchParams.get('type');
        
        if (type === 'recovery') {
            console.log('AuthCallback - Detected password recovery type');
            
            // Wait for Supabase to process the session, then extract tokens
            const handleRecovery = async () => {
                try {
                    // Get the current session after Supabase processes the recovery
                    const { data: { session }, error } = await supabase.auth.getSession();
                    
                    if (error) {
                        console.error('AuthCallback - Session error after recovery:', error);
                        throw error;
                    }
                    
                    if (session && session.access_token && session.refresh_token) {
                        console.log('AuthCallback - Got session tokens, redirecting to reset password');
                        if (mounted) {
                            window.location.href = `/reset-password?access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}`;
                        }
                    } else {
                        console.log('AuthCallback - No session found, waiting for auth state change');
                        
                        // Listen for auth state change
                        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
                            console.log('AuthCallback - Auth state change:', event, !!currentSession);
                            
                            if (event === 'SIGNED_IN' && currentSession && currentSession.access_token) {
                                subscription.unsubscribe();
                                if (mounted) {
                                    window.location.href = `/reset-password?access_token=${encodeURIComponent(currentSession.access_token)}&refresh_token=${encodeURIComponent(currentSession.refresh_token)}`;
                                }
                            } else if (event === 'PASSWORD_RECOVERY') {
                                subscription.unsubscribe();
                                if (mounted) {
                                    window.location.href = `/reset-password?access_token=${encodeURIComponent(currentSession.access_token)}&refresh_token=${encodeURIComponent(currentSession.refresh_token)}`;
                                }
                            }
                        });
                        
                        // Fallback timeout
                        setTimeout(() => {
                            if (mounted) {
                                subscription.unsubscribe();
                                console.error('AuthCallback - Recovery timeout, redirecting to login');
                                navigate('/login', { state: { error: 'Password reset session expired. Please try again.' }, replace: true });
                            }
                        }, 10000);
                    }
                } catch (error) {
                    console.error('AuthCallback - Recovery handling error:', error);
                    if (mounted) {
                        navigate('/login', { state: { error: 'Failed to process password reset. Please try again.' }, replace: true });
                    }
                }
            };
            
            // Small delay to let Supabase process the URL
            setTimeout(handleRecovery, 1000);
            return;
        }

        const handleSession = async () => {
            try {
                // Supabase v2 automatically processes the ?code parameter when detectSessionInUrl is true.
                // It fetches the session and sets it. We just need to check if it's there.
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) throw error;
                
                if (session) {
                    if (!isValidInstitutionalEmail(session.user.email)) {
                        await supabase.auth.signOut();
                        throw new Error('Only institutional emails starting with 0808 and ending in .ies@ipsacademy.org are allowed');
                    }
                    const { role } = await getAuthenticatedUserWithRole({ initializeStudentProfile: true });
                    if (mounted) navigate(getRedirectPathForRole(role), { replace: true });
                } else {
                    // No session immediately available. Wait for the background automatic process.
                    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
                        if (event === 'SIGNED_IN' && currentSession) {
                            subscription.unsubscribe();
                            try {
                                if (!isValidInstitutionalEmail(currentSession.user.email)) {
                                    await supabase.auth.signOut();
                                    throw new Error('Only institutional emails starting with 0808 and ending in .ies@ipsacademy.org are allowed');
                                }
                                const { role } = await getAuthenticatedUserWithRole({ initializeStudentProfile: true });
                                if (mounted) navigate(getRedirectPathForRole(role), { replace: true });
                            } catch (err) {
                                console.error('Error fetching role after SIGNED_IN:', err);
                                if (mounted) navigate('/dashboard', { replace: true });
                            }
                        }
                    });
                    
                    // Fallback timeout
                    setTimeout(() => {
                        if (mounted) {
                            subscription.unsubscribe();
                            navigate('/login', { state: { error: 'Authentication timed out. Please try again.' }, replace: true });
                        }
                    }, 8000);
                }
            } catch (err) {
                console.error('Error in AuthCallback:', err);
                if (mounted) {
                    setErrorMsg(err.message || 'Authentication failed');
                    setTimeout(() => navigate('/login', { state: { error: err.message }, replace: true }), 3000);
                }
            }
        };

        // Delay to allow Supabase SDK to parse the code from the URL first
        setTimeout(handleSession, 500);

        return () => {
            mounted = false;
        };
    }, [navigate, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="text-center max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Authenticating</h2>
                <p className="text-gray-500 text-sm">
                    {errorMsg ? (
                        <span className="text-red-500 font-medium">Error: {errorMsg}. Redirecting to login...</span>
                    ) : (
                        'Please wait while we log you in securely.'
                    )}
                </p>
            </div>
        </div>
    );
};

export default AuthCallback;

