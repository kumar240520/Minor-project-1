import React from 'react';

export default function CloudCard({
  icon: Icon,
  step,
  title,
  subtitle,
  description,
  color = "purple", // purple, blue, green, orange, yellow, pink
  badgeText,
  className = "",
  floatAnimation = "animate-float-1",
  style = {},
  onClick
}) {
  const colorSchemes = {
    purple: {
      border: "#9D7BFF",
      borderClass: "border-purple-300 hover:border-edupurple",
      fill: "#FCFAFF",
      iconBg: "bg-purple-100/90 text-edupurple",
      badgeBg: "bg-edupurple text-white",
      pillBg: "bg-purple-50 text-edupurple border-purple-200",
      accent: "#7A2CFF",
      shadow: "shadow-[0_12px_30px_rgba(122,44,255,0.12)]"
    },
    blue: {
      border: "#60A5FA",
      borderClass: "border-blue-300 hover:border-edublue",
      fill: "#F4F9FF",
      iconBg: "bg-blue-100/90 text-edublue",
      badgeBg: "bg-edublue text-white",
      pillBg: "bg-blue-50 text-edublue border-blue-200",
      accent: "#1769FF",
      shadow: "shadow-[0_12px_30px_rgba(23,105,255,0.12)]"
    },
    green: {
      border: "#6EE7B7",
      borderClass: "border-emerald-300 hover:border-emerald-500",
      fill: "#F3FCF7",
      iconBg: "bg-emerald-100/90 text-emerald-600",
      badgeBg: "bg-emerald-500 text-white",
      pillBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      accent: "#10B981",
      shadow: "shadow-[0_12px_30px_rgba(16,185,129,0.12)]"
    },
    orange: {
      border: "#FCD34D",
      borderClass: "border-amber-300 hover:border-amber-500",
      fill: "#FFFDF5",
      iconBg: "bg-amber-100/90 text-amber-600",
      badgeBg: "bg-amber-500 text-white",
      pillBg: "bg-amber-50 text-amber-700 border-amber-200",
      accent: "#F59E0B",
      shadow: "shadow-[0_12px_30px_rgba(245,158,11,0.12)]"
    },
    yellow: {
      border: "#FDE047",
      borderClass: "border-yellow-300 hover:border-yellow-500",
      fill: "#FFFFF2",
      iconBg: "bg-yellow-100/90 text-yellow-700",
      badgeBg: "bg-yellow-500 text-white",
      pillBg: "bg-yellow-50 text-yellow-800 border-yellow-200",
      accent: "#EAB308",
      shadow: "shadow-[0_12px_30px_rgba(234,179,8,0.12)]"
    },
    pink: {
      border: "#F9A8D4",
      borderClass: "border-pink-300 hover:border-pink-500",
      fill: "#FFF7FB",
      iconBg: "bg-pink-100/90 text-pink-600",
      badgeBg: "bg-pink-500 text-white",
      pillBg: "bg-pink-50 text-pink-700 border-pink-200",
      accent: "#EC4899",
      shadow: "shadow-[0_12px_30px_rgba(236,72,153,0.12)]"
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.purple;

  return (
    <div
      onClick={onClick}
      style={{
        borderColor: scheme.border,
        ...style
      }}
      className={`group relative p-6 sm:p-7 rounded-[24px] border-[1.5px] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${scheme.fill} ${scheme.shadow} ${className}`}
    >
      {/* Header Row: Step Badge / Icon */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        {step && (
          <span
            className={`inline-flex items-center justify-center font-display font-bold text-xs sm:text-sm px-3.5 py-1 rounded-full shadow-xs ${scheme.badgeBg}`}
          >
            Step {step}
          </span>
        )}

        {badgeText && !step && (
          <span
            className={`text-xs font-bold px-3 py-0.5 rounded-full border shadow-2xs ${scheme.pillBg}`}
          >
            {badgeText}
          </span>
        )}

        {Icon && (
          <div
            className={`p-2.5 rounded-2xl ${scheme.iconBg} shadow-xs group-hover:scale-105 transition-transform duration-300`}
          >
            {React.isValidElement(Icon) ? Icon : React.createElement(Icon, { className: "w-5 h-5" })}
          </div>
        )}
      </div>

      {/* Title */}
      {title && (
        <h3 className="text-base sm:text-lg font-display font-bold text-edunavy leading-snug mb-1.5">
          {title}
        </h3>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs sm:text-sm font-bold text-edupurple-bright mb-1.5 font-sans">
          {subtitle}
        </p>
      )}

      {/* Description */}
      {description && (
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans font-medium">
          {description}
        </p>
      )}
    </div>
  );
}
