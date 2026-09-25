import React from 'react';

/**
 * SectionBlurMixer:
 * High-performance GPU-accelerated page breaker that softly diffuses
 * and blends two consecutive sections without frame drops or jank.
 */
export default function SectionBlurMixer({ className = "" }) {
  return (
    <div 
      aria-hidden="true"
      className={`relative w-full h-24 sm:h-32 -my-12 sm:-my-16 z-20 pointer-events-none select-none overflow-hidden will-change-transform transform-gpu ${className}`}
    >
      {/* GPU-friendly blurred gradient diffusion */}
      <div 
        className="absolute inset-0 backdrop-blur-[6px] transform-gpu will-change-transform"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%)',
        }}
      />

      {/* Atmospheric luminous gradient blend */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/75 to-white/0"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
        }}
      />

      {/* Center luminous seam */}
      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-purple-300/30 to-transparent" />
    </div>
  );
}
