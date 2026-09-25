import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminGuard from './components/admin/AdminGuard';
import { SidebarProvider } from './components/Sidebar';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';

// Resilient lazy import that automatically recovers from stale chunk errors after new deployments
const safeLazy = (importFn) =>
  lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.warn('Chunk load error in route, attempting auto-reload...', error);
      const isChunkError =
        error?.message?.includes('dynamically imported module') ||
        error?.message?.includes('MIME type') ||
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('Importing a module script failed') ||
        error?.name === 'TypeError';

      const lastReload = Number(sessionStorage.getItem('last_chunk_reload') || 0);
      const now = Date.now();

      if (isChunkError && now - lastReload > 8000) {
        sessionStorage.setItem('last_chunk_reload', String(now));
        window.location.reload();
        return new Promise(() => {});
      }

      throw error;
    }
  });

const Login = safeLazy(() => import('./pages/Login'));
const Register = safeLazy(() => import('./pages/Register'));
const EmailVerification = safeLazy(() => import('./pages/EmailVerification'));
const AuthCallback = safeLazy(() => import('./pages/AuthCallback'));
const Onboarding = safeLazy(() => import('./pages/Onboarding'));
const ForgotPassword = safeLazy(() => import('./pages/ForgotPassword'));
const ResetPassword = safeLazy(() => import('./pages/ResetPassword'));
const ResetPasswordOTP = safeLazy(() => import('./pages/ResetPasswordOTP'));
const Dashboard = safeLazy(() => import('./pages/Dashboard'));
const PYQ = safeLazy(() => import('./pages/PYQ'));
const PlacementMaterials = safeLazy(() => import('./pages/PlacementMaterials'));
const CommunityPost = safeLazy(() => import('./pages/CommunityPost'));
const MyMaterials = safeLazy(() => import('./pages/MyMaterials'));
const Calendar = safeLazy(() => import('./pages/Calendar'));
const Rewards = safeLazy(() => import('./pages/Rewards'));
const Settings = safeLazy(() => import('./pages/Settings'));
const Upload = safeLazy(() => import('./pages/Upload'));
const Profile = safeLazy(() => import('./pages/Profile'));
const Help = safeLazy(() => import('./pages/Help'));
const SupportHelp = safeLazy(() => import('./pages/SupportHelp'));

const AdminDashboard = safeLazy(() => import('./pages/admin/AdminDashboard'));
const AdminApprovals = safeLazy(() => import('./pages/admin/AdminApprovals'));
const AdminMaterials = safeLazy(() => import('./pages/admin/AdminMaterials'));
const AdminPYQs = safeLazy(() => import('./pages/admin/AdminPYQs'));
const AdminRewards = safeLazy(() => import('./pages/admin/AdminRewards'));
const AdminUsers = safeLazy(() => import('./pages/admin/AdminUsers'));
const AdminTransactions = safeLazy(() => import('./pages/admin/AdminTransactions'));
const AdminReports = safeLazy(() => import('./pages/admin/AdminReports'));
const AdminEvents = safeLazy(() => import('./pages/admin/AdminEvents'));
const AdminTickets = safeLazy(() => import('./pages/admin/AdminTickets'));
const AdminAnalytics = safeLazy(() => import('./pages/admin/AdminAnalytics'));
const AdminCommitteePosts = safeLazy(() => import('./pages/admin/AdminCommitteePosts'));
const AdminBulkEmail = safeLazy(() => import('./pages/admin/AdminBulkEmail'));
const AdminAuthSettings = safeLazy(() => import('./pages/admin/AdminAuthSettings'));

const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
    Loading page...
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <SidebarProvider>
          <div className="font-sans text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-950 min-h-screen selection:bg-violet-500 selection:text-white transition-colors duration-200">
            <ErrorBoundary>
              <Suspense fallback={<RouteLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password-otp" element={<ResetPasswordOTP />} />
                <Route path="/email-verification" element={<EmailVerification />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/pyqs" element={<ProtectedRoute><PYQ /></ProtectedRoute>} />
                <Route path="/placement-materials" element={<ProtectedRoute><PlacementMaterials /></ProtectedRoute>} />
                <Route path="/community" element={<ProtectedRoute><CommunityPost /></ProtectedRoute>} />
                <Route path="/my-materials" element={<ProtectedRoute><MyMaterials /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
                <Route path="/support-center" element={<ProtectedRoute><SupportHelp /></ProtectedRoute>} />

                <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                <Route path="/admin/approvals" element={<AdminGuard><AdminApprovals /></AdminGuard>} />
                <Route path="/admin/materials" element={<AdminGuard><AdminMaterials /></AdminGuard>} />
                <Route path="/admin/pyqs" element={<AdminGuard><AdminPYQs /></AdminGuard>} />
                <Route path="/admin/rewards" element={<AdminGuard><AdminRewards /></AdminGuard>} />
                <Route path="/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
                <Route path="/admin/transactions" element={<AdminGuard><AdminTransactions /></AdminGuard>} />
                <Route path="/admin/reports" element={<AdminGuard><AdminReports /></AdminGuard>} />
                <Route path="/admin/events" element={<AdminGuard><AdminEvents /></AdminGuard>} />
                <Route path="/admin/committee-posts" element={<AdminGuard><AdminCommitteePosts /></AdminGuard>} />
                <Route path="/admin/tickets" element={<AdminGuard><AdminTickets /></AdminGuard>} />
                <Route path="/admin/analytics" element={<AdminGuard><AdminAnalytics /></AdminGuard>} />
                <Route path="/admin/bulk-email" element={<AdminGuard><AdminBulkEmail /></AdminGuard>} />
                <Route path="/admin/auth-settings" element={<AdminGuard><AdminAuthSettings /></AdminGuard>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
        </SidebarProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
