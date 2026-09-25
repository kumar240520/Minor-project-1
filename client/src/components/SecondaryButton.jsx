import React from 'react';

export default function SecondaryButton({
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
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-white/90 text-edupurple border-2 border-edupurple/80 backdrop-blur-md shadow-[0_4px_16px_rgba(50,30,100,0.06)] hover:bg-edupurple-light/40 hover:border-edupurple hover:shadow-[0_8px_24px_rgba(100,40,230,0.18)] hover:-translate-y-0.5 active:scale-98 transition-all duration-200 cursor-pointer ${sizeClasses[size] || sizeClasses.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
