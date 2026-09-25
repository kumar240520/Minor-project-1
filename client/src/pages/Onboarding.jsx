import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Award,
  Layers,
  Calendar,
  Check,
  QrCode,
  LogOut,
  FileText,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { getDisplayName } from '../utils/auth';

const POPULAR_BRANCHES = [
  'Computer Science & Eng (CSE)',
  'Information Technology (IT)',
  'Computer Science & IT (CSIT)',
  'Artificial Intelligence & ML (AIML)',
  'Data Science (DS)',
  'Electronics & Comm (ECE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Other / General'
];

const YEAR_OPTIONS = [
  { value: '1st Year', label: '1st Year', sem: 'Sem 1 & 2' },
  { value: '2nd Year', label: '2nd Year', sem: 'Sem 3 & 4' },
  { value: '3rd Year', label: '3rd Year', sem: 'Sem 5 & 6' },
  { value: '4th Year', label: '4th Year', sem: 'Sem 7 & 8' },
];

const STUDY_SUBJECT_TAGS = [
  'Database Management (DBMS)',
  'Operating Systems (OS)',
  'Data Structures & Algorithms',
  'Computer Networks',
  'Software Engineering',
  'Theory of Computation (TOC)',
  'Machine Learning & AI',
  'Web Development',
  'Campus Placement & Aptitude',
  'Mathematics III / IV',
  'Cloud Computing',
  'Cybersecurity'
];

