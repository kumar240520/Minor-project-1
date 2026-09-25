import React from 'react';
import HandDrawnUnderline from './HandDrawnUnderline';
import DecorativeRays from './DecorativeRays';

export default function SectionHeading({
  badge,
  badgeIcon,
  titlePrefix,
  highlightedText,
  titleSuffix,
  subtitle,
  align = "center",
  showUnderline = false,
  showRays = false,
  className = ""
}) {
  const isCenter = align === "center";

  return (
    <div className={`mb-10 sm:mb-14 ${isCenter ? "text-center mx-auto" : "text-left"} max-w-3xl ${className}`}>
      {badge && (
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide mb-4 glass-pill border border-edupurple/40 text-edunavy shadow-sm ${isCenter ? "mx-auto" : ""}`}>
          {badgeIcon && <span>{badgeIcon}</span>}
          <span>{badge}</span>
        </div>
      )}

      <div className="relative inline-block">
        {showRays && (
          <div className="absolute -top-6 -right-7 sm:-right-8 pointer-events-none">
            <DecorativeRays className="w-7 h-7 sm:w-8 sm:h-8 text-edupurple-bright" />
          </div>
        )}

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-edunavy tracking-tight leading-[1.15]">
          {titlePrefix && <span>{titlePrefix} </span>}
          {highlightedText && (
            <span className="relative inline-block bg-gradient-to-r from-edupurple to-edublue bg-clip-text text-transparent">
              {highlightedText}
              {showUnderline && (
                <div className="absolute -bottom-2 sm:-bottom-3 left-0 right-0 pointer-events-none">
                  <HandDrawnUnderline className="w-full h-3 text-edupurple-bright" />
                </div>
              )}
            </span>
          )}
          {titleSuffix && <span> {titleSuffix}</span>}
        </h2>
      </div>

      {subtitle && (
        <p className={`mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed font-normal ${isCenter ? "max-w-2xl mx-auto" : "max-w-xl"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
