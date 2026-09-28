import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  GraduationCap,
  Coins,
  ShieldCheck,
  Sparkles,
  FileText,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ORBIT_ICONS = [
  {
    icon: BookOpen,
    label: 'Materials',
    color: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/25',
    angle: 0
  },
  {
    icon: GraduationCap,
    label: 'Academics',
    color: 'from-indigo-500 to-indigo-600',
    shadow: 'shadow-indigo-500/25',
    angle: 60
  },
  {
    icon: Coins,
    label: 'EduCoins',
    color: 'from-amber-400 to-amber-600',
    shadow: 'shadow-amber-500/35',
    angle: 120
  },
  {
    icon: ShieldCheck,
    label: 'Verified ID',
    color: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/25',
    angle: 180
  },
  {
    icon: Sparkles,
    label: 'Smart Tools',
    color: 'from-purple-500 to-violet-600',
    shadow: 'shadow-purple-500/25',
    angle: 240
  },
  {
    icon: FileText,
    label: 'PYQ Archive',
    color: 'from-cyan-500 to-blue-500',
    shadow: 'shadow-cyan-500/25',
    angle: 300
  }
];

const STATUS_STEPS = [
  'Verifying student identity & enrollment...',
  'Configuring department & semester preferences...',
  'Setting up personalized study resources...',
  'Finalizing student pass & opening dashboard...'
];

export const EduSureLoadingScreen = ({
  title = 'Setting Up Your Student Profile',
  subtitle,
  progressSpeed = 1000
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(25);

  // Safely connect to website theme context
  let themeContext = null;
  try {
    themeContext = useTheme();
  } catch (e) {
    // Graceful fallback if rendered outside ThemeProvider
  }

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % STATUS_STEPS.length);
    }, 1800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        return prev + Math.floor(Math.random() * 15 + 10);
      });
    }, 450);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const activeSubtitle = subtitle || STATUS_STEPS[currentStepIndex];
  const radius = 105; // radius in px for circular orbital track

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F8FAFC]/95 dark:bg-slate-950/95 backdrop-blur-xl p-4 select-none transition-colors duration-300">
      
      {/* Interactive Theme Toggle in Top Right */}
      {themeContext && (
        <button
          type="button"
          onClick={themeContext.toggleTheme}
          title={themeContext.isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="absolute top-5 right-5 p-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm hover:scale-105 active:scale-95 z-30 cursor-pointer"
        >
          {themeContext.isDark ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>
      )}

      {/* Background ambient glowing orbs (Harmonized for both light and dark themes) */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-indigo-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">

        {/* ============================================================== */}
        {/* CIRCULAR ANIMATED ORBITAL SYSTEM */}
        {/* ============================================================== */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center mb-8">
          
          {/* Subtle Outer Concentric Pulse Rings */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.45, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full border border-blue-400/25 dark:border-blue-500/20"
          />
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute -inset-4 rounded-full border border-purple-400/20 dark:border-purple-500/20"
          />

          {/* SVG Orbit Track & Rotating Dashed Ring */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 288 288">
            <defs>
              <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#EC4899" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {/* Guide circle */}
            <circle
              cx="144"
              cy="144"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              className="text-slate-300 dark:text-slate-700/60"
            />
            {/* Rotating glowing arc */}
            <circle
              cx="144"
              cy="144"
              r={radius}
              fill="none"
              stroke="url(#orbitGradient)"
              strokeWidth="2.5"
              strokeDasharray="90 200"
              className="origin-center"
              style={{
                animation: 'spin 6s linear infinite'
              }}
            />
          </svg>

          {/* Rotating Orbit System containing the 6 Circular Node Badges */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {ORBIT_ICONS.map((item, idx) => {
              const rad = (item.angle * Math.PI) / 180;
              const x = Math.round(radius * Math.cos(rad));
              const y = Math.round(radius * Math.sin(rad));
              const Icon = item.icon;

              return (
                <div
                  key={idx}
                  className="absolute"
                  style={{
                    transform: `translate(${x}px, ${y}px)`
                  }}
                >
                  {/* Counter-rotate each icon so it stays upright! */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                    className="relative group flex items-center justify-center"
                  >
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-md ${item.shadow} border-2 border-white dark:border-slate-800 transition-transform duration-300 hover:scale-110`}
                    >
                      <Icon className="w-5 h-5 drop-shadow-xs" />
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>

          {/* Central EduSure Brand Emblem Hub */}
          <div className="relative z-20 flex flex-col items-center justify-center">
            {/* Pulsing Backglow */}
            <div className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 blur-lg opacity-40 dark:opacity-60 animate-pulse" />
            
            {/* Center Circle Logo */}
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 border-2 border-blue-500/20 dark:border-blue-400/40 shadow-xl shadow-blue-500/10 dark:shadow-2xl flex flex-col items-center justify-center overflow-hidden p-3 transition-colors duration-200">
              {/* Shimmer sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 dark:via-white/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
              
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30 mb-1 text-white">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="text-[11px] font-black tracking-tight text-slate-900 dark:text-white leading-none">
                Edu<span className="text-blue-600 dark:text-blue-400">Sure</span>
              </div>
            </div>
          </div>

        </div>

        {/* ============================================================== */}
        {/* TEXT & DYNAMIC STATUS */}
        {/* ============================================================== */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2 transition-colors duration-200">
          {title}
        </h2>

        {/* Dynamic Transitioning Step Text */}
        <div className="h-6 flex items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeSubtitle}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-300 flex items-center gap-1.5"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping" />
              {activeSubtitle}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-200/80 dark:bg-slate-800/80 rounded-full h-2 p-0.5 border border-slate-300/70 dark:border-slate-700/80 overflow-hidden shadow-inner transition-colors duration-200">
          <motion.div
            initial={{ width: '20%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.4 }}
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-sm shadow-blue-500/40"
          />
        </div>

      </div>
    </div>
  );
};

export default EduSureLoadingScreen;