const Onboarding = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // User state
  const [currentUser, setCurrentUser] = useState(null);
  // Detect if the user authenticated via Google OAuth (needs password setup)
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  // Step 1: Core Identity & College
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('IES IPS Academy, Indore');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');

  // Track which Step-1 fields are already in the DB (lock them as read-only)
  const [phoneFromDb, setPhoneFromDb] = useState(false);
  const [enrollmentFromDb, setEnrollmentFromDb] = useState(false);

  // Google OAuth users must set a password during onboarding
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2: Academic Specialization & Preferences
  const [branch, setBranch] = useState('Computer Science & Eng (CSE)');
  const [year, setYear] = useState('2nd Year');
  const [preferredSubjects, setPreferredSubjects] = useState([]);
  const [bio, setBio] = useState('');

  // Fetch initial profile & check if already completed
  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: authErr } = await supabase.auth.getUser();

        if (authErr || !user) {
          navigate('/login', { replace: true });
          return;
        }

        setCurrentUser(user);

        // Detect Google OAuth provider — they have no password and need to set one
        const provider = user.app_metadata?.provider;
        const identities = user.identities || [];
        const isGoogle = provider === 'google' || identities.some(i => i.provider === 'google');
        setIsGoogleUser(isGoogle);

        // Fetch DB row
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        // Admin-level users should never fill or see student onboarding
        const isAdmin = profile?.role === 'admin' || 
                        user.app_metadata?.role === 'admin' ||
                        user.user_metadata?.role === 'admin' ||
                        user.email === 'admin.ies@ipsacademy.org' || 
                        user.email === 'myadmin.ies@ipsacademy.org';

        if (isAdmin) {
          navigate('/admin/dashboard', { replace: true });
          return;
        }

        // If already completed onboarding, redirect straight to dashboard
        if (profile?.onboarding_completed) {
          navigate('/dashboard', { replace: true });
          return;
        }

        // Pre-fill available values
        const resolvedName = profile?.full_name || 
                             profile?.name || 
                             user.user_metadata?.full_name || 
                             user.user_metadata?.name || 
                             '';
        setFullName(resolvedName);
        setEmail(user.email || profile?.email || '');

        // Pre-fill & lock fields that are already stored in the DB
        if (profile?.phone) {
          setPhone(profile.phone);
          setPhoneFromDb(true);   // already exists → read-only
        }
        if (profile?.college) setCollege(profile.college);
        if (profile?.enrollment_number) {
          setEnrollmentNumber(profile.enrollment_number);
          setEnrollmentFromDb(true);  // already exists → read-only
        }
        if (profile?.branch) setBranch(profile.branch);
        if (profile?.year) setYear(profile.year);
        if (profile?.preferred_subjects && Array.isArray(profile.preferred_subjects)) {
          setPreferredSubjects(profile.preferred_subjects);
        }
        if (profile?.bio) setBio(profile.bio);

        // Resume from step if draft was stored
        if (profile?.onboarding_step && profile.onboarding_step > 1) {
          setCurrentStep(profile.onboarding_step);
        }

      } catch (err) {
        console.error('Error initializing onboarding:', err);
        setError('Failed to load profile. Please refresh or try again.');
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [navigate]);

  const toggleSubject = (subject) => {
    setPreferredSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  // Step 1: Save identity & basic info
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please provide your full legal or college name.');
      return;
    }

    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }

    if (!college.trim()) {
      setError('Please enter your college or institute name.');
      return;
    }

    // Google OAuth users must set a password
    if (isGoogleUser) {
      if (!newPassword || newPassword.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setSubmitting(true);
    try {
      // Set password for Google OAuth users via Supabase auth update
      if (isGoogleUser) {
        const { error: pwErr } = await supabase.auth.updateUser({ password: newPassword });
        if (pwErr) throw new Error(`Password update failed: ${pwErr.message}`);
      }

      const sanitizedPhone = phone.trim();
      const sanitizedEnrollment = enrollmentNumber.trim();

      const { error: updateErr } = await supabase
        .from('users')
        .update({
          full_name: fullName.trim(),
          name: fullName.trim(),
          phone: sanitizedPhone,
          college: college.trim(),
          enrollment_number: sanitizedEnrollment,
          onboarding_step: 2,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (updateErr) throw updateErr;

      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Step 1 save error:', err);
      setError(err.message || 'Failed to save basic details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Save academic preferences or Skip
  const handleStep2Submit = async (isSkipping = false) => {
    setError(null);
    setSubmitting(true);

    try {
      const isComplete = !isSkipping && Boolean(branch && year && preferredSubjects.length > 0);

      const updatePayload = {
        branch: branch || null,
        year: year || null,
        preferred_subjects: preferredSubjects,
        bio: bio.trim() || null,
        is_profile_complete: isComplete,
        onboarding_step: 3,
        updated_at: new Date().toISOString()
      };

      const { error: updateErr } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', currentUser.id);

      if (updateErr) throw updateErr;

      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Step 2 save error:', err);
      setError(err.message || 'Failed to save preferences. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 3: Finish & Complete Onboarding
  const handleFinishOnboarding = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // Award initial welcome bonus of 50 EduCoins if coins are currently 0
      const { data: currentProfile } = await supabase
        .from('users')
        .select('coins')
        .eq('id', currentUser.id)
        .single();

      const currentCoins = currentProfile?.coins || 0;
      const updatedCoins = currentCoins === 0 ? 50 : currentCoins;

      const { error: finalErr } = await supabase
        .from('users')
        .update({
          onboarding_completed: true,
          coins: updatedCoins,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (finalErr) throw finalErr;

      // Navigate to dashboard with replacement to prevent back navigation into onboarding
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Finish onboarding error:', err);
      setError(err.message || 'Could not finalize registration. Please click again.');
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Setting up your student profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      
      {/* Fixed Sticky Header with EduSure Brand & 3-Step Progress Tracker */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight leading-none text-slate-900 dark:text-white">
                Edu<span className="text-blue-600">Sure</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider">
                Student Onboarding
              </span>
            </div>
          </div>

          {/* Desktop Step Tracker */}
          <div className="hidden sm:flex items-center gap-2.5 text-xs font-bold">
            {[
              { num: 1, label: 'Basic Details' },
              { num: 2, label: 'Academic Interests' },
              { num: 3, label: 'Digital Pass' },
            ].map((step, idx) => {
              const isPast = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <React.Fragment key={step.num}>
                  {idx > 0 && (
                    <div className={`w-8 h-0.5 transition-colors duration-300 ${isPast ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
                  )}
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                        isPast
                          ? 'bg-blue-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isPast ? <Check className="w-4 h-4" /> : step.num}
                    </div>
                    <span className={isCurrent ? 'text-blue-600 dark:text-blue-400' : isPast ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>
                      {step.label}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Security Badge & Sign Out Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="hidden md:inline">Institutional Security</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200/60 dark:border-slate-800 transition-colors cursor-pointer"
              title="Sign out of student session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Compact Progress Bar */}
        <div className="sm:hidden w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div 
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Wizard Form Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center my-4">
        
        {/* Error Notification */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 flex items-start gap-3 text-xs sm:text-sm shadow-xs"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* STEP 1: Basic Identity & College Information */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5"
          >
            {/* Header */}
            <div className="mb-7 pb-5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Step 1 of 3
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                Student Profile & Identity
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Verify your institutional information to enable seamless notes access, verified question papers, and study credits.
              </p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Full Student Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Priyanshu Patel"
                      className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Email Address (Pre-filled from auth, locked for consistency) */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Student Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      readOnly
                      value={email}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
                      title="Email is bound to your account credentials"
                    />
                  </div>
                </div>

                {/* Mobile / WhatsApp Number */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                    WhatsApp / Mobile Number <span className="text-rose-500">*</span>
                    {phoneFromDb && (
                      <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Lock className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      readOnly={phoneFromDb}
                      onChange={phoneFromDb ? undefined : (e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile number"
                      className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl transition-all ${
                        phoneFromDb
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                          : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-900 dark:text-slate-100'
                      }`}
                      title={phoneFromDb ? 'Phone already verified — cannot be changed here' : undefined}
                    />
                    {phoneFromDb && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  {phoneFromDb && (
                    <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                      This number was already saved to your account.
                    </p>
                  )}
                </div>

                {/* Enrollment / Roll Number */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                    College Enrollment / Roll No. (Optional)
                    {enrollmentFromDb && (
                      <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Lock className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={enrollmentNumber}
                      readOnly={enrollmentFromDb}
                      onChange={enrollmentFromDb ? undefined : (e) => setEnrollmentNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. 0808CI241028"
                      className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl transition-all uppercase ${
                        enrollmentFromDb
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                          : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-900 dark:text-slate-100'
                      }`}
                      title={enrollmentFromDb ? 'Enrollment already saved — cannot be changed here' : undefined}
                    />
                    {enrollmentFromDb && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  {enrollmentFromDb && (
                    <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                      Enrollment number is already on record.
                    </p>
                  )}
                </div>

                {/* College / Institute Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                    College / Institute Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. Institute of Engineering & Science, IPS Academy, Indore"
                      className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

              </div>

              {/* ---- Google OAuth Password Setup ---- */}
              {isGoogleUser && (
                <div className="mt-6 p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">Set Your EduSure Password</h3>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mb-4 leading-relaxed">
                    You signed in with Google. Please set a password so you can also log in with your email directly.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        New Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimum 8 characters"
                          className="w-full pl-10 pr-10 py-3 text-sm bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-slate-900 dark:text-slate-100"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter your password"
                          className={`w-full pl-10 pr-10 py-3 text-sm bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-900 dark:text-slate-100 ${
                            confirmPassword && confirmPassword !== newPassword
                              ? 'border-rose-400 focus:ring-rose-500/30 focus:border-rose-500'
                              : 'border-amber-200 dark:border-amber-800/60 focus:ring-amber-500/30 focus:border-amber-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPassword && confirmPassword !== newPassword && (
                        <p className="mt-1 text-xs text-rose-500">Passwords don’t match</p>
                      )}
                      {confirmPassword && confirmPassword === newPassword && newPassword.length >= 8 && (
                        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Passwords match
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 hidden sm:inline-block">
                  All details are securely saved to your account.
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving Details...' : 'Continue to Academic Interests'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: Academic Specialization & Study Preferences */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5"
          >
            {/* Header */}
            <div className="mb-7 pb-5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Step 2 of 3
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                Branch & Academic Preferences
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Tell us your branch and subject interests so we can curate previous year exams and notes specifically for your semester.
              </p>
            </div>

            <div className="space-y-6">
              
              {/* Branch / Department Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2.5">
                  Academic Branch / Department <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {POPULAR_BRANCHES.map((b) => {
                    const isSelected = branch === b;
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBranch(b)}
                        className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-700 dark:text-blue-300 ring-2 ring-blue-600/30'
                            : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Year & Semester */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2.5">
                  Current Year of Study <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {YEAR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setYear(opt.value)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        year === opt.value
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-bold">{opt.label}</div>
                      <div className={`text-[10px] mt-0.5 ${year === opt.value ? 'text-blue-100' : 'text-slate-400'}`}>
                        {opt.sem}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Study Subjects Chips */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    Preferred Subjects & Study Tags
                  </label>
                  <span className="text-xs text-slate-400">
                    Select 2 or more tags
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {STUDY_SUBJECT_TAGS.map((subj) => {
                    const isSelected = preferredSubjects.includes(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => toggleSubject(subj)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {subj}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bio & Academic Goals */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Student Bio or Study Goal <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows="2"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Aiming for 9+ CGPA and preparing for software engineering placements..."
                  className="w-full px-4 py-3 text-sm bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-900 dark:text-slate-100 resize-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Action Buttons: Back, Skip, Complete */}
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer order-2 sm:order-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Step 1
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                  <button
                    type="button"
                    onClick={() => handleStep2Submit(true)}
                    disabled={submitting}
                    className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Skip for now
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStep2Submit(false)}
                    disabled={submitting}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save & Generate Pass'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: Digital Student ID Pass & Confirmation */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Top Welcome Banner */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Welcome to EduSure, {fullName || 'Student'}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
                Your student profile is active. You have been credited with a welcome bonus of <span className="font-bold text-amber-600 dark:text-amber-400">+50 EduCoins</span>.
              </p>
            </div>

            {/* Generated EduSure Digital Student ID Pass */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#0F172A] via-[#1E293B] to-[#2563EB] text-white p-6 sm:p-8 shadow-2xl border border-white/10">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                {/* Pass Top Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/25">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-black tracking-tight text-white leading-none">
                        Edu<span className="text-blue-300">Sure</span>
                      </div>
                      <div className="text-[10px] text-blue-200 tracking-wider font-semibold">
                        OFFICIAL STUDENT PASS
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Verified Member
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-400" /> +50 Coins
                    </span>
                  </div>
                </div>

                {/* Student Details Grid on Pass */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                      Student Name
                    </div>
                    <div className="text-base font-bold text-white mt-0.5 truncate">
                      {fullName || 'Student'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                      Branch / Dept
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">
                      {branch || 'General'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                      Enrollment / Roll No
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white mt-0.5 uppercase">
                      {enrollmentNumber || 'PENDING'}
                    </div>
                  </div>
                </div>

                {/* Pass Footer */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-blue-200">
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                    <span className="truncate">{college || 'IES IPS Academy'}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[11px] text-white/80 shrink-0">
                    <QrCode className="w-4 h-4 text-white" />
                    <span>PASS-2026</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Feature Perks Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { title: 'Verified PYQs', desc: 'Semester exams & solutions', icon: FileText, color: 'text-blue-500' },
                { title: 'Peer Notes', desc: 'Class lecture summaries', icon: BookOpen, color: 'text-purple-500' },
                { title: 'EduCoins', desc: 'Earn rewards on uploads', icon: Award, color: 'text-amber-500' },
                { title: 'Study Alerts', desc: 'Schedules & exam updates', icon: Calendar, color: 'text-emerald-500' },
              ].map((perk, i) => {
                const IconComp = perk.icon;
                return (
                  <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center mb-2">
                      <IconComp className={`w-4 h-4 ${perk.color}`} />
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{perk.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{perk.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Final Action Button: Go to Dashboard */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-500 text-center sm:text-left">
                Click below to finalize onboarding and open your academic dashboard.
              </span>

              <button
                type="button"
                onClick={handleFinishOnboarding}
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Entering Dashboard...' : 'Go to Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </motion.div>
        )}

      </main>

    </div>
  );
};

export default Onboarding;
