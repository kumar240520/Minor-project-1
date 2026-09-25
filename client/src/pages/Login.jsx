import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Mail, 
  Lock, 
  ArrowRight, 
  Shield, 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { 
  ensureStudentProfile, 
  getAuthenticatedUser, 
  getAuthenticatedUserWithRole, 
  getRedirectPathForRole, 
  isRowLevelSecurityError, 
  isValidInstitutionalEmail, 
  fetchAuthPolicy 
} from '../utils/auth';
import { useOTP } from '../hooks/useOTP';
import OTPInput from '../components/OTPInput';
import signinBg from '../assets/Landing_background_images/page Signin.jpeg';

// Hand-drawn doodle rays matching reference image
const DoodleRays = ({ side = "left" }) => (
  <svg 
    className={`w-5 h-6 text-blue-500 inline-block shrink-0 ${side === "right" ? "scale-x-[-1]" : ""}`} 
    viewBox="0 0 20 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round"
  >
    <path d="M16 4L4 7" />
    <path d="M18 12L2 12" />
    <path d="M16 20L4 17" />
  </svg>
);

// Curved underline doodle matching reference image
const DoodleUnderline = () => (
  <svg 
    className="w-24 sm:w-28 h-3 text-blue-600 mx-auto -mt-1 pointer-events-none" 
    viewBox="0 0 100 12" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3.5" 
    strokeLinecap="round"
  >
    <path d="M3 8 C 30 2, 70 3, 97 8" />
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

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(location.state?.message || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // OTP states
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'
  const [currentStep, setCurrentStep] = useState('email'); // 'email' | 'otp'
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  
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
  } = useOTP();

  // Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSendingOTP(true);

    if (!isValidInstitutionalEmail(email, authPolicy.allow_non_college_emails)) {
      setError(authPolicy.allow_non_college_emails 
        ? 'Please enter a valid email address.' 
        : 'Only institutional emails ending in .ies@ipsacademy.org are allowed.');
      setIsSendingOTP(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        }
      });

      if (error) throw error;

      setSuccessMsg('OTP sent successfully! Please check your email.');
      setCurrentStep('otp');
      startTimer();
    } catch (err) {
      console.error('Send OTP Error:', err);
      let errorMessage = err.message || 'Failed to send OTP. Please try again.';
      if (errorMessage.includes('Too many OTP requests')) {
        errorMessage = 'Too many OTP requests. Please wait 10 minutes before trying again.';
      } else if (errorMessage.includes('Too many requests')) {
        errorMessage = 'Please wait a moment before requesting another OTP.';
      }
      setError(errorMessage);
    } finally {
      setIsSendingOTP(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsVerifyingOTP(true);

    if (!isOtpComplete()) {
      setError(`Please enter all ${otp.length} digits of the OTP.`);
      setIsVerifyingOTP(false);
      return;
    }

    try {
      const enteredOTP = getOtpString();
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: enteredOTP,
        type: 'email'
      });

      if (error) throw error;

      setSuccessMsg('OTP verified! Redirecting...');
      const { role, profile } = await getAuthenticatedUserWithRole({ initializeStudentProfile: false });
      let activeProfile = profile;
      
      if (!activeProfile) {
        try {
          const userName = data.user.user_metadata?.full_name || 
                           data.user.user_metadata?.name || 
                           null;
          await ensureStudentProfile({
            id: data.user.id,
            email: data.user.email,
            fullName: userName
          });
          const res = await getAuthenticatedUserWithRole({ initializeStudentProfile: false });
          activeProfile = res.profile;
        } catch (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }
      
      const redirectPath = getRedirectPathForRole(role, activeProfile);
      
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1000);
    } catch (err) {
      console.error('Verify OTP Error:', err);
      setError(err.message || 'Failed to verify OTP. Please try again.');
      clearOtp();
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsSendingOTP(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: false,
        }
      });

      if (error) throw error;

      setSuccessMsg('OTP resent successfully! Please check your email.');
      clearOtp();
      startTimer();
    } catch (err) {
      console.error('Resend OTP Error:', err);
      let errorMessage = err.message || 'Failed to resend OTP. Please try again.';
      if (errorMessage.includes('Too many requests')) {
        errorMessage = 'Please wait a moment before requesting another OTP.';
      }
      setError(errorMessage);
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
      setError(error.message || 'Failed to sign in with Google. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    if (!isValidInstitutionalEmail(email, authPolicy.allow_non_college_emails)) {
      setIsSubmitting(false);
      setError(authPolicy.allow_non_college_emails 
        ? 'Please enter a valid email address.' 
        : 'Only institutional emails ending in .ies@ipsacademy.org are allowed.');
      return;
    }

    let didAuthenticate = false;

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;
      didAuthenticate = true;

      const { role, profile } = await getAuthenticatedUserWithRole({ initializeStudentProfile: false });

      if (!profile) {
        try {
          const authUser = await getAuthenticatedUser();
          const userName = authUser.user_metadata?.full_name || 
                           authUser.user_metadata?.name || 
                           null;
          await ensureStudentProfile({
            id: authUser.id,
            email,
            fullName: userName,
          });
        } catch (profileError) {
          console.error('Profile creation error during login:', profileError);
        }
        
        const { role: newRole, profile: newProfile } = await getAuthenticatedUserWithRole({ initializeStudentProfile: false });
        navigate(getRedirectPathForRole(newRole, newProfile), { replace: true });
      } else {
        navigate(getRedirectPathForRole(role, profile), { replace: true });
      }
    } catch (loginError) {
      if (didAuthenticate) {
        await supabase.auth.signOut();
      }

      if (isRowLevelSecurityError(loginError)) {
        setError('Your account signed in, but users table is still blocked by Supabase RLS. Apply users insert policy or trigger, then try again.');
      } else if (loginError.message?.includes('Invalid login credentials')) {
        setError('Invalid login credentials. Please check your password or try OTP login.');
      } else {
        setError(loginError.message || 'Unable to sign in right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full relative flex flex-col justify-between p-4 sm:p-6 lg:p-8 overflow-x-hidden font-sans"
      style={{
        backgroundImage: `url(${signinBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Top Left EduSure Logo */}
      <div className="relative z-20 flex items-center justify-between max-w-7xl mx-auto w-full mb-4 sm:mb-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-display font-black tracking-tight text-slate-900 leading-none">
              Edu<span className="text-blue-600">Sure</span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 tracking-wider mt-0.5">
              Learn · Share · Grow
            </span>
          </div>
        </Link>

        {/* Back to Home Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>

      {/* Main Content: Left Floating Card matching reference mockup */}
      <div className="relative z-20 max-w-7xl mx-auto w-full flex items-center my-auto">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px] bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-[0_20px_50px_rgba(15,23,42,0.12)] border border-slate-100"
        >
          {/* Header with Hand-Drawn Doodle Rays and Underline */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center gap-2 mb-1">
              <DoodleRays side="left" />
              <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
                Sign In
              </h2>
              <DoodleRays side="right" />
            </div>
            <DoodleUnderline />

            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">
              {loginMethod === 'otp'
                ? (currentStep === 'email' ? 'Enter email to receive a 6-digit login OTP.' : 'Enter the verification code sent to your email.')
                : 'Please enter your credentials to continue.'}
            </p>
          </div>

          {/* Feedback Messages */}
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

          {/* Password Login Form */}
          {loginMethod === 'password' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-blue-500 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={authPolicy.allow_non_college_emails ? "name@gmail.com or 0808ci231128.ies@ipsacademy.org" : "0808ci231128.ies@ipsacademy.org"}
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#F0F6FF] border border-blue-100 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-xs font-bold text-blue-600 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
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
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#F0F6FF] border border-blue-100 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {/* OTP Option Button */}
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('otp');
                  setCurrentStep('email');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F5F2FF] hover:bg-[#EFEAFF] text-[#6D28D9] border border-purple-200/90 font-display font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-[#6D28D9]" />
                <span>Use OTP Instead</span>
              </button>
            </form>
          )}

          {/* OTP Login Form (Email Step) */}
          {loginMethod === 'otp' && currentStep === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-blue-500 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={authPolicy.allow_non_college_emails ? "name@gmail.com or 0808ci231128.ies@ipsacademy.org" : "0808ci231128.ies@ipsacademy.org"}
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#F0F6FF] border border-blue-100 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingOTP || !email}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSendingOTP ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending OTP Code...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>Send Login OTP</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-display font-bold text-xs sm:text-sm transition-all"
              >
                Use Password Instead
              </button>
            </form>
          )}

          {/* OTP Login Form (Verify Step) */}
          {loginMethod === 'otp' && currentStep === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-3 text-center">
                  Enter 6-digit code sent to {email}
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
                    <Clock className="w-3.5 h-3.5" /> Resend in {timer}s
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
                    <span>Verify & Sign In</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep('email')}
                className="w-full py-2 px-4 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all"
              >
                Change Email
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
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-display font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:border-slate-300 disabled:opacity-70 cursor-pointer"
          >
            <GoogleIcon />
            <span>{isGoogleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
          </button>

          {/* Footer Register Link */}
          <p className="mt-5 text-center text-xs text-slate-600 font-medium">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="font-bold text-blue-600 hover:text-indigo-600 transition-colors inline-flex items-center gap-0.5 ml-0.5"
            >
              <span>Sign up for free</span>
              <span className="text-sm">⤴</span>
            </Link>
          </p>

        </motion.div>
      </div>

      {/* Empty space bottom to balance viewport */}
      <div className="relative z-20 h-4" />
    </div>
  );
};

export default Login;
