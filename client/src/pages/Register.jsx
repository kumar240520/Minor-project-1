import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Mail,
  Lock,
  User,
  UserPlus,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { ensureStudentProfile, isValidInstitutionalEmail, fetchAuthPolicy, getAuthenticatedUserWithRole, getRedirectPathForRole, isAdminEmail } from '../utils/auth';
import { authAPI } from '../services/api';
import { useOTP } from '../hooks/useOTP';
import OTPInput from '../components/OTPInput';
import registerBg from '../assets/Landing_background_images/register page.jpeg';

// Hand-drawn blue underline for "Student Network"
const BlueDoodleUnderline = () => (
  <svg
    className="w-48 sm:w-56 h-3 text-blue-600 -mt-1 pointer-events-none"
    viewBox="0 0 100 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
  >
    <path d="M2 7 C 30 2, 70 3, 98 7" />
  </svg>
);

// Standard Google G Logo
const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Authentication policy state (dynamically fetched from server / Admin panel)
  const [authPolicy, setAuthPolicy] = useState({
    allow_non_college_emails: true,
    allowed_domains: ['.ies@ipsacademy.org']
  });

  useEffect(() => {
    let mounted = true;
    fetchAuthPolicy().then(policy => {
      if (mounted && policy) {
        setAuthPolicy(policy);
      }
    });
    return () => { mounted = false; };
  }, []);

  // OTP states
  const [currentStep, setCurrentStep] = useState('form'); // 'form' | 'otp'
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [pendingUserData, setPendingUserData] = useState(null);

  // OTP hook
  const {
    otp,
    timer,
    isTimerActive,
    canResend,
    handleOtpChange,
    handleKeyDown,
    handlePaste,
    clearOtp,
    getOtpString,
    isOtpComplete,
    startTimer,
    allowResend
  } = useOTP();

  const handleGoogleSignUp = async () => {
    setError(null);
    setIsGoogleLoading(true);

    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (googleError) throw googleError;
    } catch (error) {
      setError(error.message || 'Failed to sign up with Google. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  // Handle form submission and dispatch registration OTP via Nodemailer
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    if (!name.trim()) {
      setError('Please enter your full name.');
      setIsSubmitting(false);
      return;
    }

    if (!isValidInstitutionalEmail(email, authPolicy.allow_non_college_emails)) {
      setError(authPolicy.allow_non_college_emails
        ? 'Please enter a valid email address.'
        : 'Registration is currently restricted to college emails ending in .ies@ipsacademy.org');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await authAPI.sendRegistrationOTP({
        email: email.trim(),
        name: name.trim()
      });

      setPendingUserData({ name: name.trim(), email: email.trim(), password });
      setSuccessMsg(res.message || `Verification code sent to ${email.trim()}. Please enter the 6 digits below.`);
      setCurrentStep('otp');
      startTimer();
    } catch (err) {
      setError(err.message || 'Failed to send OTP verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify OTP, create account on backend, and sign in directly to dashboard
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsVerifyingOTP(true);

    if (!isOtpComplete()) {
      setError(`Please enter all ${otp.length} digits of the OTP code.`);
      setIsVerifyingOTP(false);
      return;
    }

    try {
      await authAPI.verifyRegistrationOTP({
        email: pendingUserData.email,
        otp: getOtpString(),
        password: pendingUserData.password,
        name: pendingUserData.name
      });

      setSuccessMsg('Email verified & account registered successfully! Signing you in...');

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: pendingUserData.email,
        password: pendingUserData.password
      });

      if (signInError) {
        navigate('/login', {
          state: {
            email: pendingUserData.email,
            message: 'Account registered successfully! Please sign in with your password.'
          },
          replace: true
        });
        return;
      }

      try {
        const authUser = (await supabase.auth.getUser())?.data?.user;
        if (authUser) {
          await ensureStudentProfile({
            id: authUser.id,
            email: pendingUserData.email,
            fullName: pendingUserData.name
          });
        }
      } catch (pErr) {
        console.warn('Profile initialization note:', pErr.message);
      }

      let redirectPath = isAdminEmail(pendingUserData?.email) ? '/admin/dashboard' : '/onboarding';
      try {
        const { role, profile } = await getAuthenticatedUserWithRole({ initializeStudentProfile: false });
        redirectPath = getRedirectPathForRole(role, profile);
      } catch (rErr) {
        console.warn('Redirect path determination warning:', rErr);
      }

      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1000);

    } catch (err) {
      if (err.message?.includes('Invalid OTP') || err.message?.includes('expired') || err.message?.includes('digits')) {
        setError(err.message || 'Invalid or expired OTP code. Please check your code or request a new one.');
        clearOtp();
        allowResend();
      } else {
        setError(err.message || 'Failed to complete registration. Please try again.');
      }
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  // Resend OTP via Nodemailer SMTP
  const handleResendOTP = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsSendingOTP(true);

    try {
      const res = await authAPI.sendRegistrationOTP({
        email: pendingUserData.email,
        name: pendingUserData.name
      });

      setSuccessMsg(res.message || 'A fresh verification code has been dispatched to your email.');
      clearOtp();
      startTimer();
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
    clearOtp();
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-start p-4 sm:p-6 lg:p-8 overflow-hidden font-sans">
      {/* Crisp Background Image Layer */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url(${registerBg})`,
        }}
      />

      {/* Top Bar with Home Link */}
      <div className="relative z-20 flex items-center justify-between max-w-7xl mx-auto w-full mb-3 sm:mb-4">
        {/* Mobile Logo */}
        <Link to="/" className="lg:hidden flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-xl font-display font-black text-slate-900">
            Edu<span className="text-blue-600">Sure</span>
          </span>
        </Link>
        <div className="hidden lg:block" />

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>

      {/* Main Grid: Left Promotional Branding + Right Floating Create Account Card */}
      <div className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center lg:items-start lg:pt-2">

        {/* 1. Top on Mobile / Left Column Top on Desktop: Heading & Branding */}
        <div className="order-1 lg:col-span-6 xl:col-span-7 lg:row-start-1 flex flex-col justify-start select-none py-1 lg:py-0 translate-y-0 lg:-translate-y-12 xl:-translate-y-16">
          {/* Logo on Desktop */}
          <Link to="/" className="hidden lg:flex items-center gap-2.5 mb-6 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-display font-black tracking-tight text-slate-900 leading-none">
                Edu<span className="text-blue-600">Sure</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-700 tracking-wider mt-1 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 shadow-2xs w-fit">
                Learn · Share · Grow
              </span>
            </div>
          </Link>

          {/* Heading with Blue Doodle Underline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-3 sm:mb-4 lg:mb-7 text-center lg:text-left"
          >
            <h1 className="text-[32px] xs:text-[36px] sm:text-5xl lg:text-6xl font-display font-black text-slate-900 tracking-tight leading-[1.12] lg:leading-[1.15] drop-shadow-[0_2px_8px_rgba(255,255,255,0.7)]">
              Join the <br className="hidden lg:inline" />
              Smartest <br className="hidden lg:inline" />
              <span className="text-blue-600">Student Network</span>
            </h1>
            <div className="mt-1.5 sm:mt-2 flex justify-center lg:justify-start">
              <BlueDoodleUnderline />
            </div>
          </motion.div>
        </div>

        {/* 2. Middle on Mobile / Right Column on Desktop: Create Account Card */}
        <div className="order-2 lg:order-2 lg:col-span-6 xl:col-span-5 lg:col-start-7 xl:col-start-8 lg:row-start-1 lg:row-span-2 flex justify-center lg:justify-end w-full">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[450px] bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-[0_20px_50px_rgba(15,23,42,0.14)] border border-slate-100"
          >
            {/* Card Header */}
            <div className="mb-5">
              <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
                {currentStep === 'form' ? 'Create Account' : 'Verify Your Email'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {currentStep === 'form'
                  ? 'Sign up to get started with EduSure.'
                  : `Enter the 6-digit code sent to ${pendingUserData?.email || email}`
                }
              </p>
            </div>

            {/* Feedback Notifications */}
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form (Step 1) */}
            {currentStep === 'form' && (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Email Address
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Gmail & College Allowed
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-blue-500 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@gmail.com or 0808ci231128.ies@ipsacademy.org"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#F0F6FF] border border-blue-100 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    A one-time 6-digit OTP will be sent to this email address to verify your account.
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#F0F6FF] border border-blue-100 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Continue with OTP Verification CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Continue with OTP Verification</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* OTP Verification Form (Step 2) */}
            {currentStep === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-3 text-center">
                    Enter the 6-digit verification code sent to <br />
                    <span className="font-bold text-blue-600">{pendingUserData?.email}</span>
                  </label>
                  <OTPInput
                    otp={otp}
                    onChange={handleOtpChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    disabled={isVerifyingOTP}
                  />
                </div>

                <div className="text-center text-xs text-slate-500">
                  {isTimerActive ? (
                    <span className="flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Resend code in {timer}s
                    </span>
                  ) : canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isSendingOTP}
                      className="text-blue-600 hover:underline font-bold inline-flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSendingOTP ? 'animate-spin' : ''}`} />
                      Resend Code
                    </button>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingOTP || !isOtpComplete()}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isVerifyingOTP ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Verify & Complete Registration</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToForm}
                  className="w-full py-2 px-4 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all"
                >
                  Change Details
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="my-5 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or continue with
              </span>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-display font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:border-slate-300 disabled:opacity-70 cursor-pointer"
            >
              <GoogleIcon />
              <span>{isGoogleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
            </button>

            {/* Footer Login Link */}
            <p className="mt-5 text-center text-xs text-slate-600 font-medium">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-blue-600 hover:text-indigo-600 transition-colors ml-0.5"
              >
                Sign in directly
              </Link>
            </p>

          </motion.div>
        </div>

        {/* 3. Bottom on Mobile (in a row) / Left Column Bottom on Desktop (stacked): Learn, Share, Grow */}
        <div className="order-3 lg:order-3 lg:col-span-6 xl:col-span-7 lg:row-start-2 flex flex-col justify-start select-none w-full max-w-[450px] mx-auto lg:max-w-sm lg:mx-0 translate-y-0 lg:-translate-y-8 xl:-translate-y-10">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:flex lg:flex-col lg:gap-3.5">
            {/* Feature 1: Learn */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col items-center text-center p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm lg:flex-row lg:items-center lg:text-left lg:p-0 lg:bg-transparent lg:border-none lg:shadow-none lg:gap-3.5 lg:w-fit"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="mt-1.5 lg:mt-0 lg:px-3.5 lg:py-1.5 lg:rounded-2xl lg:bg-white lg:border lg:border-slate-200/90 lg:shadow-sm">
                <div className="text-xs sm:text-base font-display font-bold text-slate-900 leading-tight">Learn</div>
                <div className="text-[10px] sm:text-xs text-slate-600 font-semibold leading-tight mt-0.5">Better Notes</div>
              </div>
            </motion.div>

            {/* Feature 2: Share */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center text-center p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm lg:flex-row lg:items-center lg:text-left lg:p-0 lg:bg-transparent lg:border-none lg:shadow-none lg:gap-3.5 lg:w-fit"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="mt-1.5 lg:mt-0 lg:px-3.5 lg:py-1.5 lg:rounded-2xl lg:bg-white lg:border lg:border-slate-200/90 lg:shadow-sm">
                <div className="text-xs sm:text-base font-display font-bold text-slate-900 leading-tight">Share</div>
                <div className="text-[10px] sm:text-xs text-slate-600 font-semibold leading-tight mt-0.5">Help Peers</div>
              </div>
            </motion.div>

            {/* Feature 3: Grow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center text-center p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm lg:flex-row lg:items-center lg:text-left lg:p-0 lg:bg-transparent lg:border-none lg:shadow-none lg:gap-3.5 lg:w-fit"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="mt-1.5 lg:mt-0 lg:px-3.5 lg:py-1.5 lg:rounded-2xl lg:bg-white lg:border lg:border-slate-200/90 lg:shadow-sm">
                <div className="text-xs sm:text-base font-display font-bold text-slate-900 leading-tight">Grow</div>
                <div className="text-[10px] sm:text-xs text-slate-600 font-semibold leading-tight mt-0.5">Brighter Future</div>
              </div>
            </motion.div>
          </div>
        </div>

      </div>

      {/* Bottom spacer */}
      <div className="relative z-20 h-2" />
    </div>
  );
};

export default Register;
