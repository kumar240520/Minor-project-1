import React, { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import Navbar from '../components/Navbar';
import LandingChapterSidebar from '../components/navigation/LandingChapterSidebar';
import SectionBlurMixer from '../components/SectionBlurMixer';
import HeroSection from '../sections/HeroSection';
import HowItWorksSection from '../sections/HowItWorksSection';
import FeaturesSection from '../sections/FeaturesSection';
import EventsSection from '../sections/EventsSection';
import StatisticsSection from '../sections/StatisticsSection';
import FinalCTASection from '../sections/FinalCTASection';
import Footer from '../components/Footer';

export default function LandingPage() {
  useEffect(() => {
    // Ultra-smooth momentum scroll with Lenis (autoRaf: true for buttery 120fps sync)
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.1,
      infinite: false,
    });

    // Make lenis accessible globally for smooth anchor navigation
    window.lenis = lenis;

    return () => {
      lenis.destroy();
      delete window.lenis;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-white text-edunavy selection:bg-edupurple selection:text-white font-poppins overflow-x-hidden">
      {/* Global Floating Navbar */}
      <Navbar />

      {/* Global Fixed Vertical Chapter Navigation Sidebar */}
      <LandingChapterSidebar />

      <main className="w-full">
        {/* Section 1: Hero Section */}
        <HeroSection />

        {/* Page Breaker Blurness: Mixes Hero & How It Works */}
        <SectionBlurMixer />

        {/* Section 2: How It Works Section */}
        <HowItWorksSection />

        {/* Page Breaker Blurness: Mixes How It Works & Features */}
        <SectionBlurMixer />

        {/* Section 3: Features Section */}
        <FeaturesSection />

        {/* Page Breaker Blurness: Mixes Features & Events */}
        <SectionBlurMixer />

        {/* Section 4: Events Section */}
        <EventsSection />

        {/* Page Breaker Blurness: Mixes Events & Statistics */}
        <SectionBlurMixer />

        {/* Section 5: Statistics Section */}
        <StatisticsSection />

        {/* Page Breaker Blurness: Mixes Statistics & Final CTA */}
        <SectionBlurMixer />

        {/* Section 6: Final CTA Section */}
        <FinalCTASection />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
