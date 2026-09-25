import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Radio, 
  ArrowRight, 
  MapPin, 
  Users, 
  Trophy, 
  Rocket, 
  Laptop, 
  BarChart3, 
  Briefcase, 
  TrendingUp,
  X,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  Share2
} from 'lucide-react';
import eventsBg from '../assets/backgrounds/Page-4.jpeg';
import EventCard, { CalendarHashIcon } from '../components/EventCard';
import { supabase } from '../supabaseClient';

const events = [
  {
    id: 'hackthecampus-2026',
    category: "Hackathon",
    dateDay: "18",
    dateMonth: "Oct",
    title: "HackTheCampus 2026",
    colorScheme: "blue",
    iconType: "calendar",
    items: [
      { icon: MapPin, text: "IPS Academy, Indore" },
      { icon: Users, text: "300+ Participants" },
      { icon: Trophy, text: "Cash Prizes & Certificates" },
      { icon: Rocket, text: "Build · Innovate · Collaborate" },
    ],
    fullDetails: {
      time: "09:00 AM - 06:00 PM IST",
      mode: "In-Person (Auditorium & Lab Complex)",
      organizer: "EduSure Tech & Innovation Club",
      description: "Join central India's premier student hackathon. Build next-gen Web, AI, and Cloud solutions in 24 hours, showcase before industry leaders, and win over ₹50,000 in cash prizes.",
      tags: ["AI/ML", "Web3", "Full Stack", "Open Innovation"]
    }
  },
  {
    id: 'google-cloud-workshop',
    category: "Workshop",
    dateDay: "22",
    dateMonth: "Oct",
    title: "Google Cloud Workshop",
    colorScheme: "green",
    iconType: "gear",
    items: [
      { icon: MapPin, text: "Online (Google Meet)" },
      { icon: Users, text: "Limited Seats" },
      { icon: Laptop, text: "Live Q&A Session" },
      { icon: BarChart3, text: "Hands-on Learning" },
    ],
    fullDetails: {
      time: "05:00 PM - 07:30 PM IST",
      mode: "Live Interactive Virtual Session",
      organizer: "Google Cloud Student Innovators",
      description: "Get hands-on training with Kubernetes, Cloud Run, and Vertex AI. Complete live lab challenges with Google Cloud certified architects and claim free Google Cloud credits.",
      tags: ["DevOps", "Kubernetes", "Vertex AI", "GCP Credits"]
    }
  },
  {
    id: 'placement-talk-amazon',
    category: "Seminar",
    dateDay: "05",
    dateMonth: "Nov",
    title: "Placement Talk: Amazon",
    colorScheme: "red",
    iconType: "mic",
    items: [
      { icon: MapPin, text: "IPS Academy, Indore" },
      { icon: Users, text: "Open to All Students" },
      { icon: Briefcase, text: "Career Insights & Tips" },
      { icon: TrendingUp, text: "Placement Readiness" },
    ],
    fullDetails: {
      time: "02:00 PM - 04:30 PM IST",
      mode: "Campus Main Auditorium",
      organizer: "Campus Placement Cell & EduSure",
      description: "Direct insider session with Senior Software Engineers & Hiring Managers from Amazon. Learn core DSA topics, system design interview formats, resume scoring secrets, and leadership principles.",
      tags: ["SDE Prep", "Resume Review", "DSA Strategies", "Mock Q&A"]
    }
  }
];

