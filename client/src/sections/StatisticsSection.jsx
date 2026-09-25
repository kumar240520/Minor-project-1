import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Users, FileText, CalendarCheck, Coins } from 'lucide-react';
import statsBg from '../assets/backgrounds/page-5.jpeg';
import StatCard from '../components/StatCard';
import HandDrawnUnderline from '../components/HandDrawnUnderline';
import { supabase } from '../supabaseClient';

export default function StatisticsSection() {
  const sectionRef = useRef(null);
  const [liveCoins, setLiveCoins] = useState(80892);
  const [liveStudents, setLiveStudents] = useState(140);
  const [liveNotes, setLiveNotes] = useState(49);

  useEffect(() => {
    let isMounted = true;
    // Calculate total coins distributed to all users directly from users table
    supabase.from('users').select('coins').then(({ data }) => {
      if (data && data.length > 0 && isMounted) {
        const sum = data.reduce((acc, u) => acc + (Number(u.coins) || 0), 0);
        setLiveCoins(sum);
        setLiveStudents(data.length);
      }
    });

    supabase.from('materials').select('*', { count: 'exact', head: true }).eq('status', 'approved').then(({ count }) => {
      if (count && isMounted) setLiveNotes(count);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Parallax scroll controls
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section
      ref={sectionRef}
      id="statistics"
      className="relative min-h-screen w-full py-20 lg:py-24 flex items-center overflow-hidden"
    >
      {/* Parallax Background Layer */}
      <motion.div
        style={{ y: yBg, willChange: 'transform' }}
        className="absolute inset-x-0 -top-[12%] h-[124%] w-full pointer-events-none select-none transform-gpu will-change-transform"
      >
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.25) 42%, rgba(255, 255, 255, 0.55) 100%), url(${statsBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          
          {/* Left Column (Clear space letting background students shine through) */}
          <div className="hidden lg:block lg:col-span-5" />

          {/* Right Column: Heading + 2x2 Statistics Grid */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-edunavy tracking-tight leading-[1.12]">
                Trusted by <br />
                <span className="relative inline-block bg-gradient-to-r from-edupurple to-edublue bg-clip-text text-transparent">
                  Hundreds of Students
                  <div className="absolute -bottom-2 sm:-bottom-3 left-0 right-0 pointer-events-none">
                    <HandDrawnUnderline className="w-full h-3.5 text-edupurple-bright" />
                  </div>
                </span>
              </h2>

              <p className="mt-4 text-base sm:text-lg text-gray-700 max-w-xl font-sans font-medium">
                Join a thriving community of learners sharing knowledge and achieving academic excellence together.
              </p>
            </motion.div>

            {/* 2x2 Statistics Grid: Cards appear sequentially one by one! */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-10">
              {/* Card 1: Active Students */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <StatCard
                  icon={Users}
                  targetNumber={liveStudents}
                  suffix="+"
                  label="Active Students"
                  colorScheme="purple"
                />
              </motion.div>

              {/* Card 2: Verified Notes */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <StatCard
                  icon={FileText}
                  targetNumber={liveNotes}
                  suffix="+"
                  label="Verified Notes"
                  colorScheme="blue"
                />
              </motion.div>

              {/* Card 3: Events Hosted */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.40, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <StatCard
                  icon={CalendarCheck}
                  targetNumber={1}
                  label="Events Hosted"
                  colorScheme="green"
                />
              </motion.div>

              {/* Card 4: Coins Distributed to all users */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <StatCard
                  icon={Coins}
                  targetNumber={liveCoins}
                  suffix="+"
                  label="Coins Distributed"
                  colorScheme="yellow"
                />
              </motion.div>
            </div>

            {/* Bottom Handwritten Message */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.70 }}
              className="inline-block"
            >
              <div className="font-handwritten text-2xl sm:text-3xl font-bold text-edupurple tracking-wide">
                Same Students. Bigger Opportunities.
              </div>
              <div className="w-56 -mt-1">
                <HandDrawnUnderline className="w-full h-2.5 text-edupurple" />
              </div>
            </motion.div>

          </div>

        </div>
      </div>

    </section>
  );
}
