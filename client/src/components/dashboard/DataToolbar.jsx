import React from 'react';
import { Search, Filter, X, RefreshCw } from 'lucide-react';
import { DashboardButton } from './DashboardControls';

export const DataToolbar = ({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterOptions = [], // [ { label: 'All', value: 'all' }, ... ]
  activeFilter = 'all',
  onFilterChange,
  onReset,
  actions,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm ${className}`}>
      
      {/* Search and Filters Cluster */}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {/* Search Field */}
        {onSearchChange && (
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-9 pl-9 pr-8 text-xs rounded-xl bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:focus:bg-slate-900 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-150"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Filter Pills */}
        {filterOptions.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {filterOptions.map((opt) => {
              const isActive = activeFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onFilterChange && onFilterChange(opt.value)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-150 whitespace-nowrap border ${
                    isActive
                      ? 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-500/20'
                      : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  {opt.label}
                  {opt.count !== undefined && (
                    <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {opt.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Actions Cluster */}
      {(actions || onReset) && (
        <div className="flex items-center gap-2 justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              title="Reset Filters"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {actions}
        </div>
      )}
    </div>
  );
};

export default DataToolbar;