export default function EventsSection() {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeQuickTab, setActiveQuickTab] = useState(null);

  // Auth guard
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

  // Parallax scroll controls
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  const handleOpenDetails = (event) => {
    setSelectedEvent(event);
    setIsRegistered(false);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setIsRegistered(false);
  };

  return (
    <section
      ref={sectionRef}
      id="events"
      className="relative min-h-screen w-full py-12 lg:py-16 flex flex-col justify-between overflow-hidden"
    >
      {/* Parallax Background Layer */}
      <motion.div
        style={{ y: yBg, willChange: 'transform' }}
        className="absolute inset-x-0 -top-[12%] h-[124%] w-full pointer-events-none select-none transform-gpu will-change-transform"
      >
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.20) 50%, rgba(255, 255, 255, 0.45) 100%), url(${eventsBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-between h-full">
        
        {/* Header Area */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/90 text-indigo-700 text-xs sm:text-sm font-semibold border border-indigo-200/80 shadow-xs mb-3 select-none"
          >
            <CalendarHashIcon className="w-4 h-4 text-indigo-600" />
            <span>Be Part of Something Bigger</span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-900 tracking-tight"
          >
            Upcoming{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              College Events
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-2 text-sm sm:text-base text-slate-700 max-w-xl mx-auto font-sans leading-relaxed"
          >
            Stay updated with the latest happenings and register
            <br className="hidden sm:inline" /> before you miss out.
          </motion.p>
        </div>

        {/* 3 Interactive Event Cards Grid: Reveal one by one sequentially! */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 max-w-6xl mx-auto mb-8 sm:mb-10 w-full">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 35, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: 0.1 + index * 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <EventCard
                {...event}
                onViewDetails={() => handleOpenDetails(event)}
              />
            </motion.div>
          ))}
        </div>

        {/* 
          Downside Card:
          Solid pure white background (NOT blurry), deeply interactive, professional design matching reference image
        */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.62 }}
          className="max-w-4xl mx-auto w-full"
        >
          <div className="p-3 sm:px-6 sm:py-3.5 rounded-2xl sm:rounded-full bg-white border border-slate-200/90 shadow-[0_12px_36px_rgba(15,23,42,0.12)] flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 hover:shadow-[0_16px_42px_rgba(15,23,42,0.16)]">
            
            {/* Left & Middle Interactive Chips */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center sm:text-left w-full sm:w-auto">
              
              {/* Chip 1: Live Events */}
              <div 
                role="button"
                tabIndex={0}
                onClick={() => goTo('/calendar')}
                onMouseEnter={() => setActiveQuickTab('live')}
                onMouseLeave={() => setActiveQuickTab(null)}
                className={`flex items-center gap-3 p-2 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-full transition-all duration-200 cursor-pointer select-none ${
                  activeQuickTab === 'live' ? 'bg-purple-50 scale-102' : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 relative">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping absolute" />
                  <Radio className="w-5 h-5 relative z-10" />
                </div>
                <div>
                  <div className="text-sm font-display font-bold text-slate-900 leading-tight">
                    Live Events
                  </div>
                  <div className="text-xs text-slate-500 font-normal">
                    Happening now & upcoming
                  </div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="hidden sm:block w-px h-8 bg-slate-200" />

              {/* Chip 2: Recent Events */}
              <div 
                role="button"
                tabIndex={0}
                onClick={() => goTo('/calendar')}
                onMouseEnter={() => setActiveQuickTab('recent')}
                onMouseLeave={() => setActiveQuickTab(null)}
                className={`flex items-center gap-3 p-2 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-full transition-all duration-200 cursor-pointer select-none ${
                  activeQuickTab === 'recent' ? 'bg-blue-50 scale-102' : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <CalendarHashIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-display font-bold text-slate-900 leading-tight">
                    Recent Events
                  </div>
                  <div className="text-xs text-slate-500 font-normal">
                    Explore past events and highlights
                  </div>
                </div>
              </div>

            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-center">
              <button
                type="button"
                onClick={() => goTo('/calendar')}
                className="w-1/2 sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <span>View All Live Events</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => goTo('/calendar')}
                className="w-1/2 sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-white hover:bg-blue-50/80 border-2 border-blue-600 text-blue-600 font-semibold text-xs sm:text-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <span>View All Events</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </motion.div>

      </div>

      {/* Interactive Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseModal}
                className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Category Pill + Date */}
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                  {selectedEvent.category}
                </span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedEvent.dateDay} {selectedEvent.dateMonth} 2026
                </span>
              </div>

              {/* Event Title */}
              <h3 className="text-2xl font-display font-black text-slate-900 mb-2">
                {selectedEvent.title}
              </h3>

              {/* Details Tag list */}
              <div className="space-y-2 mb-4 text-xs sm:text-sm text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800">Time:</span>
                  <span>{selectedEvent.fullDetails.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800">Venue:</span>
                  <span>{selectedEvent.fullDetails.mode}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800">Host:</span>
                  <span>{selectedEvent.fullDetails.organizer}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                {selectedEvent.fullDetails.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {selectedEvent.fullDetails.tags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegistered(true)}
                  disabled={isRegistered}
                  className={`flex-1 py-3 px-4 rounded-xl font-display font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-md ${
                    isRegistered 
                      ? 'bg-emerald-600 text-white shadow-emerald-500/25' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
                  }`}
                >
                  {isRegistered ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Registered Successfully! 🎉</span>
                    </>
                  ) : (
                    <>
                      <span>Register for Free</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleCloseModal();
                    goTo('/calendar');
                  }}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-display font-bold text-sm transition-all whitespace-nowrap"
                >
                  View in Calendar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
