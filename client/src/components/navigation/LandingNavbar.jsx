import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  Zap,
  LogIn,
  LogOut,
  Menu,
  X,
  Search,
  ChevronRight,
  Sparkles,
  User,
  LayoutDashboard
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { fetchUserProfile, getRedirectPathForRole } from '../../utils/auth';

export default function LandingNavbar() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const syncSession = async (nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);

      if (!nextSession?.user) {
        setRole(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const profile = await fetchUserProfile(nextSession.user.id);
        if (isMounted) setRole(profile?.role || 'student');
      } catch (err) {
        console.error('LandingNavbar auth error:', err);
        if (isMounted) setRole(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => syncSession(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Close mobile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    if (window.lenis) {
      window.lenis.scrollTo(el, { offset: -60, duration: 1.15 });
    } else {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 60;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const dashboardPath = getRedirectPathForRole(role);

  const navChapters = [
    { id: 'home', label: 'Home' },
    { id: 'how-it-works', label: 'How it Works' },
    { id: 'features', label: 'Features' },
    { id: 'events', label: 'Events' },
    { id: 'statistics', label: 'Statistics' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none pt-3 sm:pt-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between" ref={menuRef}>

        {/* ── 1. Left-Aligned Brand Control ── */}
        <div className="pointer-events-auto">
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="EduSure Home"
            className="group flex items-center gap-3 px-3 sm:px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-purple-100/90 shadow-[0_8px_30px_rgba(16,26,99,0.08)] hover:border-edupurple/40 hover:shadow-[0_8px_25px_rgba(91,32,232,0.15)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-edupurple"
          >
            {/* Cyan-to-Purple Gradient Icon Tile (Rounded Square, Scales to ~1.05 on hover) */}
            <motion.div
              whileHover={!prefersReducedMotion ? { scale: 1.05 } : {}}
              transition={{ duration: 0.15 }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-edupurple to-edupurple-bright flex items-center justify-center text-white shadow-md shadow-purple-500/25 shrink-0"
            >
              <BookOpen className="w-5 h-5 text-white" />
            </motion.div>

            {/* Heavy Brand Typography */}
            <div className="flex flex-col text-left">
              <span className="text-base sm:text-lg font-black tracking-tight text-edunavy group-hover:text-edupurple transition-colors leading-tight">
                Edu<span className="text-edupurple">Sure</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 group-hover:text-slate-600 transition-colors tracking-wide hidden xs:inline-block">
                Learn · Share · Grow
              </span>
            </div>
          </button>
        </div>

        {/* ── 2. Desktop Action Hierarchy ── */}
        <div className="hidden sm:flex items-center gap-2.5 lg:gap-3 pointer-events-auto">

          {/* Neutral / Account Action (Login or User Profile) */}
          {session ? (
            <RouterLink
              to={dashboardPath}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 text-slate-700 hover:text-edunavy hover:border-edupurple/40 shadow-sm shadow-purple-900/5 text-xs lg:text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-edupurple"
            >
              <User className="w-4 h-4 text-edupurple" />
              <span>Portal</span>
            </RouterLink>
          ) : (
            <RouterLink
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 text-slate-700 hover:text-edunavy hover:border-edupurple/40 shadow-sm shadow-purple-900/5 text-xs lg:text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-edupurple"
            >
              <LogIn className="w-4 h-4 text-educyan" />
              <span>Sign In</span>
            </RouterLink>
          )}

          {/* Tier 3: Primary Conversion Action (Emerald-to-Cyan or Purple Optimistic Gradient) */}
          {session ? (
            <motion.div
              whileHover={!prefersReducedMotion ? { scale: 1.05 } : {}}
              whileTap={!prefersReducedMotion ? { scale: 0.95 } : {}}
              transition={{ duration: 0.15 }}
            >
              <RouterLink
                to={dashboardPath}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-edupurple to-edupurple-bright text-white text-xs lg:text-sm font-bold shadow-lg shadow-purple-600/25 hover:shadow-purple-600/35 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-edupurple"
              >
                <Zap className="w-4 h-4 fill-current text-white" />
                <span>Open Dashboard</span>
              </RouterLink>
            </motion.div>
          ) : (
            <motion.div
              whileHover={!prefersReducedMotion ? { scale: 1.05 } : {}}
              whileTap={!prefersReducedMotion ? { scale: 0.95 } : {}}
              transition={{ duration: 0.15 }}
            >
              <RouterLink
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-edupurple to-edupurple-bright text-white text-xs lg:text-sm font-bold shadow-lg shadow-purple-600/25 hover:shadow-purple-600/35 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-edupurple"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Join Free</span>
              </RouterLink>
            </motion.div>
          )}

          {/* Sign Out Shortcut if logged in */}
          {session && (
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 text-slate-500 hover:text-rose-600 hover:bg-rose-50 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

        </div>

        {/* ── 3. Mobile Trigger Control (< 1024px) ── */}
        <div className="lg:hidden pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            className="p-2.5 rounded-2xl bg-white/90 backdrop-blur-xl border border-purple-100 shadow-[0_4px_20px_rgba(16,26,99,0.08)] text-edunavy hover:text-edupurple transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-edupurple"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* ── 4. Mobile Dropdown Panel (Navigational options first, actions last) ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="lg:hidden pointer-events-auto max-w-sm sm:max-w-md mx-auto mt-2 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-purple-100/90 shadow-2xl shadow-purple-950/15 flex flex-col gap-3"
          >
            {/* Navigational Chapters */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-1">
                Explore Chapters
              </span>
              {navChapters.map((chapter) => (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => scrollToSection(chapter.id)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-edupurple hover:bg-purple-50/80 transition-colors text-left"
                >
                  <span>{chapter.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>

            {/* Fine Divider */}
            <div className="border-t border-slate-200/80 my-0.5" />

            {/* Action Tiers */}
            <div className="flex flex-col gap-2 pt-1">
              {session ? (
                <>
                  <RouterLink
                    to={dashboardPath}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-edupurple to-edupurple-bright text-white font-bold text-sm shadow-md shadow-purple-600/25"
                  >
                    <Zap className="w-4 h-4 fill-current text-white" />
                    <span>Open Dashboard</span>
                  </RouterLink>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold text-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <RouterLink
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-edupurple to-edupurple-bright text-white font-bold text-sm shadow-md shadow-purple-600/25"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Join EduSure Free</span>
                  </RouterLink>

                  <RouterLink
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                  >
                    <LogIn className="w-4 h-4 text-slate-500" />
                    <span>Sign In</span>
                  </RouterLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
