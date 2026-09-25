import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { UserCheck, UploadCloud, Award, Sparkles, BookOpen } from 'lucide-react';
import howItWorksBg from '../assets/backgrounds/Page-2.jpeg';
import HandDrawnUnderline from '../components/HandDrawnUnderline';
import CloudCard from '../components/CloudCard';

const steps = [
  {
    step: "01",
    title: "Create an Account",
    description: "Sign up securely as a student. All accounts are college-specific.",
    color: "purple",
    icon: UserCheck,
    floatAnimation: "animate-float-1"
  },
  {
    step: "02",
    title: "Upload or Access Materials",
    description: "Share your well-written notes or download verified PYQs from others.",
    color: "blue",
    icon: UploadCloud,
    floatAnimation: "animate-float-2"
  },
  {
    step: "03",
    title: "Earn EduCoins",
    description: "Once your uploaded notes are verified by admins, you earn coins.",
    color: "green",
    icon: Award,
    floatAnimation: "animate-float-3"
  },
  {
    step: "04",
    title: "Unlock Premium Prep",
    description: "Use your earned coins to unlock placement roadmaps and premium questions.",
    color: "orange",
    icon: BookOpen,
    floatAnimation: "animate-float-1"
  }
];

export default function HowItWorksSection() {
  const sectionRef = useRef(null);

  // Parallax background effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative min-h-screen lg:h-screen lg:max-h-screen w-full py-8 sm:py-10 lg:py-6 flex flex-col justify-center overflow-hidden"
    >
      {/* Parallax Background Layer */}
      <motion.div
        style={{ y: yBg, willChange: 'transform' }}
        className="absolute inset-x-0 -top-[12%] h-[124%] w-full pointer-events-none select-none transform-gpu will-change-transform"
      >
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.40) 100%), url(${howItWorksBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </motion.div>

      {/* Main Content Container: Shifted slightly upwards and centered */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full -translate-y-3 sm:-translate-y-5 my-auto">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-9 lg:mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-edupurple text-xs sm:text-sm font-display font-bold border border-purple-200 shadow-sm mb-2.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Your learning journey</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-display font-black text-edunavy tracking-tight"
          >
            How{' '}
            <span className="bg-gradient-to-r from-edupurple via-purple-600 to-edublue bg-clip-text text-transparent">
              EduSure
            </span>{' '}
            Works
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-2 text-sm sm:text-base text-gray-700 max-w-lg mx-auto font-sans leading-relaxed"
          >
            Get started in minutes and transform your academic journey with our streamlined process.
          </motion.p>
        </div>

        {/* 
          Composed 2x2 Layout:
          Cards appear one by one sequentially as the page is scrolled into view!
        */}
        <div className="relative max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-stretch">
            
            {/* Step 01: Create an Account */}
            <motion.div
              initial={{ opacity: 0, y: 35, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative"
            >
              <CloudCard
                step={steps[0].step}
                title={steps[0].title}
                description={steps[0].description}
                color={steps[0].color}
                icon={steps[0].icon}
                floatAnimation={steps[0].floatAnimation}
              />
            </motion.div>

            {/* Step 02: Upload or Access Materials */}
            <motion.div
              initial={{ opacity: 0, y: 35, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative"
            >
              <CloudCard
                step={steps[1].step}
                title={steps[1].title}
                description={steps[1].description}
                color={steps[1].color}
                icon={steps[1].icon}
                floatAnimation={steps[1].floatAnimation}
              />
            </motion.div>

            {/* Step 03: Earn EduCoins */}
            <motion.div
              initial={{ opacity: 0, y: 35, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: 0.36, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative"
            >
              <CloudCard
                step={steps[2].step}
                title={steps[2].title}
                description={steps[2].description}
                color={steps[2].color}
                icon={steps[2].icon}
                floatAnimation={steps[2].floatAnimation}
              />
            </motion.div>

            {/* Step 04: Unlock Premium Prep */}
            <motion.div
              initial={{ opacity: 0, y: 35, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: 0.50, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative"
            >
              <CloudCard
                step={steps[3].step}
                title={steps[3].title}
                description={steps[3].description}
                color={steps[3].color}
                icon={steps[3].icon}
                floatAnimation={steps[3].floatAnimation}
              />
            </motion.div>

          </div>
        </div>

        {/* Bottom-Right Handwritten Slogan */}
        <div className="mt-5 sm:mt-7 lg:mt-5 flex justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-right inline-block"
          >
            <div className="font-handwritten text-3xl sm:text-4xl font-bold text-edupurple tracking-wide">
              Same Students. Bigger Opportunities.
            </div>
            <div className="w-56 sm:w-72 ml-auto -mt-1">
              <HandDrawnUnderline className="w-full h-3 text-edupurple" />
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
