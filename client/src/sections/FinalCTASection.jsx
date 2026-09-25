import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Zap, Sparkles, Coins } from 'lucide-react';
import ctaBg from '../assets/backgrounds/page-6.jpeg';
import PrimaryButton from '../components/PrimaryButton';
import HandDrawnUnderline from '../components/HandDrawnUnderline';
import { supabase } from '../supabaseClient';

export default function FinalCTASection() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);

  // Track session to show correct CTA button
  const [session, setSession] = useState(null);
  const [liveCoins, setLiveCoins] = useState(80892);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));

    supabase.from('users').select('coins').then(({ data }) => {
      if (data && data.length > 0) {
        const sum = data.reduce((acc, u) => acc + (Number(u.coins) || 0), 0);
        setLiveCoins(sum);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isLoggedIn = Boolean(session);

  // Parallax scroll controls
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="relative min-h-screen w-full py-24 lg:py-32 flex flex-col justify-between items-center text-center overflow-hidden"
    >
      {/* Parallax Background Layer */}
      <motion.div
        style={{ y: yBg, willChange: 'transform' }}
        className="absolute inset-x-0 -top-[12%] h-[124%] w-full pointer-events-none select-none transform-gpu will-change-transform"
      >
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.40) 100%), url(${ctaBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </motion.div>

      {/* Background Soft Sunlight Overlay */}
      <div className="absolute inset-0 bg-white/10 pointer-events-none" />

      {/* Main CTA Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 my-auto">
        
        {/* CTA Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-edupurple text-white text-xs sm:text-sm font-display font-bold shadow-lg shadow-purple-500/25 mb-6 select-none"
        >
          <Users className="w-4 h-4" />
          <span>Join the Community</span>
          <Zap className="w-3.5 h-3.5 fill-current" />
        </motion.div>

        {/* CTA Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-edunavy tracking-tight leading-[1.12] mb-6"
        >
          Ready to Upgrade Your <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-edupurple via-purple-600 to-edublue bg-clip-text text-transparent">
            Academic Journey?
          </span>
        </motion.h2>

        {/* CTA Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed mb-8 font-sans font-medium"
        >
          Join thousands of students who are already using EduSure to share knowledge and ace their exams. Start your journey to academic excellence today.
        </motion.p>

        {/* CTA Button & Supporting Text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col items-center justify-center gap-4"
        >
          {/* Live Coins Distributed Highlight Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-300 text-amber-900 text-xs sm:text-sm font-bold shadow-xs select-none">
            <Coins className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>Over {liveCoins.toLocaleString()} EduCoins Distributed to All Users</span>
          </div>

          <PrimaryButton
            size="lg"
            onClick={() => navigate(isLoggedIn ? '/dashboard' : '/register')}
            className="px-9 sm:px-11 py-4 text-base sm:text-lg font-display font-black tracking-wide shadow-[0_12px_32px_rgba(100,40,230,0.35)] hover:shadow-[0_16px_40px_rgba(100,40,230,0.45)] hover:scale-105 active:scale-95 transition-all"
          >
            <span>{isLoggedIn ? 'Go to Dashboard →' : 'Join Now →'}</span>
          </PrimaryButton>

          {/* Supporting Text with Handwritten Underline */}
          <div className="relative inline-block mt-2">
            <span className="text-xs sm:text-sm font-bold text-gray-600 font-sans">
              No credit card required · Free forever
            </span>
            <div className="w-full -mt-0.5">
              <HandDrawnUnderline className="w-full h-2 text-edupurple-bright" />
            </div>
          </div>
        </motion.div>

      </div>

      {/* CTA Footer Message */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="relative z-10 mt-auto pt-8 pb-4"
      >
        <div className="font-handwritten text-3xl sm:text-4xl font-bold text-edupurple tracking-wider flex items-center justify-center gap-2">
          <span>Knowledge Today. A Better Tomorrow.</span>
          <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
        </div>
        <div className="w-64 sm:w-88 mx-auto -mt-1">
          <HandDrawnUnderline className="w-full h-3 text-edupurple" />
        </div>
      </motion.div>
    </section>
  );
}
