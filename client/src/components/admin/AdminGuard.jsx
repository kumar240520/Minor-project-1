import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { getAuthenticatedUserWithRole, MissingUserRoleError } from '../../utils/auth';

const AdminGuard = ({ children }) => {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    const checkAdminAccess = async () => {
      try {
        const { user, role } = await getAuthenticatedUserWithRole();

        if (!isMounted) {
          return;
        }

        if (!user) {
          setStatus('unauthenticated');
          return;
        }

        setStatus(role === 'admin' ? 'authorized' : 'forbidden');
      } catch (error) {
        console.error('Admin guard failed:', error);

        if (!isMounted) {
          return;
        }

        if (error instanceof MissingUserRoleError) {
          setStatus('forbidden');
          return;
        }

        setStatus('unauthenticated');
      }
    };

    checkAdminAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      if (!session) {
        setStatus('unauthenticated');
        return;
      }

      setStatus('loading');
      checkAdminAccess();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  if (status === 'forbidden') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminGuard;
