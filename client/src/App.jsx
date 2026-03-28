import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
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

            <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            <Route path="/admin/approvals" element={<AdminGuard><AdminApprovals /></AdminGuard>} />
            <Route path="/admin/materials" element={<AdminGuard><AdminMaterials /></AdminGuard>} />
            <Route path="/admin/pyqs" element={<AdminGuard><AdminPYQs /></AdminGuard>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
