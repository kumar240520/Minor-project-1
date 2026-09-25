import React from 'react';

export default function HandDrawnUnderline({
  className = "w-full h-3 text-edupurple-bright",
  color = "currentColor",
  strokeWidth = 3
}) {
  return (
    <svg
      viewBox="0 0 240 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
    >
      <path
        d="M3 11.5C38 4.5 95 3.5 142 6.5C178 8.8 212 12.2 237 8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 13C65 7.5 155 7.5 228 12.5"
        stroke={color}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
}
