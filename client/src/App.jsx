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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleOAuth = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      
      console.log('OAuth Check - Code:', code, 'Error:', error, 'AccessToken:', !!accessToken, 'RefreshToken:', !!refreshToken);
      console.log('All URL params:', Object.fromEntries(searchParams.entries()));
      
      // Only process if we have OAuth parameters
      if (!code && !error && !accessToken && !refreshToken) {
        console.log('No OAuth parameters, showing home');
        return;
      }

      console.log('Processing OAuth...');
      setIsProcessing(true);

      try {
        if (error) {
          console.error('OAuth Error:', error);
          navigate('/login', { state: { error: `Authentication failed: ${error}` } });
          return;
        }

        // Handle OAuth code flow
        if (code) {
          console.log('Exchanging code for session...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Exchange Error:', exchangeError);
            navigate('/login', { state: { error: exchangeError.message } });
            return;
          }

          console.log('Session established:', data);
          
          if (data?.session?.user) {
            const user = data.session.user;
            console.log('User authenticated:', user);

            // Create user profile for OAuth users
            try {
              const { ensureStudentProfile } = await import('./utils/auth');
              await ensureStudentProfile({
                id: user.id,
                email: user.email,
                fullName: user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.email?.split('@')[0] || 
                         'Google User',
              });
              console.log('User profile created/verified');
            } catch (profileError) {
              console.warn('Profile creation warning:', profileError);
              // Don't fail authentication if profile creation fails
            }

            // Get user role and redirect appropriately
            try {
              const { getAuthenticatedUserWithRole, getRedirectPathForRole } = await import('./utils/auth');
              const { role } = await getAuthenticatedUserWithRole({ initializeStudentProfile: true });
              const redirectPath = getRedirectPathForRole(role);
              
              console.log('User role:', role, 'Redirecting to:', redirectPath);
              
              // Redirect to appropriate dashboard
              setTimeout(() => {
                navigate(redirectPath, { replace: true });
              }, 1000);
            } catch (roleError) {
              console.warn('Role detection warning:', roleError);
              // Fallback to dashboard
              setTimeout(() => {
                navigate('/dashboard', { replace: true });
              }, 1000);
            }
          } else {
            throw new Error('No user session established');
          }
        }

        // Handle direct token flow (if tokens are in URL)
        if (accessToken && refreshToken) {
          console.log('Setting session from tokens...');
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('Session Error:', sessionError);
            navigate('/login', { state: { error: sessionError.message } });
            return;
          }

          console.log('Session set from tokens:', data);
          
          if (data?.user) {
            // Similar profile creation and role detection logic
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 1000);
          }
        }
      } catch (err) {
        console.error('OAuth Processing Error:', err);
        navigate('/login', { state: { error: err.message || 'Authentication failed' } });
      } finally {
        setIsProcessing(false);
      }
    };

    handleOAuth();
  }, [searchParams, navigate]);

  // Show loading if processing OAuth
  if (isProcessing || searchParams.get('code') || searchParams.get('error') || searchParams.get('access_token') || searchParams.get('refresh_token')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {searchParams.get('error') ? 'Authentication failed...' : 'Completing sign in...'}
          </p>
        </div>
      </div>
    );
  }

  // Show normal home page
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
