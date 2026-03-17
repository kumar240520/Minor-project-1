import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <div className="font-sans text-gray-900 selection:bg-violet-500 selection:text-white">
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

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
