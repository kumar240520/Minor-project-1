import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const DebugInfo = () => {
  const [debugData, setDebugData] = useState({
    session: null,
    userProfile: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    const debugAuth = async () => {
      try {
        // 1. Check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setDebugData(prev => ({ ...prev, error: `Session Error: ${sessionError.message}`, loading: false }));
          return;
        }

        // 2. Check user profile
        let profile = null;
        let profileError = null;
        
        if (session?.user) {
          const { data: profileData, error: profileErr } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          profile = profileData;
          profileError = profileErr;
        }

        setDebugData({
          session,
          userProfile: profile,
          error: profileError ? `Profile Error: ${profileError.message}` : null,
          loading: false
        });

      } catch (error) {
        setDebugData(prev => ({ 
          ...prev, 
          error: `Debug Error: ${error.message}`, 
          loading: false 
        }));
      }
    };

    debugAuth();
  }, []);

  if (debugData.loading) {
    return <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">Loading debug info...</div>;
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
      <h3 className="font-bold text-yellow-800 mb-2">🔍 Debug Information</h3>
      
      {debugData.error && (
        <div className="p-2 bg-red-100 border border-red-200 rounded mb-2">
          <strong className="text-red-700">Error:</strong> {debugData.error}
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div>
          <strong>Session Status:</strong> {debugData.session ? '✅ Active' : '❌ None'}
        </div>
        
        {debugData.session && (
          <div>
            <strong>User ID:</strong> {debugData.session.user.id}
            <br />
            <strong>Email:</strong> {debugData.session.user.email}
          </div>
        )}

        <div>
          <strong>User Profile:</strong> {debugData.userProfile ? '✅ Found' : '❌ Not Found'}
        </div>

        {debugData.userProfile && (
          <div>
            <strong>Profile Name:</strong> {debugData.userProfile.name || 'N/A'}
            <br />
            <strong>Role:</strong> {debugData.userProfile.role || 'N/A'}
            <br />
            <strong>Coins:</strong> {debugData.userProfile.coins || 0}
          </div>
        )}

        <div className="mt-3 p-2 bg-blue-50 rounded">
          <strong className="text-blue-700">🛠️ Quick Fixes:</strong>
          <ul className="list-disc list-inside mt-1 text-blue-600">
            <li>If no profile: User needs to be created in users table</li>
            <li>If session error: Check Supabase configuration</li>
            <li>If profile error: Run setup-user-profiles.sql script</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DebugInfo;
