import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const DashboardCard = ({
  children,
  title,
  subtitle,
  action,
  footer,
  state = 'rest', // 'rest' | 'hoverable' | 'selected' | 'disabled' | 'critical'
  padding = 'normal', // 'compact' (16px) | 'normal' (20-24px) | 'none'
  className = '',
  onClick,
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();

  // Internal padding
  const paddingStyles = {
    compact: 'p-4',
    normal: 'p-4 sm:p-6',
    none: 'p-0',
  }[padding] || 'p-4 sm:p-6';

  // State styling
  let stateStyles = 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm';
  let isHoverable = false;

  if (state === 'hoverable') {
    isHoverable = true;
    stateStyles = 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer';
  } else if (state === 'selected') {
    stateStyles = 'border-violet-500 ring-2 ring-violet-500/20 bg-violet-50/15 dark:bg-violet-950/20 shadow-sm';
  } else if (state === 'disabled') {
    stateStyles = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 opacity-60 cursor-not-allowed';
  } else if (state === 'critical') {
    stateStyles = 'border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 shadow-sm';
  }

  const shouldAnimate = isHoverable && !prefersReducedMotion;

  return (
    <motion.div
      onClick={state !== 'disabled' ? onClick : undefined}
      whileHover={shouldAnimate ? { y: -2 } : {}}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`rounded-2xl border transition-all duration-150 relative overflow-hidden flex flex-col ${stateStyles} ${paddingStyles} ${className}`}
      {...props}
    >
      {/* Optional Card Header */}
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <div className="flex flex-col min-w-0">
            {title && (
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {/* Card Body */}
      <div className="flex-1 w-full">{children}</div>

      {/* Optional Card Footer */}
      {footer && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 shrink-0 text-xs text-slate-400">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default DashboardCard;
