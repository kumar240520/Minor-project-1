import React from 'react';

export default function HeroInfoBox({ icon: Icon, title, subtitle, colorScheme = 'purple', className = '', onClick }) {
  const schemes = {
    purple: {
      border: 'border-[#c7a4ff]',
      iconBg: 'bg-purple-100 text-[#7C3AED]',
      subtitle: 'text-[#7C3AED]',
    },
    blue: {
      border: 'border-[#93c5fd]',
      iconBg: 'bg-blue-100 text-[#2563EB]',
      subtitle: 'text-[#2563EB]',
    },
    green: {
      border: 'border-[#86efac]',
      iconBg: 'bg-emerald-100 text-[#10B981]',
      subtitle: 'text-[#059669]',
    },
    orange: {
      border: 'border-[#fcd34d]',
      iconBg: 'bg-amber-100 text-[#d97706]',
      subtitle: 'text-[#d97706]',
    },
    yellow: {
      border: 'border-[#fde047]',
      iconBg: 'bg-yellow-100 text-[#ca8a04]',
      subtitle: 'text-[#ca8a04]',
    },
    pink: {
      border: 'border-[#f9a8d4]',
      iconBg: 'bg-pink-100 text-[#db2777]',
      subtitle: 'text-[#db2777]',
    }
  };

  const scheme = schemes[colorScheme] || schemes.purple;

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center gap-3 px-3.5 sm:px-4 rounded-[20px] border ${scheme.border} transition-all duration-300 cursor-pointer select-none hover:-translate-y-1 hover:shadow-md ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 8px 24px rgba(30, 20, 80, 0.08)',
      }}
    >
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl ${scheme.iconBg} shrink-0 flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-105`}>
        {React.isValidElement(Icon) ? Icon : React.createElement(Icon, { className: "w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" })}
      </div>
      <div className="flex flex-col pr-1 min-w-0">
        <span className="text-[13px] sm:text-[14px] font-display font-bold text-[#101A63] leading-tight truncate">
          {title}
        </span>
        <span className={`text-[10px] sm:text-[11px] font-semibold ${scheme.subtitle} leading-tight mt-0.5 font-sans truncate`}>
          {subtitle}
        </span>
      </div>
    </div>
  );
}
