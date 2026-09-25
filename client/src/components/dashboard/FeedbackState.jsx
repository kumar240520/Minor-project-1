import React from 'react';
import {
  Inbox,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Loader2
} from 'lucide-react';
import { DashboardButton } from './DashboardControls';

export const FeedbackState = ({
  type = 'empty', // 'empty' | 'loading' | 'processing' | 'success' | 'warning' | 'error' | 'restricted'
  title,
  description,
  actionText,
  onAction,
  icon: CustomIcon,
  className = '',
  children
}) => {
  // Skeleton Loading State
  if (type === 'loading') {
    return (
      <div className={`p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 animate-pulse ${className}`}>
        <div className="h-6 bg-slate-200/80 dark:bg-slate-800 rounded-lg w-1/3" />
        <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded-md w-2/3" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="h-24 bg-slate-100 dark:bg-slate-800/40 rounded-xl" />
          <div className="h-24 bg-slate-100 dark:bg-slate-800/40 rounded-xl" />
          <div className="h-24 bg-slate-100 dark:bg-slate-800/40 rounded-xl" />
        </div>
      </div>
    );
  }

  // Configurations for non-content states
  const configs = {
    empty: {
      icon: CustomIcon || Inbox,
      iconWrap: 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
      defaultTitle: 'No Records Found',
      defaultDesc: 'There is nothing to display in this workspace at this moment.',
      btnVariant: 'primary'
    },
    processing: {
      icon: CustomIcon || Loader2,
      iconWrap: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
      defaultTitle: 'Processing Request...',
      defaultDesc: 'Please wait while we update your records.',
      isSpin: true
    },
    success: {
      icon: CustomIcon || CheckCircle2,
      iconWrap: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
      defaultTitle: 'Action Completed Successfully',
      defaultDesc: 'All changes have been verified and saved.',
      btnVariant: 'secondary'
    },
    warning: {
      icon: CustomIcon || AlertTriangle,
      iconWrap: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
      defaultTitle: 'Attention Required',
      defaultDesc: 'Please review the highlighted details before continuing.',
      btnVariant: 'primary'
    },
    error: {
      icon: CustomIcon || AlertCircle,
      iconWrap: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
      defaultTitle: 'Unable to Load Records',
      defaultDesc: 'An unexpected issue occurred while fetching this data.',
      btnVariant: 'critical'
    },
    restricted: {
      icon: CustomIcon || Lock,
      iconWrap: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
      defaultTitle: 'Restricted Access',
      defaultDesc: 'You do not have sufficient permissions to view this content.',
      btnVariant: 'secondary'
    }
  };

  const current = configs[type] || configs.empty;
  const Icon = current.icon;

  return (
    <div className={`p-8 sm:p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center max-w-lg mx-auto ${className}`}>
      {/* Icon Area */}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border border-slate-200/50 dark:border-slate-800 ${current.iconWrap}`}>
        <Icon className={`w-7 h-7 ${current.isSpin ? 'animate-spin' : ''}`} />
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-1.5">
        {title || current.defaultTitle}
      </h3>

      {/* Description */}
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
        {description || current.defaultDesc}
      </p>

      {/* Next Action Button */}
      {actionText && onAction && (
        <DashboardButton
          variant={current.btnVariant || 'primary'}
          onClick={onAction}
        >
          {actionText}
        </DashboardButton>
      )}

      {children}
    </div>
  );
};

export default FeedbackState;
