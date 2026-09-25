import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export const MetricCard = ({
  label,
  value,
  icon: Icon,
  trend,         // e.g. { value: '+14%', isPositive: true, text: 'vs last month' }
  variant = 'blue', // 'blue' | 'emerald' | 'amber' | 'red' | 'purple'
  onClick,
  className = '',
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();
  const isClickable = Boolean(onClick);

  // Semantic palette for small icon tiles
  const tileStyles = {
    blue: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/60',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/60',
    amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/60',
    red: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/60',
    purple: 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/60',
  }[variant] || 'bg-violet-50 text-violet-600 border-violet-100';

  const shouldAnimate = isClickable && !prefersReducedMotion;

  return (
    <motion.div
      onClick={onClick}
      whileHover={shouldAnimate ? { y: -2 } : {}}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all duration-150 flex flex-col justify-between ${
        isClickable ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        {/* Compact Label (uppercase, tracked micro-label) */}
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
          {label}
        </span>

        {/* Small Semantic Icon Tile (Not an oversized illustration) */}
        {Icon && (
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${tileStyles}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Main Value Visually Dominant */}
      <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-none mb-2">
        {value}
      </div>

      {/* Optional Comparative / Status Detail Beneath */}
      {trend && (
        <div className="flex items-center gap-1.5 text-xs">
          {trend.isPositive ? (
            <span className="inline-flex items-center font-bold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              {trend.value}
            </span>
          ) : trend.isNeutral ? (
            <span className="inline-flex items-center font-bold text-slate-500">
              <Minus className="w-3.5 h-3.5 mr-0.5" />
              {trend.value}
            </span>
          ) : (
            <span className="inline-flex items-center font-bold text-rose-600 dark:text-rose-400">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              {trend.value}
            </span>
          )}
          {trend.text && (
            <span className="text-slate-400 dark:text-slate-500 truncate">
              {trend.text}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default MetricCard;
