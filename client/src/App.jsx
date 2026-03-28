import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route, useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Events from './components/Events';
import StatsAndCTA from './components/StatsAndCTA';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminGuard from './components/admin/AdminGuard';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const EmailVerification = lazy(() => import('./pages/EmailVerification'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PYQ = lazy(() => import('./pages/PYQ'));
const PlacementMaterials = lazy(() => import('./pages/PlacementMaterials'));
const CommunityPost = lazy(() => import('./pages/CommunityPost'));
const MyMaterials = lazy(() => import('./pages/MyMaterials'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Rewards = lazy(() => import('./pages/Rewards'));
const Settings = lazy(() => import('./pages/Settings'));
const Upload = lazy(() => import('./pages/Upload'));
const Help = lazy(() => import('./pages/Help'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminApprovals = lazy(() => import('./pages/admin/AdminApprovals'));
const AdminMaterials = lazy(() => import('./pages/admin/AdminMaterials'));
const AdminPYQs = lazy(() => import('./pages/admin/AdminPYQs'));
const AdminRewards = lazy(() => import('./pages/admin/AdminRewards'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminTickets = lazy(() => import('./pages/admin/AdminTickets'));
const SupportHelp = lazy(() => import('./pages/SupportHelp'));
const Notifications = lazy(() => import('./pages/Notifications'));

const adminRoutes = [
  { path: '/admin-dashboard', element: <AdminDashboard /> },
  { path: '/admin-dashboard/approvals', element: <AdminApprovals /> },
  { path: '/admin-dashboard/materials', element: <AdminMaterials /> },
  { path: '/admin-dashboard/pyqs', element: <AdminPYQs /> },
  { path: '/admin-dashboard/rewards', element: <AdminRewards /> },
  { path: '/admin-dashboard/users', element: <AdminUsers /> },
  { path: '/admin-dashboard/transactions', element: <AdminTransactions /> },
  { path: '/admin-dashboard/reports', element: <AdminReports /> },
  { path: '/admin-dashboard/events', element: <AdminEvents /> },
  { path: '/admin-dashboard/analytics', element: <AdminAnalytics /> },
  { path: '/admin-dashboard/tickets', element: <AdminTickets /> },
];

const legacyAdminRoutes = [
  { from: '/admin', to: '/admin-dashboard' },
  { from: '/admin/approvals', to: '/admin-dashboard/approvals' },
  { from: '/admin/materials', to: '/admin-dashboard/materials' },
  { from: '/admin/pyqs', to: '/admin-dashboard/pyqs' },
  { from: '/admin/rewards', to: '/admin-dashboard/rewards' },
  { from: '/admin/users', to: '/admin-dashboard/users' },
  { from: '/admin/transactions', to: '/admin-dashboard/transactions' },
  { from: '/admin/reports', to: '/admin-dashboard/reports' },
  { from: '/admin/events', to: '/admin-dashboard/events' },
  { from: '/admin/analytics', to: '/admin-dashboard/analytics' },
];

const Home = () => (
  <>
    <Navbar />
    <Hero />
    <Features />
    <HowItWorks />
    <Events />
    <StatsAndCTA />
    <Footer />
  </>
);

const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
    Loading page...
  </div>
);

const HomeWithOAuthHandler = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const processOAuthTokens = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      // Debug logging
      console.log('OAuth Handler Debug:', {
        accessToken,
        refreshToken,
        code,
        error,
        allParams: Object.fromEntries(searchParams.entries())
      });

      // Only process if we have OAuth parameters
      if (!accessToken && !refreshToken && !code && !error) {
        return; // No OAuth parameters, show normal home page
      }

      setIsProcessingOAuth(true);

      try {
        if (error) {
          console.error('OAuth Error:', error);
          // Handle OAuth error - redirect to login with error
          navigate('/login', { 
            state: { 
              error: `Authentication failed: ${error}` 
            } 
          });
          return;
        }

        // Handle OAuth code flow
        if (code && !accessToken) {
          console.log('Processing OAuth code...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            navigate('/login', { 
              state: { 
                error: exchangeError.message || 'Failed to complete authentication' 
              } 
            });
            return;
          }

          if (data?.session?.user) {
            console.log('Successfully exchanged code for session');
            // Create user profile if needed
            try {
              const { ensureStudentProfile } = await import('./utils/auth');
              await ensureStudentProfile({
                id: data.session.user.id,
                email: data.session.user.email,
                fullName: data.session.user.user_metadata?.full_name || 
                         data.session.user.user_metadata?.name || 
                         data.session.user.email?.split('@')[0] || 
                         'Google User',
              });
            } catch (profileError) {
              console.warn('Profile creation warning:', profileError);
            }

            // Get user role and redirect
            try {
              const { getAuthenticatedUserWithRole, getRedirectPathForRole } = await import('./utils/auth');
              const { role } = await getAuthenticatedUserWithRole({ initializeStudentProfile: true });
              const redirectPath = getRedirectPathForRole(role);
              
              console.log('Redirecting to:', redirectPath);
              navigate(redirectPath, { replace: true });
            } catch (roleError) {
              console.warn('Role detection warning:', roleError);
              navigate('/dashboard', { replace: true });
            }
          }
          return;
        }

        // Handle direct token flow
        if (accessToken && refreshToken) {
          console.log('Processing OAuth tokens...');
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('Session setting error:', sessionError);
            navigate('/login', { 
              state: { 
                error: sessionError.message || 'Failed to set session' 
              } 
            });
            return;
          }

          if (data?.user) {
            console.log('Successfully set session');
            // Create user profile if needed
            try {
              const { ensureStudentProfile } = await import('./utils/auth');
              await ensureStudentProfile({
                id: data.user.id,
                email: data.user.email,
                fullName: data.user.user_metadata?.full_name || 
                         data.user.user_metadata?.name || 
                         data.user.email?.split('@')[0] || 
                         'Google User',
              });
            } catch (profileError) {
              console.warn('Profile creation warning:', profileError);
            }

            // Get user role and redirect
            try {
              const { getAuthenticatedUserWithRole, getRedirectPathForRole } = await import('./utils/auth');
              const { role } = await getAuthenticatedUserWithRole({ initializeStudentProfile: true });
              const redirectPath = getRedirectPathForRole(role);
              
              console.log('Redirecting to:', redirectPath);
              navigate(redirectPath, { replace: true });
            } catch (roleError) {
              console.warn('Role detection warning:', roleError);
              navigate('/dashboard', { replace: true });
            }
          }
        }
      } catch (error) {
        console.error('OAuth processing error:', error);
        navigate('/login', { 
          state: { 
            error: error.message || 'Authentication processing failed' 
          } 
        });
      } finally {
        setIsProcessingOAuth(false);
      }
    };

    processOAuthTokens();
  }, [location, searchParams, navigate]);

  // Show loading while processing OAuth
  if (isProcessingOAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing authentication...</p>
        </div>
      </div>
    );
  }

  // Check if we have OAuth parameters (show loading instead of home page)
  const hasOAuthParams = searchParams.get('access_token') || 
                        searchParams.get('refresh_token') || 
                        searchParams.get('code') || 
                        searchParams.get('error');

  if (hasOAuthParams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing authentication...</p>
        </div>
      </div>
    );
  }

  // Otherwise show the regular home page
  return <Home />;
};

function App() {
  return (
    <Router>
      <div className="font-sans text-gray-900 selection:bg-violet-500 selection:text-white">
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<HomeWithOAuthHandler />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/email-verification" element={<EmailVerification />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/pyqs" element={<ProtectedRoute><PYQ /></ProtectedRoute>} />
            <Route path="/placement-materials" element={<ProtectedRoute><PlacementMaterials /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><CommunityPost /></ProtectedRoute>} />
            <Route path="/my-materials" element={<ProtectedRoute><MyMaterials /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><SupportHelp /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

            {adminRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<AdminGuard>{route.element}</AdminGuard>}
              />
            ))}

            {legacyAdminRoutes.map((route) => (
              <Route
                key={route.from}
                path={route.from}
                element={<Navigate to={route.to} replace />}
              />
            ))}
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
