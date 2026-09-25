import React from 'react';

export default function DashedArrow({
  className = "w-24 h-16",
  color = "#7A2CFF",
  variant = "curve-right", // curve-right, curve-down, diagonal-down, curve-left, straight
  strokeWidth = 2.5
}) {
  if (variant === "curve-right") {
    return (
      <svg
        viewBox="0 0 100 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M8 38 C 35 8, 65 10, 92 28"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray="5 5"
          className="animate-dash"
          strokeLinecap="round"
        />
        <path
          d="M84 18 L94 30 L80 34"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === "curve-down") {
    return (
      <svg
        viewBox="0 0 60 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M15 10 C 50 30, 50 65, 20 82"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray="5 5"
          className="animate-dash"
          strokeLinecap="round"
        />
        <path
          d="M30 72 L18 84 L14 70"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === "diagonal-down") {
    return (
      <svg
        viewBox="0 0 120 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M10 20 C 40 45, 80 50, 110 40"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray="5 5"
          className="animate-dash"
          strokeLinecap="round"
        />
        <path
          d="M98 32 L112 40 L102 50"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === "radiate-left") {
    return (
      <svg viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M10 15 L70 15" stroke={color} strokeWidth={strokeWidth} strokeDasharray="5 5" strokeLinecap="round" />
        <path d="M60 8 L72 15 L60 22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (variant === "radiate-right") {
    return (
      <svg viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M70 15 L10 15" stroke={color} strokeWidth={strokeWidth} strokeDasharray="5 5" strokeLinecap="round" />
        <path d="M20 8 L8 15 L20 22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 80 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5 20 C 30 10, 50 10, 72 20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray="5 5"
        className="animate-dash"
        strokeLinecap="round"
      />
      <path
        d="M64 13 L74 21 L65 28"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
