import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// ── Dashboard Button ──────────────────────────────────────────────────────────
export const DashboardButton = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'critical'
  size = 'md',        // 'sm' | 'md' | 'lg'
  icon: Icon,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();

  // Size styles
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
    md: 'h-10 px-4 text-xs sm:text-sm gap-2 rounded-xl',
    lg: 'h-12 px-6 text-sm sm:text-base gap-2.5 rounded-xl',
  }[size] || 'h-10 px-4 text-sm gap-2 rounded-xl';

  // Variant styles matching existing project design & colors
  const variantStyles = {
    primary:
      'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-violet-500/25 border border-transparent',
    secondary:
      'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 font-semibold shadow-xs',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border border-transparent',
    critical:
      'bg-rose-600 hover:bg-rose-500 text-white font-bold border border-rose-500 shadow-md shadow-rose-600/25',
  }[variant] || 'bg-violet-600 text-white';

  const shouldAnimate = (variant === 'primary' || variant === 'critical') && !disabled && !prefersReducedMotion;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={shouldAnimate ? { scale: 1.03 } : {}}
      whileTap={shouldAnimate ? { scale: 0.97 } : {}}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`inline-flex items-center justify-center font-sans transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </motion.button>
  );
};

// ── Dashboard Semantic Badge / Pill ───────────────────────────────────────────
export const DashboardBadge = ({
  children,
  variant = 'blue', // 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'slate'
  isLive = false,
  className = '',
  ...props
}) => {
  const badgeStyles = {
    blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/60',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/60',
    amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/60',
    red: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/60',
    purple: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200/70 dark:border-violet-800/60',
    slate: 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  }[variant] || 'bg-slate-100 text-slate-700 border-slate-200';

  const dotColors = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-rose-500',
    purple: 'bg-violet-500',
    slate: 'bg-slate-500',
  }[variant] || 'bg-slate-500';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border ${badgeStyles} ${className}`}
      {...props}
    >
      {isLive && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColors}`} />
        </span>
      )}
      {children}
    </span>
  );
};

// ── Dashboard Input ───────────────────────────────────────────────────────────
export const DashboardInput = ({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <Icon className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        )}
        <input
          className={`w-full h-10 ${Icon ? 'pl-10' : 'pl-3.5'} pr-3.5 text-xs sm:text-sm rounded-xl bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:focus:bg-slate-900 border transition-all duration-150 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-slate-200/90 dark:border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-[11px] font-medium text-rose-500">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};
