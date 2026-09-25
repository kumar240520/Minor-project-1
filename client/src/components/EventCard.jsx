import React from 'react';
import { 
  ArrowRight, 
  MapPin, 
  Users, 
  Trophy, 
  Rocket, 
  Laptop, 
  BarChart3, 
  Briefcase, 
  TrendingUp, 
  Settings, 
  Mic 
} from 'lucide-react';

// Calendar icon with '#' mark matching reference image
export function CalendarHashIcon({ className = "w-5 h-5" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      {/* Hashtag symbol in the center */}
      <path d="M9 13.5h6M9 17.5h6M11 12v7M14 12v7" strokeWidth="1.6" />
    </svg>
  );
}

export default function EventCard({
  category,
  dateDay,
  dateMonth,
  title,
  items = [],
  colorScheme = "blue", // blue, green, red
  iconType = "calendar", // calendar, gear, mic
  onViewDetails
}) {
  const styles = {
    blue: {
      cardBorder: "border-2 border-blue-500 hover:border-blue-600",
      cardShadow: "shadow-[0_10px_30px_rgba(37,99,235,0.08)] hover:shadow-[0_20px_45px_rgba(37,99,235,0.18)]",
      iconBoxBg: "bg-blue-600 text-white",
      tagBadge: "bg-blue-50 text-blue-600 border border-blue-100",
      dateBorder: "border-slate-200 text-slate-900",
      iconColor: "text-blue-600",
      buttonBg: "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/35",
    },
    green: {
      cardBorder: "border-2 border-emerald-500 hover:border-emerald-600",
      cardShadow: "shadow-[0_10px_30px_rgba(16,185,129,0.08)] hover:shadow-[0_20px_45px_rgba(16,185,129,0.18)]",
      iconBoxBg: "bg-emerald-600 text-white",
      tagBadge: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      dateBorder: "border-slate-200 text-slate-900",
      iconColor: "text-emerald-600",
      buttonBg: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35",
    },
    red: {
      cardBorder: "border-2 border-[#E11D48] hover:border-rose-600",
      cardShadow: "shadow-[0_10px_30px_rgba(225,29,72,0.08)] hover:shadow-[0_20px_45px_rgba(225,29,72,0.18)]",
      iconBoxBg: "bg-[#E11D48] text-white",
      tagBadge: "bg-rose-50 text-[#E11D48] border border-rose-100",
      dateBorder: "border-slate-200 text-slate-900",
      iconColor: "text-[#E11D48]",
      buttonBg: "bg-[#E11D48] hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 hover:shadow-rose-500/35",
    }
  };

  const scheme = styles[colorScheme] || styles.blue;

  // Render top-left icon based on iconType
  const renderTopIcon = () => {
    switch (iconType) {
      case 'gear':
        return <Settings className="w-6 h-6 stroke-[2.2]" />;
      case 'mic':
        return <Mic className="w-6 h-6 stroke-[2.2]" />;
      case 'calendar':
      default:
        return <CalendarHashIcon className="w-6 h-6" />;
    }
  };

  return (
    <div
      onClick={onViewDetails}
      tabIndex={0}
      role="button"
      aria-label={`${category}: ${title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onViewDetails?.();
        }
      }}
      className={`group relative p-5 sm:p-6 rounded-[28px] bg-white ${scheme.cardBorder} ${scheme.cardShadow} transition-all duration-300 hover:-translate-y-2 hover:scale-[1.015] flex flex-col justify-between cursor-pointer select-none`}
    >
      <div>
        {/* Top Header Row: Left Icon Box + Category Tag + Right Date Box */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Square Rounded Icon Box */}
            <div className={`w-12 h-12 rounded-2xl ${scheme.iconBoxBg} flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-105 shrink-0`}>
              {renderTopIcon()}
            </div>

            {/* Pill Category Tag */}
            <span className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize tracking-wide ${scheme.tagBadge}`}>
              {category}
            </span>
          </div>

          {/* Right Date Box */}
          <div className={`px-3 py-1 rounded-xl text-center bg-white border ${scheme.dateBorder} min-w-[50px] shadow-2xs transition-transform duration-300 group-hover:scale-105 shrink-0`}>
            <div className="text-lg font-display font-extrabold leading-tight text-slate-900">
              {dateDay}
            </div>
            <div className="text-[11px] font-medium text-slate-500 uppercase leading-none">
              {dateMonth}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-display font-bold text-slate-900 mb-4 tracking-tight leading-snug group-hover:text-edupurple transition-colors">
          {title}
        </h3>

        {/* Feature / Meta List */}
        <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-700 mb-6">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <li key={idx} className="flex items-center gap-2.5">
                <span className={`shrink-0 ${scheme.iconColor}`}>
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </span>
                <span className="font-medium text-slate-800 truncate">
                  {item.text}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Full-width View Details Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.();
          }}
          className={`w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 ${scheme.buttonBg}`}
        >
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
