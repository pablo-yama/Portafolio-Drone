'use client';

import { useState } from 'react';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { Navigation } from '@/components/layout/Navigation';
import { Cursor } from '@/components/layout/Cursor';
import { Preloader } from '@/components/layout/Preloader';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';

import { WorkGrid } from '@/components/sections/WorkGrid';
import { StatsSection } from '@/components/sections/StatsSection';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { CTASection } from '@/components/sections/CTASection';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <Preloader onComplete={() => setIsLoaded(true)} />
      <Cursor />
      <SmoothScroll>
        <Navigation />
        <main>
          <HeroSection />
          <AboutSection />
          <WorkGrid />
          <StatsSection />
          <ServicesSection />
          <CTASection />
        </main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
