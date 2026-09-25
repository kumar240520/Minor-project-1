import React from 'react';

export default function DecorativeRays({
  className = "w-8 h-8 text-edupurple-bright",
  color = "currentColor"
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 3 playful hand-drawn rays */}
      <path
        d="M24 6V16"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M10 14L18 21"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M38 14L30 21"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Tiny companion accent dot */}
      <circle cx="24" cy="26" r="2" fill={color} />
    </svg>
  );
}

export function HandDrawnSparkle({
  className = "w-6 h-6 text-edupurple-bright",
  color = "currentColor"
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z"
        fill={color}
      />
    </svg>
  );
}
