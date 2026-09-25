import React from 'react';

export default function PrimaryButton({
  children,
  onClick,
  className = "",
  type = "button",
  size = "md",
  ...props
}) {
  const sizeClasses = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold",
    lg: "px-8 py-3.5 sm:py-4 text-base sm:text-lg font-bold"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-edupurple to-edupurple-bright text-white shadow-[0_8px_20px_rgba(100,40,230,0.28)] hover:shadow-[0_12px_28px_rgba(100,40,230,0.40)] hover:-translate-y-0.5 active:scale-98 transition-all duration-200 cursor-pointer ${sizeClasses[size] || sizeClasses.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
