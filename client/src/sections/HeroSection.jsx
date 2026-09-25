import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Search, 
  UploadCloud, 
  FileText, 
  Users, 
  Coins, 
  ShieldCheck, 
  Heart 
} from 'lucide-react';
import heroBg from '../assets/backgrounds/Hero-section.jpeg';
import { supabase } from '../supabaseClient';

export default function HeroSection() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);

  // Track auth session so protected links redirect to /login when not signed in
  const [session, setSession] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Navigate to protected route or redirect to login
  const goTo = (route) => {
    if (session) {
      navigate(route);
    } else {
      navigate('/login', { state: { from: route } });
    }
  };

  // Parallax scroll controls
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative w-full min-h-screen xl:h-[900px] xl:max-h-[900px] overflow-hidden"
    >
      {/* Parallax Background Layer */}
      <motion.div
        style={{ y: yBg, willChange: 'transform' }}
        className="absolute inset-x-0 -top-[8%] h-[116%] w-full pointer-events-none select-none transform-gpu will-change-transform z-0"
      >
        <div 
          className="w-full h-full bg-cover bg-no-repeat bg-left xl:bg-[position:center_right]"
          style={{
            backgroundImage: `url(${heroBg})`,
          }}
        />
      </motion.div>

      {/* 
        Hero Content Group:
        Centered vertically on mobile and medium devices, pinned to left on large desktop
      */}
      <motion.div 
        style={{ y: yContent }}
        className="relative z-10 min-h-[100dvh] xl:min-h-0 pt-22 pb-12 sm:pt-24 sm:pb-14 px-4 sm:px-6 md:px-10 xl:px-0 flex flex-col justify-center items-start xl:justify-start xl:pt-0 xl:pb-0 xl:absolute xl:left-[155px] xl:top-[108px] max-w-full xl:w-[620px] transform-gpu"
      >
        {/* 1. Hero Kicker Badge: Situated directly below the navbar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-3.5 sm:mb-4 inline-block"
        >
          <div 
            onClick={() => goTo('/pyqs')}
            className="inline-flex items-center gap-2 px-4 h-[38px] rounded-full bg-white/90 backdrop-blur-md text-[#5B21F4] text-xs font-semibold shadow-xs select-none border border-dashed border-[#5B21F4]/70 whitespace-nowrap hover:bg-white transition-colors cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-[#5B21F4] shrink-0" />
            <span className="text-[#101A63] font-bold text-xs">The #1 Student Academic Platform</span>
            <span className="text-[#5B21F4] font-bold ml-2">→</span>
          </div>
        </motion.div>

        {/* 2. Main Heading: Large, occupying the space with generous open line-height */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-4 sm:mb-5 max-w-[560px]"
        >
          <h1 className="text-[40px] sm:text-5xl lg:text-[62px] xl:text-[66px] font-display font-black tracking-tight text-[#101A63] leading-[1.18] sm:leading-[1.20] lg:leading-[1.16]">
            Master Your <br />
            <span className="bg-gradient-to-r from-[#5B21F4] via-[#6366F1] to-[#3B82F6] bg-clip-text text-transparent">
              Academics
            </span> <br />
            Together.
          </h1>
        </motion.div>

        {/* 3. Description: Generous comfortable line-height & clean spacing */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[15px] sm:text-[16px] lg:text-[18px] text-slate-700 leading-relaxed max-w-[540px] mb-5 sm:mb-6 font-sans font-medium"
        >
          Find, share and access{' '}
          <span className="bg-purple-100 text-[#5B21F4] font-bold px-2 py-0.5 rounded-md border border-purple-200/80 inline-block">
            verified notes
          </span>
          ,{' '}
          <span className="bg-purple-100 text-[#5B21F4] font-bold px-2 py-0.5 rounded-md border border-purple-200/80 inline-block">
            PDFs
          </span>
          ,{' '}
          <span className="bg-purple-100 text-[#5B21F4] font-bold px-2 py-0.5 rounded-md border border-purple-200/80 inline-block">
            PYQs
          </span>{' '}
          and{' '}
          <span className="bg-purple-100 text-[#5B21F4] font-bold px-2 py-0.5 rounded-md border border-purple-200/80 inline-block">
            study materials
          </span>
          . Earn coins by contributing and help build a smarter, stronger student community.
        </motion.p>

        {/* 4. CTA Buttons: Balanced row on mobile and desktop */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-[480px] mb-5 sm:mb-6"
        >
          <button
            type="button"
            onClick={() => goTo('/pyqs')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 h-[48px] rounded-full bg-gradient-to-r from-[#5B21F4] to-[#7C3AED] hover:from-[#4F1CD9] hover:to-[#6D28D9] text-white font-display font-bold text-[14px] sm:text-[15px] shadow-[0_8px_20px_rgba(91,33,244,0.30)] hover:shadow-[0_12px_26px_rgba(91,33,244,0.40)] hover:-translate-y-0.5 active:scale-98 transition-all cursor-pointer whitespace-nowrap"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>Explore Resources →</span>
          </button>

          <button
            type="button"
            onClick={() => goTo('/upload')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-[48px] rounded-full bg-white/95 backdrop-blur-md border-[1.5px] border-[#5B21F4]/70 text-[#5B21F4] font-display font-bold text-[14px] sm:text-[15px] hover:bg-white hover:border-[#5B21F4] hover:-translate-y-0.5 active:scale-98 transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <UploadCloud className="w-4 h-4 shrink-0 text-[#5B21F4]" />
            <span>Upload Notes →</span>
          </button>
        </motion.div>

        {/* 5. Statistics Row: Equal height aligned cards with balanced line spacing */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 w-full max-w-[580px] mb-3.5 sm:mb-5">
          {/* Card 1: 131+ Students */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.38 }}
            className="w-full h-[96px] p-3 sm:p-3.5 rounded-2xl bg-white/90 backdrop-blur-md border border-dashed border-purple-200/90 shadow-xs flex flex-col justify-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-1.5 text-[#5B21F4] mb-1">
              <Users className="w-4 h-4 shrink-0" />
              <span className="text-xl sm:text-[22px] font-display font-bold text-[#101A63] leading-none">131+</span>
            </div>
            <div className="min-h-[26px] flex items-center">
              <span className="text-[12px] sm:text-[13px] font-bold text-gray-800 leading-tight">Students</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium leading-none mt-0.5">Learning Together</p>
          </motion.div>

          {/* Card 2: 49 Verified Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.48 }}
            className="w-full h-[96px] p-3 sm:p-3.5 rounded-2xl bg-[#F8FBFF]/90 backdrop-blur-md border border-dashed border-blue-200/90 shadow-xs flex flex-col justify-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-1.5 text-[#2563EB] mb-1">
              <FileText className="w-4 h-4 shrink-0" />
              <span className="text-xl sm:text-[22px] font-display font-bold text-[#101A63] leading-none">49</span>
            </div>
            <div className="min-h-[26px] flex items-center">
              <span className="text-[12px] sm:text-[13px] font-bold text-gray-800 leading-tight">Verified Resources</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium leading-none mt-0.5">Quality Content</p>
          </motion.div>

          {/* Card 3: 580 Coins Earned */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.58 }}
            className="w-full h-[96px] p-3 sm:p-3.5 rounded-2xl bg-[#FFFDF7]/90 backdrop-blur-md border border-dashed border-amber-200/90 shadow-xs flex flex-col justify-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-1.5 text-amber-500 mb-1">
              <Coins className="w-4 h-4 shrink-0" />
              <span className="text-xl sm:text-[22px] font-display font-bold text-[#101A63] leading-none">580</span>
            </div>
            <div className="min-h-[26px] flex items-center">
              <span className="text-[12px] sm:text-[13px] font-bold text-gray-800 leading-tight">Coins Earned</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium leading-none mt-0.5">Share & Grow</p>
          </motion.div>

          {/* Card 4: 100% Community Driven */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.68 }}
            className="w-full h-[96px] p-3 sm:p-3.5 rounded-2xl bg-[#F2FBF7]/90 backdrop-blur-md border border-dashed border-emerald-200/90 shadow-xs flex flex-col justify-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-1.5 text-[#10B981] mb-1">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="text-xl sm:text-[22px] font-display font-bold text-[#101A63] leading-none">100%</span>
            </div>
            <div className="min-h-[26px] flex items-center">
              <span className="text-[12px] sm:text-[13px] font-bold text-gray-800 leading-tight">Community Driven</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium leading-none mt-0.5">By Students</p>
          </motion.div>
        </div>

        {/* 6. Trust Strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="flex flex-wrap sm:inline-flex items-center justify-center gap-2 sm:gap-4 px-4 sm:px-5 py-2.5 rounded-2xl sm:rounded-full bg-white/90 backdrop-blur-md border border-white/80 shadow-xs text-center w-full sm:w-auto"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>Admin Verified</span>
          </div>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#5B21F4]">
            <Users className="w-4 h-4 text-[#5B21F4]" />
            <span>Student Driven</span>
          </div>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-pink-600">
            <Heart className="w-3.5 h-3.5 fill-[#EC4899] text-[#EC4899]" />
            <span>Better Education</span>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
