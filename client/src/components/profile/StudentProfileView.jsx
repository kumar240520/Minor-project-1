import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  BookOpen,
  Lock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Award,
  Sparkles,
  ShieldCheck,
  LogOut,
  Save,
  Plus,
  X,
  QrCode,
  Layers,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { getDisplayName, getDisplayInitial, formatLocalDate } from '../../utils/auth';
import {
  DashboardCard,
  MetricCard,
  DashboardButton,
  DashboardBadge,
  FeedbackState
} from '../dashboard';

const YEAR_OPTIONS = [
  { value: '1st Year', label: '1st Year (Freshman)', sems: ['Semester 1', 'Semester 2'] },
  { value: '2nd Year', label: '2nd Year (Sophomore)', sems: ['Semester 3', 'Semester 4'] },
  { value: '3rd Year', label: '3rd Year (Junior)', sems: ['Semester 5', 'Semester 6'] },
  { value: '4th Year', label: '4th Year (Senior)', sems: ['Semester 7', 'Semester 8'] },
];

const PREDEFINED_SUBJECTS = [
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

export const StudentProfileView = ({ isEmbedded = false }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Editable fields
  const [year, setYear] = useState('2nd Year');
  const [semester, setSemester] = useState('Semester 3');
  const [preferredSubjects, setPreferredSubjects] = useState([]);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Not authenticated');

      const { data: profile, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (dbError) throw dbError;

      const merged = { ...user, ...profile };
      setUserData(merged);

      // Pre-fill editable state
      if (profile?.year) setYear(profile.year);
      if (profile?.semester) setSemester(profile.semester);
      if (profile?.preferred_subjects && Array.isArray(profile.preferred_subjects)) {
        setPreferredSubjects(profile.preferred_subjects);
      }
      if (profile?.bio) setBio(profile.bio);

    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubject = (subject) => {
    setPreferredSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const handleAddCustomSubject = (e) => {
    e.preventDefault();
    const trimmed = customSubjectInput.trim();
    if (!trimmed) return;
    if (!preferredSubjects.includes(trimmed)) {
      setPreferredSubjects((prev) => [...prev, trimmed]);
    }
    setCustomSubjectInput('');
  };

  const handleRemoveSubject = (subject) => {
    setPreferredSubjects((prev) => prev.filter((s) => s !== subject));
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User session not found');

      // Determine profile completeness
      const isComplete = Boolean(
        userData?.branch &&
        userData?.phone &&
        year &&
        preferredSubjects.length > 0
      );

      const updateData = {
        year,
        semester,
        preferred_subjects: preferredSubjects,
        bio: bio.trim() || null,
        is_profile_complete: isComplete,
        updated_at: new Date().toISOString()
      };

      const { error: updateErr } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (updateErr) throw updateErr;

      // Update local state
      setUserData((prev) => ({
        ...prev,
        ...updateData
      }));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
  };

  // Calculate profile completion percentage
  const calculateCompleteness = () => {
    if (!userData) return 0;
    let score = 0;
    if (userData.full_name || userData.name) score += 20;
    if (userData.email) score += 20;
    if (userData.phone) score += 20;
    if (userData.branch && userData.enrollment_number) score += 20;
    if (year && preferredSubjects.length > 0) score += 20;
    return score;
  };

  if (loading) {
    return (
      <FeedbackState
        type="loading"
        title="Loading Student Profile"
        description="Fetching your verified academic credentials and records..."
      />
    );
  }

  const completionPercent = calculateCompleteness();
  const isProfileFullyComplete = completionPercent === 100;

  return (
    <div className={`space-y-6 sm:space-y-8 ${isEmbedded ? 'w-full' : 'max-w-[1720px] mx-auto pb-12'}`}>

      {/* ── 1. Hero Card ── */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Avatar Initial Circle */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 border-2 border-white/20 backdrop-blur-md flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-inner shrink-0">
              {getDisplayInitial(userData)}
            </div>

            {/* Identity Info */}
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight truncate">
                  {getDisplayName(userData)}
                </h1>
                <DashboardBadge variant="neutral" className="bg-white/15 text-white border-white/20">
                  Student Account
                </DashboardBadge>
                {isProfileFullyComplete ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Profile 100% Complete
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {completionPercent}% Complete
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {userData?.email}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-300" />
                  {userData?.college || 'IES IPS Academy, Indore'}
                </span>
                {userData?.enrollment_number && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-300" />
                    Roll: {userData.enrollment_number}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                  Joined {formatLocalDate(userData?.created_at, { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Status Pill */}
          <div className="shrink-0 flex md:flex-col items-center md:items-end gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Student Status</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active & Enrolled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Grid Columns: Left Main & Right Sidebar ── */}
      <div className={`grid grid-cols-1 ${isEmbedded ? 'xl:grid-cols-3' : 'lg:grid-cols-3'} gap-6 sm:gap-8 items-start`}>
        
        {/* Main Column */}
        <div className={`${isEmbedded ? 'xl:col-span-2' : 'lg:col-span-2'} space-y-6 sm:space-y-8`}>

          {/* SECTION A: Institutional Verified Records (LOCKED) */}
          <DashboardCard className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    Institutional Identity Records
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Official records verified upon college registration. These locked fields preserve institutional integrity.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0 self-start sm:self-center">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Locked by Admin</span>
              </div>
            </div>

            {/* Notice Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span>
                To request modifications to your legal name, mobile number, roll number, or enrolled department, please contact the campus academic administrator desk.
              </span>
            </div>

            {/* 6 Locked Identity Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 1. Full Legal Name */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Full Legal Name</span>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {userData?.full_name || userData?.name || 'Not Provided'}
                </p>
                <span className="text-[10px] text-slate-400">Institutional admission record</span>
              </div>

              {/* 2. Institutional Email */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Institutional Email</span>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {userData?.email}
                </p>
                <span className="text-[10px] text-slate-400">Authentication & campus notifications</span>
              </div>

              {/* 3. Registered Phone */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Mobile Phone</span>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {userData?.phone || 'Not recorded yet'}
                </p>
                <span className="text-[10px] text-slate-400">SMS alerts & 2FA security</span>
              </div>

              {/* 4. College / Institute */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">College Affiliation</span>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {userData?.college || 'IES IPS Academy, Indore'}
                </p>
                <span className="text-[10px] text-slate-400">Registered campus branch</span>
              </div>

              {/* 5. Enrollment / Roll Number */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Enrollment / Roll No.</span>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {userData?.enrollment_number || 'Pending Assignment'}
                </p>
                <span className="text-[10px] text-slate-400">Official student ID code</span>
              </div>

              {/* 6. Academic Branch */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Academic Branch / Dept</span>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {userData?.branch || 'Computer Science & Eng (CSE)'}
                </p>
                <span className="text-[10px] text-slate-400">Department curriculum stream</span>
              </div>

            </div>
          </DashboardCard>

          {/* SECTION B: Editable Academic Standing & Study Preferences */}
          <DashboardCard className="p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  Academic Standing & Study Preferences
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Keep your year, semester, and focus subjects updated. These dynamically customize your notes feed, recommended PYQs, and study groups.
              </p>
            </div>

            {/* Feedback messages */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 font-medium shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Academic preferences saved successfully! Your study feeds and dashboard are updated.</span>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5 font-medium shadow-xs"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSavePreferences} className="space-y-6">
              
              {/* Year & Semester Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Academic Year */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Current Academic Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 transition-colors"
                  >
                    {YEAR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Current Semester */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Current Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 transition-colors"
                  >
                    {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preferred Study Subjects (Multi-Select Chips) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Preferred Study Subjects & Topics ({preferredSubjects.length} selected)
                  </label>
                  <span className="text-[11px] text-slate-400">Click to select or unselect</span>
                </div>

                {/* Quick Select Chips */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {PREDEFINED_SUBJECTS.map((sub) => {
                    const isSelected = preferredSubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => handleToggleSubject(sub)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs scale-102 ring-2 ring-blue-500/20'
                            : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isSelected ? `✓ ${sub}` : `+ ${sub}`}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Subject Adder */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add another subject (e.g., Compiler Design, React, AWS)..."
                    value={customSubjectInput}
                    onChange={(e) => setCustomSubjectInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSubject(e);
                      }
                    }}
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSubject}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 inline mr-1" />
                    Add
                  </button>
                </div>
              </div>

              {/* Academic Bio / Goals */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Bio & Career Aspirations
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly state your target specializations (e.g. Preparing for TCS / Infosys placements, Full Stack dev, GATE preparation)..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 transition-colors resize-none"
                />
              </div>

              {/* Action Row */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Preferences...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Preferences</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </DashboardCard>

        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">

          {/* Profile Completion Card */}
          <DashboardCard className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Profile Progress
              </h3>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                {completionPercent}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isProfileFullyComplete ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${completionPercent}%` }}
              />
            </div>

            {/* Checklist items */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Legal Name & Email
                </span>
                <span className="text-[10px] font-bold text-emerald-600">Locked</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  College & Roll Number
                </span>
                <span className="text-[10px] font-bold text-emerald-600">Locked</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Academic Branch
                </span>
                <span className="text-[10px] font-bold text-emerald-600">Locked</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  {year ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  Current Year / Sem
                </span>
                <span className="text-[10px] font-bold text-blue-600">{year}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  {preferredSubjects.length > 0 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  Study Focus Subjects
                </span>
                <span className="text-[10px] font-bold text-blue-600">
                  {preferredSubjects.length} selected
                </span>
              </div>
            </div>

            {isProfileFullyComplete ? (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                🎉 Great job! Your profile is complete and you will receive tailored academic materials.
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 font-medium">
                Select your current year and at least 1 study subject above to achieve 100% profile status.
              </div>
            )}
          </DashboardCard>

          {/* EduCoins Card */}
          <MetricCard
            label="EduCoins Balance"
            value={userData?.coins || 0}
            icon={Award}
            variant="amber"
            trend={{ value: 'Active', isPositive: true, text: 'reward points' }}
            onClick={() => window.location.href = '/rewards'}
          />

          {/* Miniature Digital Student ID Card */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-lg border border-indigo-700/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-black tracking-wider uppercase">EduSure Digital ID</span>
              </div>
              <QrCode className="w-6 h-6 text-white/80" />
            </div>

            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Student Name</p>
              <p className="text-sm font-black truncate">{getDisplayName(userData)}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/10">
              <div>
                <p className="text-[10px] text-slate-400">Enrollment</p>
                <p className="font-bold text-white truncate">{userData?.enrollment_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Branch</p>
                <p className="font-bold text-white truncate">{userData?.branch?.split(' ')[0] || 'CSE'}</p>
              </div>
            </div>
          </div>

          {/* Sign Out Card (Only if not embedded in settings) */}
          {!isEmbedded && (
            <DashboardCard className="p-5 text-center space-y-3">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                Active Session
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log out of your student account on this device.
              </p>
              <DashboardButton
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
                icon={LogOut}
              >
                Sign Out
              </DashboardButton>
            </DashboardCard>
          )}

        </div>

      </div>

    </div>
  );
};

export default StudentProfileView;
