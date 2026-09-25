import React from 'react';

export default function HeroCloud({
  icon: Icon,
  title,
  subtitle,
  colorScheme = "purple", // purple, blue, green
  className = "",
  style = {}
}) {
  const schemes = {
    purple: {
      border: "#A78BFA",
      bg: "#FAF8FF",
      iconBg: "bg-purple-100 text-edupurple",
      shadow: "shadow-[0_12px_28px_rgba(122,44,255,0.16)]",
      textColor: "text-edunavy",
      subColor: "text-edupurple"
    },
    blue: {
      border: "#93C5FD",
      bg: "#F0F7FF",
      iconBg: "bg-blue-100 text-edublue",
      shadow: "shadow-[0_12px_28px_rgba(23,105,255,0.16)]",
      textColor: "text-edunavy",
      subColor: "text-edublue"
    },
    green: {
      border: "#6EE7B7",
      bg: "#F0FDF4",
      iconBg: "bg-emerald-100 text-emerald-600",
      shadow: "shadow-[0_12px_28px_rgba(16,185,129,0.16)]",
      textColor: "text-edunavy",
      subColor: "text-emerald-600"
    }
  };

  const scheme = schemes[colorScheme] || schemes.purple;

  return (
    <div
      style={style}
      className={`relative inline-block group cursor-pointer transition-transform duration-300 hover:scale-105 ${className}`}
    >
      {/* Organic Cloud Bumps */}
      <div
        className="absolute -top-3.5 left-6 w-12 h-7 rounded-full border-t-[2px] border-l-[2px] pointer-events-none z-0"
        style={{ backgroundColor: scheme.bg, borderColor: scheme.border }}
      />
      <div
        className="absolute -top-5 left-14 w-16 h-10 rounded-full border-t-[2px] pointer-events-none z-0"
        style={{ backgroundColor: scheme.bg, borderColor: scheme.border }}
      />
      <div
        className="absolute -top-3 right-8 w-11 h-6 rounded-full border-t-[2px] border-r-[2px] pointer-events-none z-0"
        style={{ backgroundColor: scheme.bg, borderColor: scheme.border }}
      />
      <div
        className="absolute top-2 -right-2.5 w-7 h-10 rounded-full border-r-[2px] pointer-events-none z-0"
        style={{ backgroundColor: scheme.bg, borderColor: scheme.border }}
      />
      <div
        className="absolute top-3 -left-2.5 w-7 h-10 rounded-full border-l-[2px] pointer-events-none z-0"
        style={{ backgroundColor: scheme.bg, borderColor: scheme.border }}
      />
      <div
        className="absolute -bottom-2.5 left-10 w-14 h-6 rounded-full border-b-[2px] pointer-events-none z-0"
        style={{ backgroundColor: scheme.bg, borderColor: scheme.border }}
      />
      <div
        className="absolute -bottom-2.5 right-10 w-14 h-6 rounded-full border-b-[2px] pointer-events-none z-0"
        style={{ backgroundColor: scheme.bg, borderColor: scheme.border }}
      />

      {/* Main Cloud Body */}
      <div
        className={`relative z-10 px-6 py-4 rounded-[36px] border-[2px] ${scheme.shadow} flex items-center gap-3.5 transition-all`}
        style={{
          backgroundColor: scheme.bg,
          borderColor: scheme.border,
          borderRadius: "38px 46px 36px 44px / 42px 36px 46px 40px"
        }}
      >
        {Icon && (
          <div className={`p-2.5 rounded-2xl ${scheme.iconBg} shadow-sm shrink-0`}>
            {React.isValidElement(Icon) ? Icon : React.createElement(Icon, { className: "w-5 h-5" })}
          </div>
        )}
        <div className="text-left">
          <div className={`text-sm sm:text-base font-display font-extrabold ${scheme.textColor} leading-tight`}>
            {title}
          </div>
          <div className={`text-xs font-bold ${scheme.subColor} mt-0.5 tracking-wide`}>
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
}
