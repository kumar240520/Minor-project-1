import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  Home, 
  Zap, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  Award 
} from 'lucide-react';

const DEFAULT_CHAPTERS = [
  { id: 'home', label: 'Home', icon: Home, accent: '#5B20E8' },           // edupurple
  { id: 'how-it-works', label: 'How it Works', icon: Zap, accent: '#2563EB' },   // edublue
  { id: 'features', label: 'Features', icon: BookOpen, accent: '#22D3EE' },     // educyan
  { id: 'events', label: 'Events', icon: Calendar, accent: '#10B981' },         // edugreen
  { id: 'statistics', label: 'Statistics', icon: BarChart3, accent: '#F59E0B' }, // eduyellow
  { id: 'cta', label: 'Join EduSure', icon: Award, accent: '#EC4899' },         // edupink
];

export default function LandingChapterSidebar({ chapters = DEFAULT_CHAPTERS }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [activeId, setActiveId] = useState(chapters[0]?.id || 'home');
  const prefersReducedMotion = useReducedMotion();
  const railRef = useRef(null);

  // Synchronize with scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.35;
      
      for (let i = chapters.length - 1; i >= 0; i--) {
        const el = document.getElementById(chapters[i].id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top - 80) {
            setActiveId(chapters[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapters]);

  // Smooth scroll handler using Lenis if present, or native smooth scroll
  const scrollToChapter = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (window.lenis) {
      window.lenis.scrollTo(el, { offset: -60, duration: 1.15 });
    } else {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 60;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const currentIndex = chapters.findIndex((c) => c.id === activeId);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < chapters.length - 1;

  const handlePrevious = () => {
    if (canGoPrevious) {
      scrollToChapter(chapters[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      scrollToChapter(chapters[currentIndex + 1].id);
    }
  };

  // Keyboard navigation within the chapter rail
  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowDown' && index < chapters.length - 1) {
      e.preventDefault();
      scrollToChapter(chapters[index + 1].id);
    } else if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      scrollToChapter(chapters[index - 1].id);
    }
  };

  const springTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 380, damping: 30 };

  const currentChapter = chapters[currentIndex >= 0 ? currentIndex : 0];
  const progressRatio = `${String((currentIndex >= 0 ? currentIndex : 0) + 1).padStart(2, '0')}/${String(chapters.length).padStart(2, '0')}`;

  return (
    <aside
      aria-label="Page Chapter Navigation"
      ref={railRef}
      className="hidden xl:flex fixed left-3 xl:left-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center select-none"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        setIsExpanded(false);
        setHoveredRowId(null);
      }}
    >
      {/* ── Compact Vertical Cluster (Light Aesthetic Matching Landing Page) ── */}
      <div className="flex flex-col items-center gap-2">

        {/* 1. Previous Jump Control */}
        <motion.button
          type="button"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          whileHover={canGoPrevious && !prefersReducedMotion ? { scale: 1.05 } : {}}
          whileTap={canGoPrevious && !prefersReducedMotion ? { scale: 0.95 } : {}}
          transition={{ duration: 0.15 }}
          aria-label="Previous Chapter"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${
            canGoPrevious
              ? 'bg-white/90 backdrop-blur-md border-slate-200/90 text-slate-600 hover:bg-purple-50/90 hover:border-edupurple/40 hover:text-edupurple shadow-sm shadow-purple-900/5'
              : 'bg-white/40 border-slate-200/40 text-slate-300 opacity-40 cursor-not-allowed'
          } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-edupurple`}
        >
          <ChevronUp className="w-4 h-4" />
        </motion.button>

        {/* 2. Expandable Rail */}
        <motion.nav
          initial={false}
          animate={{ width: isExpanded ? 215 : 54 }}
          transition={springTransition}
          className="relative bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-[0_16px_36px_-6px_rgba(16,26,99,0.08),0_2px_8px_rgba(16,26,99,0.04)] py-2.5 px-1.5 flex flex-col gap-1 overflow-hidden"
        >
          {chapters.map((chapter, index) => {
            const isActive = activeId === chapter.id;
            const isHovered = hoveredRowId === chapter.id;
            const Icon = chapter.icon;
            const numStr = String(index + 1).padStart(2, '0');

            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => scrollToChapter(chapter.id)}
                onMouseEnter={() => setHoveredRowId(chapter.id)}
                onMouseLeave={() => setHoveredRowId(null)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-label={`Jump to chapter ${index + 1}: ${chapter.label}`}
                aria-current={isActive ? 'location' : undefined}
                className="group relative flex items-center h-10 w-full rounded-xl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white focus-visible:ring-edupurple overflow-hidden"
              >
                {/* Active Light Selection Plate with Project Accent Accentuation */}
                {isActive && (
                  <motion.div
                    layoutId="activeLandingChapterPlate"
                    transition={springTransition}
                    className="absolute inset-0 rounded-xl bg-purple-50/90 pointer-events-none"
                    style={{
                      border: `1px solid ${chapter.accent}45`,
                      boxShadow: `0 2px 10px ${chapter.accent}18`
                    }}
                  />
                )}

                {/* Hover Feedback Surface (when not active) */}
                {!isActive && isHovered && (
                  <div className="absolute inset-0 rounded-xl bg-slate-100/70 pointer-events-none transition-colors" />
                )}

                {/* Inner Content (Icon + Chips + Label) */}
                <div className="relative z-10 flex items-center w-full h-full">

                  {/* Centered Icon Container (Fixed 42px width for stable collapsed centering) */}
                  <div className="w-[42px] shrink-0 flex items-center justify-center">
                    <Icon
                      className={`w-[18px] h-[18px] transition-all duration-200 ${
                        isActive
                          ? 'scale-105'
                          : isHovered
                          ? 'text-slate-800 scale-105'
                          : 'text-slate-500'
                      }`}
                      style={{
                        color: isActive ? chapter.accent : undefined
                      }}
                    />
                  </div>

                  {/* Label & Numerical Chip (Revealed when Expanded) */}
                  {isExpanded && (
                    <motion.div
                      initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -9 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -9 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="flex items-center gap-2 pr-3 min-w-0 flex-1 whitespace-nowrap overflow-hidden"
                    >
                      {/* Compact Numerical Chip */}
                      <span
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors shrink-0"
                        style={{
                          backgroundColor: isActive ? `${chapter.accent}18` : '#f1f5f9',
                          color: isActive ? chapter.accent : '#64748b',
                          border: `1px solid ${isActive ? `${chapter.accent}45` : '#e2e8f0'}`
                        }}
                      >
                        {numStr}
                      </span>

                      {/* Single-Line Label */}
                      <span
                        className={`text-xs truncate transition-colors duration-150 ${
                          isActive
                            ? 'text-edunavy font-bold'
                            : isHovered
                            ? 'text-edunavy font-semibold'
                            : 'text-slate-600 font-medium'
                        }`}
                      >
                        {chapter.label}
                      </span>
                    </motion.div>
                  )}
                </div>
              </button>
            );
          })}
        </motion.nav>

        {/* 3. Next Jump Control */}
        <motion.button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          whileHover={canGoNext && !prefersReducedMotion ? { scale: 1.05 } : {}}
          whileTap={canGoNext && !prefersReducedMotion ? { scale: 0.95 } : {}}
          transition={{ duration: 0.15 }}
          aria-label="Next Chapter"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${
            canGoNext
              ? 'bg-white/90 backdrop-blur-md border-slate-200/90 text-slate-600 hover:bg-purple-50/90 hover:border-edupurple/40 hover:text-edupurple shadow-sm shadow-purple-900/5'
              : 'bg-white/40 border-slate-200/40 text-slate-300 opacity-40 cursor-not-allowed'
          } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-edupurple`}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.button>

        {/* 4. Lower Progress Badge */}
        <motion.div
          initial={false}
          animate={{ width: isExpanded ? 215 : 54 }}
          transition={springTransition}
          className="h-7 bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-xl flex items-center justify-center px-2 shadow-sm shadow-purple-900/5 overflow-hidden text-slate-600 font-mono text-[11px]"
        >
          {isExpanded ? (
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between w-full px-1 truncate"
            >
              <span className="font-bold text-edupurple tracking-wider">{progressRatio}</span>
              <span className="text-[10px] font-sans font-bold text-edunavy uppercase tracking-wider truncate ml-2">
                {currentChapter?.label}
              </span>
            </motion.div>
          ) : (
            <span className="font-bold text-edupurple text-[10px] tracking-tight">
              {progressRatio}
            </span>
          )}
        </motion.div>

      </div>
    </aside>
  );
}
