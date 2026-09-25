import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  FileCheck, 
  Share2, 
  Calendar, 
  Coins, 
  ShieldCheck, 
  Briefcase, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import featuresBg from '../assets/backgrounds/page-3.jpeg';
import { supabase } from '../supabaseClient';

// Exact color schemes matching reference image
const colorSchemes = {
  purple: {
    border: 'border-[#9D7BFF]',
    borderHover: 'hover:border-edupurple',
    borderActive: 'border-edupurple ring-2 ring-purple-400/40',
    fill: 'bg-[#FCFAFF]',
    iconBg: 'bg-purple-100/90 text-edupurple',
    stepPill: 'bg-[#5B20E8] text-white',
    dot: 'bg-edupurple',
    socket: 'bg-edupurple',
    shadow: 'hover:shadow-[0_12px_28px_rgba(91,32,232,0.18)]',
    shadowActive: 'shadow-[0_12px_28px_rgba(91,32,232,0.24)]',
    hex: '#7C3AED',
  },
  blue: {
    border: 'border-[#60A5FA]',
    borderHover: 'hover:border-edublue',
    borderActive: 'border-edublue ring-2 ring-blue-400/40',
    fill: 'bg-[#F4F9FF]',
    iconBg: 'bg-blue-100/90 text-edublue',
    stepPill: 'bg-[#1769FF] text-white',
    dot: 'bg-edublue',
    socket: 'bg-edublue',
    shadow: 'hover:shadow-[0_12px_28px_rgba(23,105,255,0.18)]',
    shadowActive: 'shadow-[0_12px_28px_rgba(23,105,255,0.24)]',
    hex: '#1769FF',
  },
  green: {
    border: 'border-[#6EE7B7]',
    borderHover: 'hover:border-emerald-500',
    borderActive: 'border-emerald-500 ring-2 ring-emerald-400/40',
    fill: 'bg-[#F3FCF7]',
    iconBg: 'bg-emerald-100/90 text-emerald-600',
    stepPill: 'bg-[#059669] text-white',
    dot: 'bg-emerald-500',
    socket: 'bg-emerald-500',
    shadow: 'hover:shadow-[0_12px_28px_rgba(16,185,129,0.18)]',
    shadowActive: 'shadow-[0_12px_28px_rgba(16,185,129,0.24)]',
    hex: '#10B981',
  },
  orange: {
    border: 'border-[#FCD34D]',
    borderHover: 'hover:border-amber-500',
    borderActive: 'border-amber-500 ring-2 ring-amber-400/40',
    fill: 'bg-[#FFFDF5]',
    iconBg: 'bg-amber-100/90 text-amber-600',
    stepPill: 'bg-[#D97706] text-white',
    dot: 'bg-amber-500',
    socket: 'bg-amber-500',
    shadow: 'hover:shadow-[0_12px_28px_rgba(245,158,11,0.18)]',
    shadowActive: 'shadow-[0_12px_28px_rgba(245,158,11,0.24)]',
    hex: '#F59E0B',
  },
  yellow: {
    border: 'border-[#FDE047]',
    borderHover: 'hover:border-yellow-500',
    borderActive: 'border-yellow-500 ring-2 ring-yellow-400/40',
    fill: 'bg-[#FFFFF2]',
    iconBg: 'bg-yellow-100/90 text-yellow-700',
    stepPill: 'bg-[#CA8A04] text-white',
    dot: 'bg-yellow-500',
    socket: 'bg-yellow-500',
    shadow: 'hover:shadow-[0_12px_28px_rgba(234,179,8,0.18)]',
    shadowActive: 'shadow-[0_12px_28px_rgba(234,179,8,0.24)]',
    hex: '#EAB308',
  },
  pink: {
    border: 'border-[#F9A8D4]',
    borderHover: 'hover:border-pink-500',
    borderActive: 'border-pink-500 ring-2 ring-pink-400/40',
    fill: 'bg-[#FFF7FB]',
    iconBg: 'bg-pink-100/90 text-pink-600',
    stepPill: 'bg-[#DB2777] text-white',
    dot: 'bg-pink-500',
    socket: 'bg-pink-500',
    shadow: 'hover:shadow-[0_12px_28px_rgba(236,72,153,0.18)]',
    shadowActive: 'shadow-[0_12px_28px_rgba(236,72,153,0.24)]',
    hex: '#EC4899',
  },
};

