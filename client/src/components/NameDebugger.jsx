import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getDisplayName, getFirstName } from '../utils/auth';

const NameDebugger = () => {
    const [debugInfo, setDebugInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const debugNameFlow = async () => {
            try {
                // 1. Get auth user
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError) throw authError;

                // 2. Get database profile
                const { data: profile, error: profileError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                // 3. Test display name functions
                const authDisplayName = getDisplayName(user);
                const profileDisplayName = getDisplayName(profile);
                const authFirstName = getFirstName(user);
                const profileFirstName = getFirstName(profile);

                setDebugInfo({
                    authUser: {
                        id: user.id,
                        email: user.email,
                        metadata: user.user_metadata,
                        computedDisplayName: authDisplayName,
                        computedFirstName: authFirstName
                    },
                    dbProfile: profile ? {
                        id: profile.id,
                        email: profile.email,
                        name: profile.name,
                        full_name: profile.full_name,
                        role: profile.role,
                        computedDisplayName: profileDisplayName,
                        computedFirstName: profileFirstName
                    } : null,
                    profileError: profileError?.message
                });
            } catch (error) {
                console.error('Debug error:', error);
                setDebugInfo({ error: error.message });
            } finally {
                setLoading(false);
            }
        };

        debugNameFlow();
    }, []);

    if (loading) return <div>Loading debug info...</div>;

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', margin: '20px', borderRadius: '8px' }}>
            <h3>Name Display Debug Info</h3>
            
            {debugInfo?.error ? (
                <div style={{ color: 'red' }}>Error: {debugInfo.error}</div>
            ) : (
                <div>
                    <div style={{ marginBottom: '20px' }}>
                        <h4>Auth User Data:</h4>
                        <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
                            {JSON.stringify(debugInfo?.authUser, null, 2)}
                        </pre>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h4>Database Profile:</h4>
                        {debugInfo?.dbProfile ? (
                            <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
                                {JSON.stringify(debugInfo?.dbProfile, null, 2)}
                            </pre>
                        ) : (
                            <div style={{ color: 'orange' }}>
                                No profile found in database. Error: {debugInfo?.profileError}
                            </div>
                        )}
                    </div>

                    <div>
                        <h4>What Dashboard Will Show:</h4>
                        <p><strong>Display Name:</strong> {debugInfo?.dbProfile?.computedDisplayName || debugInfo?.authUser?.computedDisplayName}</p>
                        <p><strong>First Name:</strong> {debugInfo?.dbProfile?.computedFirstName || debugInfo?.authUser?.computedFirstName}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NameDebugger;
