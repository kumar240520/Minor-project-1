import React from 'react';

export const DashboardPage = ({
  header,
  summary,
  primary,
  secondary,
  footer,
  children,
  className = '',
}) => {
  return (
    <div className={`min-h-full w-full bg-[#f8fafc] dark:bg-slate-950 text-[#0f172a] dark:text-slate-100 p-4 sm:p-6 lg:p-8 font-sans ${className}`}>
      {/* Fluid container centered with maximum width near 1720px */}
      <div className="max-w-[1720px] mx-auto space-y-6 lg:space-y-8">
        {/* 1. Header / Context Layer */}
        {header && <div className="shrink-0">{header}</div>}

        {/* 2. Summary Layer (Key figures / Metric Cards) */}
        {summary && <div className="shrink-0">{summary}</div>}

        {/* 3. Primary Workspace Layer (Main data surfaces / Tables / Workflows) */}
        {primary && <div className="space-y-6">{primary}</div>}

        {/* 4. Secondary / Supporting Content (Feeds, Quick panels) */}
        {secondary && <div className="space-y-6">{secondary}</div>}

        {/* Direct children fallback */}
        {children}

        {/* 5. Restrained Footer */}
        {footer && (
          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