// 6 Feature cards designed strictly matching reference image structure
const features = [
  // Left Column (0, 1, 2)
  {
    id: 'pyqs',
    step: 'Step 01',
    title: 'Verified PYQs & Notes',
    description: 'High-quality previous year questions and university study materials checked by faculty.',
    icon: FileCheck,
    color: 'purple',
    route: '/pyqs',
  },
  {
    id: 'events',
    step: 'Step 02',
    title: 'College Events & Fests',
    description: 'Never miss campus hackathons, club workshops, guest lectures, and campus festivals.',
    icon: Calendar,
    color: 'blue',
    route: '/calendar',
  },
  {
    id: 'admin',
    step: 'Step 03',
    title: 'Admin Verification',
    description: 'Every resource is reviewed for authenticity and accuracy before publishing online.',
    icon: ShieldCheck,
    color: 'green',
    route: '/my-materials',
  },
  // Right Column (3, 4, 5)
  {
    id: 'sharing',
    step: 'Step 04',
    title: 'Seamless Sharing',
    description: 'Upload your notes effortlessly and earn recognition while helping juniors succeed.',
    icon: Share2,
    color: 'orange',
    route: '/upload',
  },
  {
    id: 'rewards',
    step: 'Step 05',
    title: 'Earn EduCoins',
    description: 'Get rewarded with coins for verified uploads and redeem them for premium prep materials.',
    icon: Coins,
    color: 'yellow',
    route: '/rewards',
  },
  {
    id: 'placement',
    step: 'Step 06',
    title: 'Placement Roadmaps',
    description: 'Curated career roadmaps, company interview archives, and placement question banks.',
    icon: Briefcase,
    color: 'pink',
    route: '/placement-materials',
  },
];

