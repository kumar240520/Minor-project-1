import React, { useEffect, useState } from 'react';
import { useInView } from 'framer-motion';

export default function StatCard({
  icon: Icon,
  targetNumber,
  suffix = "",
  label,
  colorScheme = "purple", // purple, blue, green, yellow
  className = ""
}) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = parseInt(targetNumber, 10) || 0;
    if (end === 0) {
      setDisplayCount(0);
      return;
    }

    const duration = 1600; // ms
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      // easeOutExpo
      const progress = frame / totalFrames;
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (end - start) * easeProgress);

      setDisplayCount(current);

      if (frame >= totalFrames) {
        clearInterval(counter);
        setDisplayCount(end);
      }
    }, frameDuration);

    return () => clearInterval(counter);
  }, [isInView, targetNumber]);

  const styles = {
    purple: {
      border: "border-purple-200/90 hover:border-edupurple",
      iconBg: "bg-purple-100 text-edupurple",
      numberColor: "text-edupurple",
      shadow: "hover:shadow-[0_12px_28px_rgba(122,44,255,0.15)]"
    },
    blue: {
      border: "border-blue-200/90 hover:border-edublue",
      iconBg: "bg-blue-100 text-edublue",
      numberColor: "text-edublue",
      shadow: "hover:shadow-[0_12px_28px_rgba(23,105,255,0.15)]"
    },
    green: {
      border: "border-emerald-200/90 hover:border-emerald-500",
      iconBg: "bg-emerald-100 text-emerald-600",
      numberColor: "text-emerald-600",
      shadow: "hover:shadow-[0_12px_28px_rgba(16,185,129,0.15)]"
    },
    yellow: {
      border: "border-amber-200/90 hover:border-amber-500",
      iconBg: "bg-amber-100 text-amber-600",
      numberColor: "text-amber-600",
      shadow: "hover:shadow-[0_12px_28px_rgba(245,158,11,0.15)]"
    }
  };

  const scheme = styles[colorScheme] || styles.purple;

  return (
    <div
      ref={ref}
      className={`p-6 sm:p-7 rounded-[26px] bg-white/90 backdrop-blur-md border-2 ${scheme.border} shadow-[0_10px_28px_rgba(50,30,100,0.06)] ${scheme.shadow} transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`p-3.5 rounded-2xl ${scheme.iconBg} shadow-sm shrink-0`}>
            {React.isValidElement(Icon) ? Icon : React.createElement(Icon, { className: "w-7 h-7" })}
          </div>
        )}

        <div>
          <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${scheme.numberColor}`}>
            {displayCount}{suffix}
          </div>
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 mt-0.5">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
