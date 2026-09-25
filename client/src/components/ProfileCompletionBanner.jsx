import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2,
  GraduationCap
} from 'lucide-react';

const ProfileCompletionBanner = ({ userProfile, profile }) => {
  const navigate = useNavigate();
  const data = userProfile || profile;

  // If profile is completely verified and complete, do not render banner
  if (!data) return null;

  const isComplete = Boolean(
    data.is_profile_complete &&
    data.branch &&
    data.year &&
    data.phone &&
    data.preferred_subjects &&
    data.preferred_subjects.length > 0
  );

  if (isComplete) return null;

  // Calculate missing field list for helpful guidance
  const missing = [];
  if (!data.branch) missing.push('Branch');
  if (!data.year) missing.push('Year/Semester');
  if (!data.phone) missing.push('Phone');
  if (!data.preferred_subjects || data.preferred_subjects.length === 0) {
    missing.push('Study Interests');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-amber-300/80 dark:border-amber-700/60 bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-100/50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-900/20 p-4 sm:p-5 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Warning Icon & Information */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Action Required: Complete Your Academic Profile
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50">
                Incomplete
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Your profile is missing <span className="font-semibold text-slate-800 dark:text-slate-200">{missing.join(', ')}</span>. Complete your academic details to receive tailored semester PYQs, lecture notes, and study group alerts.
            </p>
          </div>
        </div>

        {/* Right Side: CTA Button */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>Complete Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileCompletionBanner;