export default function FeaturesSection() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isHubHovered, setIsHubHovered] = useState(false);
  const [paths, setPaths] = useState([]);

  // Auth guard: redirect to /login if session is missing
  const [session, setSession] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const goTo = (route) => {
    if (session) {
      navigate(route);
    } else {
      navigate('/login', { state: { from: route } });
    }
  };

  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const hubRef = useRef(null);
  const cardRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const updatePaths = useCallback(() => {
    if (!containerRef.current || !hubRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const hubRect = hubRef.current.getBoundingClientRect();

    const hubLeftX = hubRect.left - containerRect.left;
    const hubRightX = hubRect.right - containerRect.left;
    const hubCenterY = hubRect.top + hubRect.height / 2 - containerRect.top;

    const newPaths = features.map((feat, idx) => {
      const cardEl = cardRefs[idx].current;
      if (!cardEl) return null;
      const cardRect = cardEl.getBoundingClientRect();
      const isLeft = idx < 3;

      // Stagger vertical anchor sockets on the hub
      const verticalOffset = (idx % 3 === 0) ? -28 : (idx % 3 === 1) ? 0 : 28;
      const startX = isLeft ? hubLeftX : hubRightX;
      const startY = hubCenterY + verticalOffset;

      const endX = isLeft
        ? cardRect.right - containerRect.left
        : cardRect.left - containerRect.left;
      const endY = cardRect.top + cardRect.height / 2 - containerRect.top;

      // Smooth horizontal S-curve bezier
      const curvature = Math.abs(endX - startX) * 0.52;
      const cpX1 = isLeft ? startX - curvature : startX + curvature;
      const cpX2 = isLeft ? endX + curvature : endX - curvature;

      const d = `M ${startX} ${startY} C ${cpX1} ${startY}, ${cpX2} ${endY}, ${endX} ${endY}`;
      return {
        d,
        startX,
        startY,
        endX,
        endY,
        isLeft,
        color: colorSchemes[feat.color].hex,
        id: feat.id,
      };
    });

    setPaths(newPaths);
  }, []);

  useLayoutEffect(() => {
    updatePaths();
  }, [updatePaths]);

  useEffect(() => {
    window.addEventListener('resize', updatePaths);

    let observer;
    if (window.ResizeObserver && containerRef.current) {
      observer = new ResizeObserver(() => {
        updatePaths();
      });
      observer.observe(containerRef.current);
    }

    const t1 = setTimeout(updatePaths, 100);
    const t2 = setTimeout(updatePaths, 400);
    const t3 = setTimeout(updatePaths, 800);

    return () => {
      window.removeEventListener('resize', updatePaths);
      if (observer) observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [updatePaths]);

  // Parallax scroll controls
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const yBg = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative min-h-screen lg:h-screen lg:max-h-screen w-full flex flex-col justify-center py-6 sm:py-8 lg:py-5 px-3 sm:px-6 lg:px-8 overflow-hidden select-none"
    >
      {/* Parallax Background Layer */}
      <motion.div
        style={{ y: yBg, willChange: 'transform' }}
        className="absolute inset-x-0 -top-[10%] h-[120%] w-full pointer-events-none select-none transform-gpu will-change-transform"
      >
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.20) 50%, rgba(255, 255, 255, 0.45) 100%), url(${featuresBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </motion.div>
      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col justify-center my-auto">
        
        {/* Section Header: Matching the standard 4xl-5xl font size of other pages */}
        <div className="text-center max-w-3xl mx-auto shrink-0 mb-3 sm:mb-4 lg:mb-3">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-edupurple text-xs font-display font-bold border border-purple-200/80 shadow-2xs mb-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-edupurple animate-pulse" />
            <span>Interactive Campus Ecosystem</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-edunavy tracking-tight leading-tight"
          >
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-edupurple via-purple-600 to-edublue bg-clip-text text-transparent">
              ace your semesters.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-1.5 text-xs sm:text-sm text-gray-700 max-w-xl mx-auto font-sans leading-snug"
          >
            Built by students, for students. Hover any module to trace its connection to the EduSure core network.
          </motion.p>
        </div>

        {/* 
          Center Interactive Grid:
          Left Column (3 Cards) | SVG Center Lines | Center Hub Box | Right Column (3 Cards)
        */}
        <div ref={containerRef} className="relative max-w-6xl mx-auto w-full my-auto py-2 sm:py-3">
          
          {/* Dynamic SVG Connecting Lines (Visible on Desktop / lg+) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block overflow-visible z-0"
            style={{ width: '100%', height: '100%' }}
          >
            <defs>
              <filter id="features-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {paths.map((path, idx) => {
              if (!path) return null;
              const isCardHovered = hoveredCard === idx;
              const isActive = isCardHovered || isHubHovered;

              return (
                <g key={`connection-group-${path.id}`}>
                  {/* Subtle Background Glow Track */}
                  <path
                    d={path.d}
                    fill="none"
                    stroke={path.color}
                    strokeWidth={isActive ? 6 : 3}
                    strokeOpacity={isActive ? 0.45 : 0.12}
                    className="transition-all duration-300"
                    filter={isActive ? 'url(#features-glow-filter)' : undefined}
                  />

                  {/* Main Line Track */}
                  <path
                    d={path.d}
                    fill="none"
                    stroke={path.color}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    strokeOpacity={isActive ? 1 : 0.4}
                    className="transition-all duration-300"
                  />

                  {/* Animated Dash Pulse Flow */}
                  <path
                    d={path.d}
                    fill="none"
                    stroke={isActive ? '#FFFFFF' : path.color}
                    strokeWidth={isActive ? 2 : 1.2}
                    strokeDasharray="6 6"
                    strokeOpacity={isActive ? 0.95 : 0.6}
                    className="animate-dash"
                  />

                  {/* Traveling Energy Pulse Node */}
                  <circle
                    r={isActive ? 4.5 : 3}
                    fill={path.color}
                    filter="url(#features-glow-filter)"
                    className="transition-all duration-300"
                  >
                    <animateMotion
                      path={path.d}
                      dur={isActive ? '1.8s' : '3.5s'}
                      repeatCount="indefinite"
                      keyPoints={path.isLeft ? '0;1' : '0;1'}
                      keyTimes="0;1"
                    />
                  </circle>

                  {/* Terminal Anchor Circle at Hub End */}
                  <circle
                    cx={path.startX}
                    cy={path.startY}
                    r={isActive ? 4 : 3}
                    fill="#7C3AED"
                    className="transition-all duration-300"
                  />

                  {/* Terminal Anchor Circle at Card End */}
                  <circle
                    cx={path.endX}
                    cy={path.endY}
                    r={isActive ? 4.5 : 3}
                    fill={path.color}
                    className="transition-all duration-300"
                  />

                  {/* Radiating Ping Halo on Active Card Terminal */}
                  {isActive && (
                    <circle
                      cx={path.endX}
                      cy={path.endY}
                      r="8"
                      fill={path.color}
                      opacity="0.3"
                      className="animate-ping"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* 3-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 lg:gap-6 items-center relative z-10">
            
            {/* Left Column (3 features matching reference image) */}
            <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-3.5 lg:gap-3">
              {features.slice(0, 3).map((feat, i) => {
                const scheme = colorSchemes[feat.color];
                const Icon = feat.icon;
                const isHovered = hoveredCard === i;

                return (
                  <motion.div
                    key={feat.id}
                    initial={{ opacity: 0, x: -20, scale: 0.96 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: 0.08 + i * 0.14, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <div
                      ref={cardRefs[i]}
                      onMouseEnter={() => setHoveredCard(i)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onClick={() => goTo(feat.route)}
                      tabIndex={0}
                      role="button"
                      aria-label={feat.title}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') goTo(feat.route);
                      }}
                      className={`group relative p-3.5 sm:p-4 lg:p-3.5 xl:p-4 rounded-[24px] border-[1.5px] transition-all duration-300 cursor-pointer select-none backdrop-blur-md ${
                        scheme.fill
                      } ${scheme.shadow} ${
                        isHovered
                          ? `${scheme.borderActive} ${scheme.shadowActive} -translate-y-1 scale-[1.015]`
                          : `${scheme.border} ${scheme.borderHover} hover:-translate-y-0.5 hover:scale-[1.01]`
                      }`}
                    >
                      {/* Connection socket on right edge facing center hub */}
                      <div
                        className={`absolute -right-2 top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center transition-all duration-300 ${
                          isHovered ? 'scale-125' : ''
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${scheme.socket}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        </span>
                      </div>

                      {/* Header Row (Exact match with reference image: Step Pill on Left, Round Icon on Right) */}
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span
                          className={`inline-flex items-center justify-center font-display font-bold text-xs px-3.5 py-1 rounded-full shadow-2xs ${scheme.stepPill}`}
                        >
                          {feat.step}
                        </span>

                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${scheme.iconBg}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Title (Bold dark navy as in reference image) */}
                      <h3 className="text-[15px] sm:text-base font-display font-bold text-edunavy leading-snug mb-1 group-hover:text-edupurple transition-colors">
                        {feat.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-gray-600 font-sans line-clamp-2 leading-relaxed font-medium">
                        {feat.description}
                      </p>

                      {/* Interactive Micro Action Hint */}
                      <div className="mt-1 flex items-center justify-end text-[11px] font-bold text-edupurple opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                        <span className="mr-0.5">Explore module</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Center Column: Interactive EduSure Visual Hub */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center py-2 lg:py-0">
              <motion.div
                initial={{ scale: 0.88, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.44 }}
                className="w-full flex justify-center"
              >
                <div
                  ref={hubRef}
                  onMouseEnter={() => setIsHubHovered(true)}
                  onMouseLeave={() => setIsHubHovered(false)}
                  className="relative p-5 sm:p-6 rounded-[28px] border-2 border-edupurple/40 bg-gradient-to-b from-[#FCFAFF]/95 to-[#F5F1FF]/95 backdrop-blur-xl shadow-[0_16px_40px_rgba(91,32,232,0.14)] text-center w-full max-w-[250px] sm:max-w-[270px] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(91,32,232,0.25)] hover:border-edupurple cursor-pointer group"
                >
                  {/* Ambient Background Aura */}
                  <div
                    className={`absolute -inset-2 bg-gradient-to-r from-edupurple/20 via-edublue/20 to-purple-400/20 rounded-[32px] blur-xl transition-opacity duration-500 pointer-events-none ${
                      isHubHovered ? 'opacity-100 animate-pulse' : 'opacity-60'
                    }`}
                  />

                  {/* Left Hub Sockets (3 sockets aligned with Left Cards) */}
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 hidden lg:flex flex-col justify-between h-[64px] pointer-events-none">
                    {[0, 1, 2].map((idx) => {
                      const isCardActive = hoveredCard === idx || isHubHovered;
                      return (
                        <span
                          key={`hub-left-socket-${idx}`}
                          className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs flex items-center justify-center transition-all duration-300 ${
                            isCardActive
                              ? 'bg-edupurple scale-125 shadow-[0_0_10px_rgba(124,58,237,0.8)]'
                              : 'bg-purple-300/80 scale-100'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        </span>
                      );
                    })}
                  </div>

                  {/* Right Hub Sockets (3 sockets aligned with Right Cards) */}
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 hidden lg:flex flex-col justify-between h-[64px] pointer-events-none">
                    {[3, 4, 5].map((idx) => {
                      const isCardActive = hoveredCard === idx || isHubHovered;
                      return (
                        <span
                          key={`hub-right-socket-${idx}`}
                          className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs flex items-center justify-center transition-all duration-300 ${
                            isCardActive
                              ? 'bg-edupurple scale-125 shadow-[0_0_10px_rgba(124,58,237,0.8)]'
                              : 'bg-purple-300/80 scale-100'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        </span>
                      );
                    })}
                  </div>

                  {/* Hub Body */}
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider mb-2 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>Ecosystem Core</span>
                    </div>

                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-edupurple via-purple-600 to-edublue text-white flex items-center justify-center mx-auto mb-2 shadow-md shadow-purple-500/25 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                      <BookOpen className="w-5 h-5" />
                    </div>

                    <h3 className="text-xl font-display font-black text-edunavy leading-tight">
                      Edu<span className="text-edupurple">Sure</span> Hub
                    </h3>
                    
                    <p className="text-[11px] font-bold text-edupurple tracking-wider mt-0.5 font-sans">
                      Learn · Share · Grow
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-purple-100/80 flex items-center justify-center gap-1.5 text-[11px] font-medium text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-edupurple animate-pulse" />
                      <span>6 Connected Modules</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column (3 features matching reference image) */}
            <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-3.5 lg:gap-3">
              {features.slice(3, 6).map((feat, localIdx) => {
                const i = localIdx + 3;
                const scheme = colorSchemes[feat.color];
                const Icon = feat.icon;
                const isHovered = hoveredCard === i;

                return (
                  <motion.div
                    key={feat.id}
                    initial={{ opacity: 0, x: 20, scale: 0.96 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: 0.54 + localIdx * 0.14, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <div
                      ref={cardRefs[i]}
                      onMouseEnter={() => setHoveredCard(i)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onClick={() => goTo(feat.route)}
                      tabIndex={0}
                      role="button"
                      aria-label={feat.title}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') goTo(feat.route);
                      }}
                      className={`group relative p-3.5 sm:p-4 lg:p-3.5 xl:p-4 rounded-[24px] border-[1.5px] transition-all duration-300 cursor-pointer select-none backdrop-blur-md ${
                        scheme.fill
                      } ${scheme.shadow} ${
                        isHovered
                          ? `${scheme.borderActive} ${scheme.shadowActive} -translate-y-1 scale-[1.015]`
                          : `${scheme.border} ${scheme.borderHover} hover:-translate-y-0.5 hover:scale-[1.01]`
                      }`}
                    >
                      {/* Connection socket on left edge facing center hub */}
                      <div
                        className={`absolute -left-2 top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center transition-all duration-300 ${
                          isHovered ? 'scale-125' : ''
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${scheme.socket}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        </span>
                      </div>

                      {/* Header Row (Exact match with reference image: Step Pill on Left, Round Icon on Right) */}
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span
                          className={`inline-flex items-center justify-center font-display font-bold text-xs px-3.5 py-1 rounded-full shadow-2xs ${scheme.stepPill}`}
                        >
                          {feat.step}
                        </span>

                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${scheme.iconBg}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Title (Bold dark navy as in reference image) */}
                      <h3 className="text-[15px] sm:text-base font-display font-bold text-edunavy leading-snug mb-1 group-hover:text-edupurple transition-colors">
                        {feat.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-gray-600 font-sans line-clamp-2 leading-relaxed font-medium">
                        {feat.description}
                      </p>

                      {/* Interactive Micro Action Hint */}
                      <div className="mt-1 flex items-center justify-end text-[11px] font-bold text-edupurple opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                        <span className="mr-0.5">Explore module</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
